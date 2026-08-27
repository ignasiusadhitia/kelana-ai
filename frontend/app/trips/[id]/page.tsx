"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTrip } from "@/services/tripService";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { TripRecommendation } from "@/components/TripRecommendation";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, AlertTriangle, RotateCcw } from "lucide-react";
import { tripKeys } from "@/lib/queryKeys";
import { TripResponse } from "@/types/trip";

// ARCHITECTURE: Dynamic Route Segment (/trips/[id])
// PATTERN: 100% Unified Presentation Component (Reusing TripRecommendation with cache invalidation)

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TripDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const tripId = parseInt(resolvedParams.id, 10);

  // Fetch trip from PostgreSQL database via internal Next.js proxy
  const {
    data: trip,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: tripKeys.detail(tripId),
    queryFn: () => getTrip(tripId),
    enabled: !isNaN(tripId) && tripId > 0,
    staleTime: 1000 * 60,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="relative flex-1 px-4 py-8 pb-24 sm:pb-8 sm:px-6 lg:px-8">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-96 w-full max-w-5xl bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_60%)]" />

        <div className="relative mx-auto max-w-5xl space-y-6">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/trips"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-white group active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Trip History</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Itinerary</span>
            </Link>
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="space-y-6 animate-pulse">
              <div className="h-64 rounded-2xl border border-card-border bg-card/60 p-8" />
              <div className="h-12 rounded-xl bg-zinc-800/40" />
              <div className="h-44 rounded-2xl bg-zinc-800/30" />
              <div className="h-44 rounded-2xl bg-zinc-800/30" />
            </div>
          )}

          {/* Error / Not Found State */}
          {isError && !isLoading && (
            <Card className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-card/40 p-8 sm:p-12 text-center backdrop-blur-xl">
              {/* Ambient Red Glow */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(239,68,68,0.08),transparent_70%)]" />

              {/* Center Illustrated Warning Icon Badge */}
              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-950/40 text-red-400 shadow-inner">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>

              <Typography variant="h3" className="font-bold text-white">
                Itinerary Not Found
              </Typography>

              <Typography variant="muted" as="p" className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
                {error instanceof Error
                  ? error.message
                  : `Trip with ID #${tripId} could not be retrieved from the database.`}
              </Typography>

              <div className="mt-6 flex items-center justify-center gap-3">
                <Link href="/trips">
                  <Button variant="secondary" size="sm" className="px-4">
                    View All Trips
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 px-4">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </Button>
              </div>
            </Card>
          )}

          {/* Loaded Trip Details: Identical presentation using TripRecommendation */}
          {trip && !isLoading && !isError && (
            <TripRecommendation
              trip={trip}
              onReset={() => router.push("/")}
              onTripUpdated={(updated) => {
                // Optimistically update active detail cache
                queryClient.setQueryData(tripKeys.detail(tripId), updated);
                // Optimistically update trips list cache as well for instant dashboard sync
                queryClient.setQueryData<TripResponse[]>(tripKeys.lists(), (old) =>
                  old ? old.map((t) => (t.id === tripId ? updated : t)) : []
                );
                // Re-sync server cache in the background
                queryClient.invalidateQueries({ queryKey: tripKeys.all });
              }}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Native App Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}
