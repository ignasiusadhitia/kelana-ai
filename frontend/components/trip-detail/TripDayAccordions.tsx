import { useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Typography } from "@/components/ui/typography";
import { ScrollableTrack } from "@/components/ui/scrollable-track";

export interface SectionItem {
  id: string;
  rawTitle: string;
  cleanTitle: string;
  icon: string;
  body: string;
  isDay: boolean;
  dayNumber?: number;
  isOverview?: boolean;
}

/**
 * COMPONENT: TripDayAccordions
 * Day-by-day filterable accordion view breaking down itinerary days and general recommendations.
 */
interface TripDayAccordionsProps {
  sections: SectionItem[];
}

/**
 * Interactive day-by-day accordion list featuring day tab filters,
 * collapse/expand toggles, and formatted markdown day itineraries.
 */
export function TripDayAccordions({ sections }: TripDayAccordionsProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const daySections = sections.filter((s) => s.isDay);
  const guideSections = sections.filter((s) => !s.isDay && !s.isOverview);
  const overviewSection = sections.find((s) => s.isOverview);

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

  const filteredSections = sections.filter((section) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "guides") return !section.isDay && !section.isOverview;
    if (activeFilter === "overview") return Boolean(section.isOverview);
    return section.id === activeFilter;
  });

  if (sections.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Navigation Filter Tabs & Accordion Controls with Automatic Flanking Chevrons */}
      {sections.length > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Day Navigation Tabs Track with Automatic Scroll Chevrons */}
          <div className="flex-1 min-w-0">
            <ScrollableTrack className="gap-1.5" fadeWidth="w-10 sm:w-12">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`cursor-pointer shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-all active:scale-95 ${
                  activeFilter === "all"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-blue-600/20 ring-2 ring-primary/30"
                    : "border border-border bg-secondary/80 text-muted-foreground hover:border-zinc-700 hover:text-foreground"
                }`}
              >
                All Days Overview
              </button>

              {overviewSection && (
                <button
                  type="button"
                  onClick={() => setActiveFilter("overview")}
                  className={`cursor-pointer shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-all active:scale-95 ${
                    activeFilter === "overview"
                      ? "bg-primary text-primary-foreground shadow-lg shadow-blue-600/20 ring-2 ring-primary/30"
                      : "border border-border bg-secondary/80 text-muted-foreground hover:border-zinc-700 hover:text-foreground"
                  }`}
                >
                  Overview
                </button>
              )}

              {daySections.map((sec, i) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveFilter(sec.id)}
                  className={`cursor-pointer shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-all active:scale-95 ${
                    activeFilter === sec.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-blue-600/20 ring-2 ring-primary/30"
                      : "border border-border bg-secondary/80 text-muted-foreground hover:border-zinc-700 hover:text-foreground"
                  }`}
                >
                  Day {sec.dayNumber || i + 1}
                </button>
              ))}

              {guideSections.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveFilter("guides")}
                  className={`cursor-pointer shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all active:scale-95 ${
                    activeFilter === "guides"
                      ? "bg-primary text-primary-foreground shadow-lg shadow-blue-600/20 ring-2 ring-primary/30"
                      : "border border-border bg-secondary/80 text-muted-foreground hover:border-zinc-700 hover:text-foreground"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Guides & Tips</span>
                </button>
              )}
            </ScrollableTrack>
          </div>

          {/* Accordion Expand / Collapse All */}
          <div className="flex items-center justify-end gap-2 text-xs shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleExpandAll}
              className="cursor-pointer font-medium text-muted-foreground hover:text-primary transition active:scale-95"
            >
              Expand all
            </button>
            <span className="text-zinc-700">•</span>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="cursor-pointer font-medium text-muted-foreground hover:text-primary transition active:scale-95"
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
                className="cursor-pointer flex w-full items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4.5 text-left transition hover:bg-zinc-800/50"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold shadow-sm ${
                      section.isDay
                        ? "bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-blue-500/20"
                        : "bg-blue-500/10 border border-blue-500/20 text-blue-300"
                    }`}
                  >
                    {section.isDay ? (
                      section.icon
                    ) : (
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    )}
                  </span>
                  <Typography variant="h3" className="tracking-tight text-sm sm:text-base">
                    {section.cleanTitle}
                  </Typography>
                </div>

                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Typography variant="muted" className="text-muted-foreground text-xs hidden sm:inline">
                    {isCollapsed ? "Show Details" : "Hide"}
                  </Typography>
                  <ChevronDown
                    className={`h-4 w-4 transform transition-transform duration-200 ${
                      isCollapsed ? "-rotate-90" : "rotate-0"
                    }`}
                  />
                </div>
              </button>

              {/* Card Body */}
              {!isCollapsed && (
                <div className="border-t border-card-border px-4 py-4 sm:px-6 sm:py-5 bg-zinc-950/40">
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
    </div>
  );
}
