/**
 * Session Info API route
 * Returns current user session information
 * GET /api/auth/session
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth/middleware";
import { logger } from "@/lib/utils/logger";

/**
 * Get current session information
 * Returns authenticated user details and session status
 *
 * @param request - Next.js request object
 * @returns Session information or null if not authenticated
 */
export async function GET(request: NextRequest) {
  try {
    const authContext = await verifyAuth(request);

    if (!authContext.isAuthenticated || !authContext.session) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        user: null,
        session: null,
      });
    }

    logger.debug("Session info retrieved", { userId: authContext.user?.id });

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: authContext.user!.id,
        email: authContext.user!.email,
        display_name: authContext.user!.display_name,
        role: authContext.user!.role,
      },
      session: {
        expires_at: authContext.session.expires_at,
        last_activity: authContext.session.last_activity,
      },
    });
  } catch (error) {
    logger.error("Failed to get session info", { error });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve session",
      },
      { status: 500 }
    );
  }
}
