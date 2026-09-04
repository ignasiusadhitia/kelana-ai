import { useState } from "react";
import { CircleDollarSign, X } from "lucide-react";
import { TripResponse } from "@/types/trip";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Portal } from "@/components/ui/portal";
import { formatBudget, roundToTwoDecimals } from "@/lib/utils";

/**
 * COMPONENT: EditBudgetModal
 * Modal dialog for adjusting trip budget and optionally triggering AI itinerary regeneration.
 */
interface EditBudgetModalProps {
  isOpen: boolean;
  trip: TripResponse;
  isUpdating: boolean;
  onClose: () => void;
  onSave: (newBudget: number, alsoRegenerate: boolean) => Promise<void>;
}

export function EditBudgetModal({
  isOpen,
  trip,
  isUpdating,
  onClose,
  onSave,
}: EditBudgetModalProps) {
  const [editBudgetValue, setEditBudgetValue] = useState<string>(String(trip.budget));
  const [alsoRegenerateAi, setAlsoRegenerateAi] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const parsedEditBudget = parseFloat(editBudgetValue);
  const calculatedDailyBudget =
    !isNaN(parsedEditBudget) && parsedEditBudget > 0 && trip.days > 0
      ? roundToTwoDecimals(parsedEditBudget / trip.days)
      : 0;

  const getEstimatedCategory = (daily: number) => {
    if (daily < 150) return "Backpacker";
    if (daily <= 350) return "Standard";
    return "Luxury";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawBudget = parseFloat(editBudgetValue);
    if (isNaN(rawBudget) || rawBudget <= 0) {
      setErrorMessage("Please enter a valid positive budget number.");
      return;
    }

    const newBudget = roundToTwoDecimals(rawBudget);
    try {
      setErrorMessage(null);
      await onSave(newBudget, alsoRegenerateAi);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update budget.");
    }
  };

  return (
    <Portal>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget && !isUpdating) {
            onClose();
          }
        }}
        className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/95 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl animate-in zoom-in-95 duration-150">
          {/* Top Ambient Glow */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-blue-500/15 blur-3xl" />
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <CircleDollarSign className="w-5 h-5 text-primary" />
              <Typography variant="h3" className="font-bold text-white">
                Update Trip Budget
              </Typography>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-zinc-800 hover:text-white transition disabled:opacity-50"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Form with noValidate */}
          <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
            <Typography variant="caption" className="text-muted-foreground block">
              Adjusting your total budget will recalculate your daily spending limit and category tier.
            </Typography>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Total Budget (USD)
              </label>
              <Input
                type="number"
                min="1"
                max="1000000"
                step="any"
                value={editBudgetValue}
                onChange={(e) => {
                  setEditBudgetValue(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="e.g. 2500"
                className={errorMessage ? "border-red-500/80 focus-visible:ring-red-500/30" : ""}
                autoFocus
              />
            </div>

            {/* Custom Stylized Glassmorphic Checkbox */}
            <Checkbox
              id="alsoRegenerate"
              checked={alsoRegenerateAi}
              onCheckedChange={setAlsoRegenerateAi}
              label="Regenerate itinerary with new budget allocations"
              description="Updates activities and schedule to match your new spending target."
            />

            {/* Dynamic Live Preview Comparison Box */}
            {parsedEditBudget > 0 && (
              <div className="rounded-xl border border-border bg-zinc-950/70 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Current Budget:</span>
                  <span>
                    {formatBudget(trip.budget)} ({formatBudget(Number(trip.budget) / trip.days)}/day)
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border font-semibold text-emerald-400">
                  <span>New Daily Limit:</span>
                  <span>{formatBudget(calculatedDailyBudget)}/day</span>
                </div>

                <div className="flex items-center justify-between text-zinc-300">
                  <span>Estimated Tier:</span>
                  <Badge
                    variant={
                      getEstimatedCategory(calculatedDailyBudget) === "Backpacker"
                        ? "success"
                        : getEstimatedCategory(calculatedDailyBudget) === "Luxury"
                        ? "warning"
                        : "default"
                    }
                  >
                    {getEstimatedCategory(calculatedDailyBudget)}
                  </Badge>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                {errorMessage}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={isUpdating || !editBudgetValue}
                className="shadow-sm"
              >
                {isUpdating ? "Saving Changes..." : "Save Budget"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
