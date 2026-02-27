"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Filter, Eye, EyeOff, Trash2, ExternalLink,
  CheckCircle2, Clock, XCircle, RefreshCw, ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

interface Study {
  id: string;
  title: string;
  adviser: string;
  course: string;
  department: string;
  status: "pending" | "approved" | "rejected" | "revision_requested";
  is_published: boolean;
  submitted_at: string;
  published_at: string | null;
  author: { full_name: string; email: string } | null;
  category: { name: string; color: string } | null;
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  pending: { label: "Pending", icon: Clock, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  approved: { label: "Approved", icon: CheckCircle2, color: "text-upgreen-700", bg: "bg-upgreen-50 border-upgreen-200" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-700", bg: "bg-red-50 border-red-200" },
  revision_requested: { label: "Revision", icon: RefreshCw, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
};

export default function StudiesTable({ studies }: { studies: Study[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = studies.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.author?.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.adviser.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function togglePublish(study: Study) {
    setLoadingId(study.id);
    const supabase = createClient();
    const newPublished = !study.is_published;

    const { error } = await supabase.from("studies").update({
      is_published: newPublished,
      published_at: newPublished ? new Date().toISOString() : null,
      status: newPublished ? "approved" : study.status,
    }).eq("id", study.id);

    if (error) {
      toast.error("Failed to update study.");
    } else {
      toast.success(newPublished ? "Study published." : "Study unpublished.");
      router.refresh();
    }
    setLoadingId(null);
  }

  async function deleteStudy(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    setLoadingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("studies").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete study.");
    } else {
      toast.success("Study deleted.");
      router.refresh();
    }
    setLoadingId(null);
  }

  return (
    <div className="bg-white rounded-2xl border border-maroon-100 shadow-sm overflow-hidden">

      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-maroon-50 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-maroon-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, adviser..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-maroon-200 bg-parchment-50 text-sm text-maroon-800 placeholder-maroon-300 focus:outline-none focus:ring-2 focus:ring-maroon-400 transition-all"
          />
        </div>
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-maroon-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-8 pr-8 py-2 rounded-xl border border-maroon-200 bg-parchment-50 text-sm text-maroon-700 focus:outline-none focus:ring-2 focus:ring-maroon-400 appearance-none transition-all"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="revision_requested">Revision</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon-400 pointer-events-none" />
        </div>
        <span className="text-xs text-maroon-400 ml-auto">{filtered.length} studies</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-maroon-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-maroon-500 uppercase tracking-wide">Study</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-maroon-500 uppercase tracking-wide hidden md:table-cell">Author</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-maroon-500 uppercase tracking-wide hidden lg:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-maroon-500 uppercase tracking-wide">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-maroon-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-maroon-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-maroon-400 text-sm">
                  No studies match your search.
                </td>
              </tr>
            ) : (
              filtered.map((study) => {
                const statusCfg = STATUS_CONFIG[study.status] ?? STATUS_CONFIG.pending;
                const StatusIcon = statusCfg.icon;
                const isLoading = loadingId === study.id;

                return (
                  <tr key={study.id} className="hover:bg-parchment-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-maroon-900 line-clamp-1 max-w-xs">{study.title}</p>
                      <p className="text-xs text-maroon-400 mt-0.5">
                        {new Date(study.submitted_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-maroon-700 text-sm">{study.author?.full_name ?? "—"}</p>
                      <p className="text-xs text-maroon-400">{study.author?.email}</p>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      {study.category ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                          style={{
                            background: `${study.category.color}15`,
                            borderColor: `${study.category.color}30`,
                            color: study.category.color,
                          }}>
                          {study.category.name}
                        </span>
                      ) : <span className="text-maroon-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${statusCfg.bg} ${statusCfg.color}`}>
                        <StatusIcon size={10} />
                        {statusCfg.label}
                      </span>
                      {study.is_published && (
                        <span className="ml-1.5 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-upgreen-50 border border-upgreen-200 text-xs font-medium text-upgreen-700">
                          <Eye size={10} /> Live
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => togglePublish(study)}
                          disabled={isLoading}
                          title={study.is_published ? "Unpublish" : "Publish"}
                          className={`p-2 rounded-lg border transition-all disabled:opacity-50 ${
                            study.is_published
                              ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                              : "border-upgreen-200 text-upgreen-600 hover:bg-upgreen-50"
                          }`}
                        >
                          {study.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => deleteStudy(study.id, study.title)}
                          disabled={isLoading}
                          title="Delete"
                          className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
