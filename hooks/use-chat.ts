/**
 * Chat Hook
 * React hook for chat functionality with WebSocket integration
 */

import { useEffect, useCallback, useRef } from "react";
import { useChatStore } from "@/stores/chat-store";
import { useAuth } from "./use-auth";
import { ChatSession, ChatMessage } from "@/types/database";
import { logger } from "@/backend/lib/utils/logger";

/**
 * Custom hook for chat functionality
 * Provides chat state and actions
 */
export function useChat() {
  const {
    sessions,
    currentSession,
    messages,
    isConnected,
    connectionError,
    isLoading,
    isTyping,
    typingUsers,
    setSessions,
    setCurrentSession,
    addSession,
    updateSession,
    setMessages,
    addMessage,
    setConnected,
    setConnectionError,
    setIsLoading,
    setIsTyping,
    addTypingUser,
    removeTypingUser,
    sendMessage,
    sendTypingIndicator,
    reset,
  } = useChatStore();

  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load user's chat sessions
   */
  const loadSessions = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/chat/sessions");
      
      if (!response.ok) {
        throw new Error("Failed to load sessions");
      }

      const result = await response.json();
      setSessions(result.sessions);
    } catch (error) {
      console.error("Failed to load sessions:", error);
      setConnectionError(error instanceof Error ? error.message : "Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  }, [user, setSessions, setIsLoading, setConnectionError]);

  /**
   * Load messages for current session
   */
  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/chat/sessions/${sessionId}`);
      
      if (!response.ok) {
        throw new Error("Failed to load messages");
      }

      const result = await response.json();
      setMessages(result.messages);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setConnectionError(error instanceof Error ? error.message : "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [setMessages, setIsLoading, setConnectionError]);

  /**
   * Create a new chat session
   */
  const createSession = useCallback(async (title: string) => {
    if (!user) return null;

    try {
      setIsLoading(true);
      const response = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create session");
      }

      const result = await response.json();
      addSession(result.session);
      return result.session;
    } catch (error) {
      console.error("Failed to create session:", error);
      setConnectionError(error instanceof Error ? error.message : "Failed to create session");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, addSession, setIsLoading, setConnectionError]);

  /**
   * Select a chat session
   */
  const selectSession = useCallback(async (session: ChatSession) => {
    setCurrentSession(session);
    await loadMessages(session.id);
  }, [setCurrentSession, loadMessages]);

  /**
   * Connect to WebSocket
   */
  const connectWebSocket = useCallback(() => {
    if (!user || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Get session token from cookies
      const token = document.cookie
        .split("; ")
        .find(row => row.startsWith("auth_session="))
        ?.split("=")[1];

      if (!token) {
        setConnectionError("No authentication token found");
        return;
      }

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/websocket?token=${token}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setConnected(true);
        setConnectionError(null);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        setConnected(false);
        
        // Attempt to reconnect after 5 seconds
        if (event.code !== 1000) { // Not a normal closure
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 5000);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionError("WebSocket connection error");
      };

    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      setConnectionError("Failed to connect to chat server");
    }
  }, [user, setConnected, setConnectionError]);

  /**
   * Disconnect WebSocket
   */
  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnect");
      wsRef.current = null;
    }

    setConnected(false);
  }, [setConnected]);

  /**
   * Handle incoming WebSocket messages
   */
  const handleWebSocketMessage = useCallback((message: any) => {
    switch (message.type) {
      case "message":
        if (message.sessionId === currentSession?.id) {
          addMessage({
            id: message.messageId,
            session_id: message.sessionId,
            user_id: message.userId,
            content: message.content,
            message_type: message.role || "user",
            created_at: message.timestamp,
            metadata: {},
            timestamp: message.timestamp || new Date().toISOString(),
          });
        }
        break;

      case "typing":
        if (message.sessionId === currentSession?.id && message.userId !== user?.id) {
          addTypingUser(message.userId);
          setTimeout(() => {
            removeTypingUser(message.userId);
          }, 3000);
        }
        break;

      case "error":
        setConnectionError(message.content);
        break;

      default:
        console.log("Unknown WebSocket message type:", message.type);
    }
  }, [currentSession, user, addMessage, addTypingUser, removeTypingUser, setConnectionError]);

  /**
   * Send a message
   */
  const sendChatMessage = useCallback(async (content: string) => {
    if (!currentSession || !content.trim()) return;

    try {
      await sendMessage(content.trim());
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [currentSession, sendMessage]);

  /**
   * Send typing indicator
   */
  const sendTyping = useCallback(() => {
    if (!currentSession) return;
    
    sendTypingIndicator();
    
    // Send WebSocket typing indicator
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "typing",
        sessionId: currentSession.id,
        userId: user?.id,
      }));
    }
  }, [currentSession, user, sendTypingIndicator]);

  // Initialize chat on mount
  useEffect(() => {
    if (user) {
      loadSessions();
      // Set connected status for REST API mode
      setConnected(true);
      // Note: WebSocket connection disabled for now - using REST API only
      // connectWebSocket();
    }

    return () => {
      // disconnectWebSocket();
      reset();
    };
  }, [user, loadSessions, setConnected, reset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    // State
    sessions,
    currentSession,
    messages,
    isConnected,
    connectionError,
    isLoading,
    isTyping,
    typingUsers,
    
    // Actions
    loadSessions,
    createSession,
    selectSession,
    sendMessage: sendChatMessage,
    sendTyping,
    connectWebSocket,
    disconnectWebSocket,
  };
}
