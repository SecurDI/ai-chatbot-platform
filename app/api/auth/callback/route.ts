import { exchangeCodeForTokens } from "@/backend/lib/auth/auth-config";
import { consumeOIDCState, createSession } from "@/backend/lib/auth/session-manager";
import { createOrUpdateUser } from "@/backend/lib/database/users";
import { AUTH_CONFIG } from "@/backend/lib/auth/auth-config";
import { logger } from "@/backend/lib/utils/logger";
import { EntraIDUserInfo } from "@/backend/lib/auth/types";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles the OAuth 2.0 callback from Entra ID.
 * Exchanges the authorization code for tokens, validates state and nonce,
 * creates/updates the user, and establishes a session.
 */
export async function GET(request: NextRequest) {
  logger.info("Callback route hit");

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // Handle errors from Entra ID
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  if (error) {
    logger.error(`Entra ID error: ${error} - ${errorDescription}`);
    return NextResponse.redirect(`${url.origin}/login?error=${error}&error_description=${errorDescription}`);
  }

  if (!code) {
    logger.warn("No authorization code found in callback");
    return NextResponse.redirect(`${url.origin}/login?error=invalid_callback`);
  }

  try {
    const redirectUri = new URL("/api/auth/callback", url.origin).toString();
    logger.info(`Using redirect URI: ${redirectUri}`);

    // Consume and validate state and nonce - also retrieve code_verifier
    const oidcState = await consumeOIDCState(state as string); // Pass the state string

    if (!oidcState) {
      logger.error("OIDC state not found or expired");
      return NextResponse.redirect(`${url.origin}/login?error=invalid_state`);
    }

    const { nonce: expectedNonce, code_verifier, redirect_uri } = oidcState;

    const { idToken, accessToken, retrievedState, retrievedNonce } = await exchangeCodeForTokens(
      code as string,
      code_verifier as string,
      redirectUri,
      expectedNonce as string,
      state as string
    );
    logger.info("Tokens exchanged successfully");

    if (retrievedState !== state) {
      logger.error(`State mismatch: Expected ${state}, Received ${retrievedState}`);
      return NextResponse.redirect(`${url.origin}/login?error=invalid_state`);
    }
    logger.info("State validated successfully");

    if (retrievedNonce !== expectedNonce) {
      logger.error(`Nonce mismatch: Expected ${expectedNonce}, Received ${retrievedNonce}`);
      return NextResponse.redirect(`${url.origin}/login?error=invalid_nonce`);
    }
    logger.info("Nonce validated successfully");

    // Get user info from ID token and create/update user in DB
    const userInfo: EntraIDUserInfo = idToken as EntraIDUserInfo;
    logger.info(`User info from ID token: ${JSON.stringify(userInfo)}`);

    const user = await createOrUpdateUser(userInfo.sub, userInfo.preferred_username || userInfo.email || "unknown", userInfo.name || userInfo.preferred_username || userInfo.email || "Unknown User", "end-user");
    logger.info(`User created/updated in DB: ${user.id}`);

    // Create session
    const response = NextResponse.redirect(url.origin);
    const sessionResult = await createSession(user.id, userInfo.sub, userInfo.preferred_username || userInfo.email || "unknown", userInfo.name || userInfo.preferred_username || userInfo.email || "Unknown User", user.role);

    if (sessionResult.success && sessionResult.token) {
      response.cookies.set(AUTH_CONFIG.COOKIE_NAME, sessionResult.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: AUTH_CONFIG.COOKIE_MAX_AGE,
        path: "/",
      });
      logger.info(`Session cookie set for user: ${user.id}`);
    }

    logger.info(`Session created for user: ${user.id}`);
    return response;
  } catch (error: any) {
    logger.error(`Authentication callback failed: ${error.message}`);
    const errorParam = error.message.includes("invalid_state") ? "invalid_state" : "authentication_failed";
    return NextResponse.redirect(`${url.origin}/login?error=${errorParam}`);
  }
}
