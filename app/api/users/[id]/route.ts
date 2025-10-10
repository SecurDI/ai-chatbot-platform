/**
 * User Management API - Single User Operations
 * GET /api/users/[id] - Get user details
 * PUT /api/users/[id] - Update user (admin only)
 * DELETE /api/users/[id] - Deactivate user (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session-manager";
import {
  getUserById,
  updateUserRole,
  deactivateUser,
  reactivateUser,
} from "@/lib/database/users";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/users/[id]
 * Get user details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const userId = params.id;

    // Users can view their own profile, admins can view any profile
    if (session.user_id !== userId && session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get user
    const user = await getUserById(userId);

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
    logger.error("Failed to get user", { error, userId: params.id });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]
 * Update user role (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      logger.warn("Non-admin user attempted to update user", {
        adminId: session.user_id,
        targetUserId: params.id,
      });
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { role, action } = body;

    const userId = params.id;

    // Handle reactivation
    if (action === "reactivate") {
      const user = await reactivateUser(userId);
      logger.info("User reactivated", {
        adminId: session.user_id,
        userId,
      });
      return NextResponse.json({
        success: true,
        data: { user },
        message: "User reactivated successfully",
      });
    }

    // Validate role
    if (!role || (role !== "admin" && role !== "end-user")) {
      return NextResponse.json(
        { success: false, error: "Invalid role" },
        { status: 400 }
      );
    }

    // Update user role
    const user = await updateUserRole(userId, role);

    logger.info("User role updated", {
      adminId: session.user_id,
      userId,
      newRole: role,
    });

    return NextResponse.json({
      success: true,
      data: { user },
      message: "User role updated successfully",
    });
  } catch (error) {
    logger.error("Failed to update user", { error, userId: params.id });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Deactivate user (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      logger.warn("Non-admin user attempted to deactivate user", {
        adminId: session.user_id,
        targetUserId: params.id,
      });
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Prevent admin from deactivating themselves
    if (session.user_id === userId) {
      return NextResponse.json(
        { success: false, error: "Cannot deactivate your own account" },
        { status: 400 }
      );
    }

    // Deactivate user
    const user = await deactivateUser(userId);

    logger.info("User deactivated", {
      adminId: session.user_id,
      userId,
    });

    return NextResponse.json({
      success: true,
      data: { user },
      message: "User deactivated successfully",
    });
  } catch (error) {
    logger.error("Failed to deactivate user", { error, userId: params.id });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
