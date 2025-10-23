/**
 * Chat database operations
 * Handles CRUD operations for chat sessions and messages
 */

import { sql } from "@vercel/postgres";
import { ChatSession, ChatMessage } from "../../frontend/types/database";
import { logger } from "../utils/logger";

/**
 * Create a new chat session
 *
 * @param userId - The ID of the user creating the session
 * @param title - The title of the chat session
 * @returns The newly created chat session
 */
export async function createChatSession(userId: string, title: string): Promise<ChatSession> {
  try {
    logger.info("💬 Creating new chat session", { userId, title });
    const result = await sql<ChatSession>`
      INSERT INTO chat_sessions (user_id, title, created_at, updated_at)
      VALUES (${userId}, ${title}, NOW(), NOW())
      RETURNING *;
    `;
    const session = result.rows[0];
    logger.info("✅ Chat session created successfully", { sessionId: session.id, userId });
    return session;
  } catch (error) {
    logger.error("❌ Failed to create chat session", { error, userId, title });
    throw new Error("Failed to create chat session");
  }
}

/**
 * Get a chat session by its ID
 *
 * @param sessionId - The ID of the chat session
 * @returns The chat session or null if not found
 */
export async function getChatSessionById(sessionId: string): Promise<ChatSession | null> {
  try {
    const result = await sql<ChatSession>`
      SELECT * FROM chat_sessions
      WHERE id = ${sessionId};
    `;
    return result.rows[0] || null;
  } catch (error) {
    logger.error("❌ Failed to get chat session by ID", { error, sessionId });
    return null;
  }
}

/**
 * Get all chat sessions for a specific user
 *
 * @param userId - The ID of the user
 * @returns An array of chat sessions
 */
export async function getUserChatSessions(userId: string): Promise<ChatSession[]> {
  try {
    const result = await sql<ChatSession>`
      SELECT * FROM chat_sessions
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC;
    `;
    return result.rows;
  } catch (error) {
    logger.error("❌ Failed to get user chat sessions", { error, userId });
    throw new Error("Failed to get user chat sessions");
  }
}

/**
 * Add a message to a chat session
 *
 * @param sessionId - The ID of the chat session
 * @param userId - The ID of the user sending the message
 * @param content - The content of the message
 * @param role - The role of the sender ("user" or "assistant")
 * @returns The newly created chat message
 */
export async function addChatMessage(
  sessionId: string,
  userId: string,
  content: string,
  role: "user" | "assistant"
): Promise<ChatMessage> {
  try {
    logger.info("💬 Adding new chat message", { sessionId, userId, role });
    const result = await sql<ChatMessage>`
      INSERT INTO chat_messages (session_id, user_id, content, role, created_at)
      VALUES (${sessionId}, ${userId}, ${content}, ${role}, NOW())
      RETURNING *;
    `;
    const message = result.rows[0];
    logger.info("✅ Chat message added successfully", { messageId: message.id, sessionId });

    // Update the session's updated_at timestamp
    await updateChatSessionTimestamp(sessionId);

    return message;
  } catch (error) {
    logger.error("❌ Failed to add chat message", { error, sessionId, userId });
    throw new Error("Failed to add chat message");
  }
}

/**
 * Get all messages for a specific chat session
 *
 * @param sessionId - The ID of the chat session
 * @returns An array of chat messages
 */
export async function getChatSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  try {
    const result = await sql<ChatMessage>`
      SELECT * FROM chat_messages
      WHERE session_id = ${sessionId}
      ORDER BY created_at ASC;
    `;
    return result.rows;
  } catch (error) {
    logger.error("❌ Failed to get chat session messages", { error, sessionId });
    throw new Error("Failed to get chat session messages");
  }
}

/**
 * Update the `updated_at` timestamp of a chat session
 *
 * @param sessionId - The ID of the chat session
 */
export async function updateChatSessionTimestamp(sessionId: string): Promise<void> {
  try {
    logger.debug("Updating chat session timestamp", { sessionId });
    await sql`
      UPDATE chat_sessions
      SET updated_at = NOW()
      WHERE id = ${sessionId};
    `;
    logger.debug("✅ Chat session timestamp updated", { sessionId });
  } catch (error) {
    logger.error("❌ Failed to update chat session timestamp", { error, sessionId });
    // Do not throw an error here, as it's a non-critical operation
  }
}
