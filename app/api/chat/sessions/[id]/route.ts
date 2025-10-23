/**
 * Chat Session API
 * GET: Get session with messages
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/backend/lib/auth/middleware";
import { getChatSessionById, getChatSessionMessages } from "@/backend/lib/database/chat";
import { logger } from "@/backend/lib/utils/logger";

/**
 * GET /api/chat/sessions/[id]
 * Get a specific chat session with its messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authContext = await verifyAuth(request);
    if (!authContext.isAuthenticated || !authContext.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: sessionId } = await params;

    // Validate session ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      return NextResponse.json(
        { success: false, error: "Invalid session ID format" },
        { status: 400 }
      );
    }

    logger.info("📋 Fetching chat session", { 
      sessionId, 
      userId: authContext.user.id 
    });
    
    // Get session details
    const session = await getChatSessionById(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    // Check if user owns this session
    if (session.user_id !== authContext.user.id) {
      logger.warn("🚫 Unauthorized access to chat session", {
        sessionId,
        sessionUserId: session.user_id,
        requestUserId: authContext.user.id,
      });
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    // Get session messages
    const messages = await getChatSessionMessages(sessionId);
    
    logger.info("✅ Chat session retrieved successfully", { 
      sessionId, 
      messageCount: messages.length 
    });

    return NextResponse.json({
      success: true,
      session,
      messages,
    });
  } catch (error) {
    logger.error("❌ Failed to get chat session", { error, sessionId: (await params).id });
    return NextResponse.json(
      { success: false, error: "Failed to retrieve chat session" },
      { status: 500 }
    );
  }
}
