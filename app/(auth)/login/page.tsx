"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      const errors: Record<string, string> = {
        invalid_callback: "Invalid authentication callback.",
        invalid_state: "Invalid authentication state.",
        no_id_token: "Authentication failed. No token received.",
        session_creation_failed: "Failed to create session.",
        authentication_failed: "Authentication failed.",
        access_denied: "Access denied.",
      };
      setError(errors[errorParam] || "Login error occurred.");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{backgroundColor: '#0f0f0f'}}>
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">AI Chatbot Platform</h1>
            <p className="text-gray-400">Sign in with your Microsoft account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900 bg-opacity-20 border border-red-800 rounded-md">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={() => { setIsLoading(true); window.location.href = "/api/auth/login"; }}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            {isLoading ? (
              <span>Redirecting...</span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
                  <rect width="10" height="10" fill="#F25022"/>
                  <rect x="11" width="10" height="10" fill="#7FBA00"/>
                  <rect y="11" width="10" height="10" fill="#00A4EF"/>
                  <rect x="11" y="11" width="10" height="10" fill="#FFB900"/>
                </svg>
                <span>Sign in with Microsoft</span>
              </>
            )}
          </button>

          <p className="mt-6 text-center text-xs text-gray-500">
            Secure authentication via Azure Active Directory
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          By signing in, you agree to our terms of service
        </p>
      </div>
    </div>
  );
}
