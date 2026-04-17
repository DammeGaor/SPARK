"use client";

import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

interface ViewPDFButtonProps {
  fileUrl: string;
  studyId: string;
}

export default function ViewPDFButton({ fileUrl, studyId }: ViewPDFButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      // Fire-and-forget: notify the author. Don't block the user on this.
      fetch("/api/notify-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studyId }),
      }).catch(() => {
        // Silently ignore network errors — this is a best-effort notification
      });
    } finally {
      // Open PDF immediately; don't wait for the notification round-trip
      window.open(fileUrl, "_blank", "noopener,noreferrer");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-parchment-50 transition-all disabled:opacity-60"
      style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <ExternalLink size={14} />
      )}
      View PDF
    </button>
  );
}
