/**
 * useAuth Hook
 * React hook for accessing authentication state and methods
 */

"use client";

import { useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Auth hook providing authentication state and methods
 *
 * @returns Auth state and methods
 */
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    sessionExpiresAt,
    setUser,
    setSessionExpiry,
    setLoading,
    logout,
    checkSession,
  } = useAuthStore();

  /**
   * Check session on mount
   */
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  /**
   * Setup session refresh timer
   * Refreshes session 1 hour before expiry
   */
  useEffect(() => {
    if (!isAuthenticated || !sessionExpiresAt) {
      return;
    }

    const checkAndRefresh = async () => {
      const now = Date.now();
      const timeUntilExpiry = sessionExpiresAt - now;
      const oneHour = 60 * 60 * 1000;

      // Refresh if less than 1 hour until expiry
      if (timeUntilExpiry > 0 && timeUntilExpiry <= oneHour) {
        try {
          const response = await fetch("/api/auth/refresh", {
            method: "POST",
          });

          if (response.ok) {
            const data = await response.json();
            if (data.expires_at) {
              setSessionExpiry(data.expires_at);
            }
          }
        } catch (error) {
          console.error("Session refresh failed:", error);
        }
      }

      // Auto-logout if session expired
      if (timeUntilExpiry <= 0) {
        logout();
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkAndRefresh, 5 * 60 * 1000);

    // Check immediately
    checkAndRefresh();

    return () => clearInterval(interval);
  }, [isAuthenticated, sessionExpiresAt, logout, setSessionExpiry]);

  /**
   * Login - redirects to login page
   */
  const login = useCallback(() => {
    window.location.href = "/api/auth/login";
  }, []);

  /**
   * Check if user is admin
   */
  const isAdmin = useCallback(() => {
    return user?.role === "admin";
  }, [user]);

  /**
   * Check if user is end-user
   */
  const isEndUser = useCallback(() => {
    return user?.role === "end-user";
  }, [user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    sessionExpiresAt,
    login,
    logout,
    checkSession,
    isAdmin,
    isEndUser,
  };
}
