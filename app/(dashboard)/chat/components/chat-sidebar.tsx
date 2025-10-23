"use client";

/**
 * Chat Sidebar Component
 * Displays chat sessions and allows session management
 */

import { ChatSession } from "@/types/database";
import { MessageSquare, Plus, Clock, Trash2 } from "lucide-react";
import { useState } from "react";

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  onSelectSession: (session: ChatSession) => void;
  onCreateSession: () => void;
  isLoading: boolean;
}

export default function ChatSidebar({
  sessions,
  currentSession,
  onSelectSession,
  onCreateSession,
  isLoading,
}: ChatSidebarProps) {
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0A0A0A] to-[#0A0A0A]/90">
      {/* Header */}
      <div className="p-6 border-b-2 border-[#7dd3c0]/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7dd3c0] rounded-xl flex items-center justify-center shadow-lg shadow-[#7dd3c0]/40">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Chat Sessions</h2>
              <p className="text-xs text-gray-400">Manage your conversations</p>
            </div>
          </div>
          <button
            onClick={onCreateSession}
            className="p-3 bg-[#7dd3c0]/10 hover:bg-[#7dd3c0]/20 border-2 border-[#7dd3c0]/30 hover:border-[#7dd3c0]/50 rounded-xl transition-all duration-200 hover:scale-105"
            title="New Chat"
          >
            <Plus className="w-5 h-5 text-[#7dd3c0]" />
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#7dd3c0]/30 border-t-[#7dd3c0] mx-auto"></div>
              <div className="absolute inset-0 rounded-full border-2 border-[#7dd3c0]/10"></div>
            </div>
            <p className="text-gray-400 text-sm mt-4 font-medium">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-6 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#7dd3c0]/20 to-[#7dd3c0]/10 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-[#7dd3c0]/20">
                <MessageSquare className="w-10 h-10 text-[#7dd3c0]" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#7dd3c0] rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">💬</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No chat sessions yet</h3>
            <p className="text-gray-400 text-sm mb-4">Start your first conversation</p>
            <button
              onClick={onCreateSession}
              className="px-6 py-3 bg-gradient-to-r from-[#7dd3c0] to-[#7dd3c0]/90 text-white rounded-xl text-sm font-semibold hover:from-[#7dd3c0]/90 hover:to-[#7dd3c0]/80 transition-all duration-200 shadow-lg shadow-[#7dd3c0]/40 hover:shadow-xl hover:shadow-[#7dd3c0]/50 hover:scale-105"
            >
              Start your first chat
            </button>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                  currentSession?.id === session.id
                    ? "bg-gradient-to-r from-[#7dd3c0]/20 to-[#7dd3c0]/10 border-2 border-[#7dd3c0] shadow-lg shadow-[#7dd3c0]/20"
                    : "hover:bg-[#7dd3c0]/10 border-2 border-transparent hover:border-[#7dd3c0]/30"
                }`}
                onClick={() => onSelectSession(session)}
                onMouseEnter={() => setHoveredSession(session.id)}
                onMouseLeave={() => setHoveredSession(null)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    currentSession?.id === session.id
                      ? "bg-[#7dd3c0] shadow-lg shadow-[#7dd3c0]/40"
                      : "bg-[#7dd3c0]/20 group-hover:bg-[#7dd3c0]/30"
                  }`}>
                    <MessageSquare className={`w-5 h-5 ${
                      currentSession?.id === session.id ? "text-white" : "text-[#7dd3c0]"
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate mb-1">
                      {session.session_name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400 font-medium">
                        {formatDate(session.updated_at)}
                      </span>
                    </div>
                  </div>

                  {/* Delete Button (on hover) */}
                  {hoveredSession === session.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement delete functionality
                        console.log("Delete session:", session.id);
                      }}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t-2 border-[#7dd3c0]/20">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400 font-medium">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''}
          </div>
          {sessions.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-[#7dd3c0]">
              <div className="w-2 h-2 bg-[#7dd3c0] rounded-full animate-pulse"></div>
              <span>Active</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
