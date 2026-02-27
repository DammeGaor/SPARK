"use client";

import { useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search, LayoutGrid, List, SlidersHorizontal, X,
  ChevronDown, Tag, User, Calendar, ArrowUpDown,
  FileText, ExternalLink, Filter,
} from "lucide-react";

interface Study {
  id: string;
  title: string;
  abstract: string;
  adviser: string;
  course: string;
  department: string;
  keywords: string[];
  date_completed: string;
  published_at: string;
  file_url: string | null;
  author: { full_name: string } | null;
  category: { id: string; name: string; color: string } | null;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Props {
  studies: Study[];
  categories: Category[];
  years: string[];
  initialQuery: string;
  initialCategory: string;
  initialYearFrom: string;
  initialYearTo: string;
  initialSort: string;
}

const inputCls = "w-full px-3 py-2 rounded-xl border border-maroon-200 bg-white text-maroon-800 text-sm placeholder-maroon-300 focus:outline-none focus:ring-2 focus:ring-maroon-400 transition-all";
const selectCls = "w-full px-3 py-2 rounded-xl border border-maroon-200 bg-white text-maroon-800 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-400 transition-all appearance-none";

// ── Study Card (Grid) ─────────────────────────────────────────────────────────
function StudyCard({ study }: { study: Study }) {
  return (
    <Link href={`/studies/${study.id}`}
      className="group bg-white rounded-2xl border border-maroon-100 p-5 hover:border-maroon-300 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden relative">

      {/* Category accent */}
      {study.category && (
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{ background: study.category.color }} />
      )}

      <div className="flex items-start justify-between gap-2 mb-3">
        {study.category && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0"
            style={{
              background: `${study.category.color}15`,
              borderColor: `${study.category.color}30`,
              color: study.category.color,
            }}>
            <Tag size={9} />
            {study.category.name}
          </span>
        )}
      </div>

      <h3 className="font-serif text-base font-semibold text-maroon-900 leading-snug mb-3 line-clamp-2 group-hover:text-maroon-600 transition-colors flex-1">
        {study.title}
      </h3>

      <div className="mt-auto space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-maroon-500">
          <User size={11} className="flex-shrink-0" />
          <span className="truncate">{study.author?.full_name ?? "Unknown"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-maroon-400">
          <Calendar size={11} className="flex-shrink-0" />
          <span>{study.date_completed
            ? new Date(study.date_completed).toLocaleDateString("en-PH", { year: "numeric", month: "long" })
            : "—"}
          </span>
        </div>
      </div>

      {/* Hover arrow */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink size={13} className="text-maroon-400" />
      </div>
    </Link>
  );
}

// ── Study Row (List) ──────────────────────────────────────────────────────────
function StudyRow({ study }: { study: Study }) {
  return (
    <Link href={`/studies/${study.id}`}
      className="group bg-white rounded-2xl border border-maroon-100 px-5 py-4 hover:border-maroon-300 hover:shadow-md transition-all duration-200 flex items-center gap-4">

      {/* Category dot */}
      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ background: study.category?.color ?? "#8f1535" }} />

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <h3 className="font-serif text-sm font-semibold text-maroon-900 truncate group-hover:text-maroon-600 transition-colors">
          {study.title}
        </h3>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-maroon-500 flex items-center gap-1">
            <User size={10} /> {study.author?.full_name ?? "Unknown"}
          </span>
          {study.category && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-md"
              style={{ background: `${study.category.color}15`, color: study.category.color }}>
              {study.category.name}
            </span>
          )}
        </div>
      </div>

      {/* Date */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-maroon-400 flex-shrink-0">
        <Calendar size={11} />
        {study.date_completed
          ? new Date(study.date_completed).toLocaleDateString("en-PH", { year: "numeric", month: "short" })
          : "—"}
      </div>

      <ExternalLink size={13} className="text-maroon-300 group-hover:text-maroon-500 transition-colors flex-shrink-0" />
    </Link>
  );
}

// ── Main Catalog ──────────────────────────────────────────────────────────────
export default function CatalogClient({
  studies, categories, years,
  initialQuery, initialCategory, initialYearFrom, initialYearTo, initialSort,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Local filter state
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [yearFrom, setYearFrom] = useState(initialYearFrom);
  const [yearTo, setYearTo] = useState(initialYearTo);
  const [sort, setSort] = useState(initialSort);

  const hasFilters = category || yearFrom || yearTo;

  function applyFilters() {
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (category) params.set("category", category);
    if (yearFrom) params.set("year_from", yearFrom);
    if (yearTo) params.set("year_to", yearTo);
    if (sort !== "date_desc") params.set("sort", sort);
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    setQuery("");
    setCategory("");
    setYearFrom("");
    setYearTo("");
    setSort("date_desc");
    router.push(pathname);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") applyFilters();
  }

  return (
    <div>
      {/* ── Search + toolbar ── */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">

        {/* Search bar */}
        <div className="relative flex-1 min-w-60">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-maroon-300 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by title, author, keyword, or adviser..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-maroon-200 bg-white text-maroon-800 text-sm placeholder-maroon-300 focus:outline-none focus:ring-2 focus:ring-maroon-400 shadow-sm transition-all"
          />
        </div>

        {/* Filters toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            showFilters || hasFilters
              ? "border-maroon-400 text-maroon-700 bg-maroon-50"
              : "border-maroon-200 text-maroon-500 bg-white hover:bg-maroon-50"
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-maroon-600" />}
          <ChevronDown size={12} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-maroon-400 pointer-events-none" />
          <select value={sort} onChange={(e) => { setSort(e.target.value); }}
            className="pl-8 pr-8 py-2.5 rounded-xl border border-maroon-200 bg-white text-sm text-maroon-700 focus:outline-none focus:ring-2 focus:ring-maroon-400 appearance-none transition-all">
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon-400 pointer-events-none" />
        </div>

        {/* Search button */}
        <button onClick={applyFilters}
          className="px-5 py-2.5 rounded-xl text-parchment-50 text-sm font-medium shadow-sm hover:shadow-md transition-all"
          style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>
          Search
        </button>

        {/* Layout toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-maroon-200 bg-white ml-auto">
          <button onClick={() => setLayout("grid")}
            className={`p-2 rounded-lg transition-all ${layout === "grid" ? "bg-maroon-100 text-maroon-700" : "text-maroon-400 hover:text-maroon-600"}`}>
            <LayoutGrid size={15} />
          </button>
          <button onClick={() => setLayout("list")}
            className={`p-2 rounded-lg transition-all ${layout === "list" ? "bg-maroon-100 text-maroon-700" : "text-maroon-400 hover:text-maroon-600"}`}>
            <List size={15} />
          </button>
        </div>
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-maroon-100 p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-maroon-600 uppercase tracking-wide">Filters</p>
            {hasFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-maroon-400 hover:text-maroon-700 transition-colors">
                <X size={11} /> Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-maroon-600 mb-1.5">Category</label>
              <div className="relative">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name.toLowerCase().replace(/\s+/g, "-")}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon-400 pointer-events-none" />
              </div>
            </div>

            {/* Year from */}
            <div>
              <label className="block text-xs font-medium text-maroon-600 mb-1.5">Year From</label>
              <div className="relative">
                <select value={yearFrom} onChange={(e) => setYearFrom(e.target.value)} className={selectCls}>
                  <option value="">Any year</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon-400 pointer-events-none" />
              </div>
            </div>

            {/* Year to */}
            <div>
              <label className="block text-xs font-medium text-maroon-600 mb-1.5">Year To</label>
              <div className="relative">
                <select value={yearTo} onChange={(e) => setYearTo(e.target.value)} className={selectCls}>
                  <option value="">Any year</option>
                  {years.filter((y) => !yearFrom || y >= yearFrom).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active filter pills */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-maroon-50">
              {category && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-maroon-50 border border-maroon-200 text-xs text-maroon-700">
                  {categories.find(c => c.name.toLowerCase().replace(/\s+/g, "-") === category)?.name}
                  <button onClick={() => setCategory("")}><X size={10} /></button>
                </span>
              )}
              {yearFrom && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-maroon-50 border border-maroon-200 text-xs text-maroon-700">
                  From {yearFrom}
                  <button onClick={() => setYearFrom("")}><X size={10} /></button>
                </span>
              )}
              {yearTo && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-maroon-50 border border-maroon-200 text-xs text-maroon-700">
                  To {yearTo}
                  <button onClick={() => setYearTo("")}><X size={10} /></button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Results count ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-maroon-500">
          <span className="font-semibold text-maroon-800">{studies.length}</span> {studies.length === 1 ? "study" : "studies"} found
        </p>
      </div>

      {/* ── Empty state ── */}
      {studies.length === 0 && (
        <div className="bg-white rounded-2xl border border-maroon-100 p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #8f153515, #6b0f2415)", border: "1.5px solid #8f153525" }}>
            <FileText size={26} className="text-maroon-400" />
          </div>
          <h3 className="font-serif text-lg text-maroon-700 mb-2">No studies found</h3>
          <p className="text-maroon-400 text-sm mb-5">Try adjusting your search or filters.</p>
          <button onClick={clearFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-parchment-50 text-sm font-medium shadow-sm"
            style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>
            <X size={14} /> Clear filters
          </button>
        </div>
      )}

      {/* ── Grid layout ── */}
      {studies.length > 0 && layout === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {studies.map((study) => (
            <StudyCard key={study.id} study={study} />
          ))}
        </div>
      )}

      {/* ── List layout ── */}
      {studies.length > 0 && layout === "list" && (
        <div className="space-y-2">
          {studies.map((study) => (
            <StudyRow key={study.id} study={study} />
          ))}
        </div>
      )}
    </div>
  );
}
