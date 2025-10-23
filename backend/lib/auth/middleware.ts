/**
 * Authentication middleware
 * Route protection and session validation
 */

import { NextRequest, NextResponse } from "next/server";
import { verifySession, refreshSession } from "./session-manager";
import { AUTH_CONFIG } from "./auth-config";
import { AuthContext, Session } from "./types";
import { logger } from "@/lib/utils/logger";
import { parse as parseCookie } from "cookie";

/**
 * Get session token from request cookies
 *
 * @param request - Next.js request object
 * @returns Session token or null
 */
export function getSessionToken(request: NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const cookies = parseCookie(cookieHeader);
  return cookies[AUTH_CONFIG.COOKIE_NAME] || null;
}

/**
 * Create auth context from session
 *
 * @param session - Session object or null
 * @returns Auth context
 */
export function createAuthContext(session: Session | null): AuthContext {
  if (!session) {
    return {
      session: null,
      isAuthenticated: false,
      user: null,
    };
  }

  return {
    session,
    isAuthenticated: true,
    user: {
      id: session.user_id,
      email: session.email,
      display_name: session.display_name,
      role: session.role,
    },
  };
}

/**
 * Verify authentication for protected routes
 *
 * @param request - Next.js request object
 * @returns Auth context
 */
export async function verifyAuth(request: NextRequest): Promise<AuthContext> {
  const token = getSessionToken(request);

  if (!token) {
    logger.debug("No session token found");
    return createAuthContext(null);
  }

  try {
    const session = await verifySession(token);
    return createAuthContext(session);
  } catch (error) {
    logger.error("Auth verification failed", { error });
    return createAuthContext(null);
  }
}

/**
 * Require authentication middleware
 * Redirects to login if not authenticated
 *
 * @param request - Next.js request object
 * @param redirectUrl - URL to redirect to after login (default: current URL)
 * @returns Auth context or redirect response
 */
export async function requireAuth(
  request: NextRequest,
  redirectUrl?: string
): Promise<AuthContext | NextResponse> {
  const authContext = await verifyAuth(request);

  if (!authContext.isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    const returnUrl = redirectUrl || request.nextUrl.pathname;
    loginUrl.searchParams.set("returnUrl", returnUrl);

    logger.info("Unauthenticated access attempt", { path: request.nextUrl.pathname });

    return NextResponse.redirect(loginUrl);
  }

  return authContext;
}

/**
 * Require specific role middleware
 * Returns 403 if user doesn't have required role
 *
 * @param request - Next.js request object
 * @param requiredRole - Required user role
 * @returns Auth context or error response
 */
export async function requireRole(
  request: NextRequest,
  requiredRole: "admin" | "end-user"
): Promise<AuthContext | NextResponse> {
  const authResult = await requireAuth(request);

  // If it's a redirect response, return it
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const authContext = authResult as AuthContext;

  // Check role
  if (authContext.user?.role !== requiredRole) {
    logger.warn("Insufficient permissions", {
      userId: authContext.user?.id,
      requiredRole,
      actualRole: authContext.user?.role,
      path: request.nextUrl.pathname,
    });

    return NextResponse.json(
      { success: false, error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  return authContext;
}

/**
 * Check if user is admin
 *
 * @param authContext - Auth context
 * @returns True if user is admin
 */
export function isAdmin(authContext: AuthContext): boolean {
  return authContext.user?.role === "admin";
}

/**
 * Check if session needs refresh
 *
 * @param session - Session object
 * @returns True if session should be refreshed
 */
export function shouldRefreshSession(session: Session): boolean {
  const now = Date.now();
  const timeUntilExpiry = session.expires_at - now;
  const refreshThreshold = AUTH_CONFIG.SESSION_REFRESH_THRESHOLD * 1000;

  return timeUntilExpiry <= refreshThreshold && timeUntilExpiry > 0;
}

/**
 * Middleware to check and refresh session if needed
 *
 * @param request - Next.js request object
 * @returns Response with new session cookie if refreshed, or null
 */
export async function handleSessionRefresh(
  request: NextRequest
): Promise<NextResponse | null> {
  const token = getSessionToken(request);
  if (!token) {
    return null;
  }

  try {
    const session = await verifySession(token);
    if (!session) {
      return null;
    }

    if (shouldRefreshSession(session)) {
      const refreshResult = await refreshSession(token);

      if (refreshResult?.success && refreshResult.token) {
        logger.info("Session auto-refreshed", { sessionId: session.id });

        // Create response with new session cookie
        const response = NextResponse.next();
        response.cookies.set({
          name: AUTH_CONFIG.COOKIE_NAME,
          value: refreshResult.token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: AUTH_CONFIG.COOKIE_MAX_AGE,
          path: "/",
        });

        return response;
      }
    }

    return null;
  } catch (error) {
    logger.error("Session refresh check failed", { error });
    return null;
  }
}
