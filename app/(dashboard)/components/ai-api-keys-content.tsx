"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Key, Plus, Trash2, Eye, EyeOff, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";

/**
 * AI API Keys Content Component
 * Allows admins to manage API keys for different AI models
 */
export default function AIApiKeysContent() {
  console.log("🔑 AIApiKeysContent component rendering");
  const { user, isLoading, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    provider: "",
    model: "",
    apiKey: "",
    name: "",
    description: "",
  });

  // Available AI providers and models
  const aiProviders = [
    { value: "openai", label: "OpenAI", models: ["gpt-4", "gpt-3.5-turbo", "gpt-4-turbo"] },
    { value: "anthropic", label: "Anthropic", models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"] },
    { value: "google", label: "Google", models: ["gemini-pro", "gemini-pro-vision"] },
    { value: "azure", label: "Azure OpenAI", models: ["gpt-4", "gpt-35-turbo"] },
  ];

  // Fetch API keys
  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/ai-api-keys");
      const data = await response.json();

      if (data.success) {
        setApiKeys(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin()) {
      fetchApiKeys();
    }
  }, [user]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add new API key
  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/ai-api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        fetchApiKeys();
        setShowAddForm(false);
        setFormData({ provider: "", model: "", apiKey: "", name: "", description: "" });
        alert("API key added successfully!");
      } else {
        alert(data.error || "Failed to add API key.");
      }
    } catch (error) {
      console.error("Failed to add API key:", error);
      alert("Failed to add API key.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete API key
  const handleDeleteKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) {
      return;
    }

    setIsDeleting(keyId);
    try {
      const response = await fetch(`/api/admin/ai-api-keys/${keyId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        fetchApiKeys();
        alert("API key deleted successfully!");
      } else {
        alert(data.error || "Failed to delete API key.");
      }
    } catch (error) {
      console.error("Failed to delete API key:", error);
      alert("Failed to delete API key.");
    } finally {
      setIsDeleting(null);
    }
  };

  // Toggle secret visibility
  const toggleSecretVisibility = (keyId: string) => {
    setShowSecrets(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  // Mask API key
  const maskApiKey = (key: string) => {
    if (key.length <= 8) return "****";
    return key.substring(0, 4) + "****" + key.substring(key.length - 4);
  };

  // Loading state
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-securdi-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7dd3c0]"></div>
      </div>
    );
  }

  // Check admin access
  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-securdi-dark-bg">
        <div className="text-center">
          <Shield className="w-16 h-16 text-[#7dd3c0] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
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
          <h1 className="text-4xl font-bold text-white mb-2">AI API Keys Management</h1>
          <p className="text-gray-400">Manage API keys for different AI models and providers</p>
        </div>

        {/* Add New Key Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#7dd3c0] hover:opacity-90 text-white rounded-xl font-semibold transition-all"
          >
            <Plus className="w-5 h-5" />
            Add New API Key
          </button>
        </div>

        {/* API Keys List */}
        <div className="backdrop-blur-xl bg-[#0A0A0A]/40 border-2 border-[#7dd3c0] rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">Current API Keys</h2>
          {apiKeys.length > 0 ? (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="bg-[#0A0A0A]/50 border-2 border-[#7dd3c0] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{key.name}</h3>
                      <p className="text-sm text-gray-400">{key.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSecretVisibility(key.id)}
                        className="p-2 hover:bg-[#7dd3c0]/10 rounded-lg transition-colors"
                        title={showSecrets[key.id] ? "Hide API Key" : "Show API Key"}
                      >
                        {showSecrets[key.id] ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        disabled={isDeleting === key.id}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete API Key"
                      >
                        {isDeleting === key.id ? (
                          <RefreshCw className="w-4 h-4 text-red-400 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Provider</label>
                      <p className="mt-1 text-white capitalize">{key.provider}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Model</label>
                      <p className="mt-1 text-white">{key.model}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">API Key</label>
                      <p className="mt-1 text-white font-mono text-sm">
                        {showSecrets[key.id] ? key.api_key : maskApiKey(key.api_key)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      key.is_active 
                        ? "bg-green-900/20 text-green-300 border border-green-800" 
                        : "bg-red-900/20 text-red-300 border border-red-800"
                    }`}>
                      {key.is_active ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {key.is_active ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs text-gray-500">
                      Created: {new Date(key.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Key className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No API Keys Found</h3>
              <p className="text-gray-400 mb-6">Add your first API key to get started with AI models.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-[#7dd3c0] hover:opacity-90 text-white rounded-xl font-semibold transition-all"
              >
                Add API Key
              </button>
            </div>
          )}
        </div>

        {/* Add New Key Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="backdrop-blur-xl bg-[#0A0A0A] border-2 border-[#7dd3c0] rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">Add New API Key</h3>
              <form onSubmit={handleAddKey} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="provider" className="block text-sm font-medium text-gray-400 mb-2">Provider</label>
                    <select
                      id="provider"
                      name="provider"
                      value={formData.provider}
                      onChange={handleChange}
                      required
                      className="w-full p-4 bg-[#0A0A0A]/50 border-2 border-[#7dd3c0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7dd3c0] focus:border-transparent text-white"
                    >
                      <option value="">Select Provider</option>
                      {aiProviders.map((provider) => (
                        <option key={provider.value} value={provider.value}>
                          {provider.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-400 mb-2">Model</label>
                    <select
                      id="model"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      required
                      className="w-full p-4 bg-[#0A0A0A]/50 border-2 border-[#7dd3c0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7dd3c0] focus:border-transparent text-white"
                    >
                      <option value="">Select Model</option>
                      {formData.provider && aiProviders.find(p => p.value === formData.provider)?.models.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-4 bg-[#0A0A0A]/50 border-2 border-[#7dd3c0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7dd3c0] focus:border-transparent text-white"
                    placeholder="e.g., OpenAI GPT-4 Production"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-4 bg-[#0A0A0A]/50 border-2 border-[#7dd3c0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7dd3c0] focus:border-transparent text-white"
                    placeholder="Brief description of this API key's purpose"
                  />
                </div>
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-400 mb-2">API Key</label>
                  <input
                    type="password"
                    id="apiKey"
                    name="apiKey"
                    value={formData.apiKey}
                    onChange={handleChange}
                    required
                    className="w-full p-4 bg-[#0A0A0A]/50 border-2 border-[#7dd3c0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7dd3c0] focus:border-transparent text-white"
                    placeholder="Enter your API key"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Your API key will be encrypted and stored securely.
                  </p>
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    disabled={isSaving}
                    className="px-6 py-3 bg-[#0A0A0A]/50 border-2 border-[#7dd3c0] text-white rounded-xl font-semibold hover:bg-[#7dd3c0]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#7dd3c0] hover:opacity-90 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Key className="w-5 h-5" />
                    )}
                    {isSaving ? "Adding..." : "Add API Key"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
