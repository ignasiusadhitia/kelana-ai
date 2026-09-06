"use client";

import { FileText } from "lucide-react";

interface SourceCitationsProps {
  sources: string[];
}

/**
 * COMPONENT: SourceCitations
 * Renders verified S3 knowledge base source citations under AI assistant messages.
 */
export function SourceCitations({ sources }: SourceCitationsProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 px-1 text-[10px] text-zinc-400">
      <FileText className="w-3 h-3 text-blue-400 shrink-0" />
      <span>{sources.length > 1 ? "Sources:" : "Source:"}</span>
      {sources.map((src, i) => (
        <code
          key={i}
          className="rounded bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 font-mono text-[10px] font-medium text-blue-300"
        >
          {src}
        </code>
      ))}
    </div>
  );
}
