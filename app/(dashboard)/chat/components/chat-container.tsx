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
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0A0A0A] to-[#0A0A0A]/80">
      <div className="max-w-5xl mx-auto p-6">
        {/* Session Header */}
        <div className="mb-8 pb-6 border-b-2 border-[#7dd3c0]/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#7dd3c0] rounded-full flex items-center justify-center shadow-lg shadow-[#7dd3c0]/40">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{currentSession.session_name}</h2>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#7dd3c0] rounded-full animate-pulse"></span>
                Created {new Date(currentSession.created_at).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-[#7dd3c0]/20 to-[#7dd3c0]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#7dd3c0]/20">
                  <svg className="w-12 h-12 text-[#7dd3c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#7dd3c0] rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">✨</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Start the conversation</h3>
              <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
                Send your first message to begin chatting with our AI assistant. 
                Ask questions, get help, or start a conversation about anything!
              </p>
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
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-3 bg-[#0A0A0A]/60 backdrop-blur-sm border-2 border-[#7dd3c0]/30 rounded-2xl px-6 py-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#7dd3c0] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#7dd3c0] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[#7dd3c0] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-300 font-medium">AI is thinking...</span>
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
