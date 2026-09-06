import React, { isValidElement } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sunrise,
  Sun,
  Moon,
  CircleDollarSign,
  Utensils,
  Train,
  Lightbulb,
  MapPin,
} from "lucide-react";

/**
 * COMPONENT: MarkdownRenderer
 * Custom Markdown parser transforming AI output into stylized, branded HTML elements
 * with dedicated time-block vector badges (Morning, Afternoon, Evening, Tips, Budget).
 * Fully independent of OS light/dark mode overrides to ensure 100% legible contrast on the dark canvas.
 */

interface MarkdownRendererProps {
  content: string;
}

/**
 * Normalizes LLM markdown formatting:
 * 1. Converts raw LaTeX math blocks (\[ ... \], \text{...}, \frac{...}{...}) into clean, readable plain-text calculations.
 * 2. Trims spaces INSIDE bold delimiters: `** text **` -> `**text**` so CommonMark parses it as bold.
 * 3. Guarantees a single space OUTSIDE if a normal word is glued directly to the asterisks: `to**The` -> `to **The`.
 * 4. Preserves punctuation directly attached to bold: `**Activity 1:**` -> `**Activity 1:**` (no space before `:`).
 */
function sanitizeMarkdown(text: string): string {
  if (!text) return "";

  // Step 0: Normalize stacked markdown headings (e.g. "#### ## Day 1" -> "## Day 1", "#### ### Morning" -> "### Morning")
  let normalized = text;
  while (/^#{1,6}\s+#{1,6}\s+/m.test(normalized)) {
    normalized = normalized.replace(/^#{1,6}\s+(#{1,6}\s+)/gm, "$1");
  }

  // Step 0.5: Strip robotic boilerplate meta-headers if present
  normalized = normalized.replace(
    /^[#*\s]*(?:Warm Welcome(?:\s*(?:and|&)\s*Itinerary\s*Overview)?|Modular Breakdown(?:\s*(?:and|&)\s*Budget\s*Allocation)?|Itinerary\s*Overview(?:\s*(?:and|&)\s*Warm\s*Welcome)?|Budget\s*Allocation(?:\s*(?:and|&)\s*Modular\s*Breakdown)?|Next Steps?|Sambutan\s*Hangat(?:\s*(?:dan|&)\s*Gambaran\s*Itinerary)?|Pembagian\s*Modular(?:\s*(?:dan|&)\s*Alokasi\s*Anggaran)?|Langkah\s*Selanjutnya)[#*\s]*\n+/gim,
    ""
  );

  // Step 1: Clean raw LaTeX math expressions into clean readable text
  const cleanedMath = normalized
    // Replace \text{...} or \mathrm{...} with just the content first to avoid nested braces
    .replace(/\\(?:text|mathrm|mathbf)\{([^}]+)\}/g, "$1")
    // Replace \frac{numerator}{denominator} with numerator ÷ denominator
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 ÷ $2")
    // Replace common math symbols
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "·")
    .replace(/\\div/g, "÷")
    .replace(/\\approx/g, "≈")
    .replace(/\\le\b|\\leq\b/g, "≤")
    .replace(/\\ge\b|\\geq\b/g, "≥")
    // Remove \[ and \] display math delimiters
    .replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (match, inner) => inner.trim())
    // Remove \( and \) inline math delimiters
    .replace(/\\\(\s*([\s\S]*?)\s*\\\)/g, (match, inner) => inner.trim())
    // Clean up residual unescaped [ ... ] blocks if CommonMark or LLM output plain [ ... ]
    .replace(/\[\s*([\d\w\s.,$€¥£×÷=\-\/]+(?:USD|JPY|IDR|EUR|SGD|days?|hari|pax|×|÷|=)[\d\w\s.,$€¥£×÷=\-\/]*)\s*\]/gi, (match, inner) => inner.trim())
    // Clean up double spaces created by stripped \text{ USD}
    .replace(/ {2,}/g, " ");

  return (
    cleanedMath
      // Normalize double asterisks bold pairs
      .replace(/(^|[\s\S])\*\*([^*\n]+?)\*\*([\s\S]|$)/g, (match, before, content, after) => {
        const trimmed = content.trim();
        if (!trimmed) return match;

        let prefix = before || "";
        if (before && /[a-zA-Z0-9]/.test(before)) {
          prefix = `${before} `;
        }

        let suffix = after || "";
        if (after && /[a-zA-Z0-9]/.test(after)) {
          suffix = ` ${after}`;
        }

        return `${prefix}**${trimmed}**${suffix}`;
      })
      // Normalize double underscore bold pairs
      .replace(/(^|[\s\S])__([^_\n]+?)__([\s\S]|$)/g, (match, before, content, after) => {
        const trimmed = content.trim();
        if (!trimmed) return match;

        let prefix = before || "";
        if (before && /[a-zA-Z0-9]/.test(before)) {
          prefix = `${before} `;
        }

        let suffix = after || "";
        if (after && /[a-zA-Z0-9]/.test(after)) {
          suffix = ` ${after}`;
        }

        return `${prefix}**${trimmed}**${suffix}`;
      })
  );
}

/**
 * Helper to recursively extract pure string text from React children nodes.
 */
function extractText(node: React.ReactNode): string {
  if (!node) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement<{ children?: React.ReactNode }>(node) && node.props.children) {
    return extractText(node.props.children);
  }
  return "";
}

/**
 * Helper to strip leading emojis/pictographs and residual markdown symbols from heading text.
 * Preserves alphanumeric characters and digits (e.g. "5-Day", "Day 1").
 */
function cleanHeadingText(text: string): string {
  if (!text) return "";
  const unhashed = text.replace(/^[#*\s]+/, "");
  return unhashed.replace(/^(?:[^\p{L}\p{N}\s#*]|[\p{Extended_Pictographic}])+\s*/u, "").trim();
}

function getTimeBlockBadge(rawText: string) {
  if (/morning|pagi|breakfast|sarapan/i.test(rawText)) {
    return {
      icon: <Sunrise className="w-3.5 h-3.5 text-amber-400" />,
      colorClass: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    };
  }
  if (/afternoon|siang|sore|lunch|brunch/i.test(rawText)) {
    return {
      icon: <Sun className="w-3.5 h-3.5 text-sky-400" />,
      colorClass: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    };
  }
  if (/evening|night|malam|dinner/i.test(rawText)) {
    return {
      icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
      colorClass: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    };
  }
  if (/budget|cost|breakdown|expense|biaya/i.test(rawText)) {
    return {
      icon: <CircleDollarSign className="w-3.5 h-3.5 text-emerald-400" />,
      colorClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    };
  }
  if (/food|dish|culinary|dining|kuliner|makan/i.test(rawText)) {
    return {
      icon: <Utensils className="w-3.5 h-3.5 text-orange-400" />,
      colorClass: "bg-orange-500/10 text-orange-300 border-orange-500/20",
    };
  }
  if (/transport|navigate|subway|train|transit/i.test(rawText)) {
    return {
      icon: <Train className="w-3.5 h-3.5 text-purple-400" />,
      colorClass: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    };
  }
  if (/tip|insider|essential|advice|panduan|catatan/i.test(rawText)) {
    return {
      icon: <Lightbulb className="w-3.5 h-3.5 text-teal-400" />,
      colorClass: "bg-teal-500/10 text-teal-300 border-teal-500/20",
    };
  }

  return {
    icon: <MapPin className="w-3.5 h-3.5 text-blue-400" />,
    colorClass: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  };
}

const markdownComponents: Components = {
  h1: ({ children }) => {
    const rawText = extractText(children);
    const cleanedText = cleanHeadingText(rawText) || rawText;
    return (
      <h1 className="text-xl font-extrabold text-white mb-3 mt-4 first:mt-0">
        {cleanedText}
      </h1>
    );
  },
  h2: ({ children }) => {
    const rawText = extractText(children);
    const cleanedText = cleanHeadingText(rawText) || rawText;
    return (
      <h2 className="text-base font-bold text-white mb-3 mt-5 first:mt-0 pb-1.5 border-b border-white/10">
        {cleanedText}
      </h2>
    );
  },
  h3: ({ children }) => {
    const rawText = extractText(children);
    const cleanedText = cleanHeadingText(rawText) || rawText;
    const isTimeBlock = /morning|afternoon|evening|night|breakfast|lunch|dinner|brunch|budget|cost|breakdown|expense|tip|insider|pagi|siang|sore|malam|sarapan|biaya/i.test(
      cleanedText
    );
    if (isTimeBlock) {
      const { icon, colorClass } = getTimeBlockBadge(cleanedText);
      return (
        <div className="mt-5 mb-2.5 flex items-center gap-2 first:mt-1">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold tracking-wide uppercase ${colorClass}`}
          >
            {icon}
            <span>{cleanedText}</span>
          </span>
        </div>
      );
    }
    return (
      <h3 className="text-sm font-bold text-white mt-4 mb-2">
        {cleanedText}
      </h3>
    );
  },
  h4: ({ children }) => {
    const rawText = extractText(children);
    const cleanedText = cleanHeadingText(rawText) || rawText;
    const isTimeBlock = /morning|afternoon|evening|night|breakfast|lunch|dinner|brunch|budget|cost|breakdown|expense|tip|insider|pagi|siang|sore|malam|sarapan|biaya/i.test(
      cleanedText
    );
    if (isTimeBlock) {
      const { icon, colorClass } = getTimeBlockBadge(cleanedText);
      return (
        <div className="mt-4 mb-2 flex items-center gap-2 first:mt-1">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold tracking-wide uppercase ${colorClass}`}
          >
            {icon}
            <span>{cleanedText}</span>
          </span>
        </div>
      );
    }
    return (
      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mt-3 mb-1">
        {cleanedText}
      </h4>
    );
  },
  p: ({ children }) => (
    <p className="text-sm leading-relaxed text-zinc-300 mb-3 last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="space-y-2 mb-3.5 pl-4 text-sm text-zinc-300 list-disc marker:text-blue-400">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="space-y-2 mb-3.5 pl-4 text-sm text-zinc-300 list-decimal marker:text-blue-400">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed text-sm text-zinc-300">
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic text-zinc-200">{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-500 bg-blue-950/30 pl-4 py-2.5 my-3 rounded-r-xl text-sm text-zinc-300 italic">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4 rounded-xl border border-white/10">
      <table className="min-w-full divide-y divide-white/10 text-xs">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="bg-zinc-800/80 px-3.5 py-2.5 text-left font-semibold text-white">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3.5 py-2.5 text-zinc-300 border-t border-white/5">
      {children}
    </td>
  ),
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const sanitizedContent = sanitizeMarkdown(content);

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {sanitizedContent}
    </ReactMarkdown>
  );
}
