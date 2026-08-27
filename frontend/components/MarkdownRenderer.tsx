import React, { isValidElement } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * COMPONENT: MarkdownRenderer
 * Custom Markdown parser transforming AI output into stylized, branded HTML elements
 * with dedicated time-block badges (Morning, Afternoon, Evening, Tips, Budget).
 * Includes a robust single-pass LLM markdown normalizer.
 */

interface MarkdownRendererProps {
  content: string;
}

/**
 * Normalizes LLM markdown formatting:
 * 1. Trims spaces INSIDE bold delimiters: `** text **` -> `**text**` so CommonMark parses it as bold.
 * 2. Guarantees a single space OUTSIDE if a normal word is glued directly to the asterisks: `to**The` -> `to **The`.
 * 3. Preserves punctuation directly attached to bold: `**Activity 1:**` -> `**Activity 1:**` (no space before `:`).
 */
function sanitizeMarkdown(text: string): string {
  if (!text) return "";

  return (
    text
      // Normalize double asterisks bold pairs
      .replace(/(^|[\s\S])\*\*([^*\n]+?)\*\*([\s\S]|$)/g, (match, before, content, after) => {
        const trimmed = content.trim();
        if (!trimmed) return match;

        // If preceding char is an alphanumeric letter/number, add space before `**`
        let prefix = before || "";
        if (before && /[a-zA-Z0-9]/.test(before)) {
          prefix = `${before} `;
        }

        // If succeeding char is an alphanumeric letter/number, add space after `**`
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
 * Helper to strip leading emojis/pictographs from heading text to avoid duplicate icons.
 */
function stripLeadingEmoji(text: string): string {
  return text.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s:-]+/u, "").trim();
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-3 mt-4 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => {
    const rawText = extractText(children);
    const cleanedText = stripLeadingEmoji(rawText) || rawText;
    return (
      <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-3 mt-5 first:mt-0 pb-1.5 border-b border-zinc-200/60 dark:border-zinc-800">
        {cleanedText}
      </h2>
    );
  },
  h3: ({ children }) => {
    const rawText = extractText(children);
    const cleanedText = stripLeadingEmoji(rawText) || rawText;

    let icon = "📍";
    let badgeColor =
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800";

    // Dynamic icon and badge coloring based on time-block keywords
    if (/morning/i.test(rawText)) {
      icon = "🌅";
      badgeColor =
        "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
    } else if (/afternoon/i.test(rawText)) {
      icon = "☀️";
      badgeColor =
        "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800";
    } else if (/evening|night/i.test(rawText)) {
      icon = "🌙";
      badgeColor =
        "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800";
    } else if (/budget|cost|breakdown|expense/i.test(rawText)) {
      icon = "💰";
      badgeColor =
        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
    } else if (/food|dish|culinary|dining/i.test(rawText)) {
      icon = "🍜";
      badgeColor =
        "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800";
    } else if (/transport|navigate|subway|train/i.test(rawText)) {
      icon = "🚆";
      badgeColor =
        "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800";
    } else if (/tip|insider|essential|advice/i.test(rawText)) {
      icon = "💡";
      badgeColor =
        "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800";
    }

    return (
      <div className="mt-5 mb-2.5 flex items-center gap-2 first:mt-1">
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold tracking-wide uppercase ${badgeColor}`}
        >
          <span>{icon}</span>
          <span>{cleanedText}</span>
        </span>
      </div>
    );
  },
  h4: ({ children }) => (
    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mt-3 mb-1">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 mb-3 last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="space-y-2 mb-3.5 pl-4 text-sm text-zinc-700 dark:text-zinc-300 list-disc marker:text-blue-500">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="space-y-2 mb-3.5 pl-4 text-sm text-zinc-700 dark:text-zinc-300 list-decimal marker:text-blue-500">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed text-sm text-zinc-700 dark:text-zinc-300">
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic text-zinc-800 dark:text-zinc-200">{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 pl-4 py-2.5 my-3 rounded-r-xl text-sm text-zinc-700 dark:text-zinc-300 italic">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-200 text-xs dark:divide-zinc-800">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="bg-zinc-100 px-3.5 py-2.5 text-left font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3.5 py-2.5 text-zinc-700 dark:text-zinc-300 border-t border-zinc-100 dark:border-zinc-800/50">
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
