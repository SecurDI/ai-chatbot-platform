"use client";

import { useAuth } from "@/hooks/use-auth";
import { MessageSquare, FileText, CheckCircle, User, Users } from "lucide-react";

/**
 * Dashboard Content Component
 * Main dashboard view with stats and quick actions
 */
export default function DashboardContent() {
  console.log("📊 DashboardContent component rendering");
  const { user, isAdmin } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-securdi-dark-bg">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
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
  );
}
