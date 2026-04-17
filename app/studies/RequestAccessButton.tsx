"use client";

import { useState } from "react";
import { Lock, Send, Clock, CheckCircle2, XCircle, LogIn } from "lucide-react";
import Link from "next/link";

interface Props {
  studyId: string;
  studyTitle: string;
  isLoggedIn: boolean;
  initialStatus: "none" | "pending" | "approved" | "denied";
}

export default function RequestAccessButton({ studyId, studyTitle, isLoggedIn, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-maroon-100 bg-parchment-50 p-4 text-center">
        <Lock size={18} className="text-maroon-400 mx-auto mb-2" />
        <p className="text-xs text-maroon-600 font-medium mb-1">Access Restricted</p>
        <p className="text-xs text-maroon-400 mb-3">Sign in to request access to this study's PDF.</p>
        <Link href="/login"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-parchment-50 transition-all"
          style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>
          <LogIn size={12} /> Sign In
        </Link>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-upgreen-50 border border-upgreen-200 text-xs text-upgreen-700 font-medium">
        <CheckCircle2 size={14} className="text-upgreen-600" />
        Access granted — check your email for the PDF link.
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
        <Clock size={14} className="text-amber-500" />
        Access request sent — awaiting author approval.
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
        <XCircle size={14} className="text-red-500" />
        Your request was not approved by the author.
      </div>
    );
  }

  // status === "none"
  async function handleRequest() {
    setLoading(true);
    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studyId, message }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("pending");
        setShowForm(false);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-parchment-50 border border-maroon-100 text-xs text-maroon-500">
        <Lock size={12} className="flex-shrink-0 text-maroon-400" />
        The author has restricted access to this PDF.
      </div>

      {showForm ? (
        <div className="space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Optional: briefly explain why you'd like access…"
            rows={3}
            className="w-full text-xs rounded-xl border border-maroon-200 bg-white px-3 py-2 text-maroon-700 placeholder:text-maroon-300 focus:outline-none focus:ring-2 focus:ring-maroon-300 resize-none"
          />
          <div className="flex gap-2">
            <button onClick={handleRequest} disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-parchment-50 disabled:opacity-60 transition-all"
              style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>
              {loading ? <Clock size={12} className="animate-spin" /> : <Send size={12} />}
              Send Request
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-3 py-2 rounded-xl border border-maroon-200 text-xs text-maroon-500 hover:bg-maroon-50 transition-all">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-parchment-50 transition-all"
          style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>
          <Send size={14} /> Request Access
        </button>
      )}
    </div>
  );
}
