"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, MapPin, Calendar, CircleDollarSign, Sparkles, X, Loader2, AlertCircle } from "lucide-react";
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

  // Validate if the AI response follows the Day-by-Day heading structure
  const hasDayHeadings = React.useMemo(() => {
    return (
      /(?:^|\n)##\s+Day\s+\d+/i.test(rawItineraryText) ||
      /(?:^|\n)\*\*(?:Day|Hari)\s+\d+/i.test(rawItineraryText)
    );
  }, [rawItineraryText]);

  const initialDestination =
    defaultDestination && defaultDestination !== "New Conversation"
      ? defaultDestination.replace(/\.\.\.$/, "").trim()
      : "";

  const [destination, setDestination] = useState(initialDestination);
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(1500);
  const [travelStyle, setTravelStyle] = useState(defaultStyle || "Family");
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setDestination(
        defaultDestination && defaultDestination !== "New Conversation"
          ? defaultDestination.replace(/\.\.\.$/, "").trim()
          : ""
      );
      setDays(3);
      setBudget(1500);
      setTravelStyle(defaultStyle || "Family");
    }
  }, [isOpen, defaultDestination, defaultStyle]);

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

      toast.success(`Saved "${createdTrip.destination}" as Official Trip!`, {
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
                  Save as Official Trip
                </Typography>
                <Typography variant="muted" className="text-[11px] text-zinc-400">
                  Confirm the trip details before saving to your Blueprint.
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
            {!hasDayHeadings && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-[11px] text-amber-300">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <span className="font-semibold">Formatting note:</span> This itinerary doesn&apos;t follow the standard Day-by-Day (## Day X) heading format. It will be saved as an overview section in your Blueprint.
                </div>
              </div>
            )}
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
              <div className="font-semibold text-zinc-300 mb-1">Content Preview:</div>
              <p className="line-clamp-2 text-zinc-400 italic">
                &ldquo;{rawItineraryText.slice(0, 140)}...&rdquo;
              </p>
              <p className="mt-1.5 text-[10px] text-zinc-500">
                The itinerary will be stored in your Blueprint exactly as generated in the chat.
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
                    <span>Saving as Official Trip...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-3.5 h-3.5" />
                    <span>Save as Official Trip</span>
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
