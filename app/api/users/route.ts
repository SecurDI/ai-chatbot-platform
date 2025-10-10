/**
 * User Management API - List Users
 * GET /api/users - List all users (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session-manager";
import { listUsers } from "@/lib/database/users";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/users
 * List all users with pagination (admin only)
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

    // Check if user is admin
    if (session.role !== "admin") {
      logger.warn("Non-admin user attempted to access user list", {
        userId: session.user_id,
      });
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get pagination params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // List users
    const { users, total } = await listUsers(page, limit);

    logger.info("Users list retrieved", {
      adminId: session.user_id,
      page,
      limit,
      total,
    });

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error("Failed to list users", { error });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
