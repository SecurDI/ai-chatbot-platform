/**
 * Session Manager - JWT and KV-based session handling
 * Manages user sessions with JWT tokens and Vercel KV storage
 */

import { SignJWT, jwtVerify } from "jose";
import { kv } from "@/lib/kv/connection";
import { Session, JWTPayload, SessionResult } from "./types";
import { AUTH_CONFIG } from "./auth-config";
import { logger } from "@/lib/utils/logger";
import { UserRole } from "@/types/database";

/**
 * Get JWT secret as Uint8Array
 */
function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Generate session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Create a new session for a user
 *
 * @param userId - User's database ID
 * @param entraId - User's EntraID
 * @param email - User's email
 * @param displayName - User's display name
 * @param role - User's role (admin or end-user)
 * @returns Session result with token
 */
export async function createSession(
  userId: string,
  entraId: string,
  email: string,
  displayName: string,
  role: UserRole
): Promise<SessionResult> {
  try {
    const now = Date.now();
    const sessionId = generateSessionId();
    const expiresAt = now + AUTH_CONFIG.SESSION_TIMEOUT * 1000;

    // Create session object
    const session: Session = {
      id: sessionId,
      user_id: userId,
      entra_id: entraId,
      email,
      display_name: displayName,
      role,
      created_at: now,
      expires_at: expiresAt,
      last_activity: now,
    };

    // Store session in KV with expiration
    await kv.set(
      `session:${sessionId}`,
      session,
      { ex: AUTH_CONFIG.SESSION_TIMEOUT }
    );

    // Create JWT token
    const token = await new SignJWT({
      session_id: sessionId,
      user_id: userId,
      entra_id: entraId,
      email,
      display_name: displayName,
      role,
    } as JWTPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${AUTH_CONFIG.SESSION_TIMEOUT}s`)
      .sign(getJWTSecret());

    logger.info("Session created", { sessionId, userId, email });

    return {
      success: true,
      session,
      token,
    };
  } catch (error) {
    logger.error("Failed to create session", { error });
    return {
      success: false,
      error: "Failed to create session",
    };
  }
}

/**
 * Verify and retrieve a session from a JWT token
 *
 * @param token - JWT token from cookie
 * @returns Session object or null
 */
export async function verifySession(token: string): Promise<Session | null> {
  try {
    // Verify JWT
    const { payload } = await jwtVerify(token, getJWTSecret());
    const jwtPayload = payload as unknown as JWTPayload;

    // Retrieve session from KV
    const session = await kv.get<Session>(`session:${jwtPayload.session_id}`);

    if (!session) {
      logger.warn("Session not found in KV", { sessionId: jwtPayload.session_id });
      return null;
    }

    // Check if session is expired
    if (session.expires_at < Date.now()) {
      logger.warn("Session expired", { sessionId: session.id });
      await destroySession(session.id);
      return null;
    }

    // Update last activity
    session.last_activity = Date.now();
    await kv.set(
      `session:${session.id}`,
      session,
      { ex: AUTH_CONFIG.SESSION_TIMEOUT }
    );

    return session;
  } catch (error) {
    logger.error("Session verification failed", { error });
    return null;
  }
}

/**
 * Refresh a session if it's within the refresh threshold
 *
 * @param token - Current JWT token
 * @returns New session result with refreshed token, or null if refresh not needed
 */
export async function refreshSession(token: string): Promise<SessionResult | null> {
  try {
    const session = await verifySession(token);
    if (!session) {
      return null;
    }

    const now = Date.now();
    const timeUntilExpiry = session.expires_at - now;
    const refreshThreshold = AUTH_CONFIG.SESSION_REFRESH_THRESHOLD * 1000;

    // Only refresh if within threshold (default: 1 hour before expiry)
    if (timeUntilExpiry > refreshThreshold) {
      logger.debug("Session doesn't need refresh yet", { sessionId: session.id });
      return null;
    }

    // Destroy old session
    await destroySession(session.id);

    // Create new session
    const result = await createSession(
      session.user_id,
      session.entra_id,
      session.email,
      session.display_name,
      session.role
    );

    if (result.success) {
      logger.info("Session refreshed", { oldSessionId: session.id, newSessionId: result.session?.id });
    }

    return result;
  } catch (error) {
    logger.error("Session refresh failed", { error });
    return null;
  }
}

/**
 * Destroy a session (logout)
 *
 * @param sessionId - Session ID to destroy
 */
export async function destroySession(sessionId: string): Promise<void> {
  try {
    await kv.del(`session:${sessionId}`);
    logger.info("Session destroyed", { sessionId });
  } catch (error) {
    logger.error("Failed to destroy session", { error, sessionId });
  }
}

/**
 * Get session from JWT token (no activity update)
 *
 * @param token - JWT token
 * @returns Session or null
 */
export async function getSession(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, getJWTSecret());
    const jwtPayload = payload as unknown as JWTPayload;

    const session = await kv.get<Session>(`session:${jwtPayload.session_id}`);

    if (!session || session.expires_at < Date.now()) {
      return null;
    }

    return session;
  } catch (error) {
    logger.error("Failed to get session", { error });
    return null;
  }
}

/**
 * Store OIDC state for CSRF protection
 *
 * @param state - State parameter
 * @param data - OIDC state data
 */
export async function storeOIDCState(
  state: string,
  data: { nonce: string; code_verifier: string; redirect_uri: string }
): Promise<void> {
  await kv.set(
    `oidc:state:${state}`,
    { ...data, created_at: Date.now() },
    { ex: AUTH_CONFIG.STATE_EXPIRY }
  );
  logger.info("OIDC state stored", { state });
}

/**
 * Retrieve and delete OIDC state
 *
 * @param state - State parameter
 * @returns OIDC state data or null
 */
export async function consumeOIDCState(state: string): Promise<{
  nonce: string;
  code_verifier: string;
  redirect_uri: string;
} | null> {
  const key = `oidc:state:${state}`;
  const data = await kv.get<{
    nonce: string;
    code_verifier: string;
    redirect_uri: string;
    created_at: number;
  }>(key);

  if (data) {
    await kv.del(key);
    logger.info("OIDC state consumed", { state });
  }

  return data;
}
