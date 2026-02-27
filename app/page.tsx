import Link from "next/link";
import { GraduationCap, FlaskConical, Cpu, Globe, ArrowRight, Upload, BookMarked } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SearchBar from "@/components/SearchBar";
import NavbarUserMenu from "@/components/NavbarUserMenu";

const CATEGORIES = [
  { name: "Computer Science", slug: "computer-science", icon: Cpu, color: "#8f1535", count: 24 },
  { name: "Natural Sciences", slug: "natural-sciences", icon: FlaskConical, color: "#2E7D32", count: 18 },
  { name: "Social Sciences", slug: "social-sciences", icon: Globe, color: "#5a0c1c", count: 31 },
  { name: "Education", slug: "education", icon: GraduationCap, color: "#6b0f24", count: 15 },
];

async function getPageData() {
  try {
    const supabase = await createClient();

    const [studiesRes, userRes] = await Promise.all([
      supabase.from("studies").select("*", { count: "exact", head: true }).eq("is_published", true),
      supabase.auth.getUser(),
    ]);

// Count unique authors from published studies
const { data: authorData } = await supabase
  .from("studies")
  .select("author_id")
  .eq("is_published", true);

const uniqueAuthors = new Set(authorData?.map((s) => s.author_id) ?? []).size;

    let profile = null;
    if (userRes.data.user) {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", userRes.data.user.id)
        .single();
      profile = data;
    }

    return {
      studies: studiesRes.count ?? 0,
      authors: uniqueAuthors,  // ← changed from authorsRes.count
      profile,
    };
  } catch {
    return { studies: 0, authors: 0, profile: null };
  }
}

export default async function HomePage() {
  const { studies, authors, profile } = await getPageData();

  return (
    <div className="min-h-screen bg-parchment-50 flex flex-col">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-parchment-50/90 backdrop-blur-md border-b border-maroon-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow"
              style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}
            >
              <span className="text-parchment-100 font-serif font-bold text-xs">SP</span>
            </div>
            <span className="font-serif font-bold text-maroon-800 text-lg tracking-tight">SPARK</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/studies" className="px-4 py-2 text-sm text-maroon-600 hover:text-maroon-900 hover:bg-maroon-50 rounded-lg transition-all font-medium">
              Browse Catalog
            </Link>
            <div className="w-px h-4 bg-maroon-200 mx-1" />
            {profile ? (
              <NavbarUserMenu fullName={profile.full_name} role={profile.role} />
            ) : (
              <Link href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-parchment-50 transition-all shadow-sm hover:shadow-md"
                style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile nav */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/studies" className="text-sm text-maroon-600 font-medium">Browse</Link>
            {profile ? (
              <NavbarUserMenu fullName={profile.full_name} role={profile.role} />
            ) : (
              <Link href="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-parchment-50"
                style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-maroon-200 to-transparent" />
          <div
            className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-5"
            style={{ background: "radial-gradient(circle, #8f1535, transparent 70%)" }}
          />
          <div
            className="absolute top-1/2 -left-20 w-[300px] h-[300px] rounded-full opacity-5"
            style={{ background: "radial-gradient(circle, #2E7D32, transparent 70%)" }}
          />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, #8f1535 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="font-serif mb-4">
            <span
              className="block text-5xl sm:text-6xl lg:text-7xl font-bold leading-none tracking-tight"
              style={{ color: "#6b0f24" }}
            >
              SPARK
            </span>
            <span className="block text-xl sm:text-2xl lg:text-3xl text-maroon-500 font-normal mt-3 leading-snug">
              Special Problems Archive for<br className="hidden sm:block" /> Research and Knowledge
            </span>
          </h1>

          <p className="text-maroon-400 text-base sm:text-lg max-w-xl mx-auto mt-4 mb-10 leading-relaxed">
            Discover, explore, and share undergraduate research from the University of the Philippines community.
          </p>

          <SearchBar />
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y border-maroon-100 bg-white py-5">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-center gap-12">
          <div className="text-center">
            <p className="font-serif text-3xl font-bold text-maroon-800">{studies}+</p>
            <p className="text-xs text-maroon-400 mt-0.5 tracking-wide uppercase">Published Studies</p>
          </div>
          <div className="w-px h-10 bg-maroon-100" />
          <div className="text-center">
            <p className="font-serif text-3xl font-bold text-maroon-800">{authors}+</p>
            <p className="text-xs text-maroon-400 mt-0.5 tracking-wide uppercase">Registered Authors</p>
          </div>
          <div className="w-px h-10 bg-maroon-100" />
          <div className="text-center">
            <p className="font-serif text-3xl font-bold text-maroon-800">{CATEGORIES.length}</p>
            <p className="text-xs text-maroon-400 mt-0.5 tracking-wide uppercase">Research Categories</p>
          </div>
        </div>
      </section>

      {/* ── Discover Sources ── */}
      <section className="max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs text-maroon-400 tracking-widest uppercase mb-2">Explore by Field</p>
            <h2 className="font-serif text-3xl text-maroon-800 font-bold">Discover Sources</h2>
          </div>
          <Link href="/studies"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-maroon-500 hover:text-maroon-800 transition-colors font-medium group"
          >
            View all research
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/studies?category=${cat.slug}`}
                className="group relative bg-white rounded-2xl border border-maroon-100 p-6 hover:border-maroon-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-5 group-hover:opacity-10 transition-opacity"
                  style={{ background: cat.color }}
                />
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-sm"
                  style={{ background: `${cat.color}15`, border: `1.5px solid ${cat.color}30` }}
                >
                  <Icon size={20} style={{ color: cat.color }} />
                </div>
                <h3 className="font-serif text-base font-semibold text-maroon-800 mb-1 leading-tight">
                  {cat.name}
                </h3>
                <p className="text-xs text-maroon-400">{cat.count} studies</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: cat.color }}>
                  Explore <ArrowRight size={11} />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-4 sm:hidden text-center">
          <Link href="/studies" className="text-sm text-maroon-500 hover:text-maroon-800 font-medium transition-colors">
            View all research →
          </Link>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-6xl mx-auto px-6 pb-16 w-full">
        <div
          className="relative rounded-2xl overflow-hidden p-8 sm:p-10"
          style={{ background: "linear-gradient(135deg, #6b0f24 0%, #8f1535 50%, #5a0c1c 100%)" }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, #faf3e0 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-upgreen-500" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-upgreen-300 text-xs tracking-widest uppercase mb-2">For Researchers</p>
              <h3 className="font-serif text-2xl text-parchment-100 font-bold mb-2">Share your research with the community</h3>
              <p className="text-parchment-400 text-sm max-w-md leading-relaxed">
                Submit your special problem to SPARK and make your work accessible to future students and researchers.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                href="/studies/submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-maroon-800 text-sm font-semibold hover:bg-parchment-100 transition-all shadow-md hover:shadow-lg"
              >
                <Upload size={15} />
                Submit Research
              </Link>
              <Link
                href="/studies"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-parchment-300/40 text-parchment-200 text-sm font-medium hover:bg-white/10 transition-all"
              >
                <BookMarked size={15} />
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-maroon-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-maroon-400">
            An Undergraduate Special Problem by{" "}
            <span className="text-maroon-600 font-medium">Sheyn Jenelle E. Briones</span>
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-xs text-maroon-400 hover:text-maroon-700 transition-colors">Terms of Use</Link>
            <div className="flex items-center gap-1.5 opacity-40">
              <div className="w-2 h-2 rounded-full bg-maroon-600" />
              <div className="w-2 h-2 rounded-full bg-upgreen-600" />
              <span className="text-xs text-maroon-600 tracking-wider uppercase ml-0.5">UP</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
