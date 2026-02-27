import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClipboardCheck, Clock, FileText } from "lucide-react";
import ValidationCard from "./ValidationCard";

export default async function SubmissionsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/admin/submissions");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();

  if (!profile || !["admin", "faculty"].includes(profile.role)) redirect("/");

  const { data: studies, error } = await supabase
    .from("studies")
    .select(`
      id, title, abstract, adviser, course, department,
      keywords, date_completed, submitted_at, file_url, file_name,
      status, category_id,
      author:profiles!studies_author_id_fkey(full_name, email, student_id),
      category:categories(name, color)
    `)
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });

  const pending = studies ?? [];

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #8f153520, #6b0f2420)", border: "1.5px solid #8f153530" }}>
            <ClipboardCheck size={17} className="text-maroon-600" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-maroon-800">Pending Validation</h1>
        </div>
        <p className="text-maroon-400 text-sm ml-12">
          Review and validate student research submissions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-maroon-100 p-4 shadow-sm">
          <p className="font-serif text-3xl font-bold text-maroon-800">{pending.length}</p>
          <p className="text-xs text-maroon-400 mt-1 uppercase tracking-wide">Awaiting Review</p>
        </div>
        <div className="bg-white rounded-2xl border border-maroon-100 p-4 shadow-sm">
          <p className="font-serif text-3xl font-bold text-amber-600">
            {pending.filter(s => {
              const days = Math.floor((Date.now() - new Date(s.submitted_at).getTime()) / 86400000);
              return days > 7;
            }).length}
          </p>
          <p className="text-xs text-maroon-400 mt-1 uppercase tracking-wide">Over 7 Days</p>
        </div>
        <div className="bg-white rounded-2xl border border-maroon-100 p-4 shadow-sm">
          <p className="font-serif text-3xl font-bold text-upgreen-600">
            {pending.filter(s => {
              const days = Math.floor((Date.now() - new Date(s.submitted_at).getTime()) / 86400000);
              return days <= 2;
            }).length}
          </p>
          <p className="text-xs text-maroon-400 mt-1 uppercase tracking-wide">New (≤2 days)</p>
        </div>
      </div>

      {/* List */}
      {pending.length === 0 ? (
        <div className="bg-white rounded-2xl border border-maroon-100 p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-upgreen-50 flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck size={28} className="text-upgreen-500" />
          </div>
          <h3 className="font-serif text-lg text-maroon-700 mb-2">All caught up!</h3>
          <p className="text-maroon-400 text-sm">No studies are pending validation right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((study) => (
            <ValidationCard key={study.id} study={study} validatorId={user.id} />
          ))}
        </div>
      )}
    </div>
  );
}
