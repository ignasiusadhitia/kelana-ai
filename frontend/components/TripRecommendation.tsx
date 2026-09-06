"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot } from "lucide-react";
import { TripResponse } from "@/types/trip";
import { LoadingState } from "@/components/LoadingState";
import { updateTripBudget, regenerateTripAi } from "@/services/tripService";
import { toast } from "@/components/ui/toast";
import { formatBudget } from "@/lib/utils";
import { TripHeader } from "./trip-detail/TripHeader";
import { TripMetricsGrid } from "./trip-detail/TripMetricsGrid";
import { TripDayAccordions, SectionItem } from "./trip-detail/TripDayAccordions";
import { EditBudgetModal } from "./trip-detail/EditBudgetModal";
import { generateTripIcs } from "@/lib/calendar";

/**
 * COMPONENT: TripRecommendation
 * Master orchestrator for curated travel blueprint view.
 * Clean, modularized architecture delegating to specialized sub-components:
 * - TripHeader (Title, persona badges, export/copy/print toolbar)
 * - TripMetricsGrid (5-metric overview cards + budget edit trigger)
 * - TripDayAccordions (Day-by-day filter tabs & collapsible Markdown sections)
 * - EditBudgetModal (Portal-based in-place budget editor & AI regeneration)
 */

interface TripRecommendationProps {
  trip: TripResponse;
  onReset?: () => void;
  onTripUpdated?: (updatedTrip: TripResponse) => void;
}

// Helper to strip leading emoji/pictographs from title strings without stripping numbers (e.g. "5-Day")
function cleanTitleText(text: string): string {
  if (!text) return "";
  return text
    .replace(/^#+\s*/, "")
    .replace(/^(?:[^\p{L}\p{N}\s#*]|[\p{Extended_Pictographic}])+\s*/u, "")
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/___(.*?)___/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/[*_`]/g, "")
    .trim();
}

// Check if a line is a Day heading (e.g. "## Day 1", "### Day 1:", "**Day 1**", "Day 1 -", "Hari 1")
function isDayHeaderLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    /^(?:#{1,4}\s+)?(?:\*\*)?(?:Day|Hari)\s+\d+[:\s\*\-]/i.test(trimmed) ||
    /^(?:#{1,4}\s+)?(?:\*\*)?(?:Day|Hari)\s+\d+(?:\*\*)?$/i.test(trimmed)
  );
}

// Check if a line is a known Guide / Appendix heading
function isGuideHeaderLine(line: string): boolean {
  const trimmed = line.trim();
  return /^(?:#{1,4}\s+)?(?:\*\*)?(?:Essential Local Dishes|Smart Navigation|Practical Packing|Guides?\s*(?:&|and)\s*Tips|Travel Tips|Practical Tips|Insider Tips|Tips\s*(?:&|and)\s*(?:Tricks|Panduan)|Panduan\s*(?:&|dan)\s*Tips|Kuliner\s*Khas|Transportasi|Local Etiquette|Recommendations?|Important Notes|General Tips)\b/i.test(
    trimmed
  );
}

// Check if a line is a sub-timeblock header inside a day (NOT a section delimiter)
function isTimeBlockHeader(line: string): boolean {
  const trimmed = line.trim();
  return /^(?:#{3,4}\s+)?(?:\*\*)?(?:Morning|Afternoon|Evening|Night|Insider Tip|Daily Cost Breakdown|Budget Breakdown|Pagi|Siang|Sore|Malam|Estimasi Biaya)\b/i.test(
    trimmed
  );
}

export function TripRecommendation({
  trip,
  onReset,
  onTripUpdated,
}: TripRecommendationProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);
  const [isUpdatingBudget, setIsUpdatingBudget] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Resilient multi-level parser: accurately splits Day sections, Guide sections,
  // and substantive Overviews regardless of markdown heading levels (H2, H3, H4, bold)
  const parseSections = (rawText: string): SectionItem[] => {
    if (!rawText || !rawText.trim()) return [];

    const lines = rawText.replace(/\r\n/g, "\n").split("\n");
    const parsedSections: SectionItem[] = [];
    let currentTitle = "";
    let currentBodyLines: string[] = [];
    let isCurrentDay = false;
    let hasFoundFirstDay = false;
    let preambleLines: string[] = [];

    const flushCurrentSection = () => {
      if (!currentTitle && currentBodyLines.length === 0) return;

      const rawTitle = currentTitle || "Overview";
      const cleanTitle = cleanTitleText(rawTitle) || rawTitle;
      const isDay = isCurrentDay || /^(?:Day|Hari)\s+\d+/i.test(cleanTitle);

      parsedSections.push({
        id: `section-${parsedSections.length}`,
        rawTitle,
        cleanTitle,
        icon: "",
        body: currentBodyLines.join("\n").trim(),
        isDay,
        isOverview: !isDay && parsedSections.length === 0 && !hasFoundFirstDay,
      });

      currentTitle = "";
      currentBodyLines = [];
      isCurrentDay = false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check for Day section delimiter
      if (isDayHeaderLine(trimmed)) {
        if (!hasFoundFirstDay) {
          const preambleText = preambleLines.join("\n").trim();
          const firstLine = preambleText.split("\n")[0] || "";
          const bodyAfterTitle = preambleText.split("\n").slice(1).join("\n").trim();

          // If preamble has substantive overview content (>80 chars), keep as an Overview section
          if (bodyAfterTitle.length > 80) {
            parsedSections.push({
              id: "section-overview",
              rawTitle: firstLine.replace(/^#+\s*/, "").trim() || "Trip Overview",
              cleanTitle: cleanTitleText(firstLine) || "Trip Overview",
              icon: "",
              body: bodyAfterTitle,
              isDay: false,
              isOverview: true,
            });
          }
          hasFoundFirstDay = true;
        } else {
          flushCurrentSection();
        }

        currentTitle = trimmed;
        isCurrentDay = true;
        continue;
      }

      // Check for Guide section delimiter (or any H2/H3 after first day that isn't a time block)
      const isGuideCandidate =
        isGuideHeaderLine(trimmed) ||
        (hasFoundFirstDay && /^(?:##|###)\s+[A-Za-z]/.test(trimmed) && !isTimeBlockHeader(trimmed));

      if (hasFoundFirstDay && isGuideCandidate) {
        flushCurrentSection();
        currentTitle = trimmed;
        isCurrentDay = false;
        continue;
      }

      if (!hasFoundFirstDay) {
        preambleLines.push(line);
      } else {
        currentBodyLines.push(line);
      }
    }

    // Flush trailing section
    flushCurrentSection();

    // Fallback: If no day sections were detected via lines, return single Overview section
    if (parsedSections.length === 0) {
      return [
        {
          id: "section-0",
          rawTitle: "Itinerary Overview",
          cleanTitle: "Itinerary Overview",
          icon: "1",
          body: rawText.trim(),
          isDay: false,
        },
      ];
    }

    // Assign sequential day numbers and icons
    let dayCounter = 0;
    return parsedSections.map((sec, idx) => {
      if (sec.isDay) {
        dayCounter += 1;
        return {
          ...sec,
          id: `section-${idx}`,
          icon: String(dayCounter),
          dayNumber: dayCounter,
        };
      }
      return {
        ...sec,
        id: `section-${idx}`,
        icon: "",
      };
    });
  };

  const sections = trip.ai_recommendation ? parseSections(trip.ai_recommendation) : [];

  // Copy raw markdown content to clipboard
  const handleCopy = async () => {
    if (!trip.ai_recommendation) return;
    try {
      await navigator.clipboard.writeText(trip.ai_recommendation);
      setCopied(true);
      toast.success("Itinerary copied to clipboard!", { title: "Copied" });
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy itinerary text to clipboard.");
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
    toast.info("Downloading itinerary Markdown document...", { title: "Export Started" });
  };

  // Trigger browser native print dialog for PDF saving
  const handlePrint = () => {
    window.print();
  };

  // Export structured itinerary to .ics for Google / Apple Calendar
  const handleExportCalendar = () => {
    generateTripIcs(trip);
    toast.success("iCalendar (.ics) downloaded! Open to add to your calendar app.", {
      title: "Calendar Exported",
    });
  };

  // Handle Edit Budget submission with optional AI regeneration
  const handleSaveBudget = async (newBudget: number, alsoRegenerate: boolean) => {
    try {
      setIsUpdatingBudget(true);

      if (alsoRegenerate) {
        setIsEditBudgetOpen(false);
        setIsRegenerating(true);

        const updated = await updateTripBudget(trip.id, newBudget);
        const regenRes = await regenerateTripAi(trip.id);
        const fullyUpdatedTrip: TripResponse = {
          ...updated,
          ai_recommendation: regenRes.recommendation,
        };
        onTripUpdated?.(fullyUpdatedTrip);
        toast.success("Budget updated & AI itinerary regenerated successfully!", {
          title: "Itinerary Updated",
        });
      } else {
        const updated = await updateTripBudget(trip.id, newBudget);
        onTripUpdated?.(updated);
        setIsEditBudgetOpen(false);
        toast.success(`Budget updated to ${formatBudget(newBudget)} successfully!`, {
          title: "Budget Saved",
        });
      }
    } finally {
      setIsUpdatingBudget(false);
      setIsRegenerating(false);
    }
  };

  // Handle direct Regenerate AI Guide submission
  const handleRegenerateAi = async () => {
    if (isRegenerating) return;
    try {
      setIsRegenerating(true);
      const res = await regenerateTripAi(trip.id);
      const updatedTrip: TripResponse = {
        ...trip,
        ai_recommendation: res.recommendation,
      };
      onTripUpdated?.(updatedTrip);
      toast.success("AI Itinerary regenerated successfully!", {
        title: "Regeneration Complete",
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to regenerate AI itinerary.",
        { title: "Regeneration Failed" }
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  // If regeneration is in progress, display the official animated LoadingState component
  if (isRegenerating) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header Card with Action Toolbar */}
      <div className="relative overflow-hidden rounded-2xl border border-card-border bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-blue-950/40 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

        <TripHeader
          trip={trip}
          copied={copied}
          onRegenerateAi={handleRegenerateAi}
          onCopy={handleCopy}
          onDownloadMarkdown={handleDownloadMarkdown}
          onPrint={handlePrint}
          onExportCalendar={handleExportCalendar}
        />

        <TripMetricsGrid
          trip={trip}
          onOpenEditBudget={() => setIsEditBudgetOpen(true)}
        />
      </div>

      {/* Structured Day Tabs & Accordion Markdown Content */}
      <TripDayAccordions sections={sections} />



      {/* Portal-based Edit Budget Modal */}
      <EditBudgetModal
        isOpen={isEditBudgetOpen}
        trip={trip}
        isUpdating={isUpdatingBudget}
        onClose={() => setIsEditBudgetOpen(false)}
        onSave={handleSaveBudget}
      />

      {/* Floating Action Button (FAB): Discuss with AI */}
      <div className="fixed bottom-24 right-4 sm:bottom-8 sm:right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button
          type="button"
          onClick={() => router.push(`/chat?trip_id=${trip.id}`)}
          className="group flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-blue-500/25 border border-blue-400/30 backdrop-blur-md transition-all duration-200 active:scale-95 hover:shadow-2xl hover:shadow-blue-500/40"
          title={`Discuss ${trip.destination} trip with KelanaAI`}
        >
          <div className="relative flex items-center justify-center w-6 h-6 rounded-lg bg-white/20">
            <Bot className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
          </div>
          <span className="tracking-tight">Discuss with AI</span>
        </button>
      </div>
    </div>
  );
}
