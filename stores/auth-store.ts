import { create } from "zustand";
import type { User } from "@/types/database"; // ✅ Import the shared User type

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
