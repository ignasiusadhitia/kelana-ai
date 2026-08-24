"use client";

import Image from "next/image";
import { useTripGenerator } from "@/hooks/useTripGenerator";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TravelForm } from "@/components/TravelForm";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { TripRecommendation } from "@/components/TripRecommendation";
import { SummaryBar } from "@/components/SummaryBar";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";

// ARCHITECTURE: Main Homepage Controller & View Orchestrator
// PATTERN: State-Driven UI State Machine (Form -> Loading -> Recommendation | Error)

/**
 * Main application homepage rendering the hero showcase, travel form, and AI-curated guides.
 */
export default function Home() {
  const {
    trip,
    isLoading,
    error,
    summaryInfo,
    savedTrips,
    generateTrip,
    loadSavedTrip,
    deleteSavedTrip,
    resetTrip,
  } = useTripGenerator();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Top Brand Navbar */}
      <Navbar onPlanTrip={resetTrip} />

      {/* Main Content Area */}
      <main className="relative flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Ambient Top Glow Orbs */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-96 w-full max-w-4xl bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_60%)]" />
        <div className="pointer-events-none absolute top-40 right-1/4 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-3xl space-y-6">
          {/* Destination Hero Image & Headline Banner (Shown when not viewing results) */}
          {!trip && (
            <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
              {/* Hero Image Container */}
              <div className="relative h-56 sm:h-72 md:h-80 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1400&auto=format&fit=crop"
                  alt="Iconic Travel Destination — Kyoto & Mount Fuji, Japan"
                  fill
                  priority
                  className="object-cover object-center transform transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 800px"
                />

                {/* Dark Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                <div className="absolute inset-0 bg-blue-950/20 mix-blend-overlay" />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 text-left">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-zinc-900/80 px-3 py-1 text-xs font-semibold text-white mb-3 backdrop-blur-md w-fit">
                    <span className="text-amber-400">✨</span>
                    <span>Featured Destination: Kyoto, Japan</span>
                  </div>

                  <Typography variant="h1" className="drop-shadow-md">
                    Plan Your Next Journey with{" "}
                    <Typography as="span" variant="gradient">
                      KelanaAI
                    </Typography>
                  </Typography>

                  <Typography variant="lead" className="mt-1.5 max-w-xl drop-shadow-sm">
                    Custom day-by-day itineraries, smart daily budget allowances, and authentic local spots.
                  </Typography>
                </div>
              </div>
            </div>
          )}

          {/* Saved Plans History Chips (If user has previously saved trips) */}
          {!trip && !isLoading && savedTrips.length > 0 && (
            <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between mb-2.5">
                <Typography variant="kicker" className="flex items-center gap-1.5">
                  <span>📂</span>
                  <span>Recent Saved Plans ({savedTrips.length})</span>
                </Typography>
                <Typography variant="muted">Click to view anytime</Typography>
              </div>

              <div className="flex flex-wrap gap-2">
                {savedTrips.map((saved) => (
                  <div
                    key={saved.id}
                    className="group inline-flex items-center rounded-xl border border-border bg-secondary/80 px-3 py-1.5 text-xs text-zinc-200 transition-all hover:border-primary/50 hover:bg-zinc-800"
                  >
                    <button
                      type="button"
                      onClick={() => loadSavedTrip(saved)}
                      className="cursor-pointer flex items-center gap-1.5 font-medium hover:text-white"
                    >
                      <span className="text-blue-400">📍</span>
                      <span>{saved.destination}</span>
                      <Typography as="span" variant="muted" className="text-zinc-400">
                        ({saved.days}D • ${Number(saved.budget).toLocaleString()})
                      </Typography>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSavedTrip(saved.id);
                      }}
                      className="cursor-pointer ml-2 text-muted-foreground hover:text-destructive transition"
                      title="Remove from history"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Card Container for Form, Loading, Error, or Results */}
          <Card id="planner" className="overflow-hidden">
            {/* Top Summary Bar when active in loading or error state */}
            {(isLoading || error) && summaryInfo && (
              <SummaryBar summaryInfo={summaryInfo} />
            )}

            {/* Loading State */}
            {isLoading && <LoadingState />}

            {/* Graceful Error State */}
            {error && !isLoading && (
              <ErrorState onRetry={resetTrip} message={error} />
            )}

            {/* AI Recommendation State */}
            {trip && !isLoading && !error && (
              <TripRecommendation trip={trip} onReset={resetTrip} />
            )}

            {/* Travel Form State */}
            {!isLoading && !error && !trip && (
              <TravelForm onSubmit={generateTrip} />
            )}
          </Card>
        </div>
      </main>

      {/* Footer */}
      <Footer onPlanTrip={resetTrip} />
    </div>
  );
}
