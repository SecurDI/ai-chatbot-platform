"use client";
import { useAuth } from "@/hooks/use-auth";
import { MessageSquare, Shield, Zap, CheckCircle, Menu, X, User, LogOut, LayoutDashboard, Users, FileText } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

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
      <div className="min-h-screen flex items-center justify-center bg-securdi-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-securdi-accent"></div>
      </div>
    );
  }

  // If user is logged in, show dashboard with sidebar
  if (user) {
    return (
      <div className="min-h-screen bg-securdi-dark-bg wave-background flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-72" : "w-0"
          } bg-securdi-dark-bg/90 backdrop-blur-xl border-r border-securdi-accent/20 transition-all duration-300 overflow-hidden flex flex-col shadow-xl shadow-slate-900/50`}
        >
          <div className="p-6 border-b border-securdi-accent/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/SecurDI-logo-white-1-1.png"
                  alt="SecurDI Logo"
                  width={40}
                  height={40}
                />
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
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-securdi-accent/10 text-securdi-accent font-semibold border border-securdi-accent/20 shadow-sm transition-all hover:bg-securdi-accent/20"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </a>
            <a
              href="/chat"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-securdi-accent/10 hover:text-securdi-text-light transition-all duration-200"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Chat</span>
            </a>
            <a
              href="/approvals"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-securdi-accent/10 hover:text-securdi-text-light transition-all duration-200"
            >
              <FileText className="w-5 h-5" />
              <span>Approvals</span>
            </a>
            {isAdmin() && (
              <a
                href="/admin/users"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-securdi-accent/10 hover:text-securdi-text-light transition-all duration-200"
              >
                <Users className="w-5 h-5" />
                <span>User Management</span>
              </a>
            )}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-securdi-accent/20">
            <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-securdi-dark-bg/50 rounded-xl border border-securdi-accent/20">
              <div className="w-10 h-10 bg-securdi-accent rounded-full flex items-center justify-center shadow-lg shadow-securdi-accent/30">
                <User className="w-5 h-5 text-securdi-text-light" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-securdi-text-light truncate">{user.display_name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-securdi-dark-bg/60 backdrop-blur-xl border-b border-securdi-accent/20 px-8 py-6 shadow-sm shadow-slate-900/20">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-securdi-accent/10 rounded-xl transition-colors"
                >
                  <Menu className="w-5 h-5 text-slate-300" />
                </button>
              )}
              <div>
                <h2 className="text-3xl font-bold text-securdi-text-light">Dashboard</h2>
                <p className="text-sm text-slate-400 mt-1">Welcome back, {user.display_name}</p>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group relative backdrop-blur-xl bg-securdi-dark-bg/40 border border-securdi-accent/20 rounded-3xl p-8 hover:shadow-2xl hover:shadow-securdi-accent/10 transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-5">
                    <div className="p-5 bg-securdi-accent rounded-2xl shadow-lg shadow-securdi-accent/40">
                      <MessageSquare className="w-7 h-7 text-securdi-text-light" />
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-securdi-text-light">0</p>
                      <p className="text-sm text-slate-400 font-medium mt-1">Chat Sessions</p>
                    </div>
                  </div>
                </div>
                <div className="group relative backdrop-blur-xl bg-securdi-dark-bg/40 border border-securdi-accent/20 rounded-3xl p-8 hover:shadow-2xl hover:shadow-securdi-accent/10 transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-5">
                    <div className="p-5 bg-securdi-accent rounded-2xl shadow-lg shadow-securdi-accent/40">
                      <FileText className="w-7 h-7 text-securdi-text-light" />
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-securdi-text-light">0</p>
                      <p className="text-sm text-slate-400 font-medium mt-1">Pending Approvals</p>
                    </div>
                  </div>
                </div>
                <div className="group relative backdrop-blur-xl bg-securdi-dark-bg/40 border border-securdi-accent/20 rounded-3xl p-8 hover:shadow-2xl hover:shadow-green-500/10 transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-5">
                    <div className="p-5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg shadow-green-500/40">
                      <CheckCircle className="w-7 h-7 text-securdi-text-light" />
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-securdi-text-light">1</p>
                      <p className="text-sm text-slate-400 font-medium mt-1">Active Sessions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Info Card */}
              <div className="backdrop-blur-xl bg-securdi-dark-bg/40 border border-securdi-accent/20 rounded-3xl p-10 shadow-xl shadow-slate-900/50">
                <h3 className="text-2xl font-bold text-securdi-text-light mb-8">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                    <p className="text-securdi-text-light mt-3 font-semibold text-xl">{user.display_name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <p className="text-securdi-text-light mt-3 font-semibold text-xl">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</label>
                    <div className="mt-3">
                      <span
                        className={`inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold ${
                          isAdmin()
                            ? "bg-securdi-accent/10 text-securdi-accent border border-securdi-accent/20"
                            : "bg-securdi-accent/10 text-slate-300 border border-securdi-accent/20"
                        }`}
                      >
                        {user.role === "admin" ? "Administrator" : "End User"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                    <div className="mt-3">
                      <span className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="backdrop-blur-xl bg-securdi-dark-bg/40 border border-securdi-accent/20 rounded-3xl p-10 shadow-xl shadow-slate-900/50">
                <h3 className="text-2xl font-bold text-securdi-text-light mb-8">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <button className="group flex flex-col items-start gap-4 p-6 bg-securdi-accent/10 border border-securdi-accent/20 hover:border-securdi-accent/50 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-securdi-accent/10 text-left">
                    <div className="p-3 bg-securdi-accent rounded-xl shadow-lg shadow-securdi-accent/40 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-6 h-6 text-securdi-text-light" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-securdi-text-light">New Chat</p>
                      <p className="text-sm text-slate-400 mt-1">Start conversation</p>
                    </div>
                  </button>
                  <button className="group flex flex-col items-start gap-4 p-6 bg-securdi-accent/10 border border-securdi-accent/20 hover:border-securdi-accent/50 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-securdi-accent/10 text-left">
                    <div className="p-3 bg-securdi-accent rounded-xl shadow-lg shadow-securdi-accent/40 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-securdi-text-light" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-securdi-text-light">Request Approval</p>
                      <p className="text-sm text-slate-400 mt-1">Submit new request</p>
                    </div>
                  </button>
                  <button className="group flex flex-col items-start gap-4 p-6 bg-securdi-accent/10 border border-securdi-accent/20 hover:border-green-500/50 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/10 text-left">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg shadow-green-500/40">
                      <User className="w-6 h-6 text-securdi-text-light" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-securdi-text-light">Profile</p>
                      <p className="text-sm text-slate-400 mt-1">View your profile</p>
                    </div>
                  </button>
                  {isAdmin() && (
                    <button className="group flex flex-col items-start gap-4 p-6 bg-securdi-accent/10 border border-securdi-accent/20 hover:border-securdi-accent/50 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-securdi-accent/10 text-left">
                      <div className="p-3 bg-securdi-accent rounded-xl shadow-lg shadow-securdi-accent/40 group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6 text-securdi-text-light" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-securdi-text-light">Manage Users</p>
                        <p className="text-sm text-slate-400 mt-1">Admin panel</p>
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-securdi-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-securdi-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-securdi-accent/5 rounded-full blur-3xl"></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-securdi-dark-bg/80 backdrop-blur-xl border-b border-securdi-accent/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src="/SecurDI-logo-white-1-1.png"
                alt="SecurDI Logo"
                width={150}
                height={150}
              />
              {/* Removed the 'SecurDI' text next to the logo */}
            </div>
            
            {/* Navigation Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-300 hover:text-securdi-text-light transition-colors duration-200">Features</a>
              <a href="#about" className="text-sm font-medium text-slate-300 hover:text-securdi-text-light transition-colors duration-200">About</a>
              <a href="#contact" className="text-sm font-medium text-slate-300 hover:text-securdi-text-light transition-colors duration-200">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-24 pb-32 lg:pt-36 lg:pb-48">
        <div className="grid lg:grid-cols-2 gap-20 lg:gap-24 items-center">
          {/* Left Side: Hero Content */}
          <div className="order-2 lg:order-1">
            {/* Glassmorphic Card */}
            <div className="backdrop-blur-xl bg-securdi-dark-bg/40 border border-securdi-accent/20 rounded-3xl p-12 lg:p-16 shadow-2xl shadow-slate-900/50">
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-securdi-accent/10 text-securdi-accent border border-securdi-accent/20">
                  <div className="w-2 h-2 bg-securdi-accent rounded-full animate-pulse mr-2"></div>
                  Enterprise AI Platform
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-securdi-text-light leading-[1.05] tracking-tight mb-8">
                Transform Your<br />
                <span className="bg-gradient-to-r from-securdi-accent to-securdi-accent bg-clip-text text-transparent">
                  Workflow
                </span><br />
                with Intelligent AI
              </h1>

              <p className="text-xl lg:text-2xl text-slate-300 leading-relaxed mb-12 max-w-2xl">
                Enterprise-grade AI chatbot with approval workflows and secure cloud management for modern organizations
              </p>

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/auth/login"
                  className="inline-flex items-center justify-center bg-securdi-accent hover:opacity-90 text-securdi-text-light px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl shadow-securdi-accent/25 hover:shadow-2xl hover:shadow-securdi-accent/40 transition-all duration-300 hover:scale-[1.02] group"
                >
                  <Shield className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Sign In via Entra ID
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center bg-securdi-accent/10 hover:bg-securdi-accent/20 text-securdi-text-light hover:text-securdi-text-light px-8 py-4 rounded-2xl text-lg font-medium border border-securdi-accent/20 hover:border-securdi-accent/30 transition-all duration-300"
                >
                  Learn More
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center gap-8 text-sm">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">SOC 2 Certified</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Shield className="w-4 h-4" />
                <span className="font-medium">EntraID SSO</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Zap className="w-4 h-4" />
                <span className="font-medium">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">GDPR Compliant</span>
              </div>
            </div>
          </div>

          {/* Right Side: Modern AI Visualization */}
          <div className="relative h-[500px] lg:h-[700px] order-1 lg:order-2">
            {/* Central AI Core */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-securdi-dark-bg/60 rounded-3xl border border-securdi-accent/20 backdrop-blur-xl shadow-2xl shadow-slate-900/50">
              <div className="absolute inset-4 bg-securdi-accent/10 rounded-2xl border border-securdi-accent/20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-securdi-accent rounded-full shadow-xl shadow-securdi-accent/30 animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm"></div>
              </div>
            </div>

            {/* Orbital Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 animate-spin" style={{ animationDuration: '20s' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-securdi-accent rounded-full shadow-lg shadow-securdi-accent/50"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-securdi-accent rounded-full shadow-lg shadow-securdi-accent/50"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-securdi-accent rounded-full shadow-lg shadow-securdi-accent/50"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-securdi-accent rounded-full shadow-lg shadow-securdi-accent/50"></div>
            </div>

            {/* Floating Cards */}
            <div className="absolute top-[15%] right-[20%] w-24 h-32 bg-securdi-dark-bg/60 rounded-2xl border border-securdi-accent/20 backdrop-blur-xl shadow-xl shadow-slate-900/30 transform rotate-12 hover:rotate-6 transition-transform duration-500">
              <div className="p-4">
                <div className="w-4 h-4 bg-green-400 rounded-full mb-2"></div>
                <div className="w-full h-1 bg-securdi-accent/20 rounded mb-2"></div>
                <div className="w-3/4 h-1 bg-securdi-accent/20 rounded"></div>
              </div>
            </div>

            <div className="absolute bottom-[20%] left-[15%] w-28 h-20 bg-securdi-dark-bg/60 rounded-2xl border border-securdi-accent/20 backdrop-blur-xl shadow-xl shadow-slate-900/30 transform -rotate-6 hover:-rotate-3 transition-transform duration-500">
              <div className="p-4">
                <div className="w-3 h-3 bg-securdi-accent rounded-full mb-2"></div>
                <div className="w-full h-1 bg-securdi-accent/20 rounded mb-1"></div>
                <div className="w-2/3 h-1 bg-securdi-accent/20 rounded"></div>
              </div>
            </div>

            <div className="absolute top-[60%] right-[10%] w-20 h-20 bg-securdi-dark-bg/60 rounded-2xl border border-securdi-accent/20 backdrop-blur-xl shadow-xl shadow-slate-900/30 transform rotate-45 hover:rotate-30 transition-transform duration-500">
              <div className="p-3">
                <div className="w-3 h-3 bg-securdi-accent rounded-full"></div>
              </div>
            </div>

            {/* Data Flow Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 400">
              <defs>
                <linearGradient id="flow1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7dd3c0" />
                  <stop offset="100%" stopColor="#7dd3c0" />
                </linearGradient>
                <linearGradient id="flow2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7dd3c0" />
                  <stop offset="100%" stopColor="#7dd3c0" />
                </linearGradient>
              </defs>

              <path
                d="M50,100 Q150,50 250,100 Q300,150 350,100"
                stroke="url(#flow1)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="5,5"
                className="animate-pulse"
              />

              <path
                d="M50,300 Q150,250 250,300 Q300,350 350,300"
                stroke="url(#flow2)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="5,5"
                className="animate-pulse"
                style={{ animationDelay: '1s' }}
              />
            </svg>

            {/* Glow Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-securdi-accent/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-securdi-accent/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-securdi-accent/5 rounded-full blur-2xl"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
