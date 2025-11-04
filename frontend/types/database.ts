export type UserRole = "admin" | "end-user";

export interface User {
  id: string;
  display_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_login: string | null;
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
  redirect_uri: string;
  domain: string | null;
  created_at: string;
  updated_at: string;
}

export interface EntraConfigSafe extends Omit<EntraConfig, "client_secret"> {
  client_secret?: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
}