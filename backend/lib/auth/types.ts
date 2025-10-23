/**
 * Authentication type definitions
 * Defines session, user, and auth-related types
 */

import { logger } from "@/lib/utils/logger";
import { UserRole } from "../../../types/database";

/**
 * Session data stored in Vercel KV
 */
export interface Session {
  id: string;
  user_id: string;
  entra_id: string;
  email: string;
  display_name: string;
  role: UserRole;
  organization_id: string | null;
  created_at: number;
  expires_at: number;
  last_activity: number;
}

/**
 * JWT payload structure
 */
export interface JWTPayload {
  session_id: string;
  user_id: string;
  entra_id: string;
  email: string;
  display_name: string;
  role: UserRole;
  organization_id: string | null;
  iat: number;
  exp: number;
}

/**
 * User info from EntraID ID token
 */
export interface EntraIDUserInfo {
  sub: string; // subject (entra_id)
  email: string;
  name: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
}

/**
 * OIDC state stored in KV for CSRF protection
 */
export interface OIDCState {
  state: string;
  nonce: string;
  code_verifier: string;
  redirect_uri: string;
  created_at: number;
}

/**
 * Auth context for middleware
 */
export interface AuthContext {
  session: Session | null;
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    display_name: string;
    role: UserRole;
  } | null;
}

/**
 * Login result
 */
export interface LoginResult {
  success: boolean;
  authorization_url?: string;
  error?: string;
}

/**
 * Session creation result
 */
export interface SessionResult {
  success: boolean;
  session?: Session;
  token?: string;
  error?: string;
}
