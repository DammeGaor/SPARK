import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import UsersTable from "./UsersTable";

export default async function UsersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/admin/submissions");

  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, department, student_id, created_at")
    .order("created_at", { ascending: false });

  const all = users ?? [];
  const stats = {
    total: all.length,
    admins: all.filter((u) => u.role === "admin").length,
    faculty: all.filter((u) => u.role === "faculty").length,
    students: all.filter((u) => u.role === "student").length,
  };

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #8f153520, #6b0f2420)", border: "1.5px solid #8f153530" }}>
            <Users size={17} className="text-maroon-600" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-maroon-800">Users</h1>
        </div>
        <p className="text-maroon-400 text-sm ml-12">
          Manage user accounts and assign faculty/validator roles.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total Users", value: stats.total, color: "text-maroon-700", bg: "bg-maroon-50 border-maroon-100" },
          { label: "Admins", value: stats.admins, color: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
          { label: "Faculty", value: stats.faculty, color: "text-upgreen-700", bg: "bg-upgreen-50 border-upgreen-100" },
          { label: "Students", value: stats.students, color: "text-blue-700", bg: "bg-blue-50 border-blue-100" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl border p-4 shadow-sm ${stat.bg}`}>
            <p className={`font-serif text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className={`text-xs font-medium mt-1 ${stat.color}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <UsersTable users={all} currentUserId={user.id} />
    </div>
  );
}
