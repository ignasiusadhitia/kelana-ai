"use client";

import * as React from "react";
import Link from "next/link";
import { Map, X, ArrowRight } from "lucide-react";
import { TripResponse } from "@/types/trip";
import { TripRecommendation } from "@/components/TripRecommendation";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Portal } from "@/components/ui/portal";

// COMPONENT: TripDetailModal
// Displays an interactive itinerary quick preview in a glassmorphic modal wrapped in <Portal>
// Triggered when a saved itinerary chip or history card is selected on the homepage

interface TripDetailModalProps {
  trip: TripResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onTripUpdated?: (updatedTrip: TripResponse) => void;
}

export function TripDetailModal({
  trip,
  isOpen,
  onClose,
  onTripUpdated,
}: TripDetailModalProps) {
  // Close on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll when open
  React.useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !trip) return null;

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="trip-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        className="fixed inset-0 z-[9995] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-950 shadow-2xl text-foreground ring-1 ring-white/10 backdrop-blur-2xl animate-in zoom-in-95 duration-150">
          {/* Ambient Top Glow */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl" />

          {/* Modal Header */}
          <div className="flex items-center justify-between gap-4 p-4 sm:p-6 border-b border-border/60 bg-zinc-900/60 shrink-0">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Map className="w-5 h-5" />
              </span>
              <div>
                <Typography
                  as="span"
                  variant="kicker"
                  className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-300 font-bold uppercase tracking-wider"
                >
                  ITINERARY PREVIEW #{trip.id}
                </Typography>
                <Typography
                  id="trip-modal-title"
                  variant="h3"
                  className="font-bold text-white tracking-tight mt-0.5"
                >
                  {trip.destination}
                </Typography>
              </div>
            </div>

            {/* Header Right Actions: Open Full Page & 1:1 Circular Close Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href={`/trips/${trip.id}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="hidden sm:inline-flex text-xs gap-1.5 shadow-sm"
                >
                  <span>Open Full Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>

              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition active:scale-90"
                title="Close modal (Esc)"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
            <TripRecommendation
              trip={trip}
              onReset={onClose}
              onTripUpdated={onTripUpdated}
            />
          </div>

          {/* Modal Sticky Bottom Bar */}
          <div className="p-4 sm:px-6 border-t border-border/60 bg-zinc-900/60 flex items-center justify-between shrink-0">
            <Typography variant="muted" className="text-xs text-zinc-400">
              {trip.days} Days • USD {Number(trip.budget).toLocaleString()} Total Budget
            </Typography>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="text-xs px-4 active:scale-95"
              >
                Close Preview
              </Button>
              <Link href={`/trips/${trip.id}`} className="sm:hidden">
                <Button variant="default" size="sm" className="text-xs gap-1 active:scale-95">
                  <span>Full Page</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
