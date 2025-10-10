/**
 * API request and response type definitions
 * Ensures type safety for API endpoints
 */

import { UserRole, ApprovalStatus, ActivityStatus } from "./database";

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * User API types
 */

export interface CreateUserRequest {
  entra_id: string;
  email: string;
  display_name: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  display_name?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface UserResponse {
  id: string;
  entra_id: string;
  email: string;
  display_name: string;
  role: UserRole;
  created_at: string;
  last_login: string | null;
  is_active: boolean;
}

/**
 * Approval API types
 */

export interface CreateApprovalRequest {
  command_text: string;
  justification?: string;
}

export interface UpdateApprovalRequest {
  status: "approved" | "rejected";
  approver_note?: string;
}

export interface ApprovalResponse {
  id: string;
  requester_id: string;
  command_text: string;
  justification: string | null;
  status: ApprovalStatus;
  approver_id: string | null;
  requested_at: string;
  responded_at: string | null;
  expires_at: string;
  requester_name?: string;
  requester_email?: string;
  hours_until_expiry?: number;
}

/**
 * Chat API types
 */

export interface CreateChatSessionRequest {
  session_name?: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface ChatMessageResponse {
  id: string;
  session_id: string;
  message_type: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface ChatSessionResponse {
  id: string;
  user_id: string;
  session_name: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  messages?: ChatMessageResponse[];
}

/**
 * Activity Log API types
 */

export interface LogActivityRequest {
  user_id?: string;
  session_id?: string;
  action_type: string;
  resource_service?: string;
  command_executed?: string;
  command_response?: string;
  status: ActivityStatus;
  ip_address?: string;
  user_agent?: string;
  duration_ms?: number;
}

export interface ActivityLogResponse {
  id: string;
  user_id: string | null;
  action_type: string;
  status: ActivityStatus;
  timestamp: string;
  user_name?: string;
  user_email?: string;
}

/**
 * Authentication API types
 */

export interface LoginRequest {
  code: string;
}

export interface SessionResponse {
  user: UserResponse;
  expires_at: string;
}

/**
 * WebSocket message types
 */

export interface WebSocketMessage {
  type: string;
  payload: any;
}

export interface ChatWebSocketMessage extends WebSocketMessage {
  type: "chat:message" | "chat:typing" | "chat:status";
  payload: {
    session_id: string;
    message?: ChatMessageResponse;
    user_id?: string;
    is_typing?: boolean;
  };
}

export interface ApprovalWebSocketMessage extends WebSocketMessage {
  type: "approval:created" | "approval:updated" | "approval:expired";
  payload: {
    approval: ApprovalResponse;
  };
}

export interface ActivityWebSocketMessage extends WebSocketMessage {
  type: "activity:new";
  payload: {
    activity: ActivityLogResponse;
  };
}
