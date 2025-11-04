/**
 * Chat Sessions API
 * GET: List user sessions
 * POST: Create new session
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/backend/lib/auth/middleware";
import { getUserChatSessions, createChatSession } from "@/backend/lib/database/chat";
import { logger } from "@/backend/lib/utils/logger";

/**
 * GET /api/chat/sessions
 * List all chat sessions for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authContext = await verifyAuth(request);
    if (!authContext.isAuthenticated || !authContext.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    logger.info("📋 Fetching user chat sessions", { userId: authContext.user.id });
    
    const sessions = await getUserChatSessions(authContext.user.id);
    
    logger.info("✅ User chat sessions retrieved", { 
      userId: authContext.user.id, 
      sessionCount: sessions.length 
    });

    return NextResponse.json({
      success: true,
      sessions,
    });
  } catch (error) {
    logger.error("❌ Failed to get user chat sessions", { error });
    return NextResponse.json(
      { success: false, error: "Failed to retrieve chat sessions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/sessions
 * Create a new chat session
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authContext = await verifyAuth(request);
    if (!authContext.isAuthenticated || !authContext.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title } = body;

    // Validate input
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    if (title.length > 255) {
      return NextResponse.json(
        { success: false, error: "Title must be 255 characters or less" },
        { status: 400 }
      );
    }

    logger.info("💬 Creating new chat session", { 
      userId: authContext.user.id, 
      title: title.trim() 
    });
    
    const session = await createChatSession(authContext.user.id, title.trim());
    
    logger.info("✅ Chat session created successfully", { 
      sessionId: session.id, 
      userId: authContext.user.id 
    });

    return NextResponse.json({
      success: true,
      session,
    }, { status: 201 });
  } catch (error) {
    logger.error("❌ Failed to create chat session", { error });
    return NextResponse.json(
      { success: false, error: "Failed to create chat session" },
      { status: 500 }
    );
  }
}
