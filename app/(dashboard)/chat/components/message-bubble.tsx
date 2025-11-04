"use client";

/**
 * Message Bubble Component
 * Displays individual chat messages
 */

import { ChatMessage } from "@/types/database";
import { User, Bot, Clock } from "lucide-react";
import { useState } from "react";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [showTimestamp, setShowTimestamp] = useState(false);
  const isUser = message.message_type === "user";

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-105 ${
        isUser 
          ? 'bg-gradient-to-br from-[#7dd3c0] to-[#7dd3c0]/80 shadow-[#7dd3c0]/40' 
          : 'bg-gradient-to-br from-gray-600 to-gray-700 shadow-gray-600/40'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
        {/* Message Bubble */}
        <div
          className={`relative px-6 py-4 rounded-3xl shadow-lg transition-all duration-200 group-hover:shadow-xl ${
            isUser
              ? 'bg-gradient-to-br from-[#7dd3c0] to-[#7dd3c0]/90 text-white rounded-br-lg shadow-[#7dd3c0]/30'
              : 'bg-gradient-to-br from-gray-800/90 to-gray-700/90 text-gray-100 rounded-bl-lg shadow-gray-800/30 border border-gray-600/30'
          }`}
        >
          <div className="whitespace-pre-wrap break-words leading-relaxed text-sm">
            {message.content}
          </div>
          
          {/* Message status indicator for user messages */}
          {isUser && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
        </div>

        {/* Timestamp and status */}
        <div className={`flex items-center gap-2 mt-2 text-xs ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}>
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3 h-3" />
            <span className={`transition-opacity duration-200 ${showTimestamp ? 'opacity-100' : 'opacity-0'}`}>
              {formatTime(message.timestamp)}
            </span>
          </div>
          {isUser && (
            <div className="flex items-center gap-1 text-[#7dd3c0]">
              <div className="w-1 h-1 bg-[#7dd3c0] rounded-full"></div>
              <span className="text-xs font-medium">Delivered</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
