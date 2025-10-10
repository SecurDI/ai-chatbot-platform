/**
 * Authentication Zustand Store
 * Manages global authentication state
 */

import { create } from "zustand";
import { UserRole } from "@/types/database";

/**
 * User state interface
 */
interface User {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
}

/**
 * Auth store state interface
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpiresAt: number | null;

  // Actions
  setUser: (user: User | null) => void;
  setSessionExpiry: (expiresAt: number) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  checkSession: () => Promise<void>;
}

/**
 * Auth store
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  sessionExpiresAt: null,

  /**
   * Set user and authentication status
   */
  setUser: (user) => {
    set({
      user,
      isAuthenticated: user !== null,
    });
  },

  /**
   * Set session expiration timestamp
   */
  setSessionExpiry: (expiresAt) => {
    set({ sessionExpiresAt: expiresAt });
  },

  /**
   * Set loading state
   */
  setLoading: (isLoading) => {
    set({ isLoading });
  },

  /**
   * Logout user
   * Clears user state and calls logout API
   */
  logout: async () => {
    try {
      // Call logout API
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // Clear state
      set({
        user: null,
        isAuthenticated: false,
        sessionExpiresAt: null,
      });

      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },

  /**
   * Check current session status
   * Fetches session info from API and updates store
   */
  checkSession: async () => {
    try {
      set({ isLoading: true });

      const response = await fetch("/api/auth/session");
      const data = await response.json();

      if (data.authenticated && data.user) {
        set({
          user: data.user,
          isAuthenticated: true,
          sessionExpiresAt: data.session.expires_at,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          sessionExpiresAt: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Failed to check session:", error);
      set({
        user: null,
        isAuthenticated: false,
        sessionExpiresAt: null,
        isLoading: false,
      });
    }
  },
}));
