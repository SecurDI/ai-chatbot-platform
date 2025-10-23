"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Settings as SettingsIcon, CheckCircle, XCircle, RefreshCw, Info, Lock } from "lucide-react";
import type { EntraConfigSafe } from "@/types/database";

/**
 * Admin Entra ID Settings Page
 * Allows admins to configure Entra ID (Azure AD) settings
 */
export default function AdminEntraSettingsPage() {
  const { user, isLoading, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [entraConfig, setEntraConfig] = useState<EntraConfigSafe | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [formData, setFormData] = useState({
    tenantId: "",
    clientId: "",
    clientSecret: "",
    redirectUri: "",
    domain: "",
  });

  // Fetch Entra config
  const fetchEntraConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/entra-config");
      const data = await response.json();

      if (data.success && data.data) {
        setEntraConfig(data.data);
        setFormData({
          tenantId: data.data.tenant_id,
          clientId: data.data.client_id,
          clientSecret: data.data.client_secret ? "********" : "", // Mask secret
          redirectUri: data.data.redirect_uri,
          domain: data.data.domain || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch Entra config:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin()) {
      fetchEntraConfig();
    }
  }, [user]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save Entra config
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTestResult(null);

    try {
      const payload = { ...formData };
      // Only send clientSecret if it's changed from the masked value
      if (payload.clientSecret === "********") {
        const { clientSecret, ...payloadWithoutSecret } = payload;
        Object.assign(payload, payloadWithoutSecret);
      }

      const response = await fetch("/api/admin/entra-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        fetchEntraConfig();
        setEditMode(false);
        alert("Entra ID configuration saved successfully!");
      } else {
        alert(data.error || "Failed to save Entra ID configuration.");
      }
    } catch (error) {
      console.error("Failed to save Entra config:", error);
      alert("Failed to save Entra ID configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  // Test Entra ID connection
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/admin/entra-config/test");
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error("Failed to test connection:", error);
      setTestResult({ success: false, message: "Failed to connect to Entra ID." });
    } finally {
      setIsTesting(false);
    }
  };

  // Loading state
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-securdi-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-securdi-accent"></div>
      </div>
    );
  }

  // Check admin access
  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-securdi-dark-bg">
        <div className="text-center">
          <Shield className="w-16 h-16 text-securdi-accent mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-securdi-text-light mb-2">Access Denied</h1>
          <p className="text-gray-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-securdi-dark-bg wave-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-securdi-text-light mb-2">Entra ID Settings</h1>
          <p className="text-gray-400">Configure your Azure Active Directory / Entra ID integration</p>
        </div>

        {/* Organization Info Card */}
        <div className="backdrop-blur-xl bg-securdi-dark-bg border border-securdi-accent/20 rounded-3xl p-8 mb-8 shadow-xl">
          <h2 className="text-2xl font-bold text-securdi-text-light mb-6">Organization Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400">Organization Name</label>
              <p className="mt-2 text-lg text-securdi-text-light">SecurDI Corp</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Organization ID</label>
              <p className="mt-2 text-lg text-securdi-text-light">org_securdi_12345</p>
            </div>
          </div>
        </div>

        {/* Configuration Status Card */}
        <div className="backdrop-blur-xl bg-securdi-dark-bg border border-securdi-accent/20 rounded-3xl p-8 mb-8 shadow-xl">
          <h2 className="text-2xl font-bold text-securdi-text-light mb-6">Current Configuration</h2>
          {entraConfig ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">Tenant ID</label>
                <p className="mt-1 text-lg text-securdi-text-light">{entraConfig.tenant_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Client ID</label>
                <p className="mt-1 text-lg text-securdi-text-light">{entraConfig.client_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Client Secret</label>
                <p className="mt-1 text-lg text-securdi-text-light">{entraConfig.client_secret ? "********" : "Not configured"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Redirect URI</label>
                <p className="mt-1 text-lg text-securdi-text-light">{entraConfig.redirect_uri}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Custom Domain</label>
                <p className="mt-1 text-lg text-securdi-text-light">{entraConfig.domain || "N/A"}</p>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="flex items-center gap-2 px-6 py-3 bg-securdi-accent hover:opacity-90 text-securdi-text-light rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTesting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {isTesting ? "Testing..." : "Test Connection"}
                </button>
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-securdi-accent/10 hover:bg-securdi-accent/20 text-securdi-text-light rounded-xl font-semibold transition-all"
                >
                  <SettingsIcon className="w-5 h-5" />
                  Edit Configuration
                </button>
              </div>

              {testResult && (
                <div
                  className={`mt-4 p-4 rounded-xl border ${
                    testResult.success
                      ? "bg-green-900/20 border-green-800 text-green-300"
                      : "bg-red-900/20 border-red-800 text-red-300"
                  }`}
                >
                  <p className="flex items-center gap-2 font-medium">
                    {testResult.success ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    Test Result:
                  </p>
                  <p className="mt-2 text-sm">{testResult.message}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400 text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-gray-500" />
              No Entra ID configuration found. Please configure it to enable SSO.
              <button
                onClick={() => setEditMode(true)}
                className="ml-4 px-4 py-2 bg-securdi-accent/10 hover:bg-securdi-accent/20 text-securdi-text-light rounded-xl font-semibold transition-all"
              >
                Configure Now
              </button>
            </div>
          )}
        </div>

        {/* Edit Configuration Form */}
        {editMode && (
          <div className="backdrop-blur-xl bg-securdi-dark-bg border border-securdi-accent/20 rounded-3xl p-8 shadow-xl mt-8">
            <h2 className="text-2xl font-bold text-securdi-text-light mb-6">Edit Entra ID Configuration</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label htmlFor="tenantId" className="block text-sm font-medium text-gray-400 mb-2">Tenant ID</label>
                <input
                  type="text"
                  id="tenantId"
                  name="tenantId"
                  value={formData.tenantId}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-securdi-dark-bg/50 border border-securdi-accent/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-securdi-accent focus:border-transparent text-securdi-text-light"
                />
              </div>
              <div>
                <label htmlFor="clientId" className="block text-sm font-medium text-gray-400 mb-2">Client ID</label>
                <input
                  type="text"
                  id="clientId"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-securdi-dark-bg/50 border border-securdi-accent/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-securdi-accent focus:border-transparent text-securdi-text-light"
                />
              </div>
              <div>
                <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-400 mb-2">Client Secret</label>
                <div className="relative">
                  <input
                    type="password"
                    id="clientSecret"
                    name="clientSecret"
                    value={formData.clientSecret}
                    onChange={handleChange}
                    className="w-full p-4 bg-securdi-dark-bg/50 border border-securdi-accent/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-securdi-accent focus:border-transparent text-securdi-text-light pr-12"
                    placeholder={entraConfig?.client_secret ? "********" : "Enter client secret"}
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
                <p className="mt-2 text-sm text-gray-500">Leave blank to keep current secret. Enter new value to update.</p>
              </div>
              <div>
                <label htmlFor="redirectUri" className="block text-sm font-medium text-gray-400 mb-2">Redirect URI</label>
                <input
                  type="url"
                  id="redirectUri"
                  name="redirectUri"
                  value={formData.redirectUri}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-securdi-dark-bg/50 border border-securdi-accent/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-securdi-accent focus:border-transparent text-securdi-text-light"
                />
                <p className="mt-2 text-sm text-gray-500">This must match the redirect URI configured in your Azure AD application.</p>
              </div>
              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-400 mb-2">Custom Domain (Optional)</label>
                <input
                  type="text"
                  id="domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  className="w-full p-4 bg-securdi-dark-bg/50 border border-securdi-accent/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-securdi-accent focus:border-transparent text-securdi-text-light"
                  placeholder="e.g., yourcompany.com"
                />
                <p className="mt-2 text-sm text-gray-500">Only allow users from this domain to sign in.</p>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  disabled={isSaving}
                  className="px-6 py-3 bg-securdi-dark-bg/50 border border-securdi-accent/20 text-securdi-text-light rounded-xl font-semibold hover:bg-securdi-accent/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-securdi-accent hover:opacity-90 text-securdi-text-light rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {isSaving ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
