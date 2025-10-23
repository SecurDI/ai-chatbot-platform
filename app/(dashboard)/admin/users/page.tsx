"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Admin Users Page - Redirects to SPA Dashboard
 * This route is now handled by the SPA dashboard
 */
export default function AdminUsersPage() {
  console.log("🔄 AdminUsersPage: Redirecting to SPA dashboard");
  const router = useRouter();

  useEffect(() => {
    // Redirect to main dashboard which will handle SPA navigation
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-securdi-dark-bg">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-securdi-accent"></div>
    </div>
  );
}