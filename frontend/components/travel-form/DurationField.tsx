import { UseFormRegister, UseFormSetValue, FieldError } from "react-hook-form";
import { Calendar } from "lucide-react";
import { TripFormValues } from "@/schemas/tripSchema";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { ScrollableTrack } from "@/components/ui/scrollable-track";

/**
 * COMPONENT: DurationField
 * Duration selector with quick-select trip duration pills up to 14 days.
 */
interface DurationFieldProps {
  register: UseFormRegister<TripFormValues>;
  setValue: UseFormSetValue<TripFormValues>;
  watchedDays: number;
  error?: FieldError;
}

const POPULAR_DURATIONS = [
  { days: 3, label: "3 Days", sub: "Weekend" },
  { days: 5, label: "5 Days", sub: "Standard" },
  { days: 7, label: "7 Days", sub: "1 Week" },
  { days: 10, label: "10 Days", sub: "Extended" },
  { days: 14, label: "14 Days", sub: "Full 2 Wks" },
];

export function DurationField({ register, setValue, watchedDays, error }: DurationFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2 min-w-0">
        <label htmlFor="days" className="flex items-center gap-1.5 cursor-pointer shrink-0">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <Typography as="span" variant="kicker" className="text-zinc-300">
            Duration (Days)
          </Typography>
        </label>
        <Typography variant="muted" className="text-right min-w-0 truncate">
          1 – 14 Days
        </Typography>
      </div>

      <Input
        id="days"
        {...register("days", { valueAsNumber: true })}
        type="number"
        min={1}
        max={14}
        placeholder="e.g. 5"
        error={!!error}
      />
      {error && (
        <Typography variant="caption" className="mt-1 font-medium text-red-400 block">
          {error.message}
        </Typography>
      )}

      {/* Preset Duration Buttons */}
      <div className="mt-2.5">
        <ScrollableTrack className="gap-1.5" fadeWidth="w-8 sm:w-10">
          {POPULAR_DURATIONS.map((dur) => (
            <button
              key={dur.days}
              type="button"
              onClick={() => setValue("days", dur.days, { shouldValidate: true })}
              className={`cursor-pointer shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all active:scale-95 ${
                watchedDays === dur.days
                  ? "border-primary bg-primary/20 text-white shadow-sm ring-1 ring-primary/40"
                  : "border-border bg-secondary/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <span className="font-semibold">{dur.label}</span>
              <span className="text-[10px] opacity-70 ml-1">({dur.sub})</span>
            </button>
          ))}
        </ScrollableTrack>
      </div>
    </div>
  );
}
