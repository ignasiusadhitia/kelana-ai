import { SlidersHorizontal, Pencil, Backpack, Compass, Users, Heart, Crown, Mountain, UtensilsCrossed, Flower2 } from "lucide-react";
import { UseFormSetValue } from "react-hook-form";
import { TripFormValues } from "@/schemas/tripSchema";
import { TRAVEL_STYLE_OPTIONS } from "@/constants/trip";
import { getTravelStyleIconComponent } from "@/lib/icons";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";

/**
 * COMPONENT: TravelStyleField
 * Persona selector grid supporting curated travel styles and custom text inputs.
 */
interface TravelStyleFieldProps {
  setValue: UseFormSetValue<TripFormValues>;
  watchedStyle: string;
  isCustomStyle: boolean;
  setIsCustomStyle: (val: boolean) => void;
  customStyleText: string;
  setCustomStyleText: (val: string) => void;
}

function renderPresetIcon(iconKey: string, isSelected: boolean) {
  const baseClasses = `w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110`;
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
    case "flower":
      return <Flower2 className={`${baseClasses} ${isSelected ? "text-purple-300" : "text-purple-400"}`} />;
    default:
      return <Compass className={`${baseClasses} ${isSelected ? "text-blue-300" : "text-blue-400"}`} />;
  }
}

/**
 * Form field for selecting travel preferences, supporting curated style tiles
 * (Cultural, Luxury, Adventure, Culinary, Wellness) and freeform custom inputs.
 */
export function TravelStyleField({
  setValue,
  watchedStyle,
  isCustomStyle,
  setIsCustomStyle,
  customStyleText,
  setCustomStyleText,
}: TravelStyleFieldProps) {
  const handleSelectStyle = (styleId: string) => {
    setIsCustomStyle(false);
    setValue("travel_style", styleId, { shouldValidate: true });
  };

  const handleSelectCustom = () => {
    setIsCustomStyle(true);
    if (customStyleText) {
      setValue("travel_style", customStyleText.trim(), { shouldValidate: true });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2.5 min-w-0">
        <label className="flex items-center gap-1.5 shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-purple-400" />
          <Typography as="span" variant="kicker" className="text-zinc-300">
            Travel Style
          </Typography>
        </label>
        <Typography variant="muted" className="text-right min-w-0 truncate">
          Customizes your itinerary
        </Typography>
      </div>

      {/* Travel Style Card Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {TRAVEL_STYLE_OPTIONS.map((style) => {
          const isSelected = !isCustomStyle && watchedStyle === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => handleSelectStyle(style.id)}
              className={`cursor-pointer group flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all active:scale-95 ${
                isSelected
                  ? "border-primary bg-primary/15 text-white shadow-md ring-1 ring-primary/50"
                  : "border-border bg-card/40 text-muted-foreground hover:border-zinc-700 hover:bg-card/70 hover:text-white"
              }`}
            >
              <div className="mb-1.5">{renderPresetIcon(style.icon, isSelected)}</div>
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

      {/* Custom Style Toggle Bar */}
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={handleSelectCustom}
          className={`cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold transition-colors active:scale-95 ${
            isCustomStyle ? "text-primary" : "text-muted-foreground hover:text-white"
          }`}
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>{isCustomStyle ? "Entering custom style..." : "+ Custom travel style..."}</span>
        </button>

        {isCustomStyle && (
          <button
            type="button"
            onClick={() => handleSelectStyle("Solo")}
            className="cursor-pointer text-[11px] text-zinc-400 hover:text-white transition-colors"
          >
            Cancel custom
          </button>
        )}
      </div>

      {/* Custom Style Input Drawer */}
      {isCustomStyle && (
        <div className="mt-3 space-y-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
              {customStyleText.trim() ? (
                getTravelStyleIconComponent(customStyleText, { className: "w-4 h-4 text-blue-400" })
              ) : (
                <Pencil className="w-4 h-4 text-zinc-400" />
              )}
            </span>
            <Input
              type="text"
              placeholder="e.g. Scuba Diving, Road Trip, Photography, Nightlife, Shopping"
              value={customStyleText}
              onChange={(e) => {
                const val = e.target.value;
                setCustomStyleText(val);
                setValue("travel_style", val, { shouldValidate: true });
              }}
              className="pl-10"
              autoFocus
            />
          </div>
          {customStyleText.trim() && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Selected style:</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 font-semibold text-blue-300">
                {getTravelStyleIconComponent(customStyleText, { className: "w-3.5 h-3.5 text-blue-300" })}
                <span>{customStyleText}</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
