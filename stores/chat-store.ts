/**
 * Chat Store - Zustand state management for chat functionality
 * Manages chat sessions, messages, and WebSocket connections
 */

import { create } from "zustand";
import { ChatSession, ChatMessage, WebSocketMessage } from "@/types/database";

interface ChatState {
  // Sessions
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  
  // Messages
  messages: ChatMessage[];
  
  // WebSocket
  isConnected: boolean;
  connectionError: string | null;
  
  // UI State
  isLoading: boolean;
  isTyping: boolean;
  typingUsers: Set<string>;
  
  // Actions
  setSessions: (sessions: ChatSession[]) => void;
  setCurrentSession: (session: ChatSession | null) => void;
  addSession: (session: ChatSession) => void;
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  
  setConnected: (connected: boolean) => void;
  setConnectionError: (error: string | null) => void;
  
  setIsLoading: (loading: boolean) => void;
  setIsTyping: (typing: boolean) => void;
  setTypingUsers: (users: Set<string>) => void;
  addTypingUser: (userId: string) => void;
  removeTypingUser: (userId: string) => void;
  
  // WebSocket actions
  sendMessage: (content: string, role?: "user" | "assistant") => Promise<void>;
  sendTypingIndicator: () => void;
  
  // Reset
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  sessions: [],
  currentSession: null,
  messages: [],
  isConnected: false,
  connectionError: null,
  isLoading: false,
  isTyping: false,
  typingUsers: new Set(),

  // Session actions
  setSessions: (sessions) => set({ sessions }),
  
  setCurrentSession: (session) => set({ 
    currentSession: session,
    messages: [] // Clear messages when switching sessions
  }),
  
  addSession: (session) => set((state) => ({
    sessions: [session, ...state.sessions]
  })),
  
  updateSession: (sessionId, updates) => set((state) => ({
    sessions: state.sessions.map(session =>
      session.id === sessionId ? { ...session, ...updates } : session
    ),
    currentSession: state.currentSession?.id === sessionId 
      ? { ...state.currentSession, ...updates }
      : state.currentSession
  })),

  // Message actions
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  updateMessage: (messageId, updates) => set((state) => ({
    messages: state.messages.map(message =>
      message.id === messageId ? { ...message, ...updates } : message
    )
  })),

  // Connection actions
  setConnected: (connected) => set({ 
    isConnected: connected,
    connectionError: connected ? null : get().connectionError
  }),
  
  setConnectionError: (error) => set({ connectionError: error }),

  // UI state actions
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setIsTyping: (typing) => set({ isTyping: typing }),
  
  setTypingUsers: (users) => set({ typingUsers: users }),
  
  addTypingUser: (userId) => set((state) => {
    const newTypingUsers = new Set(state.typingUsers);
    newTypingUsers.add(userId);
    return { typingUsers: newTypingUsers };
  }),
  
  removeTypingUser: (userId) => set((state) => {
    const newTypingUsers = new Set(state.typingUsers);
    newTypingUsers.delete(userId);
    return { typingUsers: newTypingUsers };
  }),

  // WebSocket actions
  sendMessage: async (content, role = "user") => {
    const { currentSession } = get();
    if (!currentSession) {
      throw new Error("No active session");
    }

    set({ isLoading: true });

    try {
      const response = await fetch(`/api/chat/sessions/${currentSession.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          role,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }

      const result = await response.json();
      
      // Add message to store
      get().addMessage(result.message);
      
      // Update session timestamp
      get().updateSession(currentSession.id, {
        updated_at: new Date().toISOString()
      });

    } catch (error) {
      console.error("Failed to send message:", error);
      set({ connectionError: error instanceof Error ? error.message : "Failed to send message" });
    } finally {
      set({ isLoading: false });
    }
  },

  sendTypingIndicator: () => {
    const { currentSession, isConnected } = get();
    if (!currentSession || !isConnected) {
      return;
    }

    // This would typically send a WebSocket message
    // For now, we'll just set the local typing state
    set({ isTyping: true });
    
    // Clear typing indicator after 3 seconds
    setTimeout(() => {
      set({ isTyping: false });
    }, 3000);
  },

  // Reset
  reset: () => set({
    sessions: [],
    currentSession: null,
    messages: [],
    isConnected: false,
    connectionError: null,
    isLoading: false,
    isTyping: false,
    typingUsers: new Set(),
  }),
}));
