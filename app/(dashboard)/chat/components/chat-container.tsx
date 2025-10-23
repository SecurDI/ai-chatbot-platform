"use client";

/**
 * Chat Container Component
 * Displays chat messages in a scrollable container
 */

import { ChatSession, ChatMessage } from "@/types/database";
import { useEffect, useRef } from "react";
import MessageBubble from "./message-bubble";
import { Loader2 } from "lucide-react";

interface ChatContainerProps {
  messages: ChatMessage[];
  currentSession: ChatSession;
  isLoading: boolean;
}

export default function ChatContainer({
  messages,
  currentSession,
  isLoading,
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto bg-securdi-dark-bg">
      <div className="max-w-4xl mx-auto p-6">
        {/* Session Header */}
        <div className="mb-6 pb-4 border-b border-securdi-accent/20">
          <h2 className="text-xl font-semibold text-white mb-2">{currentSession.session_name}</h2>
          <p className="text-sm text-gray-400">
            Created {new Date(currentSession.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-securdi-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-securdi-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Start the conversation</h3>
              <p className="text-gray-400">Send your first message to begin chatting.</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
              />
            ))
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Sending message...</span>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
