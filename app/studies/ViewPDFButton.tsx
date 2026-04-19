"use client";

import { Download, ExternalLink } from "lucide-react";

interface ViewPDFButtonProps {
  studyId: string;
}

export default function ViewPDFButton({ studyId }: ViewPDFButtonProps) {
  return (
    <div className="flex flex-col gap-2">
      <a
        href={`/api/studies/${studyId}/view`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-parchment-50 transition-all hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}
      >
        <ExternalLink size={14} />
        View PDF
      </a>
      <a
        href={`/api/studies/${studyId}/download`}
        download
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-maroon-700 border border-maroon-200 hover:bg-maroon-50 transition-all"
      >
        <Download size={14} />
        Download PDF
      </a>
    </div>
  );
}
