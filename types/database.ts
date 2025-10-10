/**
 * Database type definitions matching the PostgreSQL schema
 * These types ensure type safety across database operations
 */

export type UserRole = "admin" | "end-user";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";

export type ActivityStatus = "success" | "error" | "denied";

export type MessageType = "user" | "assistant" | "system";

/**
 * User table type
 */
export interface User {
  id: string;
  entra_id: string;
  email: string;
  display_name: string;
  role: UserRole;
  created_at: Date;
  last_login: Date | null;
  is_active: boolean;
}

/**
 * Approval request table type
 */
export interface ApprovalRequest {
  id: string;
  requester_id: string;
  command_text: string;
  justification: string | null;
  status: ApprovalStatus;
  approver_id: string | null;
  requested_at: Date;
  responded_at: Date | null;
  expires_at: Date;
}

/**
 * Activity log table type
 */
export interface ActivityLog {
  id: string;
  user_id: string | null;
  session_id: string | null;
  action_type: string;
  resource_service: string | null;
  command_executed: string | null;
  command_response: string | null;
  status: ActivityStatus;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: Date;
  duration_ms: number | null;
}

/**
 * Chat session table type
 */
export interface ChatSession {
  id: string;
  user_id: string;
  session_name: string | null;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

/**
 * Chat message table type
 */
export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string | null;
  message_type: MessageType;
  content: string;
  metadata: Record<string, any> | null;
  timestamp: Date;
}

/**
 * Extended types with joined data
 */

export interface ApprovalRequestWithRequester extends ApprovalRequest {
  requester_name: string;
  requester_email: string;
  hours_until_expiry: number;
}

export interface ActivityLogWithUser extends ActivityLog {
  user_name: string | null;
  user_email: string | null;
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[];
}
