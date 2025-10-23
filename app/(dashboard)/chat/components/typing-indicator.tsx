"use client";

/**
 * Typing Indicator Component
 * Shows when other users are typing
 */

import { Users, Loader2 } from "lucide-react";

interface TypingIndicatorProps {
  users: string[];
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  return (
    <div className="px-6 py-3 bg-securdi-dark-bg/60 backdrop-blur-md border-t border-securdi-accent/20">
      <div className="flex items-center gap-3 text-gray-400">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <Users className="w-4 h-4" />
        </div>
        
        <span className="text-sm">
          {users.length === 1 
            ? "Someone is typing..." 
            : `${users.length} people are typing...`
          }
        </span>
      </div>
    </div>
  );
}
