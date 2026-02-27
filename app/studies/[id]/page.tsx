import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Tag, User, Calendar, BookOpen,
  Building2, GraduationCap, FileText, ExternalLink, ChevronRight,
} from "lucide-react";
import NavbarUserMenu from "@/components/NavbarUserMenu";
import CommentsSection from "../CommentsSection";
import CitationCopy from "../CitationCopy";

export default async function StudyPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
    profile = data;
  }

  const { data: study } = await supabase
    .from("studies")
    .select(`
      id, title, abstract, adviser, course, department,
      keywords, date_completed, published_at, citation,
      file_url, file_name, file_size_bytes,
      author:profiles!studies_author_id_fkey(full_name, department),
      category:categories(name, color)
    `)
    .eq("id", params.id)
    .eq("is_published", true)
    .single();

  if (!study) notFound();

  const { data: commentsData } = await supabase
    .from("comments")
    .select(`id, body, created_at, parent_id, author:profiles!comments_user_id_fkey(id, full_name)`)
    .eq("study_id", params.id)
    .order("created_at", { ascending: true });

  const { data: related } = await supabase
    .from("studies")
    .select(`id, title, date_completed, author:profiles!studies_author_id_fkey(full_name), category:categories(name, color)`)
    .eq("is_published", true)
    .neq("id", study.id)
    .limit(3);

  const fileSizeMB = study.file_size_bytes ? (study.file_size_bytes / 1024 / 1024).toFixed(2) : null;

  return (
    <div className="min-h-screen bg-parchment-50 flex flex-col">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-parchment-50/90 backdrop-blur-md border-b border-maroon-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><Image src="/spark-logo.svg" alt="SPARK" width={120} height={38} priority /></Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/studies" className="px-4 py-2 text-sm text-maroon-600 hover:text-maroon-900 hover:bg-maroon-50 rounded-lg transition-all font-medium">
              Browse Catalog
            </Link>
            <div className="w-px h-4 bg-maroon-200 mx-1" />
            {profile
              ? <NavbarUserMenu fullName={profile.full_name} role={profile.role} />
              : <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-parchment-50 shadow-sm hover:shadow-md transition-all"
                  style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>Sign In</Link>
            }
          </nav>
          <div className="md:hidden">
            {profile
              ? <NavbarUserMenu fullName={profile.full_name} role={profile.role} />
              : <Link href="/login" className="px-3 py-1.5 rounded-lg text-xs font-medium text-parchment-50"
                  style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>Sign In</Link>
            }
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, #6b0f24 0%, #8f1535 60%, #5a0c1c 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #faf3e0 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-upgreen-500" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 text-parchment-400 text-xs mb-5 flex-wrap">
            <Link href="/" className="hover:text-parchment-200 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/studies" className="hover:text-parchment-200 transition-colors">Browse Catalog</Link>
            <ChevronRight size={12} />
            <span className="text-parchment-300 truncate max-w-xs">{study.title}</span>
          </div>
          {study.category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold mb-4"
              style={{ background: `${study.category.color}25`, borderColor: `${study.category.color}40`, color: "#faf3e0" }}>
              <Tag size={10} />{study.category.name}
            </span>
          )}
          <h1 className="font-serif text-2xl sm:text-3xl text-parchment-100 font-bold leading-snug mb-4">{study.title}</h1>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-parchment-400 text-sm">
            <span className="flex items-center gap-1.5"><User size={13} className="text-parchment-500" />{study.author?.full_name ?? "Unknown"}</span>
            <span className="flex items-center gap-1.5"><BookOpen size={13} className="text-parchment-500" />Adviser: {study.adviser}</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-parchment-500" />
              {study.date_completed ? new Date(study.date_completed).toLocaleDateString("en-PH", { year: "numeric", month: "long" }) : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main — 2/3 */}
          <div className="lg:col-span-2 space-y-5">

            {/* Abstract — overflow fixed */}
            <div className="bg-white rounded-2xl border border-maroon-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-maroon-50" style={{ background: "linear-gradient(135deg, #fdf6f0, #fff)" }}>
                <h2 className="font-serif text-base font-semibold text-maroon-800">Abstract</h2>
              </div>
              <div className="p-6 overflow-hidden">
                <p className="text-maroon-700 text-sm leading-relaxed break-words [overflow-wrap:anywhere]">
                  {study.abstract}
                </p>
              </div>
            </div>

            {/* Keywords — no hash icon */}
            {study.keywords?.length > 0 && (
              <div className="bg-white rounded-2xl border border-maroon-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-maroon-50" style={{ background: "linear-gradient(135deg, #fdf6f0, #fff)" }}>
                  <h2 className="font-serif text-base font-semibold text-maroon-800">Keywords</h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {study.keywords.map((kw: string, i: number) => (
                      <Link key={i} href={`/studies?query=${encodeURIComponent(kw)}`}
                        className="px-3 py-1 rounded-full bg-maroon-50 border border-maroon-100 text-xs text-maroon-700 hover:bg-maroon-100 hover:border-maroon-300 transition-all">
                        {kw}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Citation with copy button */}
            {study.citation && <CitationCopy citation={study.citation} />}

          </div>

          {/* Sidebar — 1/3 */}
          <div className="space-y-4">
            {study.file_url && (
              <div className="bg-white rounded-2xl border border-maroon-100 shadow-sm p-5">
                <h3 className="font-serif text-sm font-semibold text-maroon-800 mb-3">Study File</h3>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-parchment-50 border border-maroon-100 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #8f153520, #6b0f2420)", border: "1.5px solid #8f153530" }}>
                    <FileText size={16} className="text-maroon-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-maroon-800 truncate">{study.file_name ?? "study.pdf"}</p>
                    {fileSizeMB && <p className="text-xs text-maroon-400">{fileSizeMB} MB</p>}
                  </div>
                </div>
                <a href={study.file_url} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-parchment-50 text-sm font-medium transition-all shadow-sm hover:shadow-md"
                  style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>
                  <ExternalLink size={14} /> View PDF
                </a>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-maroon-100 shadow-sm p-5">
              <h3 className="font-serif text-sm font-semibold text-maroon-800 mb-4">Details</h3>
              <div className="space-y-3">
                {[
                  { icon: User, label: "Author", value: study.author?.full_name },
                  { icon: BookOpen, label: "Adviser", value: study.adviser },
                  { icon: GraduationCap, label: "Course", value: study.course },
                  { icon: Building2, label: "Department", value: study.department },
                  { icon: Calendar, label: "Completed", value: study.date_completed
                    ? new Date(study.date_completed).toLocaleDateString("en-PH", { year: "numeric", month: "long" }) : null },
                  { icon: Tag, label: "Category", value: study.category?.name },
                ].filter((d) => d.value).map((detail) => {
                  const Icon = detail.icon;
                  return (
                    <div key={detail.label} className="flex items-start gap-2.5">
                      <Icon size={13} className="text-maroon-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-maroon-400 uppercase tracking-wide">{detail.label}</p>
                        <p className="text-xs text-maroon-700 font-medium">{detail.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Link href="/studies"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-maroon-200 text-sm text-maroon-600 hover:bg-maroon-50 transition-all font-medium">
              <ArrowLeft size={14} /> Back to Catalog
            </Link>

            {/* Comments */}
            <CommentsSection
              studyId={study.id}
              currentUserId={user?.id ?? null}
              currentUserName={profile?.full_name ?? null}
              currentUserRole={profile?.role ?? null}
              initialComments={(commentsData ?? []) as any}
            />
          </div>
        </div>

        {related && related.length > 0 && (
          <div className="mt-10">
            <h2 className="font-serif text-xl font-bold text-maroon-800 mb-4">More Studies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((s) => (
                <Link key={s.id} href={`/studies/${s.id}`}
                  className="group bg-white rounded-2xl border border-maroon-100 p-5 hover:border-maroon-300 hover:shadow-md transition-all">
                  {s.category && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border mb-2"
                      style={{ background: `${s.category.color}15`, borderColor: `${s.category.color}30`, color: s.category.color }}>
                      <Tag size={9} />{s.category.name}
                    </span>
                  )}
                  <h3 className="font-serif text-sm font-semibold text-maroon-800 line-clamp-2 group-hover:text-maroon-600 transition-colors">{s.title}</h3>
                  <p className="text-xs text-maroon-400 mt-2">{s.author?.full_name}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-maroon-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <p className="text-xs text-maroon-400">An Undergraduate Special Problem by{" "}
            <span className="text-maroon-600 font-medium">Sheyn Jenelle E. Briones</span>
          </p>
          <Link href="/terms?from=/studies" className="text-xs text-maroon-400 hover:text-maroon-700 transition-colors">Terms of Use</Link>
        </div>
      </footer>
    </div>
  );
}
