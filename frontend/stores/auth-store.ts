import { create } from "zustand";
import { UserRole } from "@/types/database";

interface User {
  id: string;
  display_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_login: string | null;
}

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

/**
 * Zustand store for authentication state.
 * Manages the authenticated user's information.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
