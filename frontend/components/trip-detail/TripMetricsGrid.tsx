import { Calendar, Wallet, Zap, Tag, Pencil } from "lucide-react";
import { TripResponse } from "@/types/trip";
import { Typography } from "@/components/ui/typography";
import { formatBudget } from "@/lib/utils";
import { getTravelStyleIconComponent } from "@/lib/icons";

interface TripMetricsGridProps {
  trip: TripResponse;
  onOpenEditBudget: () => void;
}

export function TripMetricsGrid({ trip, onOpenEditBudget }: TripMetricsGridProps) {
  return (
    <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-5">
      {/* Duration */}
      <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-3 sm:p-3.5 backdrop-blur-md">
        <Typography variant="kicker" className="block text-[10px] sm:text-xs text-zinc-400">
          Duration
        </Typography>
        <Typography variant="h4" className="mt-0.5 flex items-center gap-1.5 text-sm sm:text-base text-white font-extrabold">
          <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{trip.days} Days</span>
        </Typography>
      </div>

      {/* Total Budget Card with Interactive Edit Trigger */}
      <div className="group/budget relative rounded-xl border border-white/5 bg-zinc-950/60 p-3 sm:p-3.5 backdrop-blur-md transition-all hover:border-primary/40">
        <div className="flex items-center justify-between">
          <Typography variant="kicker" className="block text-[10px] sm:text-xs text-zinc-400">
            Total Budget
          </Typography>
          <button
            type="button"
            onClick={onOpenEditBudget}
            className="cursor-pointer inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-primary hover:text-blue-400 transition active:scale-95"
          >
            <Pencil className="w-2.5 h-2.5" />
            <span>Edit</span>
          </button>
        </div>
        <Typography variant="h4" className="mt-0.5 flex items-center gap-1.5 text-sm sm:text-base text-white font-extrabold">
          <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{formatBudget(trip.budget)}</span>
        </Typography>
      </div>

      {/* Daily Limit */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-3 sm:p-3.5 backdrop-blur-md">
        <Typography variant="kicker" className="block text-[10px] sm:text-xs text-emerald-300">
          Daily Limit
        </Typography>
        <Typography variant="h4" className="mt-0.5 flex items-center gap-1.5 text-sm sm:text-base text-emerald-400 font-extrabold truncate">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="truncate">
            {trip.daily_budget ? formatBudget(trip.daily_budget) : formatBudget(Number(trip.budget) / trip.days)}/day
          </span>
        </Typography>
      </div>

      {/* Category Tier */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-950/30 p-3 sm:p-3.5 backdrop-blur-md">
        <Typography variant="kicker" className="block text-[10px] sm:text-xs text-blue-300">
          Category Tier
        </Typography>
        <Typography variant="h4" className="mt-0.5 flex items-center gap-1.5 text-sm sm:text-base text-blue-300 font-extrabold truncate">
          <Tag className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="truncate">{trip.category}</span>
        </Typography>
      </div>

      {/* Travel Style */}
      <div className="col-span-2 sm:col-span-1 rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-3 sm:p-3.5 backdrop-blur-md">
        <Typography variant="kicker" className="block text-[10px] sm:text-xs text-indigo-300">
          Travel Style
        </Typography>
        <Typography variant="h4" className="mt-0.5 flex items-center gap-1.5 text-sm sm:text-base text-indigo-300 font-extrabold truncate">
          {getTravelStyleIconComponent(trip.travel_style, { className: "w-4 h-4 text-indigo-300 shrink-0" })}
          <span className="truncate">{trip.travel_style || "Solo"}</span>
        </Typography>
      </div>
    </div>
  );
}
