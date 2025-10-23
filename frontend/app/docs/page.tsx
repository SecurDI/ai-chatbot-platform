"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Copy, Check, Search, ExternalLink } from "lucide-react";

// Helper component for syntax highlighting (simplified for this example)
const SyntaxHighlighter = ({ code, language }: { code: string; language: string }) => {
  return (
    <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto my-4">
      <code className={`language-${language} text-gray-200`}>{code}</code>
    </pre>
  );
};

// Helper component for Pretty JSON display (simplified)
const PrettyJson = ({ data }: { data: any }) => (
  <SyntaxHighlighter code={JSON.stringify(data, null, 2)} language="json" />
);

// Copy Button Component
const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-3 py-1 bg-securdi-accent/10 border border-securdi-accent/20 text-securdi-accent rounded-md text-xs font-medium hover:bg-securdi-accent/20 transition-colors"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
};

/**
 * API Documentation Page
 * Provides interactive API documentation with examples
 */
export default function DocsPage() {
  const { user, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("introduction");

  const methodStyles: { [key: string]: string } = {
    GET: "bg-green-600",
    POST: "bg-securdi-accent",
    PUT: "bg-yellow-600",
    DELETE: "bg-red-600",
  };

  const apiEndpoints = [
    {
      id: "introduction",
      title: "Introduction",
      description: "Welcome to the SecurDI API documentation. This guide will help you get started with integrating your applications.",
      content: (
        <>
          <h3 className="text-xl font-semibold text-securdi-text-light mb-4">Authentication</h3>
          <p className="text-gray-400 mb-4">All API requests must be authenticated using a valid session token. Obtain a token by completing the OAuth 2.0 flow via Microsoft Entra ID.</p>
          <SyntaxHighlighter code={`Authorization: Bearer <YOUR_SESSION_TOKEN>`} language="http" />

          <h3 className="text-xl font-semibold text-securdi-text-light mb-4">Base URL</h3>
          <p className="text-gray-400 mb-4">All API endpoints are prefixed with:</p>
          <SyntaxHighlighter code={`https://api.securdi.com/v1`} language="http" />
        </>
      ),
    },
    {
      id: "get-users",
      title: "Get All Users",
      method: "GET",
      path: "/api/admin/users",
      description: "Retrieve a list of all users in the organization. Requires admin privileges.",
      request: null,
      response: {
        success: true,
        data: [
          { id: "user_1", display_name: "Alice Smith", email: "alice@securdi.com", role: "end-user" },
          { id: "user_2", display_name: "Bob Johnson", email: "bob@securdi.com", role: "admin" },
        ],
      },
    },
    {
      id: "create-user",
      title: "Create User",
      method: "POST",
      path: "/api/admin/users",
      description: "Create a new user. Requires admin privileges.",
      request: { display_name: "Charlie Brown", email: "charlie@securdi.com", role: "end-user" },
      response: { success: true, data: { id: "user_3", display_name: "Charlie Brown", email: "charlie@securdi.com", role: "end-user" } },
    },
    {
      id: "get-user-by-id",
      title: "Get User by ID",
      method: "GET",
      path: "/api/users/{id}",
      description: "Retrieve a specific user by their ID. Requires admin privileges or ownership.",
      request: null,
      response: { success: true, data: { id: "user_1", display_name: "Alice Smith", email: "alice@securdi.com", role: "end-user" } },
    },
    {
      id: "update-user",
      title: "Update User Role",
      method: "PUT",
      path: "/api/users/{id}",
      description: "Update a user's role. Requires admin privileges.",
      request: { role: "admin" },
      response: { success: true, message: "User role updated successfully." },
    },
    {
      id: "delete-user",
      title: "Deactivate User",
      method: "DELETE",
      path: "/api/users/{id}",
      description: "Deactivate a user, making them unable to log in. Requires admin privileges.",
      request: null,
      response: { success: true, message: "User deactivated successfully." },
    },
    {
      id: "get-entra-config",
      title: "Get Entra ID Config",
      method: "GET",
      path: "/api/admin/entra-config",
      description: "Retrieve the current Entra ID configuration. Requires admin privileges.",
      request: null,
      response: { success: true, data: { tenant_id: "xxxx-xxxx-xxxx", client_id: "yyyy-yyyy-yyyy", redirect_uri: "https://localhost:3000/auth/callback" } },
    },
    {
      id: "update-entra-config",
      title: "Update Entra ID Config",
      method: "POST",
      path: "/api/admin/entra-config",
      description: "Update the Entra ID configuration. Requires admin privileges.",
      request: { tenantId: "xxxx-xxxx-xxxx", clientId: "yyyy-yyyy-yyyy", clientSecret: "your_secret", redirectUri: "https://localhost:3000/auth/callback" },
      response: { success: true, message: "Entra ID configuration updated." },
    },
    {
      id: "test-entra-config",
      title: "Test Entra ID Connection",
      method: "GET",
      path: "/api/admin/entra-config/test",
      description: "Test the configured Entra ID connection. Requires admin privileges.",
      request: null,
      response: { success: true, message: "Connection to Entra ID successful!" },
    },
  ];

  const filteredEndpoints = apiEndpoints.filter(
    (endpoint) =>
      endpoint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (endpoint.path && endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const handleScroll = () => {
      const sections = filteredEndpoints.map((endpoint) => document.getElementById(endpoint.id));
      let currentActive = "introduction";

      for (const section of sections) {
        if (section && window.scrollY >= section.offsetTop - 100) {
          currentActive = section.id;
        }
      }
      setActiveSection(currentActive);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredEndpoints]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-securdi-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-securdi-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-securdi-dark-bg text-gray-200 flex">
      {/* Sidebar Navigation */}
      <nav className="w-72 bg-securdi-dark-bg/80 backdrop-blur-xl border-r border-securdi-accent/20 p-6 flex-col hidden lg:flex sticky top-0 h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold text-securdi-text-light mb-6">
          API Docs
        </h2>
        <input
          type="text"
          placeholder="Search documentation..."
          className="w-full px-4 py-3 bg-securdi-dark-bg/50 border border-securdi-accent/20 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-securdi-accent focus:border-transparent text-securdi-text-light placeholder-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ul className="space-y-2">
          {filteredEndpoints.map((endpoint) => (
            <li key={endpoint.id}>
              <a
                href={`#${endpoint.id}`}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  activeSection === endpoint.id
                    ? "bg-securdi-accent/10 text-securdi-accent border border-securdi-accent/20"
                    : "text-gray-400 hover:bg-securdi-accent/10 hover:text-securdi-text-light"
                }`}
              >
                {endpoint.method && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      methodStyles[endpoint.method] || "bg-gray-500"
                    } text-white`}
                  >
                    {endpoint.method}
                  </span>
                )}
                <span>{endpoint.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold gradient-text mb-12">
            API Documentation
          </h1>

          {filteredEndpoints.map((endpoint) => (
            <section key={endpoint.id} id={endpoint.id} className="mb-16 last:mb-0">
              <div className="flex items-center gap-4 mb-6">
                {endpoint.method && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      methodStyles[endpoint.method] || "bg-gray-500"
                    } text-white`}
                  >
                    {endpoint.method}
                  </span>
                )}
                <h2 className="text-3xl font-bold text-securdi-text-light">{endpoint.title}</h2>
              </div>
              <p className="text-lg text-gray-400 mb-8">{endpoint.description}</p>

              {endpoint.path && (
                <div className="bg-securdi-dark-bg/50 border border-securdi-accent/20 rounded-xl p-4 flex items-center justify-between gap-4 mb-6">
                  <code className="font-mono text-securdi-text-light text-sm">
                    <span className="text-gray-500">BASE_URL</span>{endpoint.path}
                  </code>
                  <CopyButton textToCopy={`BASE_URL${endpoint.path}`} />
                </div>
              )}

              {endpoint.request && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-securdi-text-light mb-4">Request Example</h3>
                  <div className="relative">
                    <PrettyJson data={endpoint.request} />
                    <div className="absolute top-4 right-4">
                      <CopyButton textToCopy={JSON.stringify(endpoint.request, null, 2)} />
                    </div>
                  </div>
                </div>
              )}

              {endpoint.response && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-securdi-text-light mb-4">Response Example</h3>
                  <div className="relative">
                    <PrettyJson data={endpoint.response} />
                    <div className="absolute top-4 right-4">
                      <CopyButton textToCopy={JSON.stringify(endpoint.response, null, 2)} />
                    </div>
                  </div>
                </div>
              )}

              {endpoint.content && <div className="mt-8">{endpoint.content}</div>}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
