"use client";

/**
 * PAGE: / (Landing Page & Trip Generator)
 * Public homepage featuring AI trip blueprint generator and quick-start travel planner.
 */

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Folder, MapPin, Trash2, ArrowRight } from "lucide-react";
import { useTripGenerator } from "@/hooks/useTripGenerator";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { TravelForm } from "@/components/TravelForm";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { TripRecommendation } from "@/components/TripRecommendation";
import { SummaryBar } from "@/components/SummaryBar";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { ScrollableTrack } from "@/components/ui/scrollable-track";
import { TripRequest, TripResponse } from "@/types/trip";
import { getTrips, deleteTripService } from "@/services/tripService";
import { tripKeys } from "@/lib/queryKeys";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/toast";

// Code-splitting / Lazy-load quick preview modal (zero hydration overhead on initial load)
const TripDetailModal = dynamic(
  () => import("@/components/TripDetailModal").then((mod) => mod.TripDetailModal),
  { ssr: false }
);

// High-performance lightweight shimmer blur generator for smooth image loading
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#18181b" offset="20%" />
      <stop stop-color="#27272a" offset="50%" />
      <stop stop-color="#18181b" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#18181b" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

/**
 * Main application homepage rendering the hero showcase, travel form, and AI-curated guides.
 */
export default function Home() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedModalTrip, setSelectedModalTrip] = useState<TripResponse | null>(null);

  // Fetch real user trips from database for authenticated toolbar
  const { data: userTrips = [] } = useQuery<TripResponse[]>({
    queryKey: tripKeys.lists(),
    queryFn: () => getTrips("active"),
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTripService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      toast.info("Itinerary removed from your dashboard.", { title: "Deleted" });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete trip.");
    },
  });

  const {
    trip,
    isLoading,
    error,
    summaryInfo,
    generateTrip,
    resetTrip,
  } = useTripGenerator();

  const isGeneratingOrNavigating = isLoading || isNavigating;

  // Handler submitting form with butter-smooth redirect to /trips
  const handleFormSubmit = async (data: TripRequest) => {
    try {
      setIsNavigating(true);
      const createdTrip = await generateTrip(data);
      if (createdTrip && createdTrip.id) {
        toast.success(`Itinerary for ${createdTrip.destination} has been created & saved!`, {
          title: "Trip Created",
        });
        router.push(`/trips?highlight=${createdTrip.id}`);
      } else {
        setIsNavigating(false);
      }
    } catch (e) {
      setIsNavigating(false);
      toast.error(e instanceof Error ? e.message : "Failed to generate travel plan.", {
        title: "Creation Failed",
      });
      console.error("Failed to generate trip:", e);
    }
  };

  const displayedSavedTrips = isAuthenticated ? userTrips.slice(0, 10) : [];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Top Brand Navbar */}
      <Navbar onPlanTrip={resetTrip} />

      {/* Main Content Area */}
      <main className="relative flex-1 px-4 py-8 pb-24 sm:pb-8 sm:px-6 lg:px-8">
        {/* Ambient Top Glow Orbs */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-96 w-full max-w-5xl bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_60%)]" />

        <div className="mx-auto max-w-5xl space-y-6">
          {/* Destination Hero Image & Headline Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            {/* Hero Image Container */}
            <div className="relative h-60 sm:h-72 md:h-80 w-full overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1400&auto=format&fit=crop"
                alt="Iconic Travel Destination — Kyoto & Mount Fuji, Japan"
                fill
                priority
                placeholder="blur"
                blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(1400, 800))}`}
                className="object-cover object-center transform transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 768px) 100vw, 800px"
              />

              {/* Dark Gradient Overlay for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
              <div className="absolute inset-0 bg-blue-950/20 mix-blend-overlay" />

              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 text-left">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-zinc-900/85 px-2.5 py-0.5 text-[11px] font-semibold text-white mb-2.5 backdrop-blur-md w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Featured Destination: Kyoto, Japan</span>
                </div>

                <Typography variant="h1" className="text-2xl sm:text-4xl md:text-5xl font-black drop-shadow-md tracking-tight leading-tight">
                  Plan Your Next Trip with{" "}
                  <Typography as="span" variant="gradient">
                    KelanaAI
                  </Typography>
                </Typography>

                <Typography variant="lead" className="mt-1 sm:mt-1.5 text-xs sm:text-base text-zinc-300 max-w-xl drop-shadow-sm line-clamp-2 sm:line-clamp-none">
                  Day-by-day itineraries, daily budget breakdowns, and curated local recommendations.
                </Typography>
              </div>
            </div>
          </div>

          {/* Quick Saved Itineraries History Toolbar for Authenticated User */}
          {isAuthenticated && displayedSavedTrips.length > 0 && (
            <div className="rounded-2xl border border-border/80 bg-card/40 p-4 sm:p-5 backdrop-blur-md animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-blue-400" />
                  <Typography variant="kicker" className="text-zinc-200 text-xs sm:text-sm font-bold tracking-wide">
                    Saved Itineraries
                  </Typography>
                  <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-blue-300">
                    {displayedSavedTrips.length}
                  </span>
                </div>

                <Link
                  href="/trips"
                  className="text-xs font-semibold text-primary hover:text-blue-400 transition-colors inline-flex items-center gap-1 active:scale-95"
                >
                  <span className="hidden sm:inline">Open Full Dashboard</span>
                  <span className="sm:hidden">All Trips</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Saved Plans History Chips with Automatic Left/Right Flanking Chevrons */}
              <ScrollableTrack className="mt-3.5 gap-2.5">
                {displayedSavedTrips.map((saved) => (
                  <div
                    key={saved.id}
                    className="group shrink-0 inline-flex items-center rounded-xl border border-border bg-secondary/90 hover:bg-zinc-800/90 px-3.5 py-2 text-xs text-zinc-200 transition-all hover:border-primary/50 hover:shadow-md active:scale-[0.98]"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedModalTrip(saved)}
                      className="cursor-pointer flex items-center gap-2 font-medium hover:text-white"
                      title="Click to open quick preview modal"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="font-semibold text-white text-xs sm:text-sm">{saved.destination}</span>
                      <Typography as="span" variant="muted" className="text-zinc-400 text-xs">
                        ({saved.days}D • ${Number(saved.budget).toLocaleString()})
                      </Typography>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(saved.id);
                      }}
                      className="cursor-pointer ml-2 flex h-5 w-5 items-center justify-center rounded-full text-zinc-500 hover:bg-destructive/20 hover:text-destructive transition active:scale-90"
                      title="Remove from history"
                      aria-label="Remove from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </ScrollableTrack>
            </div>
          )}

          {/* Main Card Container for Form, Loading, Error, or Results */}
          <Card id="planner" className="overflow-hidden">
            {/* Top Summary Bar when active in loading or error state */}
            {(isGeneratingOrNavigating || error) && summaryInfo && (
              <SummaryBar summaryInfo={summaryInfo} />
            )}

            {/* Loading State: Persists smoothly until /trips page is reached */}
            {isGeneratingOrNavigating && <LoadingState />}

            {/* Graceful Error State with Intelligent Auth Detection */}
            {error && !isGeneratingOrNavigating && (
              <div className="p-6 sm:p-8">
                <ErrorState
                  onRetry={resetTrip}
                  message={error}
                />
              </div>
            )}

            {/* Main Interactive Planner Form */}
            {!trip && !isGeneratingOrNavigating && !error && (
              <div className="p-6 sm:p-8">
                <TravelForm onSubmit={handleFormSubmit} />
              </div>
            )}

            {/* Generated Trip Blueprint View */}
            {trip && !isGeneratingOrNavigating && !error && (
              <div className="p-6 sm:p-8">
                <TripRecommendation
                  trip={trip}
                  onReset={resetTrip}
                />
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Dock */}
      <MobileBottomNav />

      {/* Quick Preview Detail Modal */}
      <TripDetailModal
        trip={selectedModalTrip}
        isOpen={!!selectedModalTrip}
        onClose={() => setSelectedModalTrip(null)}
      />
    </div>
  );
}
