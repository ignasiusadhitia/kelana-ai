import { useState } from "react";
import { useForm, useWatch, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripFormSchema, TripFormValues } from "@/schemas/tripSchema";
import { TripRequest } from "@/types/trip";
import { TRAVEL_STYLE_OPTIONS } from "@/constants/trip";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";

/**
 * COMPONENT: TravelForm
 * Interactive trip request form powered by React Hook Form & Zod Schema Validation.
 * Utilizes atomic Input and Typography UI primitives.
 */

interface TravelFormProps {
  onSubmit: (data: TripRequest) => void;
}

// Destination inspiration chips
const POPULAR_DESTINATIONS = [
  { name: "Tokyo, Japan", icon: "🗼" },
  { name: "Seoul, Korea", icon: "🌸" },
  { name: "Bali, Indonesia", icon: "🏝️" },
  { name: "Rome, Italy", icon: "🏛️" },
  { name: "Zurich, Switzerland", icon: "🏔️" },
  { name: "Paris, France", icon: "🥐" },
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
      travel_style: "Family",
    },
  });

  // Isolated field watchers for real-time calculations without triggering full component re-renders
  const watchedBudget = useWatch({ control, name: "budget" });
  const watchedDays = useWatch({ control, name: "days" });
  const watchedStyle = useWatch({ control, name: "travel_style" });
  const watchedDestination = useWatch({ control, name: "destination" });

  const numBudget = Number(watchedBudget);
  const numDays = Number(watchedDays);

  // Real-time daily budget allowance calculation
  const dailyBudgetPreview =
    numBudget > 0 && numDays > 0 ? (numBudget / numDays).toFixed(0) : null;

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
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Destination Field */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="destination"
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <span>📍</span>
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

        {/* Quick Destination Chips */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <Typography variant="muted" className="mr-1">Popular:</Typography>
          {POPULAR_DESTINATIONS.map((dest) => (
            <button
              key={dest.name}
              type="button"
              onClick={() => setValue("destination", dest.name, { shouldValidate: true })}
              className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-border bg-secondary px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white active:scale-95"
            >
              <span>{dest.icon}</span>
              <span>{dest.name.split(",")[0]}</span>
            </button>
          ))}
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
              <span>💵</span>
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
              <span>⏱️</span>
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

          {/* Quick Duration Presets */}
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

      {/* Smart Long-Trip Advice Suggestion Banner */}
      {numDays >= 10 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-zinc-900/70 to-amber-950/30 p-4 text-xs text-amber-200 shadow-md backdrop-blur-md">
          <span className="text-xl shrink-0">💡</span>
          <div>
            <Typography variant="kicker" className="text-amber-300 block mb-1">
              Curator Tip for Extended Journeys ({numDays} Days):
            </Typography>
            <Typography variant="caption" className="text-zinc-300 leading-relaxed block">
              Planning a trip across multiple regions? For the deepest dining and transit accuracy, consider crafting separate guides for each city (e.g. <strong>{watchedDestination ? watchedDestination.split(",")[0] : "City A"} for 7 days</strong>, then <strong>Neighboring Region for 7 days</strong>).
            </Typography>
          </div>
        </div>
      )}

      {/* Real-time Dynamic Budget Calculation Box */}
      {dailyBudgetPreview && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-emerald-950/40 p-3.5 text-xs text-emerald-300 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-base">⚡</span>
            <Typography variant="caption" className="text-emerald-300">
              Calculated Budget Allowance:{" "}
              <strong className="text-white font-bold">
                ~${Number(dailyBudgetPreview).toLocaleString()} / day
              </strong>
            </Typography>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
            AUTO-OPTIMIZED
          </span>
        </div>
      )}

      {/* Travel Style Selector */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span>🎭</span>
            <Typography as="span" variant="kicker" className="text-zinc-300">
              Travel Persona / Style
            </Typography>
          </label>
          <Typography variant="muted">Select your preferred vibe</Typography>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {TRAVEL_STYLE_OPTIONS.map((style) => {
            const isSelected = !isCustomStyle && watchedStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => handleSelectStyle(style.id)}
                className={`cursor-pointer group flex flex-col items-start rounded-xl border p-3.5 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-gradient-to-br from-blue-950/80 to-indigo-950/60 text-white shadow-lg shadow-blue-500/10 ring-2 ring-primary/40"
                    : "border-border bg-secondary/70 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg transition-transform group-hover:scale-110">
                    {style.icon}
                  </span>
                  <Typography as="span" variant="kicker" className="text-white tracking-normal font-bold">
                    {style.label}
                  </Typography>
                </div>
                {style.description && (
                  <Typography
                    variant="muted"
                    className={`mt-1 ${
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
            className={`cursor-pointer group flex flex-col items-start rounded-xl border p-3.5 text-left transition-all ${
              isCustomStyle
                ? "border-primary bg-gradient-to-br from-blue-950/80 to-indigo-950/60 text-white shadow-lg shadow-blue-500/10 ring-2 ring-primary/40"
                : "border-border bg-secondary/70 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg transition-transform group-hover:scale-110">
                ✏️
              </span>
              <Typography as="span" variant="kicker" className="text-white tracking-normal font-bold">
                Custom...
              </Typography>
            </div>
            <Typography
              variant="muted"
              className={`mt-1 ${
                isCustomStyle ? "text-blue-300 font-medium" : "text-zinc-400"
              }`}
            >
              Type your own style
            </Typography>
          </button>
        </div>

        {/* Custom Style Text Input */}
        {isCustomStyle && (
          <div className="mt-3">
            <Input
              type="text"
              placeholder="e.g. Culinary Street Tour, Remote Workation, Road Trip"
              value={customStyleText}
              onChange={(e) => {
                const val = e.target.value;
                setCustomStyleText(val);
                setValue("travel_style", val, { shouldValidate: true });
              }}
            />
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
            <span className="text-base">✨</span>
            <Typography as="span" variant="h4" className="text-white tracking-wide">
              Craft Bespoke Travel Itinerary
            </Typography>
          </div>
        </button>
      </div>
    </form>
  );
}
