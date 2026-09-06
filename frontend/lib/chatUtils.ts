import { ChatMessage } from "@/services/chatService";

export const SUGGESTED_PROMPTS = [
  { label: "Family Trip in Japan", prompt: "Plan a 5-day family trip to Japan with kids." },
  { label: "Customs Duty-Free Limits", prompt: "What are the duty-free limits for alcohol and electronics under Japan customs?" },
  { label: "Halal Food in Tokyo", prompt: "How to verify Halal food in Tokyo convenience stores?" },
  { label: "QRIS Payment in Japan", prompt: "Can I use Indonesian QRIS in Japan?" },
];

/**
 * Parses message raw text to extract citations while preserving clean markdown.
 * Supports bracket format [Source: doc.pdf] and standalone Source: doc.pdf.
 */
export function parseMessageContentAndSources(rawContent: string): { text: string; sources: string[] } {
  if (!rawContent) return { text: "", sources: [] };
  const sources: string[] = [];

  // Match [Source: filename.md] or [Source: file1.md, file2.pdf]
  const bracketRegex = /\[Source:\s*([^\]]+)\]/gi;
  let match: RegExpExecArray | null;
  while ((match = bracketRegex.exec(rawContent)) !== null) {
    const raw = match[1]?.trim().replace(/[*_`]/g, "");
    if (raw && raw.toLowerCase() !== "n/a") {
      // Split by comma or semicolons if multiple sources are listed
      const parts = raw.split(/[,;]/);
      for (const p of parts) {
        const filename = p.split("/").pop()?.trim();
        if (filename && !sources.includes(filename)) {
          sources.push(filename);
        }
      }
    }
  }

  // Also match plain "Source: filename.md" or "Source: filename.pdf"
  const plainRegex = /(?:^|\n)\s*Source:\s*([a-zA-Z0-9_\-.]+\.(?:pdf|md|txt))/gi;
  while ((match = plainRegex.exec(rawContent)) !== null) {
    const filename = match[1]?.trim();
    if (filename && !sources.includes(filename)) {
      sources.push(filename);
    }
  }

  // Strip citation tags from displayed markdown text
  const cleanText = rawContent
    .replace(/\[Source:\s*[^\]]+\]/gi, "")
    .replace(/(?:^|\n)\s*Source:\s*[a-zA-Z0-9_\-.]+\.(?:pdf|md|txt)/gi, "")
    .trim();

  return { text: cleanText || rawContent, sources };
}

/**
 * Checks whether an assistant message represents a failed/error state.
 */
export function isFailedMessage(msg: ChatMessage): boolean {
  if (msg.role !== "assistant") return false;
  if (msg.is_error) return true;
  const text = (msg.content || "").trim();
  const lower = text.toLowerCase();
  return (
    lower.startsWith("sorry, i encountered an issue") ||
    lower.startsWith("failed to stream message") ||
    lower.startsWith("i apologize, but i encountered an issue") ||
    lower.includes("failed to stream message")
  );
}

/**
 * Formats ISO timestamp to HH:MM format.
 */
export function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/**
 * Formats full date with time for accessible hover tooltips.
 */
export function formatFullDateTooltip(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

/**
 * Formats calendar divider text between message days (Today, Yesterday, or full date).
 */
export function formatDateDivider(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "";
  }
}

/**
 * Formats timestamp for sidebar conversation list items.
 */
export function formatSidebarTimestamp(isoString?: string): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return "Yesterday";
    }

    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 7 && diffDays >= 0) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    }

    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
