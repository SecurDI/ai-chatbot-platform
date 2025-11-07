/**
 * WebSocket Server
 * Handles real-time chat communication with authentication
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// Ensure we're using the Node.js WebSocket (not DOM)

import { WebSocketServer } from "ws";
import type WebSocket from "ws"; 

import { IncomingMessage } from "http";
import { verifySession, getTokenFromRequest } from "../auth/session-manager";
import { addChatMessage, getChatSessionById } from "../database/chat";
import { logger } from "../utils/logger";
import { WebSocketMessage, WebSocketConnection, WebSocketState } from "../../../types/database";

/**
 * WebSocket server instance
 */
let wss: WebSocketServer | null = null;

/**
 * Global state for managing WebSocket connections
 */
const wsState: WebSocketState = {
  connections: new Map(),
  userSessions: new Map(),
};

/**
 * Initialize WebSocket server
 *
 * @param server - HTTP server instance
 */
export function initializeWebSocketServer(server: any): void {
  if (wss) {
    logger.warn("WebSocket server already initialized");
    return;
  }

  wss = new WebSocketServer({ 
    server,
    path: "/api/websocket",
    verifyClient: async (info: { origin: string; secure: boolean; req: import("http").IncomingMessage }) => {

      try {
        // Extract token from query parameters or cookies
        const url = new URL(info.req.url || "", `http://${info.req.headers.host}`);
        const token = url.searchParams.get("token") || getTokenFromRequest(info.req);
        
        if (!token) {
          logger.warn("WebSocket connection rejected: No token provided");
          return false;
        }

        // Verify session
        const session = await verifySession(token);
        if (!session) {
          logger.warn("WebSocket connection rejected: Invalid session");
          return false;
        }

        // Store user info in the request for later use
        (info.req as any).user = {
          id: session.user_id,
          email: session.email,
          display_name: session.display_name,
          role: session.role,
        };

        logger.info("WebSocket connection verified", { userId: session.user_id });
        return true;
      } catch (error) {
        logger.error("WebSocket verification failed", { error });
        return false;
      }
    },
  });

  wss.on("connection", handleWebSocketConnection);
  
  logger.info("🚀 WebSocket server initialized", { path: "/api/websocket" });
}

/**
 * Handle new WebSocket connection
 *
 * @param ws - WebSocket connection
 * @param req - HTTP request
 */
function handleWebSocketConnection(ws: WebSocket, req: IncomingMessage): void {
  const user = (req as any).user;
  if (!user) {
    logger.error("WebSocket connection without user info");
    ws.close(1008, "Authentication required");
    return;
  }

  const connectionId = `${user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  const connection: WebSocketConnection = {
  userId: user.id,
  sessionId: "",
  socket: ws as unknown as WebSocket,
  lastActivity: Date.now(),
};


  wsState.connections.set(connectionId, connection);

  logger.info("🔌 WebSocket connection established", { 
    connectionId, 
    userId: user.id 
  });

  // Handle incoming messages
  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString()) as WebSocketMessage;
      handleWebSocketMessage(connectionId, message);
    } catch (error) {
      logger.error("Failed to parse WebSocket message", { error, connectionId });
      sendError(ws, "Invalid message format");
    }
  });

  // Handle connection close
  ws.on("close", () => {
    handleWebSocketDisconnect(connectionId);
  });

  // Handle errors
  ws.on("error", (error) => {
    logger.error("WebSocket error", { error, connectionId });
    handleWebSocketDisconnect(connectionId);
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: "user_joined",
    userId: user.id,
    message: "Connected to chat server",
    timestamp: new Date().toISOString(),
  }));
}

/**
 * Handle incoming WebSocket message
 *
 * @param connectionId - Connection ID
 * @param message - WebSocket message
 */
async function handleWebSocketMessage(connectionId: string, message: WebSocketMessage): Promise<void> {
  const connection = wsState.connections.get(connectionId);
  if (!connection) {
    logger.error("WebSocket message for unknown connection", { connectionId });
    return;
  }

  connection.lastActivity = Date.now();

  try {
    switch (message.type) {
      case "message":
        await handleChatMessage(connection, message);
        break;
      case "typing":
        handleTypingIndicator(connection, message);
        break;
      default:
        logger.warn("Unknown WebSocket message type", { type: message.type, connectionId });
    }
  } catch (error) {
    logger.error("Failed to handle WebSocket message", { error, connectionId, message });
    sendError(connection.socket, "Failed to process message");
  }
}

/**
 * Handle chat message
 *
 * @param connection - WebSocket connection
 * @param message - Chat message
 */
async function handleChatMessage(connection: WebSocketConnection, message: WebSocketMessage): Promise<void> {
  if (!message.sessionId || !message.content) {
    sendError(connection.socket, "Session ID and content are required");
    return;
  }

  // Verify session exists and user has access
  const session = await getChatSessionById(message.sessionId);
  if (!session || session.user_id !== connection.userId) {
    sendError(connection.socket, "Session not found or access denied");
    return;
  }

  // Add message to database
  const dbMessage = await addChatMessage(
    message.sessionId,
    connection.userId,
    message.content,
    message.role || "user"
  );

  // Update connection's current session
  connection.sessionId = message.sessionId;

  // Add user to session tracking
  if (!wsState.userSessions.has(connection.userId)) {
    wsState.userSessions.set(connection.userId, new Set());
  }
  wsState.userSessions.get(connection.userId)!.add(message.sessionId);

  // Broadcast message to all connections in this session
  broadcastToSession(message.sessionId, {
    type: "message",
    sessionId: message.sessionId,
    userId: connection.userId,
    content: message.content,
    role: message.role || "user",
    messageId: dbMessage.id,
    timestamp: dbMessage.created_at,
  });

  logger.info("💬 Chat message processed", { 
    connectionId: connection.id,
    sessionId: message.sessionId,
    messageId: dbMessage.id 
  });
}

/**
 * Handle typing indicator
 *
 * @param connection - WebSocket connection
 * @param message - Typing message
 */
function handleTypingIndicator(connection: WebSocketConnection, message: WebSocketMessage): void {
  if (!message.sessionId) {
    return;
  }

  // Broadcast typing indicator to other users in the session
  broadcastToSession(message.sessionId, {
    type: "typing",
    sessionId: message.sessionId,
    userId: connection.userId,
    timestamp: new Date().toISOString(),
  }, connection.id); // Exclude sender
}

/**
 * Handle WebSocket disconnection
 *
 * @param connectionId - Connection ID
 */
function handleWebSocketDisconnect(connectionId: string): void {
  const connection = wsState.connections.get(connectionId);
  if (!connection) {
    return;
  }

  // Remove from user sessions
  const userSessions = wsState.userSessions.get(connection.userId);
  if (userSessions && connection.sessionId) {
    userSessions.delete(connection.sessionId);
    if (userSessions.size === 0) {
      wsState.userSessions.delete(connection.userId);
    }
  }

  // Remove connection
  wsState.connections.delete(connectionId);

  logger.info("🔌 WebSocket connection closed", { 
    connectionId, 
    userId: connection.userId 
  });
}

/**
 * Broadcast message to all connections in a session
 *
 * @param sessionId - Session ID
 * @param message - Message to broadcast
 * @param excludeConnectionId - Connection ID to exclude from broadcast
 */
function broadcastToSession(
  sessionId: string, 
  message: WebSocketMessage, 
  excludeConnectionId?: string
): void {
  let sentCount = 0;

  for (const [connectionId, connection] of wsState.connections) {
    if (connectionId === excludeConnectionId) {
      continue;
    }

    // Check if connection is in this session
    const userSessions = wsState.userSessions.get(connection.userId);
    if (userSessions && userSessions.has(sessionId)) {
      try {
        connection.socket.send(JSON.stringify(message));
        sentCount++;
      } catch (error) {
        logger.error("Failed to send WebSocket message", { error, connectionId });
        // Remove failed connection
        handleWebSocketDisconnect(connectionId);
      }
    }
  }

  logger.debug("📡 Message broadcasted", { sessionId, sentCount });
}

/**
 * Send error message to WebSocket
 *
 * @param ws - WebSocket connection
 * @param error - Error message
 */
function sendError(ws: WebSocket, error: string): void {
  try {
    ws.send(JSON.stringify({
      type: "error",
      content: error,
      timestamp: new Date().toISOString(),
    }));
  } catch (err) {
    logger.error("Failed to send error message", { error: err });
  }
}

/**
 * Get WebSocket server instance
 *
 * @returns WebSocket server or null
 */
export function getWebSocketServer(): WebSocketServer | null {
  return wss;
}

/**
 * Get current WebSocket state
 *
 * @returns Current WebSocket state
 */
export function getWebSocketState(): WebSocketState {
  return wsState;
}

/**
 * Clean up inactive connections
 * Should be called periodically
 */
export function cleanupInactiveConnections(): void {
  const now = Date.now();
  const timeout = 30 * 60 * 1000; // 30 minutes

  for (const [connectionId, connection] of wsState.connections) {
    if (now - connection.lastActivity > timeout) {
      logger.info("🧹 Cleaning up inactive connection", { connectionId });
      connection.socket.close(1000, "Inactive timeout");
      handleWebSocketDisconnect(connectionId);
    }
  }
}
