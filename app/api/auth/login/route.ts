/**
 * Login API route
 * Initiates EntraID OIDC authentication flow
 * GET /api/auth/login
 */

import { NextResponse } from "next/server";
import { generateAuthorizationUrl, getRedirectUri } from "@/lib/auth/auth-config";
import { storeOIDCState } from "@/lib/auth/session-manager";
import { logger } from "@/lib/utils/logger";

/**
 * Initiate login with EntraID
 * Generates authorization URL and redirects user to EntraID login
 *
 * @returns Redirect to EntraID login page
 */
export async function GET() {
  try {
    // Generate authorization URL with PKCE
    const { url, state, nonce, code_verifier } = await generateAuthorizationUrl();

    // Store state, nonce, and code_verifier for callback validation
    await storeOIDCState(state, {
      nonce,
      code_verifier,
      redirect_uri: getRedirectUri(),
    });

    logger.info("Login initiated", { state });

    // Redirect to EntraID login
    return NextResponse.redirect(url);
  } catch (error) {
    logger.error("Login initiation failed", { error });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to initiate login",
      },
      { status: 500 }
    );
  }
}
