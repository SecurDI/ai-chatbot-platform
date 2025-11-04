"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";
import { MessageSquare, LayoutDashboard, Users, FileText, User, LogOut, Menu, X, Settings as SettingsIcon, ChevronDown, ChevronUp } from "lucide-react";

// Import content components
import DashboardContent from "./dashboard-content";
import ChatContent from "./chat-content";
import UserManagementContent from "./user-management-content";
import SettingsContent from "./settings-content";
import EntraSettingsContent from "./entra-settings-content";
import AIApiKeysContent from "./ai-api-keys-content";

/**
 * SPA Dashboard Component
 * Main dashboard with client-side navigation
 */
export default function SPADashboard() {
  console.log("🚀 SPADashboard component rendering");
  const { user, isLoading, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeView, setActiveView] = useState<"dashboard" | "chat" | "user-management" | "settings" | "entra-settings" | "ai-api-keys">("dashboard");

  console.log("📊 Current activeView:", activeView);
  console.log("👤 User:", user ? "authenticated" : "not authenticated");
  console.log("📍 Current pathname:", pathname);

  // Handle URL-based navigation
  useEffect(() => {
    console.log("🔍 Checking pathname for navigation:", pathname);
    if (pathname === "/chat") {
      console.log("💬 Setting activeView to chat");
      setActiveView("chat");
    } else if (pathname === "/admin/users") {
      console.log("👥 Setting activeView to user-management");
      setActiveView("user-management");
    } else if (pathname === "/settings/account") {
      console.log("⚙️ Setting activeView to settings");
      setActiveView("settings");
    } else if (pathname === "/admin/entra-settings") {
      console.log("🔧 Setting activeView to entra-settings");
      setActiveView("entra-settings");
    } else if (pathname === "/") {
      console.log("📊 Setting activeView to dashboard");
      setActiveView("dashboard");
    }
  }, [pathname]);

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

  const navItems: Array<{
    key: string;
    icon: any;
    label: string;
    children: Array<{ key: string; label: string }>;
  }> = [
    { key: "dashboard", icon: LayoutDashboard, label: "Dashboard", children: [] },
    { key: "chat", icon: MessageSquare, label: "Chat", children: [] },
  ];

  if (isAdmin()) {
    navItems.push({ key: "user-management", icon: Users, label: "User Management", children: [] });
  }

  const settingsChildren = [
    { key: "settings", label: "Account Settings" },
  ];

  if (isAdmin()) {
    settingsChildren.push({ key: "entra-settings", label: "Entra ID Settings" });
    settingsChildren.push({ key: "ai-api-keys", label: "AI API Keys" });
  }

  navItems.push({
    key: "settings",
    icon: SettingsIcon,
    label: "Settings",
    children: settingsChildren,
  });

  const handleNavClick = (key: string) => {
    console.log("🖱️ Navigation clicked:", key);
    if (key === "settings") {
      setSettingsOpen(!settingsOpen);
    } else {
      console.log("🔄 Changing activeView from", activeView, "to", key);
      setActiveView(key as any);
      setSidebarOpen(false); // Close sidebar on mobile after navigation
    }
  };

  const handleSubNavClick = (key: string) => {
    if (key === "settings") {
      setActiveView("settings");
    } else if (key === "entra-settings") {
      setActiveView("entra-settings");
    } else if (key === "ai-api-keys") {
      setActiveView("ai-api-keys");
    }
    setSettingsOpen(false);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const renderContent = () => {
    console.log("🎨 Rendering content for view:", activeView);
    switch (activeView) {
      case "dashboard":
        console.log("📊 Rendering DashboardContent");
        return <DashboardContent />;
      case "chat":
        console.log("💬 Rendering ChatContent");
        return <ChatContent />;
      case "user-management":
        console.log("👥 Rendering UserManagementContent");
        return <UserManagementContent />;
      case "settings":
        console.log("⚙️ Rendering SettingsContent");
        return <SettingsContent />;
      case "entra-settings":
        console.log("🔧 Rendering EntraSettingsContent");
        return <EntraSettingsContent />;
      case "ai-api-keys":
        console.log("🔑 Rendering AIApiKeysContent");
        return <AIApiKeysContent />;
      default:
        console.log("📊 Default: Rendering DashboardContent");
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-securdi-dark-bg flex glow-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } bg-[#0A0A0A]/90 backdrop-blur-xl border-r-2 border-[#7dd3c0] transition-all duration-300 overflow-hidden flex flex-col shadow-xl shadow-[#7dd3c0]/20 fixed h-full z-40 lg:relative`}
      >
        <div className="p-6 border-b-2 border-[#7dd3c0]">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src="/SecurDI-logo-white-1-1.png" alt="SecurDI Logo" className="w-16 h-16" />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-[#7dd3c0]/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.key || (item.key === "settings" && activeView === "settings");
            return (
              <div key={item.label}>
                <button
                  onClick={() => handleNavClick(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                    isActive
                      ? "bg-[#7dd3c0]/20 text-[#7dd3c0] border-2 border-[#7dd3c0] shadow-sm shadow-[#7dd3c0]/20"
                      : "text-gray-300 hover:bg-[#7dd3c0]/20 hover:text-[#7dd3c0]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.children.length > 0 && (
                    settingsOpen ? <ChevronUp className="ml-auto w-4 h-4" /> : <ChevronDown className="ml-auto w-4 h-4" />
                  )}
                </button>
                {item.children.length > 0 && settingsOpen && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = activeView === child.key;
                      return (
                        <button
                          key={child.key}
                          onClick={() => handleSubNavClick(child.key)}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            isChildActive
                              ? "bg-[#7dd3c0]/20 text-[#7dd3c0] border-2 border-[#7dd3c0] shadow-sm shadow-[#7dd3c0]/20"
                              : "text-gray-300 hover:bg-[#7dd3c0]/20 hover:text-[#7dd3c0]"
                          }`}
                        >
                          <span>{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t-2 border-[#7dd3c0]">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-[#0A0A0A]/50 rounded-xl border-2 border-[#7dd3c0]">
            <div className="w-10 h-10 bg-[#7dd3c0] rounded-full flex items-center justify-center shadow-lg shadow-[#7dd3c0]/40">
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
        <header className="bg-[#0A0A0A]/60 backdrop-blur-xl border-b-2 border-[#7dd3c0] px-8 py-6 shadow-sm shadow-[#7dd3c0]/20">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-[#7dd3c0]/10 rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-300" />
              </button>
            )}
            <div>
              <h2 className="text-3xl font-bold text-white">
                {activeView === "dashboard" && "Dashboard"}
                {activeView === "chat" && "Chat"}
                {activeView === "user-management" && "User Management"}
                {activeView === "settings" && "Settings"}
                {activeView === "entra-settings" && "Entra ID Settings"}
                {activeView === "ai-api-keys" && "AI API Keys"}
              </h2>
              <p className="text-sm text-gray-400 mt-1">Welcome back, {user.display_name}</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
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
