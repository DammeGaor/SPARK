"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";

const CATEGORIES = [
  { name: "Computer Science", slug: "computer-science" },
  { name: "Natural Sciences", slug: "natural-sciences" },
  { name: "Social Sciences", slug: "social-sciences" },
  { name: "Education", slug: "education" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - i);

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [category, setCategory] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");

  const hasFilters = category || yearFrom || yearTo;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (category) params.set("category", category);
    if (yearFrom) params.set("year_from", yearFrom);
    if (yearTo) params.set("year_to", yearTo);
    router.push(`/studies?${params.toString()}`);
  }

  function clearFilters() {
    setCategory("");
    setYearFrom("");
    setYearTo("");
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <form onSubmit={handleSubmit}>

        {/* Main search row */}
        <div className="relative flex items-center bg-white rounded-2xl border-2 border-maroon-200 shadow-lg hover:border-maroon-300 focus-within:border-maroon-600 transition-all duration-200 overflow-hidden">
          <Search size={17} className="absolute left-5 text-maroon-300 flex-shrink-0 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search by title, author, keyword, or adviser..."
            className="w-full pl-12 pr-3 py-4 text-maroon-900 placeholder-maroon-300 text-sm bg-transparent outline-none focus:outline-none ring-0 focus:ring-0"
          />

          {/* Divider */}
          <div className="w-px h-6 bg-maroon-100 flex-shrink-0" />

          {/* Advanced toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-4 py-4 text-xs font-medium transition-colors flex-shrink-0 ${
              showAdvanced || hasFilters ? "text-maroon-700" : "text-maroon-400 hover:text-maroon-600"
            }`}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filters</span>
            {hasFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-maroon-600 flex-shrink-0" />
            )}
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`}
            />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-maroon-100 flex-shrink-0" />

          {/* Search button */}
          <button
            type="submit"
            className="flex-shrink-0 mx-2 px-5 py-2.5 rounded-xl text-parchment-50 text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
            style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}
          >
            Search
          </button>
        </div>

        {/* Advanced filters panel */}
        {showAdvanced && (
          <div className="mt-2 bg-white rounded-2xl border border-maroon-100 shadow-lg p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-maroon-700 tracking-wide uppercase">Advanced Filters</p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-maroon-400 hover:text-maroon-700 transition-colors"
                >
                  <X size={11} /> Clear filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-maroon-600 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-maroon-200 bg-parchment-50 text-maroon-800 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent transition-all"
                >
                  <option value="">All categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Year From */}
              <div>
                <label className="block text-xs font-medium text-maroon-600 mb-1.5">Year From</label>
                <select
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-maroon-200 bg-parchment-50 text-maroon-800 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent transition-all"
                >
                  <option value="">Any year</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Year To */}
              <div>
                <label className="block text-xs font-medium text-maroon-600 mb-1.5">Year To</label>
                <select
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-maroon-200 bg-parchment-50 text-maroon-800 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent transition-all"
                >
                  <option value="">Any year</option>
                  {YEARS.filter((y) => !yearFrom || y >= parseInt(yearFrom)).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter pills */}
            {hasFilters && (
              <div className="mt-4 flex flex-wrap gap-2">
                {category && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-maroon-50 border border-maroon-200 text-xs text-maroon-700">
                    {CATEGORIES.find(c => c.slug === category)?.name}
                    <button type="button" onClick={() => setCategory("")} className="hover:text-maroon-900">
                      <X size={10} />
                    </button>
                  </span>
                )}
                {yearFrom && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-maroon-50 border border-maroon-200 text-xs text-maroon-700">
                    From {yearFrom}
                    <button type="button" onClick={() => setYearFrom("")} className="hover:text-maroon-900">
                      <X size={10} />
                    </button>
                  </span>
                )}
                {yearTo && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-maroon-50 border border-maroon-200 text-xs text-maroon-700">
                    To {yearTo}
                    <button type="button" onClick={() => setYearTo("")} className="hover:text-maroon-900">
                      <X size={10} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </form>

      <p className="mt-4 text-sm text-maroon-400 text-center">
        Are you an author?{" "}
        <a href="/studies/submit" className="text-upgreen-600 hover:text-upgreen-800 font-medium underline underline-offset-2 transition-colors">
          Submit your research here.
        </a>
      </p>
    </div>
  );
}
