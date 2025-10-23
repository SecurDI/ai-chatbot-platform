"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/database"; // Assuming User type is defined

interface AuthHook {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  isAdmin: () => boolean;
}

/**
 * Custom hook for authentication.
 * Manages user session state and provides login/logout functionality.
 *
 * @returns AuthHook - Object containing user, loading state, and auth actions
 */
export const useAuth = (): AuthHook => {
  const { user, setUser, clearUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Check session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          clearUser();
        }
      } catch (error) {
        console.error("Session check failed:", error);
        clearUser();
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [setUser, clearUser]);

  // Login function
  const login = () => {
    // Redirect to Entra ID login flow
    window.location.href = "/auth/login";
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      clearUser();
      window.location.href = "/"; // Redirect to home page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Check if user is admin
  const isAdmin = (): boolean => {
    return user?.role === "admin";
  };

  return { user, isLoading, login, logout, isAdmin };
};
