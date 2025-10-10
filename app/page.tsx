"use client";
import { useAuth } from "@/hooks/use-auth";
import { MessageSquare, Shield, Zap, CheckCircle, Menu, X, User, LogOut, LayoutDashboard, Users, FileText } from "lucide-react";
import { useState } from "react";

/**
 * Landing/Dashboard page component
 * Shows landing page for unauthenticated users, dashboard for authenticated users
 *
 * @returns Landing page or Dashboard UI
 */
export default function HomePage() {
  const { user, isLoading, logout, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131314]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is logged in, show dashboard with sidebar
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-72" : "w-0"
          } bg-white/80 backdrop-blur-xl border-r border-gray-200/50 transition-all duration-300 overflow-hidden flex flex-col shadow-xl`}
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
            <a
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-700 font-semibold border border-purple-500/20 shadow-sm transition-all"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </a>
            <a
              href="/chat"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Chat</span>
            </a>
            <a
              href="/approvals"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all"
            >
              <FileText className="w-5 h-5" />
              <span>Approvals</span>
            </a>
            {isAdmin() && (
              <a
                href="/admin/users"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all"
              >
                <Users className="w-5 h-5" />
                <span>User Management</span>
              </a>
            )}
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
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white/60 backdrop-blur-md border-b border-gray-200/50 px-8 py-6 shadow-sm">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Menu className="w-5 h-5 text-gray-700" />
                </button>
              )}
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-sm text-gray-600 mt-1">Welcome back, {user.display_name}</p>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-auto p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group relative backdrop-blur-xl bg-white/70 border border-white/60 rounded-3xl p-8 hover:shadow-2xl hover:shadow-purple-200/50 transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-5">
                    <div className="p-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/40">
                      <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-gray-900">0</p>
                      <p className="text-sm text-gray-600 font-medium mt-1">Chat Sessions</p>
                    </div>
                  </div>
                </div>
                <div className="group relative backdrop-blur-xl bg-white/70 border border-white/60 rounded-3xl p-8 hover:shadow-2xl hover:shadow-blue-200/50 transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-5">
                    <div className="p-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/40">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-gray-900">0</p>
                      <p className="text-sm text-gray-600 font-medium mt-1">Pending Approvals</p>
                    </div>
                  </div>
                </div>
                <div className="group relative backdrop-blur-xl bg-white/70 border border-white/60 rounded-3xl p-8 hover:shadow-2xl hover:shadow-green-200/50 transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-5">
                    <div className="p-5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg shadow-green-500/40">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-gray-900">1</p>
                      <p className="text-sm text-gray-600 font-medium mt-1">Active Sessions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Info Card */}
              <div className="backdrop-blur-xl bg-white/70 border border-white/60 rounded-3xl p-10 shadow-xl shadow-purple-100/50">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                    <p className="text-gray-900 mt-3 font-semibold text-xl">{user.display_name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                    <p className="text-gray-900 mt-3 font-semibold text-xl">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</label>
                    <div className="mt-3">
                      <span
                        className={`inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold ${
                          isAdmin()
                            ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-700 border border-purple-500/30"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {user.role === "admin" ? "Administrator" : "End User"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
                    <div className="mt-3">
                      <span className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 border border-green-500/30">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="backdrop-blur-xl bg-white/70 border border-white/60 rounded-3xl p-10 shadow-xl shadow-purple-100/50">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <button className="group flex flex-col items-start gap-4 p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/60 hover:border-purple-300 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-200/50 text-left">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/40 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900">New Chat</p>
                      <p className="text-sm text-gray-600 mt-1">Start conversation</p>
                    </div>
                  </button>
                  <button className="group flex flex-col items-start gap-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/60 hover:border-blue-300 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-200/50 text-left">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/40 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900">Request Approval</p>
                      <p className="text-sm text-gray-600 mt-1">Submit new request</p>
                    </div>
                  </button>
                  <button className="group flex flex-col items-start gap-4 p-6 bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/60 hover:border-green-300 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-green-200/50 text-left">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg shadow-green-500/40 group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900">Profile</p>
                      <p className="text-sm text-gray-600 mt-1">View your profile</p>
                    </div>
                  </button>
                  {isAdmin() && (
                    <button className="group flex flex-col items-start gap-4 p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/60 hover:border-orange-300 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-200/50 text-left">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg shadow-orange-500/40 group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900">Manage Users</p>
                        <p className="text-sm text-gray-600 mt-1">Admin panel</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-200/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-indigo-100/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/60 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 shadow-lg shadow-purple-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900">Nucleus AI</span>
            </div>
            
            {/* Navigation Menu */}
            <div className="hidden md:flex items-center gap-10">
              <a href="#features" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Features</a>
              <a href="#about" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">About</a>
              <a href="#contact" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-28 lg:pt-32 lg:pb-40">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left Side: Hero Content */}
          <div className="order-2 lg:order-1">
            {/* Glassmorphic Card */}
            <div className="backdrop-blur-xl bg-white/70 border border-white/60 rounded-[2.5rem] p-12 lg:p-16 shadow-2xl shadow-purple-200/50">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
                Transform Your<br />Workflow with<br />Intelligent AI
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed mb-10">
                Enterprise-grade AI chatbot with approval workflows and secure cloud management
              </p>
              
              {/* CTA Button */}
              <a
                href="/api/auth/login"
                className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-5 rounded-full text-lg font-semibold shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02]"
              >
                Sign In via Entra
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">SOC 2 Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="font-medium">EntraID SSO</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="font-medium">99.9% Uptime</span>
              </div>
            </div>
          </div>

          {/* Right Side: 3D Visual with Product Elements */}
          <div className="relative h-[500px] lg:h-[650px] order-1 lg:order-2">
            {/* Main center circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border-[3px] border-purple-300/40 backdrop-blur-sm"></div>
            
            {/* Outer decorative circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border-[2px] border-blue-300/30 animate-pulse" style={{ animationDuration: '3s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border-[2px] border-indigo-300/30 animate-pulse" style={{ animationDuration: '4s' }}></div>
            
            {/* Gradient glow orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/30 via-blue-400/30 to-indigo-400/30 rounded-full blur-[80px]"></div>
            <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-purple-300/40 rounded-full blur-[70px]"></div>
            <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-blue-300/40 rounded-full blur-[60px]"></div>
            
            {/* Floating product-style elements */}
            <div className="absolute top-[18%] right-[25%] w-20 h-28 rounded-3xl bg-gradient-to-br from-purple-400/30 to-purple-600/40 backdrop-blur-xl border-2 border-white/50 shadow-2xl shadow-purple-300/50"></div>
            <div className="absolute bottom-[22%] left-[22%] w-24 h-32 rounded-3xl bg-gradient-to-br from-blue-400/30 to-blue-600/40 backdrop-blur-xl border-2 border-white/50 shadow-2xl shadow-blue-300/50"></div>
            <div className="absolute top-[48%] right-[18%] w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400/40 to-indigo-600/50 backdrop-blur-xl border-2 border-white/50 shadow-2xl shadow-indigo-300/50"></div>
            
            {/* Curved decorative SVG lines */}
            <svg className="absolute top-[10%] left-[12%] w-52 h-52 opacity-50" viewBox="0 0 200 200">
              <path 
                d="M30,100 Q100,30 170,100" 
                stroke="url(#gradient1)" 
                strokeWidth="3" 
                fill="none" 
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            
            <svg className="absolute bottom-[12%] right-[12%] w-48 h-48 opacity-50" viewBox="0 0 200 200">
              <path 
                d="M30,80 Q100,150 170,80" 
                stroke="url(#gradient2)" 
                strokeWidth="3" 
                fill="none" 
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Small decorative circles */}
            <div className="absolute top-[25%] left-[28%] w-3 h-3 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50"></div>
            <div className="absolute bottom-[30%] right-[30%] w-2 h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
            <div className="absolute top-[55%] left-[20%] w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
