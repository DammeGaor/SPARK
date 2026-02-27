"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, XCircle, RefreshCw, FileText, ChevronDown,
  ChevronUp, Clock, User, BookOpen, Tag, ExternalLink, Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

interface Study {
  id: string;
  title: string;
  abstract: string;
  adviser: string;
  course: string;
  department: string;
  keywords: string[];
  date_completed: string;
  submitted_at: string;
  file_url: string | null;
  file_name: string | null;
  status: string;
  author: { full_name: string; email: string; student_id: string | null } | null;
  category: { name: string; color: string } | null;
}

interface Props {
  study: Study;
  validatorId: string;
}

export default function ValidationCard({ study, validatorId }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | "revision" | null>(null);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const daysAgo = Math.floor(
    (Date.now() - new Date(study.submitted_at).getTime()) / 86400000
  );

  const isUrgent = daysAgo > 7;

  async function handleValidation(status: "approved" | "rejected" | "revision_requested") {
    if ((status === "rejected" || status === "revision_requested") && !notes.trim()) {
      toast.error("Please add notes explaining the decision.");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      // Insert validation record
      const { error: valError } = await supabase.from("validations").insert({
        study_id: study.id,
        faculty_id: validatorId,
        status,
        notes: notes.trim() || null,
        reviewed_at: new Date().toISOString(),
      });
      if (valError) throw valError;

      // Update study status
      const { error: studyError } = await supabase.from("studies").update({
        status,
        is_published: status === "approved",
        published_at: status === "approved" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq("id", study.id);
      if (studyError) throw studyError;

      const messages = {
        approved: "Study approved and published!",
        rejected: "Study rejected.",
        revision_requested: "Revision requested.",
      };

      toast.success(messages[status]);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
      setIsLoading(false);
    }
  }

  const actionConfig = {
    approve: {
      label: "Approve & Publish",
      icon: CheckCircle2,
      color: "text-upgreen-700",
      bg: "bg-upgreen-50 border-upgreen-200 hover:bg-upgreen-100",
      activeBg: "bg-upgreen-600",
      status: "approved" as const,
    },
    reject: {
      label: "Reject",
      icon: XCircle,
      color: "text-red-700",
      bg: "bg-red-50 border-red-200 hover:bg-red-100",
      activeBg: "bg-red-600",
      status: "rejected" as const,
    },
    revision: {
      label: "Request Revision",
      icon: RefreshCw,
      color: "text-amber-700",
      bg: "bg-amber-50 border-amber-200 hover:bg-amber-100",
      activeBg: "bg-amber-600",
      status: "revision_requested" as const,
    },
  };

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
      isUrgent ? "border-amber-200" : "border-maroon-100"
    }`}>
      {/* Urgent banner */}
      {isUrgent && (
        <div className="px-5 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
          <Clock size={12} className="text-amber-600" />
          <span className="text-xs text-amber-700 font-medium">Pending for {daysAgo} days — needs attention</span>
        </div>
      )}

      {/* Main header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Category + date */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {study.category && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                  style={{
                    background: `${study.category.color}15`,
                    borderColor: `${study.category.color}30`,
                    color: study.category.color,
                  }}>
                  <Tag size={9} />
                  {study.category.name}
                </span>
              )}
              <span className="text-xs text-maroon-400">
                Submitted {daysAgo === 0 ? "today" : `${daysAgo}d ago`}
              </span>
            </div>

            <h3 className="font-serif text-base font-semibold text-maroon-900 leading-snug mb-2">
              {study.title}
            </h3>

            {/* Meta */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-maroon-500">
              <span className="flex items-center gap-1">
                <User size={11} />
                {study.author?.full_name ?? "Unknown"}
                {study.author?.student_id && ` · ${study.author.student_id}`}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen size={11} />
                Adviser: {study.adviser}
              </span>
              <span>{study.course} · {study.department}</span>
            </div>
          </div>

          {/* Actions top-right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {study.file_url && (
              <a
                href={study.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-maroon-200 text-xs text-maroon-600 hover:bg-maroon-50 transition-all font-medium"
              >
                <FileText size={12} />
                <span className="hidden sm:inline">View PDF</span>
                <ExternalLink size={10} />
              </a>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-maroon-200 text-xs text-maroon-500 hover:bg-maroon-50 transition-all"
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              <span className="hidden sm:inline">{expanded ? "Less" : "More"}</span>
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 space-y-4 pt-4 border-t border-maroon-50">
            <div>
              <p className="text-xs font-semibold text-maroon-500 uppercase tracking-wide mb-1.5">Abstract</p>
              <p className="text-sm text-maroon-700 leading-relaxed">{study.abstract}</p>
            </div>
            {study.keywords?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-maroon-500 uppercase tracking-wide mb-1.5">Keywords</p>
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
      </div>

      {/* Validation panel */}
      <div className="px-5 pb-5">
        <div className="border-t border-maroon-50 pt-4">

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mb-3">
            {(Object.keys(actionConfig) as Array<keyof typeof actionConfig>).map((key) => {
              const cfg = actionConfig[key];
              const Icon = cfg.icon;
              const isSelected = action === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAction(isSelected ? null : key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? `${cfg.activeBg} text-white border-transparent shadow-sm`
                      : `${cfg.bg} ${cfg.color}`
                  }`}
                >
                  <Icon size={13} />
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Notes + confirm */}
          {action && (
            <div className="space-y-3 animate-fade-in">
              <div>
                <label className="block text-xs font-medium text-maroon-600 mb-1.5">
                  Validation Notes
                  {action !== "approve" && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder={
                    action === "approve"
                      ? "Optional: Add any notes for the author..."
                      : "Required: Explain the reason for this decision..."
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-maroon-200 bg-parchment-50 text-maroon-900 placeholder-maroon-300 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleValidation(actionConfig[action].status)}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-60 shadow-sm hover:shadow-md"
                  style={{
                    background: action === "approve"
                      ? "linear-gradient(135deg, #2E7D32, #1b5e20)"
                      : action === "reject"
                        ? "linear-gradient(135deg, #dc2626, #b91c1c)"
                        : "linear-gradient(135deg, #d97706, #b45309)",
                  }}
                >
                  {isLoading
                    ? <><Loader2 size={14} className="animate-spin" /> Processing...</>
                    : <>{React.createElement(actionConfig[action].icon, { size: 14 })} Confirm {actionConfig[action].label}</>
                  }
                </button>
                <button
                  type="button"
                  onClick={() => { setAction(null); setNotes(""); }}
                  className="px-4 py-2.5 rounded-xl border border-maroon-200 text-maroon-500 text-sm hover:bg-maroon-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
