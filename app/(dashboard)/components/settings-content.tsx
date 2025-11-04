"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { User as UserIcon, Shield, Building2, ExternalLink, RefreshCw, Lock, Info } from "lucide-react";

/**
 * Settings Content Component
 * Allows users to view and manage their account information
 */
export default function SettingsContent() {
  const { user, isLoading, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accountInfo, setAccountInfo] = useState<any | null>(null);

  // Fetch account info
  const fetchAccountInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings/account");
      const data = await response.json();

      if (data.success) {
        setAccountInfo(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch account info:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAccountInfo();
    }
  }, [user]);

  // Loading state
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-securdi-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-securdi-accent"></div>
      </div>
    );
  }

  // Check authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-securdi-dark-bg">
        <div className="text-center">
          <Lock className="w-16 h-16 text-securdi-accent mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-securdi-text-light mb-2">Authentication Required</h1>
          <p className="text-gray-400">Please sign in to view your account settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-securdi-dark-bg wave-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-securdi-text-light mb-2">Account Settings</h1>
          <p className="text-gray-400">Manage your profile and connected accounts</p>
        </div>

        {/* Profile Information Card */}
        <div className="backdrop-blur-xl bg-securdi-dark-bg border border-securdi-accent/20 rounded-3xl p-8 mb-8 shadow-xl">
          <h2 className="text-2xl font-bold text-securdi-text-light mb-6">Profile Information</h2>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-securdi-accent rounded-full flex items-center justify-center shadow-lg shadow-securdi-accent/40">
              <UserIcon className="w-12 h-12 text-securdi-text-light" />
            </div>
            <div>
              <p className="text-3xl font-bold text-securdi-text-light">{user.display_name}</p>
              <p className="text-md text-gray-400">{user.email}</p>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
                    isAdmin()
                      ? "bg-securdi-accent/10 text-securdi-accent border border-securdi-accent/20"
                      : "bg-securdi-accent/10 text-gray-400 border border-securdi-accent/20"
                  }`}
                >
                  {user.role === "admin" ? "Administrator" : "End User"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
            <div>
              <label className="block text-sm font-medium text-gray-400">User ID</label>
              <p className="mt-1 text-securdi-text-light text-lg">{user.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Created At</label>
              <p className="mt-1 text-securdi-text-light text-lg">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Last Login</label>
              <p className="mt-1 text-securdi-text-light text-lg">{user.last_login ? new Date(user.last_login).toLocaleString() : "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Organization Card */}
        {accountInfo?.organization && (
          <div className="backdrop-blur-xl bg-securdi-dark-bg border border-securdi-accent/20 rounded-3xl p-8 mb-8 shadow-xl">
            <h2 className="text-2xl font-bold text-securdi-text-light mb-6">Organization</h2>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-securdi-accent/10 rounded-full flex items-center justify-center shadow-lg shadow-securdi-accent/10">
                <Building2 className="w-8 h-8 text-securdi-accent" />
              </div>
              <div>
                <p className="text-xl font-bold text-securdi-text-light">{accountInfo.organization.name}</p>
                <p className="text-sm text-gray-400">ID: {accountInfo.organization.id}</p>
              </div>
            </div>
          </div>
        )}

        {/* Connected Accounts Card */}
        <div className="backdrop-blur-xl bg-securdi-dark-bg border border-securdi-accent/20 rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-securdi-text-light mb-6">Connected Accounts</h2>
          {accountInfo?.entraConfig ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-securdi-accent/10 rounded-xl border border-securdi-accent/20">
                <div className="flex items-center gap-4">
                  <svg width="24" height="24" viewBox="0 0 21 21" fill="none">
                    <rect width="10" height="10" fill="#F25022"/>
                    <rect x="11" width="10" height="10" fill="#7FBA00"/>
                    <rect y="11" width="10" height="10" fill="#00A4EF"/>
                    <rect x="11" y="11" width="10" height="10" fill="#FFB900"/>
                  </svg>
                  <div>
                    <p className="font-semibold text-securdi-text-light">Microsoft Entra ID</p>
                    <p className="text-sm text-gray-400">Connected as {user.email}</p>
                  </div>
                </div>
                <a
                  href={accountInfo.entraConfig.sso_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-securdi-accent hover:text-securdi-accent/80 transition-colors"
                >
                  Manage <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="p-4 bg-securdi-dark-bg/50 rounded-xl border border-securdi-accent/20">
                <p className="text-sm font-semibold text-securdi-text-light mb-2">Permissions Granted:</p>
                <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                  <li>Read user profile</li>
                  <li>Access user email address</li>
                  <li>Maintain access to data you have given it access to</li>
                </ul>
                <p className="mt-4 text-xs text-gray-500 flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5" />
                  These permissions are required for seamless integration and user management.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 flex items-center gap-2">
              <Info className="w-5 h-5 text-gray-500" />
              No Entra ID account connected. Please contact your administrator.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
