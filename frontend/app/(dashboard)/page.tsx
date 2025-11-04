"use client";
import { useAuth } from "@/hooks/use-auth";
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
        <div className="grid gap-6">
          <div className="bg-securdi-dark-bg border border-securdi-accent/20 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-securdi-text-light mb-6">User Information</h2>
            <div className="space-y-4">
              <div><span className="text-sm text-slate-300 font-medium">Name:</span><p className="text-securdi-text-light mt-1 text-lg">{user.display_name}</p></div>
              <div><span className="text-sm text-slate-300 font-medium">Email:</span><p className="text-securdi-text-light mt-1 text-lg">{user.email}</p></div>
              <div><span className="text-sm text-slate-300 font-medium">Role:</span><p className="mt-2"><span className={isAdmin() ? "bg-securdi-accent/20 text-securdi-accent border border-securdi-accent/30" : "bg-securdi-accent/10 text-slate-300 border border-securdi-accent/20" + " px-4 py-2 rounded-full text-sm font-medium"}>{user.role === "admin" ? "Administrator" : "End User"}</span></p></div>
            </div>
          </div>
          <div className="bg-securdi-dark-bg border border-securdi-accent/20 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-securdi-text-light mb-4">Welcome to SecurDI</h2>
            <p className="text-slate-300 text-lg">Your enterprise AI platform with intelligent workflow automation and secure cloud management.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
