"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  providerEmployeeRange: string | null;
  companyVerificationStatus: string | null;
  isBanned: boolean;
  bannedReason: string | null;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      setUsers(data);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBan = async (user: UserRow) => {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isBanned: !user.isBanned,
        bannedReason: !user.isBanned ? "Banned by admin" : null,
      }),
    });

    if (!response.ok) {
      toast.error("Failed to update user");
      return;
    }

    toast.success(user.isBanned ? "User unbanned" : "User banned");
    fetchUsers();
  };

  const kickUser = async (userId: string) => {
    if (!confirm("Kick (delete) this user account?")) return;
    const response = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Failed to delete user");
      return;
    }
    toast.success("User deleted");
    fetchUsers();
  };

  const filtered = users.filter((u) => {
    const q = query.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">Users</h1>
      <p className="text-neutral-600 mb-6">View users, ban/unban, or kick accounts.</p>

      <div className="card mb-6">
        <Input
          placeholder="Search users by name, email, role"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-600" />
      ) : (
        <div className="space-y-4">
          {filtered.map((user) => (
            <div key={user.id} className="card flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-neutral-900">{user.name || "Unnamed"}</h3>
                <p className="text-sm text-neutral-600">{user.email}</p>
                <p className="text-xs text-neutral-500">Role: {user.role} - Orders: {user._count.orders}</p>
                {user.isBanned && (
                  <p className="text-xs text-red-600 mt-1">Banned: {user.bannedReason || "No reason"}</p>
                )}
                {user.role === "PROVIDER" && user.providerEmployeeRange === "10+" && (
                  <div className="mt-2 space-y-1 text-xs text-neutral-700">
                    <p>
                      Verification:{" "}
                      <span className="font-semibold">{user.companyVerificationStatus || "PENDING_DOCUMENTS"}</span>
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-wrap lg:justify-end">
                <Button size="sm" variant="outline" onClick={() => toggleBan(user)}>
                  {user.isBanned ? "Unban" : "Ban"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200"
                  onClick={() => kickUser(user.id)}
                >
                  Kick
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="card text-center text-neutral-500">No users found.</div>}
        </div>
      )}
    </div>
  );
}
