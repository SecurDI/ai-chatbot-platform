/**
 * EntraID (Azure AD) OIDC Authentication Configuration
 * Configures OIDC client for Azure AD authentication
 */

import { Issuer, Client, generators } from "openid-client";
import { logger } from "../utils/logger";

/**
 * Get the EntraID issuer URL
 */
function getIssuerUrl(): string {
  const tenantId = process.env.AZURE_AD_TENANT_ID;
  if (!tenantId) {
    throw new Error("AZURE_AD_TENANT_ID is not configured");
  }
  return `https://login.microsoftonline.com/${tenantId}/v2.0`;
}

/**
 * Get or create OIDC issuer instance
 */
let cachedIssuer: Issuer | null = null;

export async function getIssuer(): Promise<Issuer> {
  if (cachedIssuer) {
    return cachedIssuer;
  }

  try {
    const issuerUrl = getIssuerUrl();
    logger.info(`Discovering OIDC issuer: ${issuerUrl}`);

    cachedIssuer = await Issuer.discover(issuerUrl);
    logger.info("OIDC issuer discovered successfully");

    return cachedIssuer;
  } catch (error) {
    logger.error("Failed to discover OIDC issuer", { error });
    throw new Error("Failed to initialize OIDC issuer");
  }
}

/**
 * Get or create OIDC client instance
 */
let cachedClient: Client | null = null;

export async function getOIDCClient(): Promise<Client> {
  if (cachedClient) {
    return cachedClient;
  }

  const clientId = process.env.AZURE_AD_CLIENT_ID;
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Azure AD credentials are not configured");
  }

  try {
    const issuer = await getIssuer();

    cachedClient = new issuer.Client({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uris: [getRedirectUri()],
      response_types: ["code"],
      token_endpoint_auth_method: "client_secret_post",
    });

    logger.info("OIDC client created successfully");
    return cachedClient;
  } catch (error) {
    logger.error("Failed to create OIDC client", { error });
    throw new Error("Failed to initialize OIDC client");
  }
}

/**
 * Get the redirect URI for OIDC callback
 */
export function getRedirectUri(): string {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${baseUrl}/api/auth/callback`;
}

/**
 * Get OAuth2 scopes for EntraID
 */
export function getScopes(): string[] {
  return ["openid", "profile", "email", "offline_access"];
}

/**
 * Generate authorization URL for login
 *
 * @returns Object containing authorization URL, state, nonce, and code_verifier
 */
export async function generateAuthorizationUrl(): Promise<{
  url: string;
  state: string;
  nonce: string;
  code_verifier: string;
}> {
  const client = await getOIDCClient();

  const code_verifier = generators.codeVerifier();
  const code_challenge = generators.codeChallenge(code_verifier);
  const state = generators.state();
  const nonce = generators.nonce();

  const url = client.authorizationUrl({
    scope: getScopes().join(" "),
    response_type: "code",
    state,
    nonce,
    code_challenge,
    code_challenge_method: "S256",
    redirect_uri: getRedirectUri(),
  });

  logger.info("Generated authorization URL", { state });

  return {
    url,
    state,
    nonce,
    code_verifier,
  };
}

/**
 * Exchange authorization code for tokens
 *
 * @param code - Authorization code from callback
 * @param code_verifier - PKCE code verifier
 * @param redirect_uri - Redirect URI used in authorization
 * @param nonce - Nonce used in authorization
 * @returns Token set with access_token, id_token, etc.
 */
export async function exchangeCodeForTokens(
  code: string,
  code_verifier: string,
  redirect_uri: string,
  expectedNonce: string,
  expectedState: string
) {
  const client = await getOIDCClient();

  try {
    logger.info("Attempting token exchange", {
      redirect_uri,
      code_length: code.length,
      has_verifier: !!code_verifier,
      has_nonce: !!expectedNonce,
      has_state: !!expectedState
    });

    const tokenSet = await client.callback(
      redirect_uri,
      { code, state: expectedState },
      { code_verifier, nonce: expectedNonce, state: expectedState }
    );

    logger.info("Successfully exchanged code for tokens");

    // Decode the ID token to get claims
    const claims = tokenSet.claims();

    return {
      idToken: claims,
      accessToken: tokenSet.access_token,
      retrievedNonce: claims.nonce,
      retrievedState: expectedState,
    };
  } catch (error: any) {
    logger.error("Failed to exchange code for tokens", {
      error: error.message,
      error_description: error.error_description,
      error_details: error
    });
    throw error;
  }
}

/**
 * Validate and decode ID token
 *
 * @param idToken - ID token from EntraID
 * @param nonce - Nonce used in authorization
 * @returns Decoded user claims
 */
export async function validateIDToken(idToken: string, nonce: string) {
  const client = await getOIDCClient();

  try {
    const claims = client.decodeIdToken(idToken) as any;

    // Validate nonce
    if (claims.nonce !== nonce) {
      throw new Error("Invalid nonce in ID token");
    }

    logger.info("ID token validated successfully", { sub: claims.sub });
    return claims;
  } catch (error) {
    logger.error("ID token validation failed", { error });
    throw new Error("Invalid ID token");
  }
}

/**
 * Configuration constants
 */
export const AUTH_CONFIG = {
  SESSION_TIMEOUT: parseInt(process.env.SESSION_TIMEOUT || "28800", 10), // 8 hours in seconds
  SESSION_REFRESH_THRESHOLD: parseInt(process.env.SESSION_REFRESH_THRESHOLD || "3600", 10), // 1 hour in seconds
  COOKIE_NAME: "auth_session",
  COOKIE_MAX_AGE: 28800, // 8 hours in seconds
  STATE_EXPIRY: 600, // 10 minutes in seconds
} as const;
