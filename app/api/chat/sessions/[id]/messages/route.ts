/**
 * Chat Messages API
 * POST: Send a message to a chat session
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/backend/lib/auth/middleware";
import { getChatSessionById, addChatMessage } from "@/backend/lib/database/chat";
import { logger } from "@/backend/lib/utils/logger";

/**
 * POST /api/chat/sessions/[id]/messages
 * Send a message to a chat session
 */
export async function POST(
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

    const body = await request.json();
    const { content, role = "user" } = body;

    // Validate input
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Message content is required" },
        { status: 400 }
      );
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { success: false, error: "Message content must be 10,000 characters or less" },
        { status: 400 }
      );
    }

    if (role !== "user" && role !== "assistant") {
      return NextResponse.json(
        { success: false, error: "Role must be 'user' or 'assistant'" },
        { status: 400 }
      );
    }

    // Verify session exists and user has access
    const session = await getChatSessionById(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

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

    logger.info("💬 Adding message to chat session", { 
      sessionId, 
      userId: authContext.user.id, 
      role,
      contentLength: content.trim().length
    });
    
    const message = await addChatMessage(
      sessionId,
      authContext.user.id,
      content.trim(),
      role
    );
    
    logger.info("✅ Message added successfully", { 
      messageId: message.id, 
      sessionId 
    });

    return NextResponse.json({
      success: true,
      message,
    }, { status: 201 });
  } catch (error) {
    logger.error("❌ Failed to add message to chat session", { 
      error, 
      sessionId: (await params).id 
    });
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
