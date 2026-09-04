"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, MapPin, Calendar, CircleDollarSign, Sparkles, X, Loader2 } from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { createTripService } from "@/services/tripService";
import { TRAVEL_STYLE_OPTIONS } from "@/constants/trip";
import { getTravelStyleIconComponent } from "@/lib/icons";
import { TripResponse } from "@/types/trip";

/**
 * COMPONENT: SaveChatTripModal
 * Modal dialog enabling travelers to save AI chat recommendations into persistent trip records.
 */
interface SaveChatTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawItineraryText: string;
  defaultDestination?: string;
  defaultStyle?: string;
  onSaved?: (trip: TripResponse) => void;
}

export function SaveChatTripModal({
  isOpen,
  onClose,
  rawItineraryText,
  defaultDestination = "",
  defaultStyle = "Family",
  onSaved,
}: SaveChatTripModalProps) {
  const router = useRouter();

  // Try to detect travel style from itinerary text or defaultStyle
  const detectedStyle = React.useMemo(() => {
    const lower = rawItineraryText.toLowerCase();
    for (const opt of TRAVEL_STYLE_OPTIONS) {
      if (lower.includes(opt.id.toLowerCase())) {
        return opt.id;
      }
    }
    return defaultStyle || "Family";
  }, [rawItineraryText, defaultStyle]);

  // Try to parse days from ## Day X or Hari X or "X hari" / "X days"
  const detectedDays = React.useMemo(() => {
    // Check for "Day X" or "Hari X" (e.g. "Day 1", "Hari 1", "## Hari 1", "**Hari 1:")
    const matches = rawItineraryText.match(/(?:##\s+|###\s+|####\s+)?(?:\*\*)?(?:Day|Hari)\s+(\d+)/gi);
    if (matches && matches.length > 0) {
      const nums = matches
        .map((m) => {
          const n = m.replace(/[^0-9]/g, "");
          return n ? parseInt(n, 10) : 1;
        })
        .filter((n) => !isNaN(n));
      if (nums.length > 0) return Math.min(Math.max(...nums), 14);
    }

    // Check for "5 hari" or "5 days" in text (e.g. "Durasi: 5 hari 4 malam")
    const durationMatch = rawItineraryText.match(/(\d+)\s*(?:hari|days)/i);
    if (durationMatch) {
      const parsed = parseInt(durationMatch[1], 10);
      if (!isNaN(parsed) && parsed >= 1) return Math.min(parsed, 14);
    }

    return 3;
  }, [rawItineraryText]);

  // Clean default destination name
  const cleanedDestination = React.useMemo(() => {
    // Check if itinerary explicitly specifies destination field like "Tujuan Liburan: (Misal: Pantai Kuta, Bali)" or "Destinasi: Bali"
    const destFieldMatch = rawItineraryText.match(
      /(?:Tujuan(?: Liburan)?|Destinasi|Destination)\s*[:*-]+\s*(?:\([^)]*\)\s*)?([A-Za-z0-9\s,]+)/i
    );
    if (destFieldMatch && destFieldMatch[1].trim()) {
      const cleaned = destFieldMatch[1]
        .replace(/^(?:Misal|Contoh|e\.g\.)[:\s]*/i, "")
        .replace(/[)\].]+$/, "")
        .split("\n")[0]
        .trim();
      if (cleaned.length >= 2) return cleaned;
    }

    if (!defaultDestination || defaultDestination === "New Conversation") {
      // Try to extract first capitalized place
      const firstFewLines = rawItineraryText.split("\n").slice(0, 3).join(" ");
      const match = firstFewLines.match(/(?:to|in|ke|di)\s+([A-Z][a-zA-Z\s,]+?)(?:[.!,\n]|$)/);
      return match ? match[1].trim() : "Custom Destination";
    }
    return defaultDestination.replace(/\.\.\.$/, "").trim();
  }, [defaultDestination, rawItineraryText]);

  // Try to estimate budget from text (USD or IDR)
  const detectedBudget = React.useMemo(() => {
    const usdMatch = rawItineraryText.match(/(?:USD|\$)\s*([0-9,.]+)/i);
    if (usdMatch) {
      const val = parseFloat(usdMatch[1].replace(/,/g, ""));
      if (!isNaN(val) && val >= 50) return Math.min(Math.round(val), 100000);
    }
    const idrMatch = rawItineraryText.match(/(?:Rp|IDR)\.?\s*([0-9.,]+)/i);
    if (idrMatch) {
      const rawNum = idrMatch[1].replace(/\./g, "").replace(/,/g, ".");
      const idrVal = parseFloat(rawNum);
      if (!isNaN(idrVal) && idrVal > 100000) {
        return Math.min(Math.max(Math.round(idrVal / 16000), 50), 100000);
      }
    }
    return 1500;
  }, [rawItineraryText]);

  const [destination, setDestination] = useState(cleanedDestination);
  const [days, setDays] = useState(detectedDays);
  const [budget, setBudget] = useState(detectedBudget);
  const [travelStyle, setTravelStyle] = useState(detectedStyle);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setDestination(cleanedDestination);
      setDays(detectedDays);
      setBudget(detectedBudget);
      setTravelStyle(detectedStyle);
    }
  }, [isOpen, cleanedDestination, detectedDays, detectedBudget, detectedStyle]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      toast.error("Please specify a destination.");
      return;
    }

    try {
      setIsSaving(true);
      const createdTrip = await createTripService({
        destination: destination.trim(),
        days: Number(days),
        budget: Number(budget),
        travel_style: travelStyle,
        ai_recommendation: rawItineraryText,
      });

      toast.success(`Saved "${createdTrip.destination}" to My Trips!`, {
        title: "Trip Saved",
      });

      if (onSaved) {
        onSaved(createdTrip);
      }

      onClose();
      router.push(`/trips?highlight=${createdTrip.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save itinerary to My Trips.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-trip-title"
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200 select-none"
      >
        <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/95 p-6 shadow-2xl shadow-black ring-1 ring-white/10 backdrop-blur-2xl animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <Typography id="save-trip-title" variant="h4" className="text-sm font-bold text-white">
                  Save Itinerary to My Trips
                </Typography>
                <Typography variant="muted" className="text-[11px] text-zinc-400">
                  Store this AI itinerary in your dashboard.
                </Typography>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="mt-4 space-y-3.5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 mb-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Destination</span>
              </label>
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Kyoto, Japan"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  <span>Duration (Days)</span>
                </label>
                <Input
                  type="number"
                  min={1}
                  max={14}
                  value={days}
                  onChange={(e) => setDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="h-9 text-xs"
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 mb-1">
                  <CircleDollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>Budget (USD)</span>
                </label>
                <Input
                  type="number"
                  min={50}
                  max={100000}
                  value={budget}
                  onChange={(e) => setBudget(Math.max(50, parseInt(e.target.value, 10) || 50))}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Travel Style</span>
                </label>
                <span className="text-[11px] text-zinc-400">
                  Selected: <span className="text-white font-semibold">{travelStyle}</span>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {TRAVEL_STYLE_OPTIONS.map((style) => {
                  const isSelected = travelStyle.toLowerCase() === style.id.toLowerCase();
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setTravelStyle(style.id)}
                      className={`cursor-pointer flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border text-[11px] font-medium transition-all active:scale-95 ${
                        isSelected
                          ? "border-primary bg-primary/20 text-white shadow-sm ring-1 ring-primary/50"
                          : "border-white/5 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white"
                      }`}
                    >
                      {getTravelStyleIconComponent(style.id, {
                        className: `w-3.5 h-3.5 shrink-0 ${isSelected ? "text-blue-300" : "text-zinc-400"}`,
                      })}
                      <span className="whitespace-nowrap">{style.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Snippet Preview */}
            <div className="rounded-xl border border-white/5 bg-zinc-900/60 p-2.5 text-[11px] text-zinc-400">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-zinc-300">Content Preview:</span>
                <span className="text-[10px] text-emerald-400/90 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Disimpan langsung (tanpa regenerate AI)
                </span>
              </div>
              <p className="line-clamp-2 text-zinc-400 italic">
                &ldquo;{rawItineraryText.slice(0, 140)}...&rdquo;
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSaving}
                className="h-8 px-3 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isSaving}
                className="h-8 px-4 text-xs font-semibold gap-1.5"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Trip...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-3.5 h-3.5" />
                    <span>Save to My Trips</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
