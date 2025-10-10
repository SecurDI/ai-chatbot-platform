"use client";

import { useAuth } from "@/hooks/use-auth";
import { MessageSquare, LayoutDashboard, Users, FileText, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Dashboard Layout
 * Provides sidebar navigation for all dashboard pages
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/api/auth/login";
    }
    return null;
  }

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/chat", icon: MessageSquare, label: "Chat" },
    { href: "/approvals", icon: FileText, label: "Approvals" },
  ];

  if (isAdmin()) {
    navItems.push({ href: "/admin/users", icon: Users, label: "User Management" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } bg-white/80 backdrop-blur-xl border-r border-gray-200/50 transition-all duration-300 overflow-hidden flex flex-col shadow-xl fixed h-full z-40 lg:relative`}
      >
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 shadow-lg shadow-purple-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900">Nucleus AI</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-700 border border-purple-500/20 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200/50">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.display_name}</p>
              <p className="text-xs text-gray-600 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white/60 backdrop-blur-md border-b border-gray-200/50 px-8 py-6 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
