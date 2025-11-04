import { getSession } from "@/backend/lib/auth/session-manager";
import { getUserById } from "@/backend/lib/database/users";
import { logger } from "@/backend/lib/utils/logger";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/backend/lib/auth/auth-config"; // Import AUTH_CONFIG

/**
 * GET /api/auth/session
 * Returns the current user session information
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_CONFIG.COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ success: false, user: null });
    }

    const session = await getSession(token);

    if (!session) {
      return NextResponse.json({ success: false, user: null });
    }

    // Fetch full user details from database
    const user = await getUserById(session.user_id);

    if (!user) {
      logger.warn(`User ${session.user_id} not found in database`);
      return NextResponse.json({ success: false, user: null });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.display_name,
        role: user.role,
        entra_id: user.entra_id,
      },
    });
  } catch (error: any) {
    logger.error(`Session check failed: ${error.message}`);
    return NextResponse.json(
      { success: false, error: "Session check failed" },
      { status: 500 }
    );
  }
}
