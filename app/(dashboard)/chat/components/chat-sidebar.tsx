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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-securdi-accent/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Chat Sessions</h2>
          <button
            onClick={onCreateSession}
            className="p-2 hover:bg-securdi-accent/10 rounded-xl transition-colors"
            title="New Chat"
          >
            <Plus className="w-5 h-5 text-securdi-accent" />
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-securdi-accent mx-auto"></div>
            <p className="text-gray-400 text-sm mt-2">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center">
            <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No chat sessions yet</p>
            <button
              onClick={onCreateSession}
              className="mt-3 px-4 py-2 bg-securdi-accent text-white rounded-lg text-sm font-medium hover:bg-securdi-accent/80 transition-colors"
            >
              Start your first chat
            </button>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  currentSession?.id === session.id
                    ? "bg-securdi-accent/20 border border-securdi-accent/40 shadow-sm shadow-securdi-accent/20"
                    : "hover:bg-securdi-accent/10"
                }`}
                onClick={() => onSelectSession(session)}
                onMouseEnter={() => setHoveredSession(session.id)}
                onMouseLeave={() => setHoveredSession(null)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-securdi-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-securdi-accent" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {session.session_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
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
                      className="p-1 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
      <div className="p-4 border-t border-securdi-accent/20">
        <div className="text-xs text-gray-400 text-center">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
