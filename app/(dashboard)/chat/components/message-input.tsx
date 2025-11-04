"use client";

/**
 * Message Input Component
 * Input field for sending chat messages
 */

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = "Type your message...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || disabled || isSending) return;

    const messageToSend = message.trim();
    setMessage("");
    setIsSending(true);

    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore message on error
      setMessage(messageToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    onTyping();

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      // Typing indicator will be cleared by the parent component
    }, 1000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="p-6 bg-gradient-to-t from-[#0A0A0A] to-transparent">
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1 relative">
            <div className="relative bg-[#0A0A0A]/60 backdrop-blur-sm border-2 border-[#7dd3c0]/30 rounded-2xl focus-within:border-[#7dd3c0] focus-within:shadow-lg focus-within:shadow-[#7dd3c0]/20 transition-all duration-200">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled || isSending}
                className="w-full px-6 py-4 pr-16 bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none max-h-32 min-h-[3.5rem] disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
                rows={1}
                style={{ minHeight: "3.5rem" }}
              />
              
              {/* Character count */}
              {message.length > 0 && (
                <div className="absolute bottom-2 right-4 text-xs text-gray-400 bg-[#0A0A0A]/80 px-2 py-1 rounded-lg">
                  {message.length}/10000
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!message.trim() || disabled || isSending}
            className="px-6 py-4 bg-gradient-to-r from-[#7dd3c0] to-[#7dd3c0]/90 text-white rounded-2xl font-semibold hover:from-[#7dd3c0]/90 hover:to-[#7dd3c0]/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg shadow-[#7dd3c0]/40 hover:shadow-xl hover:shadow-[#7dd3c0]/50 hover:scale-105 disabled:hover:scale-100"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span className="hidden sm:inline font-medium">Send</span>
          </button>
        </form>

        {/* Help text */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-4 text-xs text-gray-400 bg-[#0A0A0A]/40 backdrop-blur-sm border border-[#7dd3c0]/20 rounded-xl px-4 py-2">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-[#7dd3c0]/20 text-[#7dd3c0] rounded text-xs font-mono">Enter</kbd>
              <span>to send</span>
            </span>
            <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-[#7dd3c0]/20 text-[#7dd3c0] rounded text-xs font-mono">Shift</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-[#7dd3c0]/20 text-[#7dd3c0] rounded text-xs font-mono">Enter</kbd>
              <span>for new line</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
