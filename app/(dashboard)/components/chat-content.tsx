"use client";

/**
 * Chat Content Component
 * Chat interface with real-time messaging
 */

import { useChat } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { MessageSquare, Plus, Settings, Users, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import ChatSidebar from "../chat/components/chat-sidebar";
import ChatContainer from "../chat/components/chat-container";
import MessageInput from "../chat/components/message-input";
import TypingIndicator from "../chat/components/typing-indicator";

export default function ChatContent() {
  console.log("💬 ChatContent component rendering");
  const { user } = useAuth();
  const {
    sessions,
    currentSession,
    messages,
    isConnected,
    connectionError,
    isLoading,
    typingUsers,
    loadSessions,
    createSession,
    selectSession,
    sendMessage,
    sendTyping,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Auto-select first session if none selected
  useEffect(() => {
    if (sessions.length > 0 && !currentSession) {
      selectSession(sessions[0]);
    }
  }, [sessions, currentSession, selectSession]);

  const handleCreateSession = async () => {
    if (!newSessionTitle.trim()) return;

    const session = await createSession(newSessionTitle.trim());
    if (session) {
      setNewSessionTitle("");
      setShowNewSessionForm(false);
      selectSession(session);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentSession || !content.trim()) return;

    await sendMessage(content);
  };

  const handleTyping = () => {
    sendTyping();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-securdi-dark-bg">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-400">Please log in to access the chat interface.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-securdi-dark-bg flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-80" : "w-0"} bg-[#0A0A0A]/80 backdrop-blur-xl border-r-2 border-[#7dd3c0] transition-all duration-300 overflow-hidden flex flex-col`}>
        <ChatSidebar
          sessions={sessions}
          currentSession={currentSession}
          onSelectSession={selectSession}
          onCreateSession={() => setShowNewSessionForm(true)}
          isLoading={isLoading}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#0A0A0A]/60 backdrop-blur-xl border-b-2 border-[#7dd3c0] px-6 py-4 shadow-sm shadow-[#7dd3c0]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-[#7dd3c0]/10 rounded-xl transition-colors lg:hidden"
              >
                <MessageSquare className="w-5 h-5 text-slate-300" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#7dd3c0] rounded-full flex items-center justify-center shadow-lg shadow-[#7dd3c0]/40">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">Chat Interface</h1>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-sm text-gray-400">
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewSessionForm(true)}
                className="p-2 hover:bg-[#7dd3c0]/10 rounded-xl transition-colors"
                title="New Chat"
              >
                <Plus className="w-5 h-5 text-slate-300" />
              </button>
            </div>
          </div>
        </header>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col">
          {currentSession ? (
            <>
              {/* Chat Messages */}
              <div className="flex-1 overflow-hidden">
                <ChatContainer
                  messages={messages}
                  currentSession={currentSession}
                  isLoading={isLoading}
                />
              </div>

              {/* Typing Indicator */}
              {typingUsers.size > 0 && (
                <TypingIndicator users={Array.from(typingUsers)} />
              )}

              {/* Message Input */}
              <div className="border-t-2 border-[#7dd3c0] bg-[#0A0A0A]/60 backdrop-blur-md">
                <MessageInput
                  onSendMessage={handleSendMessage}
                  onTyping={handleTyping}
                  disabled={!isConnected || isLoading}
                  placeholder={isConnected ? "Type your message..." : "Connecting..."}
                />
              </div>
            </>
          ) : (
            /* No Session Selected */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <MessageSquare className="w-16 h-16 text-[#7dd3c0] mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-white mb-4">Welcome to Chat</h2>
                <p className="text-gray-400 mb-6">
                  Start a new conversation or select an existing chat session from the sidebar.
                </p>
                <button
                  onClick={() => setShowNewSessionForm(true)}
                  className="px-6 py-3 bg-[#7dd3c0] text-white rounded-xl font-semibold hover:bg-[#7dd3c0]/80 transition-colors shadow-lg shadow-[#7dd3c0]/40"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Connection Error */}
        {connectionError && (
          <div className="bg-red-500/10 border-t border-red-500/30 px-6 py-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm">{connectionError}</span>
            </div>
          </div>
        )}
      </div>

      {/* New Session Modal */}
      {showNewSessionForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border-2 border-[#7dd3c0] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Chat</h3>
            <input
              type="text"
              value={newSessionTitle}
              onChange={(e) => setNewSessionTitle(e.target.value)}
              placeholder="Enter chat title..."
              className="w-full px-4 py-3 bg-[#0A0A0A]/50 border-2 border-[#7dd3c0] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#7dd3c0]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateSession();
                } else if (e.key === "Escape") {
                  setShowNewSessionForm(false);
                }
              }}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateSession}
                disabled={!newSessionTitle.trim()}
                className="flex-1 px-4 py-2 bg-[#7dd3c0] text-white rounded-xl font-semibold hover:bg-[#7dd3c0]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewSessionForm(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
