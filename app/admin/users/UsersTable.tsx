"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Shield, GraduationCap, User, ChevronDown,
  Check, Loader2, AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department: string | null;
  student_id: string | null;
  created_at: string;
}

interface Props {
  users: UserProfile[];
  currentUserId: string;
}

const ROLE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  admin: {
    label: "Admin",
    icon: Shield,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  faculty: {
    label: "Faculty",
    icon: GraduationCap,
    color: "text-upgreen-700",
    bg: "bg-upgreen-50",
    border: "border-upgreen-200",
  },
  student: {
    label: "Student",
    icon: User,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
};

function RoleDropdown({
  userId,
  currentRole,
  isSelf,
  onRoleChange,
}: {
  userId: string;
  currentRole: string;
  isSelf: boolean;
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const cfg = ROLE_CONFIG[currentRole] ?? ROLE_CONFIG.student;
  const Icon = cfg.icon;

  async function handleSelect(role: string) {
    if (role === currentRole) { setOpen(false); return; }
    setOpen(false);
    setLoading(true);
    await onRoleChange(userId, role);
    setLoading(false);
  }

  if (isSelf) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${cfg.bg} ${cfg.border} ${cfg.color}`}>
        <Icon size={11} />
        {cfg.label}
        <span className="text-[10px] opacity-60">(you)</span>
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all hover:shadow-sm ${cfg.bg} ${cfg.border} ${cfg.color} ${loading ? "opacity-60" : ""}`}
      >
        {loading
          ? <Loader2 size={11} className="animate-spin" />
          : <Icon size={11} />
        }
        {cfg.label}
        <ChevronDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-xl border border-maroon-100 shadow-xl z-20 overflow-hidden">
          <div className="px-3 py-2 border-b border-maroon-50">
            <p className="text-[10px] font-semibold text-maroon-400 uppercase tracking-wide">Change Role</p>
          </div>
          {Object.entries(ROLE_CONFIG).map(([role, config]) => {
            const RIcon = config.icon;
            const isActive = role === currentRole;
            return (
              <button
                key={role}
                onClick={() => handleSelect(role)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors
                  ${isActive ? `${config.bg} ${config.color} font-semibold` : "text-maroon-700 hover:bg-parchment-50"}`}
              >
                <RIcon size={13} className={isActive ? config.color : "text-maroon-400"} />
                {config.label}
                {isActive && <Check size={11} className={`ml-auto ${config.color}`} />}
              </button>
            );
          })}
        </div>
      )}

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}

export default function UsersTable({ users, currentUserId }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = users.filter((u) => {
    const matchSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department ?? "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  async function handleRoleChange(userId: string, newRole: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to update role.");
    } else {
      const cfg = ROLE_CONFIG[newRole];
      toast.success(`Role updated to ${cfg?.label ?? newRole}.`);
      router.refresh();
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-maroon-100 shadow-sm overflow-hidden">

      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-maroon-50 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-maroon-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, department..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-maroon-200 bg-parchment-50 text-sm text-maroon-800 placeholder-maroon-300 focus:outline-none focus:ring-2 focus:ring-maroon-400 transition-all"
          />
        </div>

        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="pl-3 pr-8 py-2 rounded-xl border border-maroon-200 bg-parchment-50 text-sm text-maroon-700 focus:outline-none focus:ring-2 focus:ring-maroon-400 appearance-none transition-all"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="faculty">Faculty</option>
            <option value="student">Student</option>
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon-400 pointer-events-none" />
        </div>

        <span className="text-xs text-maroon-400 ml-auto">{filtered.length} users</span>
      </div>

      {/* Notice */}
      <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-start gap-2">
        <AlertCircle size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          Promoting a user to <strong>Faculty</strong> gives them access to validate pending studies.
          Promoting to <strong>Admin</strong> grants full platform control. You cannot change your own role.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-maroon-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-maroon-500 uppercase tracking-wide">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-maroon-500 uppercase tracking-wide hidden md:table-cell">Department</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-maroon-500 uppercase tracking-wide hidden lg:table-cell">Joined</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-maroon-500 uppercase tracking-wide">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-maroon-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-maroon-400 text-sm">
                  No users match your search.
                </td>
              </tr>
            ) : (
              filtered.map((user) => {
                const isSelf = user.id === currentUserId;
                return (
                  <tr key={user.id} className={`hover:bg-parchment-50/50 transition-colors ${isSelf ? "bg-maroon-50/30" : ""}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* Initials avatar */}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-parchment-100"
                          style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}
                        >
                          {user.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-maroon-900">
                            {user.full_name}
                            {isSelf && <span className="ml-1.5 text-xs text-maroon-400">(you)</span>}
                          </p>
                          <p className="text-xs text-maroon-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-maroon-600 text-sm">{user.department ?? "—"}</p>
                      {user.student_id && (
                        <p className="text-xs text-maroon-400">{user.student_id}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <p className="text-maroon-500 text-xs">
                        {new Date(user.created_at).toLocaleDateString("en-PH", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <RoleDropdown
                        userId={user.id}
                        currentRole={user.role}
                        isSelf={isSelf}
                        onRoleChange={handleRoleChange}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
