/**
 * Session Refresh API route
 * Refreshes user session if within refresh threshold
 * POST /api/auth/refresh
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/middleware";
import { refreshSession } from "@/lib/auth/session-manager";
import { AUTH_CONFIG } from "@/lib/auth/auth-config";
import { logger } from "@/lib/utils/logger";

/**
 * Refresh user session
 * Extends session expiration if within refresh threshold
 *
 * @param request - Next.js request object
 * @returns New session token or error
 */
export async function POST(request: NextRequest) {
  try {
    const token = getSessionToken(request);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "No session found",
        },
        { status: 401 }
      );
    }

    // Attempt to refresh session
    const refreshResult = await refreshSession(token);

    if (!refreshResult || !refreshResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Session refresh not needed or failed",
        },
        { status: 400 }
      );
    }

    logger.info("Session refreshed via API", {
      oldSessionId: refreshResult.session?.id,
    });

    // Create response with new session cookie
    const response = NextResponse.json({
      success: true,
      message: "Session refreshed",
      expires_at: refreshResult.session?.expires_at,
    });

    response.cookies.set({
      name: AUTH_CONFIG.COOKIE_NAME,
      value: refreshResult.token!,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_CONFIG.COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    logger.error("Session refresh failed", { error });

    return NextResponse.json(
      {
        success: false,
        error: "Session refresh failed",
      },
      { status: 500 }
    );
  }
}
