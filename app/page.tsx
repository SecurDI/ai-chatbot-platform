"use client";
import { useAuth } from "@/hooks/use-auth";
import { MessageSquare, Shield, Zap, CheckCircle, Menu, X, User, LogOut, LayoutDashboard, Users, FileText } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Landing/Dashboard page component
 * Shows landing page for unauthenticated users, dashboard for authenticated users
 *
 * @returns Landing page or Dashboard UI
 */
export default function HomePage() {
  const { user, isLoading, logout, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Console logging for theme debugging
  console.log("HomePage rendered - Theme debugging:");
  console.log("- User:", user ? "authenticated" : "not authenticated");
  console.log("- IsLoading:", isLoading);
  console.log("- Current theme classes should include: bg-securdi-dark-bg, text-securdi-accent, border-securdi-accent");
  
  // Test if Tailwind classes are working
  console.log("Testing Tailwind classes:");
  console.log("- bg-securdi-dark-bg should be #0A0A0A");
  console.log("- text-securdi-accent should be #7dd3c0");
  console.log("- border-securdi-accent should be #7dd3c0");

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-securdi-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-securdi-accent"></div>
      </div>
    );
  }

  // If user is logged in, show dashboard with sidebar
  if (user) {
    return (
      <div className="min-h-screen bg-securdi-dark-bg glow-background flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-72" : "w-0"
          } bg-[#0A0A0A]/90 backdrop-blur-xl border-r-2 border-[#7dd3c0] transition-all duration-300 overflow-hidden flex flex-col shadow-xl shadow-[#7dd3c0]/20`}
        >
          <div className="p-6 border-b-2 border-[#7dd3c0]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/SecurDI-logo-white-1-1.png" alt="SecurDI Logo" className="w-10 h-10" />
                <h1 className="text-xl font-bold text-securdi-text-light tracking-tight">SecurDI</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-securdi-accent/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <a
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#7dd3c0]/20 text-[#7dd3c0] font-semibold border-2 border-[#7dd3c0] shadow-sm shadow-[#7dd3c0]/20 transition-all hover:bg-[#7dd3c0]/30"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </a>
            <a
              href="/chat"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-[#7dd3c0]/20 hover:text-[#7dd3c0] transition-all duration-200"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Chat</span>
            </a>
            <a
              href="/approvals"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-[#7dd3c0]/20 hover:text-[#7dd3c0] transition-all duration-200"
            >
              <FileText className="w-5 h-5" />
              <span>Approvals</span>
            </a>
            {isAdmin() && (
              <a
                href="/admin/users"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-[#7dd3c0]/20 hover:text-[#7dd3c0] transition-all duration-200"
              >
                <Users className="w-5 h-5" />
                <span>User Management</span>
              </a>
            )}
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
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
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
                <h2 className="text-3xl font-bold text-white">Dashboard</h2>
                <p className="text-sm text-gray-400 mt-1">Welcome back, {user.display_name}</p>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group relative backdrop-blur-xl bg-[#0A0A0A]/40 border-2 border-[#7dd3c0] rounded-3xl p-8 hover:shadow-2xl hover:shadow-[#7dd3c0]/20 transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-5">
                    <div className="p-5 bg-[#7dd3c0] rounded-2xl shadow-lg shadow-[#7dd3c0]/40">
                      <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-white">0</p>
                      <p className="text-sm text-gray-400 font-medium mt-1">Chat Sessions</p>
                    </div>
                  </div>
                </div>
                <div className="group relative backdrop-blur-xl bg-[#0A0A0A]/40 border-2 border-[#7dd3c0] rounded-3xl p-8 hover:shadow-2xl hover:shadow-[#7dd3c0]/20 transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-5">
                    <div className="p-5 bg-[#7dd3c0] rounded-2xl shadow-lg shadow-[#7dd3c0]/40">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-white">0</p>
                      <p className="text-sm text-gray-400 font-medium mt-1">Pending Approvals</p>
                    </div>
                  </div>
                </div>
                <div className="group relative backdrop-blur-xl bg-[#0A0A0A]/40 border-2 border-[#7dd3c0] rounded-3xl p-8 hover:shadow-2xl hover:shadow-[#7dd3c0]/20 transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-5">
                    <div className="p-5 bg-[#7dd3c0] rounded-2xl shadow-lg shadow-[#7dd3c0]/40">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-white">1</p>
                      <p className="text-sm text-gray-400 font-medium mt-1">Active Sessions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Info Card */}
              <div className="backdrop-blur-xl bg-[#0A0A0A]/40 border-2 border-[#7dd3c0] rounded-3xl p-10 shadow-xl shadow-[#7dd3c0]/20">
                <h3 className="text-2xl font-bold text-white mb-8">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                    <p className="text-white mt-3 font-semibold text-xl">{user.display_name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <p className="text-white mt-3 font-semibold text-xl">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</label>
                    <div className="mt-3">
                      <span
                        className={`inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold ${
                          isAdmin()
                            ? "bg-[#7dd3c0]/20 text-[#7dd3c0] border border-[#7dd3c0]/40"
                            : "bg-[#7dd3c0]/10 text-gray-300 border-2 border-[#7dd3c0]"
                        }`}
                      >
                        {user.role === "admin" ? "Administrator" : "End User"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                    <div className="mt-3">
                      <span className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold bg-[#7dd3c0]/20 text-[#7dd3c0] border border-[#7dd3c0]/40">
                        <span className="w-2 h-2 bg-[#7dd3c0] rounded-full mr-2 animate-pulse"></span>
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="backdrop-blur-xl bg-[#0A0A0A]/40 border-2 border-[#7dd3c0] rounded-3xl p-10 shadow-xl shadow-[#7dd3c0]/20">
                <h3 className="text-2xl font-bold text-white mb-8">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <button className="group flex flex-col items-start gap-4 p-6 bg-[#7dd3c0]/10 border-2 border-[#7dd3c0] hover:border-[#7dd3c0]/60 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#7dd3c0]/20 text-left">
                    <div className="p-3 bg-[#7dd3c0] rounded-xl shadow-lg shadow-[#7dd3c0]/40 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">New Chat</p>
                      <p className="text-sm text-gray-400 mt-1">Start conversation</p>
                    </div>
                  </button>
                  <button className="group flex flex-col items-start gap-4 p-6 bg-[#7dd3c0]/10 border-2 border-[#7dd3c0] hover:border-[#7dd3c0]/60 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#7dd3c0]/20 text-left">
                    <div className="p-3 bg-[#7dd3c0] rounded-xl shadow-lg shadow-[#7dd3c0]/40 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">Request Approval</p>
                      <p className="text-sm text-gray-400 mt-1">Submit new request</p>
                    </div>
                  </button>
                  <button className="group flex flex-col items-start gap-4 p-6 bg-[#7dd3c0]/10 border-2 border-[#7dd3c0] hover:border-[#7dd3c0]/60 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#7dd3c0]/20 text-left">
                    <div className="p-3 bg-[#7dd3c0] rounded-xl shadow-lg shadow-[#7dd3c0]/40 group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">Profile</p>
                      <p className="text-sm text-gray-400 mt-1">View your profile</p>
                    </div>
                  </button>
                  {isAdmin() && (
                    <button className="group flex flex-col items-start gap-4 p-6 bg-[#7dd3c0]/10 border-2 border-[#7dd3c0] hover:border-[#7dd3c0]/60 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#7dd3c0]/20 text-left">
                      <div className="p-3 bg-[#7dd3c0] rounded-xl shadow-lg shadow-[#7dd3c0]/40 group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-white">Manage Users</p>
                        <p className="text-sm text-gray-400 mt-1">Admin panel</p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center p-4 glow-background">
      <header className="relative z-10 w-full mb-12">
        {/* Updated Navigation Bar */}
        <nav className="flex items-center justify-between p-4 bg-transparent absolute top-0 left-0 w-full">
          <div className="flex items-center space-x-2 ml-4">
            <img
              src="/SecurDI-logo-white-1-1.png"
              alt="SecurDI Logo"
              width={150}
              height={150}
            />
            {/* Removed the 'SecurDI' text next to the logo */}
          </div>
          {/* Removed top-right navbar */}
      </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-grow flex flex-col justify-center items-center px-4 max-w-4xl mx-auto py-20">
        <h1 className="text-6xl font-extrabold mb-8 animate-fade-in-up text-securdi-accent gradient-text">
          SecurAI Chatbot
              </h1>
        {/* Removed subheading text */}
        <Link
                href="/api/auth/authorize"
          className="px-10 py-4 border-2 border-white text-white rounded-full text-lg font-semibold transition-all duration-300 animate-scale-in animation-delay-400 hover:scale-105"
        >
          Login with Entra ID
        </Link>
      </main>

      {/* Dotted Navigation for sections (if applicable) */}
      <footer className="relative z-10 mt-12 flex space-x-3 pb-8">
        <span className="w-3 h-3 bg-white rounded-full opacity-50"></span>
        <span className="w-3 h-3 bg-white rounded-full opacity-100"></span>
        <span className="w-3 h-3 bg-white rounded-full opacity-50"></span>
        <span className="w-3 h-3 bg-white rounded-full opacity-50"></span>
      </footer>
    </div>
  );
}
