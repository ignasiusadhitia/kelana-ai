import { useState } from "react";
import { TripResponse } from "@/types/trip";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

/**
 * COMPONENT: TripRecommendation
 * Displays the curated bespoke travel guide with interactive filtering, day accordions,
 * and multi-format export toolbars (Copy, Download Markdown, Print/PDF).
 * Utilizes atomic Typography and Button UI primitives.
 */

interface TripRecommendationProps {
  trip: TripResponse;
  onReset: () => void;
}

interface SectionItem {
  id: string;
  rawTitle: string;
  cleanTitle: string;
  icon: string;
  body: string;
  isDay: boolean;
  dayNumber?: number;
}

// Helper to extract emoji characters from string headings
function extractLeadingEmoji(text: string): string | null {
  const match = text.match(/^[\p{Emoji}\p{Extended_Pictographic}]+/u);
  return match ? match[0] : null;
}

// Helper to strip leading emoji from title to avoid duplicate icons
function cleanTitleText(text: string): string {
  return text.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s:-]+/u, "").trim();
}

export function TripRecommendation({ trip, onReset }: TripRecommendationProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  // PATTERN: Parses markdown sections by top-level "## " headings for tabbed/accordion view
  const parseSections = (rawText: string): SectionItem[] => {
    const sectionDelimiter = /(?:^|\n)(?=##\s+)/g;
    const rawParts = rawText.split(sectionDelimiter).filter((s) => s.trim().length > 0);

    if (rawParts.length <= 1) {
      return [
        {
          id: "section-0",
          rawTitle: "Itinerary Overview",
          cleanTitle: "Itinerary Overview",
          icon: "🧭",
          body: rawText,
          isDay: false,
        },
      ];
    }

    let dayCounter = 0;
    return rawParts.map((part, idx) => {
      const lines = part.trim().split("\n");
      const firstLine = lines[0].trim();
      const isHeading = firstLine.startsWith("## ");
      const rawTitle = isHeading
        ? firstLine.replace(/^##\s+/, "")
        : idx === 0
        ? "Overview"
        : `Section ${idx + 1}`;
      const body = isHeading ? lines.slice(1).join("\n").trim() : part.trim();

      const isDay = /^Day\s+\d+/i.test(rawTitle);
      if (isDay) {
        dayCounter += 1;
      }

      const leadingEmoji = extractLeadingEmoji(rawTitle);
      const cleanTitle = cleanTitleText(rawTitle) || rawTitle;

      return {
        id: `section-${idx}`,
        rawTitle,
        cleanTitle,
        icon: isDay ? String(dayCounter) : leadingEmoji || "✨",
        body,
        isDay,
        dayNumber: isDay ? dayCounter : undefined,
      };
    });
  };

  const sections = trip.ai_recommendation ? parseSections(trip.ai_recommendation) : [];
  const daySections = sections.filter((s) => s.isDay);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const handleExpandAll = () => {
    const nextState: Record<string, boolean> = {};
    sections.forEach((s) => {
      nextState[s.id] = true;
    });
    setExpandedSections(nextState);
  };

  const handleCollapseAll = () => {
    const nextState: Record<string, boolean> = {};
    sections.forEach((s) => {
      nextState[s.id] = false;
    });
    setExpandedSections(nextState);
  };

  // Copy raw markdown content to clipboard
  const handleCopy = async () => {
    if (!trip.ai_recommendation) return;
    try {
      await navigator.clipboard.writeText(trip.ai_recommendation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Export itinerary as a downloadable markdown document
  const handleDownloadMarkdown = () => {
    if (!trip.ai_recommendation) return;
    const blob = new Blob([trip.ai_recommendation], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Itinerary_${trip.destination.replace(/[\s,]+/g, "_")}_${trip.days}Days.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Trigger browser native print dialog for PDF saving
  const handlePrint = () => {
    window.print();
  };

  // Filter sections by selected day tab or full overview
  const filteredSections = sections.filter((section) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "guides") return !section.isDay;
    return section.id === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-card-border bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-blue-950/40 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
        {/* Ambient Top Right Glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Typography as="span" variant="kicker" className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] text-blue-300">
                CURATED TRAVEL BLUEPRINT
              </Typography>
              <Typography variant="muted">Plan #{trip.id}</Typography>
            </div>
            <Typography variant="h2" className="text-white">
              {trip.destination}
            </Typography>
            <Typography variant="lead" className="text-zinc-300 mt-1 block">
              Custom {trip.days}-Day travel plan optimized for a total budget of USD {Number(trip.budget).toLocaleString()}
            </Typography>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <span className="text-emerald-400">✓</span>
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Copy</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleDownloadMarkdown}
            >
              <span>📥</span>
              <span>Export .md</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handlePrint}
            >
              <span>🖨️</span>
              <span>Print / PDF</span>
            </Button>
          </div>
        </div>

        {/* 4 Metric Badges */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-3.5 backdrop-blur-md">
            <Typography variant="kicker" className="block text-zinc-400">
              Duration
            </Typography>
            <Typography variant="h4" className="mt-0.5 block text-white font-extrabold">
              📅 {trip.days} Days
            </Typography>
          </div>

          <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-3.5 backdrop-blur-md">
            <Typography variant="kicker" className="block text-zinc-400">
              Total Budget
            </Typography>
            <Typography variant="h4" className="mt-0.5 block text-white font-extrabold">
              💵 USD {Number(trip.budget).toLocaleString()}
            </Typography>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-3.5 backdrop-blur-md">
            <Typography variant="kicker" className="block text-emerald-300">
              Daily Limit
            </Typography>
            <Typography variant="h4" className="mt-0.5 block text-emerald-400 font-extrabold">
              ⚡ ${Number(trip.daily_budget).toLocaleString()}/day
            </Typography>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-950/30 p-3.5 backdrop-blur-md">
            <Typography variant="kicker" className="block text-blue-300">
              Category Tier
            </Typography>
            <Typography variant="h4" className="mt-0.5 block text-blue-300 font-extrabold">
              🏷️ {trip.category}
            </Typography>
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs & Accordion Controls */}
      {sections.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Day Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`cursor-pointer rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                activeFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-blue-600/20 ring-2 ring-primary/30"
                  : "border border-border bg-secondary/80 text-muted-foreground hover:border-zinc-700 hover:text-foreground"
              }`}
            >
              All Days Overview
            </button>

            {daySections.map((sec, i) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveFilter(sec.id)}
                className={`cursor-pointer rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  activeFilter === sec.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-blue-600/20 ring-2 ring-primary/30"
                    : "border border-border bg-secondary/80 text-muted-foreground hover:border-zinc-700 hover:text-foreground"
                }`}
              >
                Day {i + 1}
              </button>
            ))}

            {sections.some((s) => !s.isDay) && (
              <button
                type="button"
                onClick={() => setActiveFilter("guides")}
                className={`cursor-pointer rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  activeFilter === "guides"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-blue-600/20 ring-2 ring-primary/30"
                    : "border border-border bg-secondary/80 text-muted-foreground hover:border-zinc-700 hover:text-foreground"
                }`}
              >
                🍜 Guides & Tips
              </button>
            )}
          </div>

          {/* Accordion Expand / Collapse All */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleExpandAll}
              className="cursor-pointer font-medium text-muted-foreground hover:text-primary transition"
            >
              Expand all
            </button>
            <span className="text-zinc-700">•</span>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="cursor-pointer font-medium text-muted-foreground hover:text-primary transition"
            >
              Collapse all
            </button>
          </div>
        </div>
      )}

      {/* Structured Sections / Cards */}
      <div className="space-y-4 pt-1">
        {filteredSections.map((section) => {
          const isCollapsed = expandedSections[section.id] === false;

          return (
            <div
              key={section.id}
              className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-md backdrop-blur-md transition-all hover:border-zinc-700"
            >
              {/* Card Header (Accordion Button) */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="cursor-pointer flex w-full items-center justify-between gap-3 px-6 py-4.5 text-left transition hover:bg-zinc-800/50"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold shadow-sm ${
                      section.isDay
                        ? "bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-blue-500/20"
                        : "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-orange-500/20"
                    }`}
                  >
                    {section.icon}
                  </span>
                  <Typography variant="h3" className="tracking-tight">
                    {section.cleanTitle}
                  </Typography>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Typography variant="muted" className="text-muted-foreground">
                    {isCollapsed ? "Show Details" : "Hide"}
                  </Typography>
                  <svg
                    className={`h-4 w-4 transform transition-transform duration-200 ${
                      isCollapsed ? "-rotate-90" : "rotate-0"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Card Body */}
              {!isCollapsed && (
                <div className="border-t border-card-border px-6 py-5 bg-zinc-950/40">
                  <MarkdownRenderer content={section.body} />
                </div>
              )}
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No sections match the selected filter.
          </div>
        )}
      </div>

      {/* Bottom Action CTA */}
      <div className="pt-4 border-t border-card-border flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          size="lg"
          onClick={onReset}
          className="flex-1 py-4 text-sm"
        >
          ✨ Plan Another Journey
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={handlePrint}
          className="px-6 py-4 text-sm"
        >
          🖨️ Print Itinerary
        </Button>
      </div>
    </div>
  );
}
