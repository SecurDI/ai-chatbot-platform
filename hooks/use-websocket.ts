/**
 * WebSocket Hook
 * React hook for WebSocket connection management
 */

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "./use-auth";
import { WebSocketMessage } from "@/types/database";

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

/**
 * Custom hook for WebSocket connections
 * 
 * @param options - WebSocket configuration options
 * @returns WebSocket connection state and methods
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
  } = options;

  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (!user || isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    isConnectingRef.current = true;

    try {
      // Get session token from cookies
      const token = document.cookie
        .split("; ")
        .find(row => row.startsWith("auth_session="))
        ?.split("=")[1];

      if (!token) {
        onError?.("No authentication token found");
        return;
      }

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/websocket?token=${token}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        isConnectingRef.current = false;
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          onMessage?.(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
          onError?.("Invalid message format");
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        isConnectingRef.current = false;
        onDisconnect?.();

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          onError?.("Max reconnection attempts reached");
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        isConnectingRef.current = false;
        onError?.("WebSocket connection error");
      };

    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      isConnectingRef.current = false;
      onError?.("Failed to connect to chat server");
    }
  }, [user, onMessage, onConnect, onDisconnect, onError, reconnectInterval, maxReconnectAttempts]);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnect");
      wsRef.current = null;
    }

    isConnectingRef.current = false;
    reconnectAttemptsRef.current = 0;
  }, []);

  /**
   * Send a message through WebSocket
   */
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  /**
   * Get connection state
   */
  const getConnectionState = useCallback(() => {
    if (!wsRef.current) return "disconnected";
    
    switch (wsRef.current.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "connected";
      case WebSocket.CLOSING:
        return "closing";
      case WebSocket.CLOSED:
        return "disconnected";
      default:
        return "disconnected";
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, user, connect, disconnect]);

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
    connect,
    disconnect,
    sendMessage,
    getConnectionState,
    isConnected: getConnectionState() === "connected",
    isConnecting: getConnectionState() === "connecting",
  };
}
