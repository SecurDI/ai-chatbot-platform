/**
 * User Profile API
 * GET /api/users/profile - Get current user's profile
 */

import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session-manager";
import { getUserById } from "@/lib/database/users";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/users/profile
 * Get current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie
    const token = request.cookies.get("auth_session")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify session
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Invalid session" },
        { status: 401 }
      );
    }

    // Get user details
    const user = await getUserById(session.user_id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    logger.error("Failed to get user profile", { error });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
