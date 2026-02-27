"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CitationCopy({ citation }: { citation: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-maroon-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-maroon-50 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #fdf6f0, #fff)" }}>
        <h2 className="font-serif text-base font-semibold text-maroon-800">Citation</h2>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            copied
              ? "border-upgreen-300 bg-upgreen-50 text-upgreen-700"
              : "border-maroon-200 text-maroon-500 hover:bg-maroon-50"
          }`}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="p-6">
        <p className="text-maroon-600 text-sm leading-relaxed font-mono bg-parchment-50 rounded-xl p-4 border border-maroon-100 break-words whitespace-pre-wrap">
          {citation}
        </p>
      </div>
    </div>
  );
}
