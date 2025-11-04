import { destroySession } from "@/backend/lib/auth/session-manager";
import { logger } from "@/backend/lib/utils/logger";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/backend/lib/auth/auth-config";

/**
 * POST /api/auth/logout
 * Logs out the current user by deleting their session
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_CONFIG.COOKIE_NAME)?.value;
    
    if (token) {
      // Get session to find session ID
      const { getSession } = await import("@/backend/lib/auth/session-manager");
      const session = await getSession(token);
      
      if (session) {
        await destroySession(session.id);
      }
    }

    // Clear the session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete(AUTH_CONFIG.COOKIE_NAME);

    logger.info("User logged out successfully");
    return response;
  } catch (error: any) {
    logger.error(`Logout failed: ${error.message}`);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
