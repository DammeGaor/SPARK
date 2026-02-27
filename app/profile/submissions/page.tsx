import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookMarked, ChevronRight, ArrowLeft } from "lucide-react";
import SubmissionsList from "./SubmissionsList";

export default async function SubmissionsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/profile/submissions");

  const { data: studies } = await supabase
    .from("studies")
    .select(`
      id, title, abstract, status, is_published,
      submitted_at, updated_at, file_url, file_name,
      adviser, course, department, keywords,
      category:categories(name, color),
      validations(status, notes, reviewed_at,
        faculty:profiles!validations_faculty_id_fkey(full_name)
      )
    `)
    .eq("author_id", user.id)
    .order("submitted_at", { ascending: false });

  return (
    <div className="min-h-screen bg-parchment-50">

      {/* Header */}
      <div className="border-b border-maroon-100 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>
                <span className="text-parchment-100 font-serif font-bold text-xs">SP</span>
              </div>
              <span className="font-serif font-bold text-maroon-800 text-base">SPARK</span>
            </Link>
            <ChevronRight size={14} className="text-maroon-300" />
            <span className="text-sm text-maroon-500 font-medium">My Submissions</span>
          </div>
          <Link href="/profile" className="flex items-center gap-1.5 text-xs text-maroon-400 hover:text-maroon-700 transition-colors">
            <ArrowLeft size={13} /> Back to Profile
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #6b0f24 0%, #8f1535 60%, #5a0c1c 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #faf3e0 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }} />
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-upgreen-500" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-parchment-300/20"
              style={{ background: "rgba(250,243,224,0.1)" }}>
              <BookMarked size={17} className="text-parchment-200" />
            </div>
            <h1 className="font-serif text-2xl text-parchment-100 font-bold">My Submissions</h1>
          </div>
          <p className="text-parchment-400 text-sm ml-12">
            Track the status of your submitted research.
          </p>

          {/* Stats */}
          <div className="flex gap-6 mt-6 ml-12">
            {[
              { label: "Total", value: studies?.length ?? 0 },
              { label: "Published", value: studies?.filter((s) => s.is_published).length ?? 0 },
              { label: "Pending", value: studies?.filter((s) => s.status === "pending").length ?? 0 },
              { label: "Needs Revision", value: studies?.filter((s) => s.status === "revision_requested").length ?? 0 },
            ].map((stat, i, arr) => (
              <div key={stat.label} className="flex items-center gap-6">
                <div>
                  <p className="font-serif text-2xl font-bold text-parchment-100">{stat.value}</p>
                  <p className="text-parchment-400 text-xs mt-0.5">{stat.label}</p>
                </div>
                {i < arr.length - 1 && <div className="w-px h-8 bg-parchment-400/20" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <SubmissionsList studies={studies ?? []} />
      </div>
    </div>
  );
}
