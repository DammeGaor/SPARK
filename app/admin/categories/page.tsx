import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Tag } from "lucide-react";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/admin/submissions");

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, description, color, created_at")
    .order("name");

  // Get study counts per category
  const all = categories ?? [];
  const withCounts = await Promise.all(
    all.map(async (cat) => {
      const { count } = await supabase
        .from("studies")
        .select("*", { count: "exact", head: true })
        .eq("category_id", cat.id);
      return { ...cat, study_count: count ?? 0 };
    })
  );

  const stats = {
    total: all.length,
    totalStudies: withCounts.reduce((sum, c) => sum + c.study_count, 0),
    mostUsed: withCounts.sort((a, b) => b.study_count - a.study_count)[0]?.name ?? "—",
  };

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #8f153520, #6b0f2420)", border: "1.5px solid #8f153530" }}>
            <Tag size={17} className="text-maroon-600" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-maroon-800">Categories</h1>
        </div>
        <p className="text-maroon-400 text-sm ml-12">
          Manage research categories shown across the catalog and submission form.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-maroon-100 p-4 shadow-sm">
          <p className="font-serif text-3xl font-bold text-maroon-800">{stats.total}</p>
          <p className="text-xs text-maroon-400 mt-1 uppercase tracking-wide">Total Categories</p>
        </div>
        <div className="bg-white rounded-2xl border border-maroon-100 p-4 shadow-sm">
          <p className="font-serif text-3xl font-bold text-maroon-800">{stats.totalStudies}</p>
          <p className="text-xs text-maroon-400 mt-1 uppercase tracking-wide">Categorized Studies</p>
        </div>
        <div className="bg-white rounded-2xl border border-maroon-100 p-4 shadow-sm">
          <p className="font-serif text-base font-bold text-maroon-800 leading-snug">{stats.mostUsed}</p>
          <p className="text-xs text-maroon-400 mt-1 uppercase tracking-wide">Most Used</p>
        </div>
      </div>

      {/* Client — handles add/edit/delete */}
      <CategoriesClient categories={withCounts} />
    </div>
  );
}
