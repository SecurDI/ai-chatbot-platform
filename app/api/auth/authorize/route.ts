import { generateAuthorizationUrl } from "@/backend/lib/auth/auth-config";
import { storeOIDCState } from "@/backend/lib/auth/session-manager";
import { logger } from "@/backend/lib/utils/logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  logger.info("Login route hit");

  try {
    const { url, state, nonce, code_verifier } = await generateAuthorizationUrl();

    // Store state and code_verifier in KV
    await storeOIDCState(state, { nonce, code_verifier, redirect_uri: new URL("/api/auth/callback", request.url).toString() });
    logger.info("OIDC state stored", { state });

    logger.info("Redirecting to Entra ID for authentication");
    return NextResponse.redirect(url);
  } catch (error: any) {
    logger.error(`Login authorization failed: ${error.message}`);
    return NextResponse.redirect(`${new URL(request.url).origin}/login?error=authentication_failed`);
  }
}
