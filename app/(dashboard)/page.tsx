"use client";
import { useAuth } from "@/hooks/use-auth";
export default function DashboardPage() {
  const { user, isLoading, logout, isAdmin } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">AI Chatbot Platform</h1>
              <p className="text-sm text-gray-400">Welcome, {user.display_name}</p>
            </div>
            <button onClick={logout} className="px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 rounded-md">Sign Out</button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">User Information</h2>
            <div className="space-y-3">
              <div><span className="text-sm text-gray-400">Name:</span><p className="text-white">{user.display_name}</p></div>
              <div><span className="text-sm text-gray-400">Email:</span><p className="text-white">{user.email}</p></div>
              <div><span className="text-sm text-gray-400">Role:</span><p><span className={isAdmin() ? "bg-blue-900/30 text-blue-400" : "bg-gray-800 text-gray-300" + " px-3 py-1 rounded-full text-sm"}>{user.role === "admin" ? "Administrator" : "End User"}</span></p></div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Phase 2 Complete! 🎉</h2>
            <p className="text-gray-400">Authentication system is now fully functional.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
