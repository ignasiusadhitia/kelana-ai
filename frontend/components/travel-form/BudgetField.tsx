import { UseFormRegister, UseFormSetValue, FieldError } from "react-hook-form";
import { CircleDollarSign } from "lucide-react";
import { TripFormValues } from "@/schemas/tripSchema";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { ScrollableTrack } from "@/components/ui/scrollable-track";

/**
 * COMPONENT: BudgetField
 * Budget input field with quick-select currency preset pills.
 */
interface BudgetFieldProps {
  register: UseFormRegister<TripFormValues>;
  setValue: UseFormSetValue<TripFormValues>;
  watchedBudget: number;
  error?: FieldError;
}

const POPULAR_BUDGETS = [
  { amount: 800, label: "$800", sub: "Budget" },
  { amount: 2000, label: "$2,000", sub: "Popular" },
  { amount: 4500, label: "$4,500", sub: "Comfort" },
  { amount: 8000, label: "$8,000", sub: "Luxury" },
];

/**
 * Form field for total trip budget in USD, providing rapid preset buttons
 * from backpacker budgets ($800) to luxury tiers ($8,000).
 */
export function BudgetField({ register, setValue, watchedBudget, error }: BudgetFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2 min-w-0">
        <label htmlFor="budget" className="flex items-center gap-1.5 cursor-pointer shrink-0">
          <CircleDollarSign className="w-4 h-4 text-amber-400" />
          <Typography as="span" variant="kicker" className="text-zinc-300">
            Total Budget (USD)
          </Typography>
        </label>
        <Typography variant="muted" className="text-right min-w-0 truncate">
          e.g. 2000
        </Typography>
      </div>

      <Input
        id="budget"
        {...register("budget", { valueAsNumber: true })}
        type="number"
        min={1}
        max={1000000}
        step="any"
        placeholder="e.g. 2000"
        error={!!error}
      />
      {error && (
        <Typography variant="caption" className="mt-1 font-medium text-red-400 block">
          {error.message}
        </Typography>
      )}

      {/* Preset Budget Buttons */}
      <div className="mt-2.5">
        <ScrollableTrack className="gap-1.5" fadeWidth="w-8 sm:w-10">
          {POPULAR_BUDGETS.map((bg) => (
            <button
              key={bg.amount}
              type="button"
              onClick={() => setValue("budget", bg.amount, { shouldValidate: true })}
              className={`cursor-pointer shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all active:scale-95 ${
                watchedBudget === bg.amount
                  ? "border-primary bg-primary/20 text-white shadow-sm ring-1 ring-primary/40"
                  : "border-border bg-secondary/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <span className="font-semibold">{bg.label}</span>
              <span className="text-[10px] opacity-70 ml-1">({bg.sub})</span>
            </button>
          ))}
        </ScrollableTrack>
      </div>
    </div>
  );
}
