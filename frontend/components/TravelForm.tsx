import { useState } from "react";
import { useForm, useWatch, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MapPin,
  CircleDollarSign,
  Calendar,
  SlidersHorizontal,
  Sparkles,
  Pencil,
  Backpack,
  Compass,
  Users,
  Heart,
  Crown,
  Mountain,
  UtensilsCrossed,
  Flower2,
} from "lucide-react";
import { ScrollableTrack } from "@/components/ui/scrollable-track";
import { tripFormSchema, TripFormValues } from "@/schemas/tripSchema";
import { TripRequest } from "@/types/trip";
import { TRAVEL_STYLE_OPTIONS } from "@/constants/trip";
import { getTravelStyleIconComponent } from "@/lib/icons";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";

/**
 * COMPONENT: TravelForm
 * Interactive trip request form powered by React Hook Form & Zod Schema Validation.
 * Utilizes atomic Input and Typography UI primitives, and 100% vector Lucide icons.
 */

interface TravelFormProps {
  onSubmit: (data: TripRequest) => void;
}

// Destination inspiration chips
const POPULAR_DESTINATIONS = [
  { name: "Tokyo, Japan" },
  { name: "Seoul, Korea" },
  { name: "Bali, Indonesia" },
  { name: "Rome, Italy" },
  { name: "Zurich, Switzerland" },
  { name: "Paris, France" },
];

// Curated duration presets strictly adhering to the 1-14 days limit
const POPULAR_DURATIONS = [
  { days: 3, label: "3 Days", sub: "Weekend" },
  { days: 5, label: "5 Days", sub: "Standard" },
  { days: 7, label: "7 Days", sub: "1 Week" },
  { days: 10, label: "10 Days", sub: "Extended" },
  { days: 14, label: "14 Days", sub: "Full 2 Wks" },
];

// Budget presets for instant selection
const POPULAR_BUDGETS = [
  { amount: 800, label: "$800", sub: "Budget" },
  { amount: 2000, label: "$2,000", sub: "Popular" },
  { amount: 4500, label: "$4,500", sub: "Comfort" },
  { amount: 8000, label: "$8,000", sub: "Luxury" },
];

function renderPresetIcon(iconKey: string, isSelected: boolean) {
  const baseClasses = `w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110`;
  switch (iconKey) {
    case "backpack":
      return <Backpack className={`${baseClasses} ${isSelected ? "text-orange-300" : "text-orange-400"}`} />;
    case "compass":
      return <Compass className={`${baseClasses} ${isSelected ? "text-blue-300" : "text-blue-400"}`} />;
    case "users":
      return <Users className={`${baseClasses} ${isSelected ? "text-teal-300" : "text-teal-400"}`} />;
    case "heart":
      return <Heart className={`${baseClasses} ${isSelected ? "text-rose-300" : "text-rose-400"}`} />;
    case "crown":
      return <Crown className={`${baseClasses} ${isSelected ? "text-amber-300" : "text-amber-400"}`} />;
    case "mountain":
      return <Mountain className={`${baseClasses} ${isSelected ? "text-emerald-300" : "text-emerald-400"}`} />;
    case "utensils":
      return <UtensilsCrossed className={`${baseClasses} ${isSelected ? "text-amber-300" : "text-amber-500"}`} />;
    case "flower2":
      return <Flower2 className={`${baseClasses} ${isSelected ? "text-indigo-300" : "text-indigo-400"}`} />;
    default:
      return <Compass className={`${baseClasses} ${isSelected ? "text-blue-300" : "text-blue-400"}`} />;
  }
}

export function TravelForm({ onSubmit }: TravelFormProps) {
  const [isCustomStyle, setIsCustomStyle] = useState(false);
  const [customStyleText, setCustomStyleText] = useState("");

  // PATTERN: Uncontrolled form inputs with schema resolver for high performance
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      destination: "",
      budget: 2000,
      days: 5,
      travel_style: "Family",
    },
    mode: "onTouched",
  });

  // Isolated watchers to avoid re-rendering entire component on every keystroke
  const watchedDays = useWatch({ control, name: "days" });
  const watchedBudget = useWatch({ control, name: "budget" });
  const watchedStyle = useWatch({ control, name: "travel_style" });

  const onFormSubmit: SubmitHandler<TripFormValues> = (values) => {
    const finalStyle = isCustomStyle ? customStyleText.trim() : values.travel_style;
    if (isCustomStyle && !finalStyle) {
      return;
    }

    onSubmit({
      destination: values.destination.trim(),
      budget: Number(values.budget),
      days: Number(values.days),
      travel_style: finalStyle,
    });
  };

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
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 sm:space-y-6">
      {/* Destination Field */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="destination"
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-blue-400" />
            <Typography as="span" variant="kicker" className="text-zinc-300">
              Destination
            </Typography>
          </label>
          <Typography variant="muted">Where do you want to go?</Typography>
        </div>

        <Input
          id="destination"
          {...register("destination")}
          type="text"
          placeholder="e.g. Tokyo, Japan or Seoul, Korea"
          error={!!errors.destination}
        />
        {errors.destination && (
          <Typography variant="caption" className="mt-1 font-medium text-red-400 block">
            {errors.destination.message}
          </Typography>
        )}

        {/* Quick Destination Inspiration Chips with Automatic Flanking Scroll Chevrons */}
        <div className="mt-2.5 flex items-center gap-2">
          <Typography variant="muted" className="text-xs font-semibold text-zinc-400 shrink-0">
            Popular:
          </Typography>

          <div className="flex-1 min-w-0">
            <ScrollableTrack className="gap-1.5" fadeWidth="w-8 sm:w-10">
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => setValue("destination", dest.name, { shouldValidate: true })}
                  className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-secondary/80 hover:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-primary/50 hover:text-white active:scale-95"
                >
                  <MapPin className="w-3 h-3 text-blue-400" />
                  <span>{dest.name.split(",")[0]}</span>
                </button>
              ))}
            </ScrollableTrack>
          </div>
        </div>
      </div>

      {/* Budget & Days Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Budget Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="budget"
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <CircleDollarSign className="w-4 h-4 text-emerald-400" />
              <Typography as="span" variant="kicker" className="text-zinc-300">
                Total Budget (USD)
              </Typography>
            </label>
          </div>

          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-semibold text-zinc-500">
              $
            </span>
            <Input
              id="budget"
              {...register("budget", { valueAsNumber: true })}
              type="number"
              min="1"
              placeholder="2000"
              error={!!errors.budget}
              className="pl-8"
            />
          </div>
          {errors.budget && (
            <Typography variant="caption" className="mt-1 font-medium text-red-400 block">
              {errors.budget.message}
            </Typography>
          )}

          {/* Quick Budget Presets */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {POPULAR_BUDGETS.map((b) => (
              <button
                key={b.amount}
                type="button"
                onClick={() => setValue("budget", b.amount, { shouldValidate: true })}
                className={`cursor-pointer rounded-lg border px-2 py-0.5 text-[11px] font-medium transition ${
                  Number(watchedBudget) === b.amount
                    ? "border-blue-500/50 bg-blue-500/20 text-blue-300"
                    : "border-border bg-secondary text-zinc-300 hover:border-zinc-700 hover:text-white"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="days"
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-indigo-400" />
              <Typography as="span" variant="kicker" className="text-zinc-300">
                Duration (Days)
              </Typography>
            </label>
            <Typography variant="muted">1 – 14 Days Max</Typography>
          </div>

          <Input
            id="days"
            {...register("days", { valueAsNumber: true })}
            type="number"
            min="1"
            max="14"
            placeholder="5"
            error={!!errors.days}
          />
          {errors.days && (
            <Typography variant="caption" className="mt-1 font-medium text-red-400 block">
              {errors.days.message}
            </Typography>
          )}

          {/* Quick Duration Preset Pills */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {POPULAR_DURATIONS.map((d) => (
              <button
                key={d.days}
                type="button"
                onClick={() => setValue("days", d.days, { shouldValidate: true })}
                className={`cursor-pointer rounded-lg border px-2 py-0.5 text-[11px] font-medium transition ${
                  Number(watchedDays) === d.days
                    ? "border-blue-500/50 bg-blue-500/20 text-blue-300"
                    : "border-border bg-secondary text-zinc-300 hover:border-zinc-700 hover:text-white"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Travel Style Selector */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <SlidersHorizontal className="w-4 h-4 text-violet-400" />
            <Typography as="span" variant="kicker" className="text-zinc-300">
              Travel Persona / Style
            </Typography>
          </label>
          <Typography variant="muted">Select your preferred vibe</Typography>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3">
          {TRAVEL_STYLE_OPTIONS.map((style) => {
            const isSelected = !isCustomStyle && watchedStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => handleSelectStyle(style.id)}
                className={`cursor-pointer group flex flex-col justify-between rounded-xl border p-3 sm:p-3.5 text-left transition-all active:scale-[0.97] ${
                  isSelected
                    ? "border-primary bg-gradient-to-br from-blue-950/80 to-indigo-950/60 text-white shadow-lg shadow-blue-500/10 ring-2 ring-primary/40"
                    : "border-border bg-secondary/70 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  {renderPresetIcon(style.icon, isSelected)}
                  <Typography as="span" variant="kicker" className="text-white text-[11px] sm:text-xs tracking-normal font-bold truncate">
                    {style.label}
                  </Typography>
                </div>
                {style.description && (
                  <Typography
                    variant="muted"
                    className={`mt-1 text-[10px] sm:text-xs line-clamp-1 sm:line-clamp-none ${
                      isSelected ? "text-blue-300 font-medium" : "text-zinc-400"
                    }`}
                  >
                    {style.description}
                  </Typography>
                )}
              </button>
            );
          })}

          {/* Custom Style Pill */}
          <button
            type="button"
            onClick={handleSelectCustom}
            className={`cursor-pointer group flex flex-col justify-between rounded-xl border p-3 sm:p-3.5 text-left transition-all active:scale-[0.97] ${
              isCustomStyle
                ? "border-primary bg-gradient-to-br from-blue-950/80 to-indigo-950/60 text-white shadow-lg shadow-blue-500/10 ring-2 ring-primary/40"
                : "border-border bg-secondary/70 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              {customStyleText.trim() ? (
                getTravelStyleIconComponent(customStyleText, { className: "w-4 h-4 sm:w-5 sm:h-5 text-blue-400 group-hover:scale-110 transition-transform" })
              ) : (
                <Pencil className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              )}
              <Typography as="span" variant="kicker" className="text-white text-[11px] sm:text-xs tracking-normal font-bold truncate max-w-[100px] sm:max-w-[120px]">
                {customStyleText.trim() ? customStyleText : "Custom..."}
              </Typography>
            </div>
            <Typography
              variant="muted"
              className={`mt-1 text-[10px] sm:text-xs line-clamp-1 sm:line-clamp-none ${
                isCustomStyle ? "text-blue-300 font-medium" : "text-zinc-400"
              }`}
            >
              {customStyleText.trim() ? "Active Vibe" : "Type your own style"}
            </Typography>
          </button>
        </div>

        {/* Custom Style Text Input with live detected Lucide fallback icon and preview */}
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
                <span>Matched visual vibe:</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 font-semibold text-blue-300">
                  {getTravelStyleIconComponent(customStyleText, { className: "w-3.5 h-3.5 text-blue-300" })}
                  <span>{customStyleText}</span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit CTA Button */}
      <div className="pt-3">
        <button
          type="submit"
          className="cursor-pointer relative group w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 p-px font-semibold text-white shadow-xl shadow-blue-600/20 transition-all hover:shadow-blue-600/30 hover:scale-[1.005] active:scale-[0.99]"
        >
          <div className="flex items-center justify-center gap-2 rounded-[11px] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 px-6 py-4 transition-all group-hover:bg-opacity-90">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <Typography as="span" variant="h4" className="text-white tracking-wide">
              Generate Itinerary
            </Typography>
          </div>
        </button>
      </div>
    </form>
  );
}
