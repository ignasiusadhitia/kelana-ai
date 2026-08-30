import { RefreshCw, Copy, Check, Download, Printer } from "lucide-react";
import { TripResponse } from "@/types/trip";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBudget } from "@/lib/utils";
import { getTravelStyleIconComponent } from "@/lib/icons";

interface TripHeaderProps {
  trip: TripResponse;
  copied: boolean;
  onRegenerateAi: () => void;
  onCopy: () => void;
  onDownloadMarkdown: () => void;
  onPrint: () => void;
}

export function TripHeader({
  trip,
  copied,
  onRegenerateAi,
  onCopy,
  onDownloadMarkdown,
  onPrint,
}: TripHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
      {/* Title & Metadata (Clean spacing & no cramped multi-line pill wrappers) */}
      <div className="space-y-1.5">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <Badge
            variant="secondary"
            className="normal-case text-xs font-semibold px-3 py-1 inline-flex items-center gap-1.5 whitespace-nowrap bg-blue-500/10 border-blue-500/20 text-blue-300"
          >
            {getTravelStyleIconComponent(trip.travel_style, { className: "w-3.5 h-3.5 text-blue-400" })}
            <span>{trip.travel_style || "Solo"}</span>
          </Badge>

          <span className="text-xs text-zinc-500 font-mono">
            Plan #{trip.id}
          </span>
        </div>

        {/* Destination Headline */}
        <Typography variant="h2" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {trip.destination}
        </Typography>

        {/* Clean, Human Summary Row */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm text-zinc-400">
          <span className="font-medium text-zinc-300">{trip.days} Days</span>
          <span className="text-zinc-600">•</span>
          <span className="font-medium text-zinc-300">{formatBudget(trip.budget)} Total Budget</span>
        </div>
      </div>

      {/* Action Toolbar (Comfortable touch targets with smooth hover states) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 sm:overflow-visible sm:flex-wrap shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRegenerateAi}
          className="gap-1.5 border-primary/40 bg-primary/10 text-blue-300 hover:bg-primary/20 hover:text-white active:scale-95 text-xs px-3.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Regenerate</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCopy}
          className="gap-1.5 active:scale-95 text-xs px-3.5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-300" />
              <span>Copy</span>
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onDownloadMarkdown}
          className="gap-1.5 active:scale-95 text-xs px-3.5"
        >
          <Download className="w-3.5 h-3.5 text-zinc-300" />
          <span>Export .md</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onPrint}
          className="gap-1.5 active:scale-95 text-xs px-3.5"
        >
          <Printer className="w-3.5 h-3.5 text-zinc-300" />
          <span>Print / PDF</span>
        </Button>
      </div>
    </div>
  );
}
