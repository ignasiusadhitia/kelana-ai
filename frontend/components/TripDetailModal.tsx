"use client";

import * as React from "react";
import Link from "next/link";
import { Map, X, ArrowRight } from "lucide-react";
import { TripResponse } from "@/types/trip";
import { TripRecommendation } from "@/components/TripRecommendation";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Portal } from "@/components/ui/portal";

/**
 * COMPONENT: TripDetailModal
 * Modal dialog displaying comprehensive trip recommendations with interactive budget editing.
 */
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
        <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl text-foreground ring-1 ring-white/10 backdrop-blur-2xl animate-in zoom-in-95 duration-150">
          {/* Ambient Top Glow */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl" />

          {/* Modal Header */}
          <div className="flex items-center justify-between gap-4 p-4 sm:p-6 border-b border-border/60 bg-zinc-900/60 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Map className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs font-semibold text-blue-400 tracking-wider uppercase block">
                  Quick Preview
                </span>
                <Typography
                  id="trip-modal-title"
                  variant="h3"
                  className="font-bold text-white tracking-tight text-base sm:text-lg truncate"
                >
                  {trip.destination}
                </Typography>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link href={`/trips/${trip.id}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="hidden sm:inline-flex text-xs gap-1.5 shadow-sm active:scale-95 px-3.5"
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

          {/* Modal Sticky Bottom Bar (Spacious layout with responsive wrapping) */}
          <div className="p-4 sm:px-6 border-t border-border/60 bg-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-xs text-zinc-400">
              <span className="font-semibold text-zinc-200">{trip.days} Days</span>
              <span className="text-zinc-600">•</span>
              <span className="font-semibold text-zinc-200">USD {Number(trip.budget).toLocaleString()}</span>
              <span>Total Budget</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="text-xs px-4 flex-1 sm:flex-none active:scale-95"
              >
                Close Preview
              </Button>
              <Link href={`/trips/${trip.id}`} className="flex-1 sm:flex-none">
                <Button
                  variant="default"
                  size="sm"
                  className="text-xs gap-1.5 px-4 w-full active:scale-95 shadow-md shadow-blue-500/20 font-semibold"
                >
                  <span>Open Full Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
