"use client";

import Link from "next/link";
import { Map, ArrowUpRight } from "lucide-react";

interface LinkedTripBannerProps {
  destination?: string | null;
  tripId?: string | null;
}

/**
 * COMPONENT: LinkedTripBanner
 * Context indicator displayed at the top of a conversation thread when linked to an active Trip Blueprint.
 */
export function LinkedTripBanner({ destination, tripId }: LinkedTripBannerProps) {
  if (!destination) return null;

  return (
    <div className="px-3 sm:px-5 py-2 border-b border-amber-500/20 bg-amber-950/20 flex items-center justify-between gap-2 shrink-0 animate-in fade-in duration-200">
      <div className="flex items-center gap-2 min-w-0">
        <Map className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-[11px] text-amber-300 font-medium truncate">
          Linked Trip: <span className="font-bold text-amber-200">{destination}</span>
        </span>
      </div>
      {tripId && (
        <Link
          href={`/trips/${tripId}`}
          className="text-[10px] text-amber-400 hover:text-amber-300 underline-offset-2 hover:underline shrink-0 flex items-center gap-1 active:scale-95"
        >
          <span>Open Blueprint</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
