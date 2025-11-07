import type WebSocket from "ws";

export type UserRole = "admin" | "end-user";

export interface User {
  id: string;
  display_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_login: string | null;
  is_active: boolean;
  entra_id: string | null;
}

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface EntraConfig {
  id: string;
  organization_id: string;
  tenant_id: string;
  client_id: string;
  client_secret: string;
  client_secret_encrypted: string;
  redirect_uri: string;
  domain: string | null;
  created_at: string;
  updated_at: string;
  is_valid: boolean | null;
  last_tested_at: string | null;
}

export interface EntraConfigSafe extends Omit<EntraConfig, "client_secret" | "client_secret_encrypted"> {
  client_secret_masked: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  session_name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  message_type: "user" | "assistant" | "system";
  metadata: any;
  timestamp: string;
  created_at: string;
}

// WebSocket Types
export interface WebSocketMessage {
  type: "message" | "typing" | "user_joined" | "user_left" | "error";
  sessionId: string;
  userId: string;
  content?: string;
  role?: "user" | "assistant";
  timestamp?: string;
  messageId?: string;
}

import type { WebSocket as WsWebSocket } from "ws";

export interface WebSocketConnection {
  id?: string;
  userId: string;
  sessionId: string;
  socket: WebSocket;
  lastActivity: number;
}

export interface WebSocketState {
  connections: Map<string, WebSocketConnection>;
  userSessions: Map<string, Set<string>>; // userId -> Set of sessionIds
}