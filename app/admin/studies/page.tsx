import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BookOpen, CheckCircle2, Clock, XCircle, RefreshCw, Eye, EyeOff } from "lucide-react";
import StudiesTable from "./StudiesTable";

export default async function StudiesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/admin/submissions");

  const { data: studies } = await supabase
    .from("studies")
    .select(`
      id, title, adviser, course, department, status,
      is_published, submitted_at, published_at, updated_at,
      author:profiles!studies_author_id_fkey(full_name, email),
      category:categories(name, color)
    `)
    .order("submitted_at", { ascending: false });

  const all = studies ?? [];
  const stats = {
    total: all.length,
    published: all.filter((s) => s.is_published).length,
    pending: all.filter((s) => s.status === "pending").length,
    rejected: all.filter((s) => s.status === "rejected").length,
    revision: all.filter((s) => s.status === "revision_requested").length,
  };

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #8f153520, #6b0f2420)", border: "1.5px solid #8f153530" }}>
            <BookOpen size={17} className="text-maroon-600" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-maroon-800">All Studies</h1>
        </div>
        <p className="text-maroon-400 text-sm ml-12">Manage, publish, or remove research submissions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Total", value: stats.total, icon: BookOpen, color: "text-maroon-700", bg: "bg-maroon-50 border-maroon-100" },
          { label: "Published", value: stats.published, icon: Eye, color: "text-upgreen-700", bg: "bg-upgreen-50 border-upgreen-100" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
          { label: "Revision", value: stats.revision, icon: RefreshCw, color: "text-blue-700", bg: "bg-blue-50 border-blue-100" },
          { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-700", bg: "bg-red-50 border-red-100" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`rounded-2xl border p-4 shadow-sm ${stat.bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={13} className={stat.color} />
                <span className={`text-xs font-medium ${stat.color}`}>{stat.label}</span>
              </div>
              <p className={`font-serif text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <StudiesTable studies={all} />
    </div>
  );
}
