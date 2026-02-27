"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, Clock, XCircle, RefreshCw, Eye, FileText,
  ChevronDown, ChevronUp, Trash2, ExternalLink, Tag,
  MessageSquare, Loader2, AlertCircle, Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

interface Validation {
  status: string;
  notes: string | null;
  reviewed_at: string;
  faculty: { full_name: string } | null;
}

interface Study {
  id: string;
  title: string;
  abstract: string;
  status: string;
  is_published: boolean;
  submitted_at: string;
  updated_at: string;
  file_url: string | null;
  file_name: string | null;
  adviser: string;
  course: string;
  department: string;
  keywords: string[];
  category: { name: string; color: string } | null;
  validations: Validation[];
}

const STATUS_CONFIG: Record<string, {
  label: string; icon: any; color: string;
  bg: string; border: string; description: string;
}> = {
  pending: {
    label: "Pending Review",
    icon: Clock,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    description: "Your study is in the queue and awaiting faculty review.",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    color: "text-upgreen-700",
    bg: "bg-upgreen-50",
    border: "border-upgreen-200",
    description: "Your study has been approved and is now publicly available.",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    description: "Your study was not accepted. See the validator's notes below.",
  },
  revision_requested: {
    label: "Needs Revision",
    icon: RefreshCw,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    description: "The validator has requested changes. Please revise and resubmit.",
  },
};

function SubmissionCard({ study }: { study: Study }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const statusCfg = STATUS_CONFIG[study.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  // Get latest validation
  const latestValidation = study.validations?.sort(
    (a, b) => new Date(b.reviewed_at).getTime() - new Date(a.reviewed_at).getTime()
  )[0];

  async function handleDelete() {
    if (!confirm(`Delete "${study.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("studies").delete().eq("id", study.id);
    if (error) {
      toast.error("Failed to delete study.");
      setDeleting(false);
    } else {
      toast.success("Study deleted.");
      router.refresh();
    }
  }

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${statusCfg.border}`}>

      {/* Status bar */}
      <div className={`px-5 py-2.5 flex items-center gap-2 border-b ${statusCfg.bg} ${statusCfg.border}`}>
        <StatusIcon size={13} className={statusCfg.color} />
        <span className={`text-xs font-semibold ${statusCfg.color}`}>{statusCfg.label}</span>
        {study.is_published && (
          <span className="ml-auto flex items-center gap-1 text-xs text-upgreen-700 font-medium">
            <Eye size={11} /> Live
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Title + meta */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-base font-semibold text-maroon-900 leading-snug mb-1.5">
              {study.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-maroon-400">
              {study.category && (
                <span className="inline-flex items-center gap-1 font-medium"
                  style={{ color: study.category.color }}>
                  <Tag size={10} />{study.category.name}
                </span>
              )}
              <span>Adviser: {study.adviser}</span>
              <span>Submitted {new Date(study.submitted_at).toLocaleDateString("en-PH", {
                year: "numeric", month: "short", day: "numeric",
              })}</span>
            </div>
          </div>
        </div>

        {/* Status description */}
        <p className={`text-xs px-3 py-2 rounded-lg border mb-4 ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color}`}>
          {statusCfg.description}
        </p>

        {/* Validation notes */}
        {latestValidation?.notes && (
          <div className="mb-4 rounded-xl border border-maroon-100 bg-parchment-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={13} className="text-maroon-500" />
              <span className="text-xs font-semibold text-maroon-700">
                Validator Feedback
                {latestValidation.faculty && (
                  <span className="font-normal text-maroon-400"> · {latestValidation.faculty.full_name}</span>
                )}
              </span>
              <span className="ml-auto text-xs text-maroon-400">
                {new Date(latestValidation.reviewed_at).toLocaleDateString("en-PH", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </span>
            </div>
            <p className="text-sm text-maroon-700 leading-relaxed">{latestValidation.notes}</p>
          </div>
        )}

        {/* Expanded details */}
        {expanded && (
          <div className="mb-4 space-y-3 pt-3 border-t border-maroon-50">
            <div>
              <p className="text-xs font-semibold text-maroon-400 uppercase tracking-wide mb-1">Abstract</p>
              <p className="text-sm text-maroon-600 leading-relaxed">{study.abstract}</p>
            </div>
            {study.keywords?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-maroon-400 uppercase tracking-wide mb-1.5">Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {study.keywords.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-maroon-50 border border-maroon-100 text-xs text-maroon-600">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View PDF */}
          {study.file_url && (
            <a href={study.file_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-maroon-200 text-xs text-maroon-600 hover:bg-maroon-50 transition-all font-medium">
              <FileText size={12} />
              View PDF
              <ExternalLink size={10} />
            </a>
          )}

          {/* Resubmit — only for revision_requested */}
          {study.status === "revision_requested" && (
            <Link href={`/studies/submit?resubmit=${study.id}`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-parchment-50 transition-all shadow-sm hover:shadow-md"
              style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>
              <Plus size={12} />
              Resubmit Study
            </Link>
          )}

          {/* Toggle details */}
          <button onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-maroon-200 text-xs text-maroon-500 hover:bg-maroon-50 transition-all ml-auto">
            {expanded ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> Details</>}
          </button>

          {/* Delete — only for pending */}
          {study.status === "pending" && (
            <button onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs text-red-600 hover:bg-red-50 transition-all disabled:opacity-50">
              {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SubmissionsList({ studies }: { studies: Study[] }) {
  const [filter, setFilter] = useState("all");

  const filtered = studies.filter((s) =>
    filter === "all" ? true : s.status === filter
  );

  const counts = {
    all: studies.length,
    pending: studies.filter((s) => s.status === "pending").length,
    approved: studies.filter((s) => s.status === "approved").length,
    revision_requested: studies.filter((s) => s.status === "revision_requested").length,
    rejected: studies.filter((s) => s.status === "rejected").length,
  };

  const tabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "revision_requested", label: "Needs Revision" },
    { key: "rejected", label: "Rejected" },
  ];

  if (studies.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-maroon-100 p-16 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "linear-gradient(135deg, #8f153515, #6b0f2415)", border: "1.5px solid #8f153525" }}>
          <FileText size={26} className="text-maroon-400" />
        </div>
        <h3 className="font-serif text-lg text-maroon-700 mb-2">No submissions yet</h3>
        <p className="text-maroon-400 text-sm mb-6">You haven't submitted any studies to SPARK.</p>
        <Link href="/studies/submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-parchment-50 text-sm font-medium shadow-sm hover:shadow-md transition-all"
          style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>
          <Plus size={15} /> Submit Your First Study
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {tabs.map((tab) => {
          const count = counts[tab.key as keyof typeof counts];
          if (count === 0 && tab.key !== "all") return null;
          const isActive = filter === tab.key;
          return (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                isActive
                  ? "border-maroon-600 text-parchment-50 shadow-sm"
                  : "border-maroon-200 text-maroon-600 bg-white hover:bg-maroon-50"
              }`}
              style={isActive ? { background: "linear-gradient(135deg, #8f1535, #6b0f24)" } : {}}>
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                isActive ? "bg-white/20 text-white" : "bg-maroon-100 text-maroon-600"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-maroon-100 p-10 text-center">
          <p className="text-maroon-400 text-sm">No studies in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((study) => (
            <SubmissionCard key={study.id} study={study} />
          ))}
        </div>
      )}
    </div>
  );
}
