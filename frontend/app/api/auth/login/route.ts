import { generateAuthorizationUrl, getRedirectUri } from "@/backend/lib/auth/auth-config";
import { storeOIDCState } from "@/backend/lib/auth/session-manager";
import { logger } from "@/backend/lib/utils/logger";
import { NextResponse } from "next/server";

/**
 * Handles the login request by redirecting to the Entra ID authorization endpoint.
 */
export async function GET(request: Request) {
  try {
    logger.info("Login route hit");

    const redirectUri = getRedirectUri();
    logger.info(`Using redirect URI: ${redirectUri}`);

    const { url, state, nonce } = await generateAuthorizationUrl(redirectUri);
    logger.info(`Generated authorization URL: ${url}`);

    // Store state and nonce in secure, httpOnly cookies
    const response = NextResponse.redirect(url);
    await storeOIDCState(response, state, nonce);

    logger.info("Redirecting to Entra ID for authentication");
    return response;
  } catch (error: any) {
    logger.error(`Login failed: ${error.message}`);
    return NextResponse.redirect(`${new URL(request.url).origin}/login?error=authentication_failed`);
  }
}
