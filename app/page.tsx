"use client";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import Link from "next/link";
import SPADashboard from "./(dashboard)/components/spa-dashboard";

/**
 * Landing/Dashboard page component
 * Shows landing page for unauthenticated users, SPA dashboard for authenticated users
 *
 * @returns Landing page or SPA Dashboard UI
 */
export default function HomePage() {
  console.log("🏠 HomePage: Main page component rendering");
  const { user, isLoading } = useAuth();

  // Console logging for debugging
  console.log("HomePage rendered - Authentication debugging:");
  console.log("- User:", user ? "authenticated" : "not authenticated");
  console.log("- IsLoading:", isLoading);

  // Loading state
  if (isLoading) {
    console.log("⏳ HomePage: Loading state");
    return (
      <div className="min-h-screen flex items-center justify-center bg-securdi-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-securdi-accent"></div>
      </div>
    );
  }

  // If user is logged in, show SPA dashboard
  if (user) {
    console.log("✅ HomePage: User authenticated, rendering SPADashboard");
    return <SPADashboard />;
  }

  // Show landing page for unauthenticated users
  console.log("🔓 HomePage: User not authenticated, showing landing page");
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
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-grow flex flex-col justify-center items-center px-4 max-w-4xl mx-auto py-20">
        <h1 className="text-6xl font-extrabold mb-8 animate-fade-in-up text-securdi-accent gradient-text">
          SecurAI Chatbot
        </h1>
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