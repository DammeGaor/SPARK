import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import CatalogClient from "./CatalogClient";
import NavbarUserMenu from "@/components/NavbarUserMenu";
import Image from "next/image";

interface SearchParams {
  query?: string;
  category?: string;
  year_from?: string;
  year_to?: string;
  sort?: string;
}

export default async function StudiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  // Fetch user profile for navbar
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  // Fetch categories for filter dropdown
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, color")
    .order("name");

  // Build query
  let query = supabase
    .from("studies")
    .select(`
      id, title, abstract, adviser, course, department,
      keywords, date_completed, submitted_at, published_at,
      file_url, is_published,
      author:profiles!studies_author_id_fkey(full_name),
      category:categories(id, name, color)
    `)
    .eq("is_published", true);

  // Search
  if (sp.query) {
    query = query.or(
      `title.ilike.%${sp.query}%,abstract.ilike.%${sp.query}%,adviser.ilike.%${sp.query}%`
    );
  }

  // Category filter
  if (sp.category) {
    const cat = categories?.find(
      (c) => c.name.toLowerCase().replace(/\s+/g, "-") === sp.category
    );
    if (cat) query = query.eq("category_id", cat.id);
  }

  // Year filters
  if (sp.year_from) {
    query = query.gte("date_completed", `${sp.year_from}-01-01`);
  }
  if (sp.year_to) {
    query = query.lte("date_completed", `${sp.year_to}-12-31`);
  }

  // Sort
  const sort = sp.sort ?? "date_desc";
  if (sort === "date_asc") {
    query = query.order("published_at", { ascending: true });
  } else {
    query = query.order("published_at", { ascending: false });
  }

  const { data: studies } = await query;

  // Available years from published studies
  const { data: yearData } = await supabase
    .from("studies")
    .select("date_completed")
    .eq("is_published", true);

  const years = Array.from(
    new Set(
      (yearData ?? [])
        .map((s) => s.date_completed?.split("-")[0])
        .filter(Boolean)
    )
  ).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="min-h-screen bg-parchment-50 flex flex-col">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-parchment-50/90 backdrop-blur-md border-b border-maroon-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <Image src="/spark-logo.svg" alt="SPARK" width={120} height={38} priority />
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/studies"
              className="px-4 py-2 text-sm font-medium text-maroon-900 bg-maroon-50 rounded-lg">
              Browse Catalog
            </Link>
            <div className="w-px h-4 bg-maroon-200 mx-1" />
            {profile ? (
              <NavbarUserMenu fullName={profile.full_name} role={profile.role} />
            ) : (
              <Link href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-parchment-50 transition-all shadow-sm hover:shadow-md"
                style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>
                Sign In
              </Link>
            )}
          </nav>
          <div className="md:hidden flex items-center gap-2">
            {profile ? (
              <NavbarUserMenu fullName={profile.full_name} role={profile.role} />
            ) : (
              <Link href="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-parchment-50"
                style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #6b0f24 0%, #8f1535 60%, #5a0c1c 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #faf3e0 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }} />
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-upgreen-500" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 text-parchment-400 text-xs mb-3">
            <Link href="/" className="hover:text-parchment-200 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-parchment-200">Browse Catalog</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-parchment-300/20"
              style={{ background: "rgba(250,243,224,0.1)" }}>
              <BookOpen size={17} className="text-parchment-200" />
            </div>
            <h1 className="font-serif text-3xl text-parchment-100 font-bold">Research Catalog</h1>
          </div>
          <p className="text-parchment-400 text-sm ml-12">
            Browse {studies?.length ?? 0} published research studies from the UP community.
          </p>
        </div>
      </div>

      {/* Catalog */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <CatalogClient
          studies={studies ?? []}
          categories={categories ?? []}
          years={years as string[]}
          initialQuery={sp.query ?? ""}
          initialCategory={sp.category ?? ""}
          initialYearFrom={sp.year_from ?? ""}
          initialYearTo={sp.year_to ?? ""}
          initialSort={sp.sort ?? "date_desc"}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-maroon-100 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-maroon-400">
            An Undergraduate Special Problem by{" "}
            <span className="text-maroon-600 font-medium">Sheyn Jenelle E. Briones</span>
          </p>
          <Link href="/terms?from=/studies" className="text-xs text-maroon-400 hover:text-maroon-700 transition-colors">
            Terms of Use
          </Link>
        </div>
      </footer>
    </div>
  );
}
