"use client";
import { useAuth } from "@/hooks/use-auth";
import { MessageSquare, FileText, CheckCircle, User, Users } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading, logout, isAdmin } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-securdi-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-securdi-accent"></div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-securdi-dark-bg">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-securdi-dark-bg glow-background">
      <main className="max-w-7xl mx-auto px-4 py-12">
        <header className="mb-8">
          <div className="bg-securdi-dark-bg border border-securdi-accent/20 rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-securdi-text-light mb-8">Dashboard</h2>
            <p className="text-sm text-slate-400 mt-1">Welcome back, {user.display_name}</p>
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
              <div className="group relative backdrop-blur-xl bg-securdi-dark-bg/40 border border-securdi-accent/20 rounded-3xl p-8 hover:shadow-2xl hover:shadow-securdi-accent/10 transition-all hover:-translate-y-1">
                <div className="flex items-center gap-5">
                  <div className="p-5 bg-securdi-accent rounded-2xl shadow-lg shadow-securdi-accent/40">
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
                    <span className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold bg-securdi-accent/10 text-securdi-accent border border-securdi-accent/30">
                      <span className="w-2 h-2 bg-securdi-accent rounded-full mr-2 animate-pulse"></span>
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
                <button className="group flex flex-col items-start gap-4 p-6 bg-securdi-accent/10 border border-securdi-accent/20 hover:border-securdi-accent/50 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-securdi-accent/10 text-left">
                  <div className="p-3 bg-securdi-accent rounded-xl shadow-lg shadow-securdi-accent/40 group-hover:scale-110 transition-transform">
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
