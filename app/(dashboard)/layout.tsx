"use client";

import { useAuth } from "@/hooks/use-auth";
import { MessageSquare, LayoutDashboard, Users, FileText, User, LogOut, Menu, X, Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Dashboard Layout
 * Provides sidebar navigation for all dashboard pages
 */
export default function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  console.log("Rendering app/(dashboard)/layout.tsx");
  const { user, isLoading, logout, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-securdi-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-securdi-accent"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    return null;
  }

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/chat", icon: MessageSquare, label: "Chat" },
    { href: "/approvals", icon: FileText, label: "Approvals" },
    { href: "/settings/account", icon: SettingsIcon, label: "Account Settings" },
  ];

  if (isAdmin()) {
    navItems.push(
      { href: "/admin/users", icon: Users, label: "User Management" },
      { href: "/admin/entra-settings", icon: SettingsIcon, label: "Entra ID Settings" }
    );
  }

  return (
    <div className="min-h-screen bg-securdi-dark-bg flex glow-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } bg-securdi-dark-bg/80 backdrop-blur-xl border-r border-securdi-accent/30 transition-all duration-300 overflow-hidden flex flex-col shadow-xl shadow-securdi-accent/20 fixed h-full z-40 lg:relative`}
      >
        <div className="p-6 border-b border-securdi-accent/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/SecurDI-logo-white-1-1.png" alt="SecurDI Logo" className="w-16 h-16" />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 hover:bg-securdi-accent/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-securdi-text-light" />
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
                    ? "bg-securdi-accent/20 text-securdi-accent border border-securdi-accent/40 shadow-sm shadow-securdi-accent/20"
                    : "text-gray-300 hover:bg-securdi-accent/20 hover:text-securdi-accent"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-securdi-accent/30">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-securdi-dark-bg/50 rounded-xl border border-securdi-accent/30">
            <div className="w-10 h-10 bg-securdi-accent rounded-full flex items-center justify-center shadow-lg shadow-securdi-accent/40">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.display_name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Top Bar */}
        <header className="bg-securdi-dark-bg/60 backdrop-blur-md border-b border-securdi-accent/30 px-8 py-6 shadow-sm shadow-securdi-accent/20 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-securdi-accent/10 rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5 text-securdi-text-light" />
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
