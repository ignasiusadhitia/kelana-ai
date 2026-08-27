import { MapPin } from "lucide-react";
import { TripSummaryInfo } from "@/types/trip";
import { Typography } from "@/components/ui/typography";
import { formatBudget } from "@/lib/utils";

/**
 * COMPONENT: SummaryBar
 * Compact summary banner displaying the destination and budget parameters during loading/error states.
 * Utilizes semantic design tokens (--card, --card-border, --radius) and Lucide icons.
 */

interface SummaryBarProps {
  summaryInfo: TripSummaryInfo;
}

export function SummaryBar({ summaryInfo }: SummaryBarProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-card-border bg-card p-4 shadow-lg backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-lg">
          <MapPin className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <Typography variant="kicker" className="block text-muted-foreground text-[10px]">
            Target Destination
          </Typography>
          <Typography variant="h4" className="text-foreground">
            {summaryInfo.destination}
          </Typography>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <Typography variant="kicker" className="block text-muted-foreground text-[10px]">
            Planned Budget
          </Typography>
          <span className="text-sm font-extrabold text-emerald-400">
            {formatBudget(summaryInfo.budget)}
          </span>
        </div>
      </div>
    </div>
  );
}
