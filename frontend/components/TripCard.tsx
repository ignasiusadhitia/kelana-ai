import Link from "next/link";
import { Trash2, ArrowRight } from "lucide-react";
import { TripResponse } from "@/types/trip";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { formatBudget } from "@/lib/utils";
import { getTravelStyleIconComponent, getDestinationVectorBadge } from "@/lib/icons";

// COMPONENT: Reusable TripCard
// Renders individual itinerary card for grid/list dashboard displays (Session 7 Part 6 & Homework)
// Features Option 2: Sleek Floating Corner Tag + Ambient Glow for newly created target trip
// 100% Vector Lucide destination badge & persona indicators

interface TripCardProps {
  trip: TripResponse;
  onDelete?: (id: number) => void;
  isHighlighted?: boolean;
}

export function TripCard({ trip, onDelete, isHighlighted = false }: TripCardProps) {
  // Category color mapper (Homework 03)
  const getCategoryVariant = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes("backpacker")) return "success";
    if (lower.includes("luxury")) return "warning";
    return "default";
  };

  const destinationBadge = getDestinationVectorBadge(trip.destination);

  return (
    <Card
      className={`group relative flex flex-col justify-between overflow-visible p-4 sm:p-5 transition-all duration-500 active:scale-[0.99] ${
        isHighlighted
          ? "border-primary/80 bg-zinc-900 ring-2 ring-primary/80 shadow-2xl shadow-blue-500/25 scale-[1.02] animate-in zoom-in-95 duration-500"
          : "border-border bg-card/60 hover:-translate-y-1 hover:border-primary/50 hover:bg-card hover:shadow-xl hover:shadow-primary/5"
      }`}
    >
      {/* Floating Corner Tag for Newly Created Trip (Option 2) */}
      {isHighlighted && (
        <div className="absolute -top-3 right-5 z-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg shadow-blue-500/30 ring-4 ring-background animate-in fade-in zoom-in-90 duration-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-300" />
            </span>
            <span>New</span>
          </span>
        </div>
      )}

      {/* Ambient Top Glow for Highlighted Card */}
      {isHighlighted && (
        <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-blue-500/20 blur-2xl animate-pulse" />
      )}

      {/* Top Meta & Badges */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/trips/${trip.id}`}
              className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-110 active:scale-95 ${destinationBadge.containerClass}`}
            >
              {destinationBadge.icon}
            </Link>
            <div>
              <Link href={`/trips/${trip.id}`}>
                <Typography
                  variant="h4"
                  className="font-bold text-white text-sm sm:text-base transition-colors group-hover:text-primary hover:underline"
                >
                  {trip.destination}
                </Typography>
              </Link>

              <Typography variant="muted" className="text-[11px] sm:text-xs mt-0.5">
                {trip.days} Days • {formatBudget(trip.budget)}
              </Typography>
            </div>
          </div>

          {/* Delete Action (Touch-friendly on mobile, hover-friendly on desktop) */}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(trip.id);
              }}
              className="cursor-pointer flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 sm:opacity-0 transition-all hover:bg-destructive/15 hover:text-destructive sm:group-hover:opacity-100 active:scale-90"
              title="Delete trip from history"
              aria-label="Delete trip"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Badges Container */}
        <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Category Badge */}
          <Badge variant={getCategoryVariant(trip.category)} className="text-[10px] sm:text-xs">
            {trip.category}
          </Badge>

          {/* Travel Style Badge with Lucide Icon */}
          <Badge variant="secondary" className="normal-case text-[10px] sm:text-xs inline-flex items-center gap-1.5">
            {getTravelStyleIconComponent(trip.travel_style, { className: "w-3 h-3 text-blue-300" })}
            <span>{trip.travel_style || "Solo"}</span>
          </Badge>

          {/* Daily Budget Pill */}
          {trip.daily_budget && (
            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground ml-auto">
              ~{formatBudget(trip.daily_budget)}/day
            </span>
          )}
        </div>
      </div>

      {/* Bottom Action Link */}
      <div className="mt-4 sm:mt-5 pt-3 border-t border-border/50 flex items-center justify-between">
        <Typography variant="muted" className="text-[10px] sm:text-[11px] text-zinc-500">
          Plan #{trip.id}
        </Typography>

        <Link
          href={`/trips/${trip.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-all group-hover:translate-x-1 group-hover:text-blue-400 active:scale-95"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
}
