/**
 * OIDC Callback API route
 * Handles EntraID authentication callback
 * GET /api/auth/callback
 */

import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/auth/auth-config";
import { consumeOIDCState, createSession } from "@/lib/auth/session-manager";
import { createOrUpdateUser } from "@/lib/database/users";
import { AUTH_CONFIG } from "@/lib/auth/auth-config";
import { logger } from "@/lib/utils/logger";
import { EntraIDUserInfo } from "@/lib/auth/types";

/**
 * Handle OIDC callback from EntraID
 * Exchanges authorization code for tokens and creates session
 *
 * @param request - Next.js request object
 * @returns Redirect to dashboard or error page
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Check for OAuth errors
    if (error) {
      logger.error("OAuth error in callback", { error, errorDescription });
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      logger.error("Missing code or state in callback");
      return NextResponse.redirect(
        new URL("/login?error=invalid_callback", request.url)
      );
    }

    // Retrieve and validate OIDC state (CSRF protection)
    const oidcState = await consumeOIDCState(state);
    if (!oidcState) {
      logger.error("Invalid or expired state", { state });
      return NextResponse.redirect(
        new URL("/login?error=invalid_state", request.url)
      );
    }

    // Exchange authorization code for tokens
    const tokenSet = await exchangeCodeForTokens(
      code,
      oidcState.code_verifier,
      oidcState.redirect_uri,
      oidcState.nonce
    );

    if (!tokenSet.id_token) {
      logger.error("No ID token received");
      return NextResponse.redirect(
        new URL("/login?error=no_id_token", request.url)
      );
    }

    // Decode ID token (already validated by openid-client during token exchange)
    const claims = tokenSet.claims();
    const userInfo: EntraIDUserInfo = {
      sub: claims.sub as string,
      email: (claims.email || claims.preferred_username) as string,
      name: (claims.name || claims.given_name || claims.email) as string,
    };

    logger.info("User claims extracted", {
      sub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name
    });

    // Create or update user in database
    const user = await createOrUpdateUser(
      userInfo.sub,
      userInfo.email,
      userInfo.name
    );

    // Create session
    const sessionResult = await createSession(
      user.id,
      user.entra_id,
      user.email,
      user.display_name,
      user.role
    );

    if (!sessionResult.success || !sessionResult.token) {
      logger.error("Failed to create session", { userId: user.id });
      return NextResponse.redirect(
        new URL("/login?error=session_creation_failed", request.url)
      );
    }

    logger.info("User logged in successfully", {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create response with session cookie
    const dashboardUrl = new URL("/", request.url);
    const response = NextResponse.redirect(dashboardUrl);

    response.cookies.set({
      name: AUTH_CONFIG.COOKIE_NAME,
      value: sessionResult.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_CONFIG.COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    logger.error("Callback processing failed", { error });
    return NextResponse.redirect(
      new URL("/login?error=authentication_failed", request.url)
    );
  }
}
