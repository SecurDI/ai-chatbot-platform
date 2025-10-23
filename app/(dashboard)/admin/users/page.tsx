"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { User as UserIcon, Shield, Trash2, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { User } from "@/types/database";

/**
 * Admin User Management Page
 * Allows admins to view, edit, and manage users
 */
export default function AdminUsersPage() {
  const { user, isLoading, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/users?page=${currentPage}&limit=20`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin()) {
      fetchUsers();
    }
  }, [user, currentPage]);

  // Update user role
  const updateUserRole = async (userId: string, newRole: "admin" | "end-user") => {
    try {
      setActionLoading(true);
      const response = await fetch(`/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (data.success) {
        fetchUsers();
        setShowRoleModal(false);
        setSelectedUser(null);
      } else {
        alert(data.error || "Failed to update user role");
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Failed to update user role");
    } finally {
      setActionLoading(false);
    }
  };

  // Deactivate user
  const deactivateUser = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this user?")) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error || "Failed to deactivate user");
      }
    } catch (error) {
      console.error("Failed to deactivate user:", error);
      alert("Failed to deactivate user");
    } finally {
      setActionLoading(false);
    }
  };

  // Reactivate user
  const reactivateUser = async (userId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reactivate" }),
      });

      const data = await response.json();

      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error || "Failed to reactivate user");
      }
    } catch (error) {
      console.error("Failed to reactivate user:", error);
      alert("Failed to reactivate user");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter users by search term
  const filteredUsers = users.filter(
    (u) =>
      u.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-4xl font-bold text-securdi-text-light mb-2">User Management</h1>
          <p className="text-gray-400">Manage user roles and permissions</p>
        </div>

        {/* Search Bar */}
        <div className="backdrop-blur-xl bg-securdi-dark-bg border border-securdi-accent/20 rounded-3xl p-6 mb-6 shadow-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-securdi-dark-bg/50 border border-securdi-accent/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-securdi-accent focus:border-transparent text-securdi-text-light placeholder-gray-500"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="backdrop-blur-xl bg-securdi-dark-bg border border-securdi-accent/20 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-securdi-accent/10 border-b border-securdi-accent/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-securdi-accent/20">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-securdi-accent/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-securdi-accent rounded-full flex items-center justify-center shadow-lg shadow-securdi-accent/30">
                          <UserIcon className="w-5 h-5 text-securdi-text-light" />
                        </div>
                        <div>
                          <p className="font-semibold text-securdi-text-light">{u.display_name}</p>
                          <p className="text-sm text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-securdi-accent/10 text-securdi-accent border border-securdi-accent/20"
                            : "bg-securdi-accent/10 text-gray-400 border border-securdi-accent/20"
                        }`}
                      >
                        {u.role === "admin" ? "Administrator" : "End User"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          u.is_active
                            ? "bg-securdi-accent/10 text-securdi-accent border border-securdi-accent/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-securdi-accent" : "bg-red-400"}`}></span>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {u.last_login ? new Date(u.last_login).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowRoleModal(true);
                          }}
                          disabled={u.id === user.id || actionLoading}
                          className="p-2 hover:bg-securdi-accent/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Change Role"
                        >
                          <Shield className="w-4 h-4 text-securdi-accent" />
                        </button>
                        {u.is_active ? (
                          <button
                            onClick={() => deactivateUser(u.id)}
                            disabled={u.id === user.id || actionLoading}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Deactivate User"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        ) : (
                          <button
                            onClick={() => reactivateUser(u.id)}
                            disabled={actionLoading}
                            className="p-2 hover:bg-securdi-accent/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Reactivate User"
                          >
                            <RefreshCw className="w-4 h-4 text-securdi-accent" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-securdi-dark-bg/50 border-t border-securdi-accent/20 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-securdi-dark-bg border border-securdi-accent/20 rounded-lg hover:bg-securdi-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-securdi-dark-bg border border-securdi-accent/20 rounded-lg hover:bg-securdi-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-gray-300"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-xl bg-securdi-dark-bg border border-securdi-accent/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-securdi-text-light mb-4">Change User Role</h3>
            <p className="text-gray-400 mb-6">
              Update role for <strong className="text-securdi-text-light">{selectedUser.display_name}</strong>
            </p>
            <div className="space-y-3 mb-6">
              <button
                onClick={() => updateUserRole(selectedUser.id, "admin")}
                disabled={actionLoading || selectedUser.role === "admin"}
                className="w-full p-4 bg-securdi-accent text-securdi-text-light rounded-2xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {selectedUser.role === "admin" ? "✓ Administrator (Current)" : "Make Administrator"}
              </button>
              <button
                onClick={() => updateUserRole(selectedUser.id, "end-user")}
                disabled={actionLoading || selectedUser.role === "end-user"}
                className="w-full p-4 bg-securdi-accent/10 text-gray-300 rounded-2xl font-semibold hover:bg-securdi-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {selectedUser.role === "end-user" ? "✓ End User (Current)" : "Make End User"}
              </button>
            </div>
            <button
              onClick={() => {
                setShowRoleModal(false);
                setSelectedUser(null);
              }}
              disabled={actionLoading}
              className="w-full p-4 border border-securdi-accent/30 text-gray-300 rounded-2xl font-semibold hover:bg-securdi-accent/10 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
