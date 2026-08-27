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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Typography
            as="span"
            variant="kicker"
            className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] text-blue-300 font-semibold"
          >
            ITINERARY DETAILS
          </Typography>
          <Typography variant="muted">Plan #{trip.id}</Typography>
          <Badge variant="secondary" className="normal-case text-[10px] ml-1 inline-flex items-center gap-1.5">
            {getTravelStyleIconComponent(trip.travel_style, { className: "w-3 h-3 text-blue-300" })}
            <span>{trip.travel_style || "Solo"}</span>
          </Badge>
        </div>
        <Typography variant="h2" className="text-white">
          {trip.destination}
        </Typography>
        <Typography variant="lead" className="text-zinc-300 mt-1 block">
          Custom {trip.days}-Day travel plan optimized for a total budget of{" "}
          {formatBudget(trip.budget)}
        </Typography>
      </div>

      {/* Action Toolbar (Swipeable on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 sm:overflow-visible sm:flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRegenerateAi}
          className="gap-1.5 border-primary/40 bg-primary/10 text-blue-300 hover:bg-primary/20 hover:text-white active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Regenerate</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCopy}
          className="gap-1.5 active:scale-95"
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
          className="gap-1.5 active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-zinc-300" />
          <span>Export .md</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onPrint}
          className="gap-1.5 active:scale-95"
        >
          <Printer className="w-3.5 h-3.5 text-zinc-300" />
          <span>Print / PDF</span>
        </Button>
      </div>
    </div>
  );
}
