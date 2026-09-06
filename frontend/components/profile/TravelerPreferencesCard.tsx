"use client";

import { useState } from "react";
import {
  Compass,
  Backpack,
  Users,
  Heart,
  Crown,
  Mountain,
  UtensilsCrossed,
  Flower2,
  Check,
  Save,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { TRAVEL_STYLE_OPTIONS } from "@/constants/trip";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

/**
 * COMPONENT: TravelerPreferencesCard
 * Interactive selector for default travel style preference with auto-fill synchronization.
 */

function renderStyleIcon(iconKey: string, isSelected: boolean) {
  const baseClasses = "w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110";
  switch (iconKey) {
    case "backpack":
      return <Backpack className={`${baseClasses} ${isSelected ? "text-orange-300" : "text-orange-400"}`} />;
    case "compass":
      return <Compass className={`${baseClasses} ${isSelected ? "text-blue-300" : "text-blue-400"}`} />;
    case "users":
      return <Users className={`${baseClasses} ${isSelected ? "text-emerald-300" : "text-emerald-400"}`} />;
    case "heart":
      return <Heart className={`${baseClasses} ${isSelected ? "text-rose-300" : "text-rose-400"}`} />;
    case "crown":
      return <Crown className={`${baseClasses} ${isSelected ? "text-amber-300" : "text-amber-400"}`} />;
    case "mountain":
      return <Mountain className={`${baseClasses} ${isSelected ? "text-teal-300" : "text-teal-400"}`} />;
    case "utensils":
      return <UtensilsCrossed className={`${baseClasses} ${isSelected ? "text-red-300" : "text-red-400"}`} />;
    case "flower2":
      return <Flower2 className={`${baseClasses} ${isSelected ? "text-purple-300" : "text-purple-400"}`} />;
    default:
      return <Compass className={`${baseClasses} ${isSelected ? "text-blue-300" : "text-blue-400"}`} />;
  }
}

/**
 * User profile preferences card allowing travelers to configure and save
 * their default travel style for personalized AI recommendations.
 */
export function TravelerPreferencesCard() {
  const { user, updateProfile } = useAuth();
  const currentDefault = user?.default_travel_style || "Family";
  const [selectedStyle, setSelectedStyle] = useState<string>(currentDefault);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const hasChanges = selectedStyle !== (user?.default_travel_style || "Family");

  const handleSave = async () => {
    setIsSubmitting(true);
    setIsSaved(false);
    try {
      await updateProfile({ default_travel_style: selectedStyle });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save travel preference. Please try again.",
        { title: "Preferences Error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-3xl border border-white/10 bg-card/60 p-6 sm:p-8 backdrop-blur-2xl shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-purple-400" />
            <Typography variant="h3" className="text-xl font-bold text-white tracking-tight">
              Default Travel Style
            </Typography>
          </div>
          <Typography variant="muted" className="text-xs text-zinc-400 mt-1">
            Pre-selected automatically whenever you create a new itinerary on the homepage.
          </Typography>
        </div>

        {/* Current Active Badge */}
        <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          <span>Active Default:</span>
          <span className="text-white font-bold">{user?.default_travel_style || "Family"}</span>
        </div>
      </div>

      {/* Style Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TRAVEL_STYLE_OPTIONS.map((style) => {
          const isSelected = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => setSelectedStyle(style.id)}
              className={`cursor-pointer group flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all active:scale-95 ${
                isSelected
                  ? "border-primary bg-primary/20 text-white shadow-lg ring-1 ring-primary/60 shadow-blue-500/15"
                  : "border-white/5 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-white"
              }`}
            >
              <div className="mb-2">{renderStyleIcon(style.icon, isSelected)}</div>
              <Typography as="span" variant="body" className="font-semibold text-xs text-white">
                {style.label}
              </Typography>
              <Typography as="span" variant="caption" className="text-[10px] text-zinc-400 mt-0.5 leading-tight line-clamp-2 min-h-[22px] flex items-center justify-center">
                {style.description}
              </Typography>
            </button>
          );
        })}
      </div>

      {/* Save Button Bar */}
      <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-white/5">
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSubmitting || !hasChanges}
          variant="default"
          size="sm"
          className="gap-2 px-6 shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 font-semibold text-xs h-10"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Preference Saved!</span>
            </>
          ) : isSubmitting ? (
            <span>Saving Preference...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Default Style</span>
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
