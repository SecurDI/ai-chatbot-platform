/**
 * Logout API route
 * Destroys user session and clears cookie
 * POST /api/auth/logout
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/middleware";
import { getSession, destroySession } from "@/lib/auth/session-manager";
import { AUTH_CONFIG } from "@/lib/auth/auth-config";
import { logger } from "@/lib/utils/logger";

/**
 * Handle user logout
 * Destroys session in KV and clears session cookie
 *
 * @param request - Next.js request object
 * @returns Success response with cleared cookie
 */
export async function POST(request: NextRequest) {
  try {
    const token = getSessionToken(request);

    if (token) {
      // Get session to log user info
      const session = await getSession(token);

      if (session) {
        // Destroy session
        await destroySession(session.id);
        logger.info("User logged out", {
          userId: session.user_id,
          email: session.email,
        });
      }
    }

    // Create response and clear session cookie
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.set({
      name: AUTH_CONFIG.COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    return response;
  } catch (error) {
    logger.error("Logout failed", { error });

    return NextResponse.json(
      {
        success: false,
        error: "Logout failed",
      },
      { status: 500 }
    );
  }
}
