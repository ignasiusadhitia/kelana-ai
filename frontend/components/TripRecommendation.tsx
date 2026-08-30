"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, Printer } from "lucide-react";
import { TripResponse } from "@/types/trip";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { updateTripBudget, regenerateTripAi } from "@/services/tripService";
import { toast } from "@/components/ui/toast";
import { formatBudget } from "@/lib/utils";
import { TripHeader } from "./trip-detail/TripHeader";
import { TripMetricsGrid } from "./trip-detail/TripMetricsGrid";
import { TripDayAccordions, SectionItem } from "./trip-detail/TripDayAccordions";
import { EditBudgetModal } from "./trip-detail/EditBudgetModal";

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
  onReset: () => void;
  onTripUpdated?: (updatedTrip: TripResponse) => void;
}

// Helper to strip leading emoji and markdown artifacts (**bold**, *italic*, `code`, # headings) from title strings
function cleanTitleText(text: string): string {
  if (!text) return "";
  return text
    .replace(/^#+\s*/, "")
    .replace(/^[\p{Emoji}\p{Extended_Pictographic}\s:-]+/u, "")
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

export function TripRecommendation({
  trip,
  onReset,
  onTripUpdated,
}: TripRecommendationProps) {
  const [copied, setCopied] = useState(false);
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);
  const [isUpdatingBudget, setIsUpdatingBudget] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Parses markdown sections by top-level "## " headings for tabbed/accordion view
  const parseSections = (rawText: string): SectionItem[] => {
    const sectionDelimiter = /(?:^|\n)(?=##\s+)/g;
    const rawParts = rawText.split(sectionDelimiter).filter((s) => s.trim().length > 0);

    if (rawParts.length <= 1) {
      return [
        {
          id: "section-0",
          rawTitle: "Itinerary Overview",
          cleanTitle: "Itinerary Overview",
          icon: "1",
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

      const cleanTitle = cleanTitleText(rawTitle) || rawTitle;

      return {
        id: `section-${idx}`,
        rawTitle,
        cleanTitle,
        icon: isDay ? String(dayCounter) : "",
        body,
        isDay,
        dayNumber: isDay ? dayCounter : undefined,
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
        />

        <TripMetricsGrid
          trip={trip}
          onOpenEditBudget={() => setIsEditBudgetOpen(true)}
        />
      </div>

      {/* Structured Day Tabs & Accordion Markdown Content */}
      <TripDayAccordions sections={sections} />

      {/* Bottom Action CTA */}
      <div className="pt-4 border-t border-card-border flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          size="lg"
          onClick={onReset}
          className="flex-1 py-4 text-sm gap-2 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>Plan Another Journey</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleRegenerateAi}
          className="px-6 py-4 text-sm gap-2 active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Regenerate Itinerary</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={handlePrint}
          className="px-6 py-4 text-sm gap-2 active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Print Itinerary</span>
        </Button>
      </div>

      {/* Portal-based Edit Budget Modal */}
      <EditBudgetModal
        isOpen={isEditBudgetOpen}
        trip={trip}
        isUpdating={isUpdatingBudget}
        onClose={() => setIsEditBudgetOpen(false)}
        onSave={handleSaveBudget}
      />
    </div>
  );
}
