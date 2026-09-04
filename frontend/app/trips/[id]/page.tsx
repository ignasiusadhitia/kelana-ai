"use client";

/**
 * PAGE: /trips/[id] (Single Trip Detailed View)
 * Detailed itinerary blueprint view featuring metrics, day accordions, budget adjustments, and calendar export.
 */

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTrip } from "@/services/tripService";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { TripRecommendation } from "@/components/TripRecommendation";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Plus,
  AlertTriangle,
  RotateCcw,
  Lock,
  LogIn,
  ShieldAlert,
  Map,
  Compass,
  MapPinOff,
  AlertOctagon,
  Home,
  Bot,
} from "lucide-react";
import { tripKeys } from "@/lib/queryKeys";
import { TripResponse } from "@/types/trip";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TripDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const rawId = resolvedParams?.id ? String(resolvedParams.id).trim() : "";
  // Valid trip ID: supports prefixed public_id (trp_...) or legacy numeric string
  const isValidTripId =
    rawId.length > 0 &&
    /^[A-Za-z0-9_-]{1,64}$/.test(rawId);
  const tripId = isValidTripId ? rawId : "";

  // Route Protection: If it's a valid trip ID format and user is unauthenticated, redirect to login
  useEffect(() => {
    if (isValidTripId && !isAuthLoading && !isAuthenticated) {
      router.push(`/login?redirect=/trips/${tripId}`);
    }
  }, [isAuthLoading, isAuthenticated, router, tripId, isValidTripId]);

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
    enabled: isValidTripId && isAuthenticated,
    staleTime: 1000 * 60,
  });

  const errorMsg = error instanceof Error ? error.message : String(error || "");
  const is401 =
    errorMsg.includes("401") ||
    errorMsg.toLowerCase().includes("authentication") ||
    errorMsg.toLowerCase().includes("unauthorized") ||
    errorMsg.toLowerCase().includes("not authenticated");
  const is403 =
    errorMsg.includes("403") ||
    errorMsg.toLowerCase().includes("forbidden") ||
    errorMsg.toLowerCase().includes("permission");
  const is404 =
    errorMsg.includes("404") ||
    errorMsg.toLowerCase().includes("not found");
  const is500 =
    !is404 &&
    !is401 &&
    !is403 &&
    (errorMsg.includes("500") ||
      errorMsg.includes("502") ||
      errorMsg.includes("503") ||
      errorMsg.toLowerCase().includes("server") ||
      errorMsg.toLowerCase().includes("internal") ||
      errorMsg.toLowerCase().includes("network") ||
      errorMsg.toLowerCase().includes("failed to fetch"));

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

          {/* Case 0: Invalid Trip ID in Address Bar (Random non-numeric string or negative number) */}
          {!isValidTripId && (
            <Card className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-card/60 p-8 sm:p-12 text-center shadow-2xl backdrop-blur-2xl animate-in fade-in duration-300">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.1),transparent_70%)]" />
              <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-950/40 text-blue-400 shadow-xl shadow-blue-500/10">
                <div className="absolute inset-0 rounded-2xl bg-blue-500/20 animate-ping opacity-25 duration-1000" />
                <MapPinOff className="w-10 h-10" />
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-300 mb-3">
                404 • Invalid Trip ID
              </span>

              <Typography variant="h2" className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Itinerary Not Found
              </Typography>

              <Typography variant="muted" as="p" className="mx-auto mt-3 max-w-md text-xs sm:text-sm text-zinc-300 leading-relaxed">
                The travel plan reference <span className="font-mono font-semibold text-blue-300 bg-blue-950/70 px-2 py-0.5 rounded border border-blue-500/20">"{rawId || "empty"}"</span> is invalid. Itinerary identifiers must be valid numeric IDs.
              </Typography>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link href="/trips">
                  <Button variant="default" size="default" className="gap-2 px-5 active:scale-95 shadow-md font-semibold">
                    <Map className="w-4 h-4" />
                    <span>View My Trips</span>
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="default" className="gap-2 px-5 active:scale-95">
                    <Plus className="w-4 h-4" />
                    <span>Plan New Trip</span>
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="ghost" size="default" className="gap-2 px-4 text-zinc-400 hover:text-white active:scale-95">
                    <Bot className="w-4 h-4" />
                    <span>Ask AI Assistant</span>
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Loading Skeleton */}
          {isValidTripId && (isLoading || (isAuthLoading && !isAuthenticated)) && (
            <div className="space-y-6 animate-pulse">
              <div className="h-64 rounded-2xl border border-card-border bg-card/60 p-8" />
              <div className="h-12 rounded-xl bg-zinc-800/40" />
              <div className="h-44 rounded-2xl bg-zinc-800/30" />
              <div className="h-44 rounded-2xl bg-zinc-800/30" />
            </div>
          )}

          {/* Error Disambiguation 1: 401 Unauthorized */}
          {isValidTripId && isError && !isLoading && is401 && (
            <Card className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-card/60 p-8 sm:p-12 text-center shadow-2xl backdrop-blur-2xl animate-in fade-in duration-300">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.1),transparent_70%)]" />
              <div className="relative mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-950/40 text-blue-400 shadow-inner">
                <Lock className="w-9 h-9" />
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-300 mb-3">
                401 • Sign In Required
              </span>

              <Typography variant="h2" className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Sign In Required to View Itinerary
              </Typography>

              <Typography variant="muted" as="p" className="mx-auto mt-3 max-w-md text-xs sm:text-sm text-zinc-300 leading-relaxed">
                This travel itinerary is private and secured to your account. Please sign in to access full itinerary details.
              </Typography>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link href={`/login?redirect=/trips/${tripId}`}>
                  <Button variant="default" size="default" className="gap-2 px-6 active:scale-95 shadow-md font-semibold">
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Button>
                </Link>
                <Link href="/trips">
                  <Button variant="outline" size="default" className="gap-2 px-5 active:scale-95">
                    <span>Back to Trips</span>
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Error Disambiguation 2: 403 Forbidden (Cross-User Privacy) */}
          {isValidTripId && isError && !isLoading && is403 && (
            <Card className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-card/60 p-8 sm:p-12 text-center shadow-2xl backdrop-blur-2xl animate-in fade-in duration-300">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(245,158,11,0.08),transparent_70%)]" />
              <div className="relative mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-950/40 text-amber-400 shadow-inner">
                <ShieldAlert className="w-9 h-9" />
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-300 mb-3">
                403 • Access Restricted
              </span>

              <Typography variant="h2" className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Private Itinerary (Access Restricted)
              </Typography>

              <Typography variant="muted" as="p" className="mx-auto mt-3 max-w-md text-xs sm:text-sm text-zinc-300 leading-relaxed">
                This travel plan belongs to another traveler and is protected by KelanaAI privacy security. You can only view and manage itineraries created on your own account.
              </Typography>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link href="/trips">
                  <Button variant="default" size="default" className="gap-2 px-6 active:scale-95 shadow-md font-semibold">
                    <Map className="w-4 h-4" />
                    <span>View My Trips</span>
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="default" className="gap-2 px-5 active:scale-95">
                    <Plus className="w-4 h-4" />
                    <span>Plan New Trip</span>
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Error Disambiguation 3: 404 Not Found (Numeric ID not in DB, e.g. /trips/999999) */}
          {isValidTripId && isError && !isLoading && is404 && (
            <Card className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-card/60 p-8 sm:p-12 text-center shadow-2xl backdrop-blur-2xl animate-in fade-in duration-300">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.1),transparent_70%)]" />
              <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-950/40 text-blue-400 shadow-xl shadow-blue-500/10">
                <div className="absolute inset-0 rounded-2xl bg-blue-500/20 animate-ping opacity-25 duration-1000" />
                <Compass className="w-10 h-10 animate-[spin_16s_linear_infinite]" />
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-300 mb-3">
                404 • Trip Not Found
              </span>

              <Typography variant="h2" className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Itinerary Not Found
              </Typography>

              <Typography variant="muted" as="p" className="mx-auto mt-3 max-w-md text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Travel itinerary with ID <span className="font-mono font-semibold text-blue-300 bg-blue-950/70 px-2 py-0.5 rounded border border-blue-500/20">#{tripId}</span> could not be found in your database. It may have been deleted or the link is incorrect.
              </Typography>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link href="/trips">
                  <Button variant="default" size="default" className="gap-2 px-5 active:scale-95 shadow-md font-semibold">
                    <Map className="w-4 h-4" />
                    <span>View My Trips</span>
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="default" className="gap-2 px-5 active:scale-95">
                    <Plus className="w-4 h-4" />
                    <span>Plan New Trip</span>
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="ghost" size="default" className="gap-2 px-4 text-zinc-400 hover:text-white active:scale-95">
                    <Bot className="w-4 h-4" />
                    <span>Ask AI Assistant</span>
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Error Disambiguation 4: 500 Internal Server / Network Error */}
          {isValidTripId && isError && !isLoading && is500 && (
            <Card className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-card/60 p-8 sm:p-12 text-center shadow-2xl backdrop-blur-2xl animate-in fade-in duration-300">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(239,68,68,0.1),transparent_70%)]" />
              <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/30 bg-red-950/40 text-red-400 shadow-xl shadow-red-500/10">
                <div className="absolute inset-0 rounded-2xl bg-red-500/20 animate-ping opacity-25 duration-1000" />
                <AlertOctagon className="w-10 h-10" />
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-red-300 mb-3">
                500 • Server Error
              </span>

              <Typography variant="h2" className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Failed to Load Itinerary
              </Typography>

              <Typography variant="muted" as="p" className="mx-auto mt-3 max-w-md text-xs sm:text-sm text-zinc-300 leading-relaxed">
                An unexpected error occurred while communicating with the server to retrieve trip #{tripId}. Please check your connection or try reloading the page.
              </Typography>

              {errorMsg && (
                <div className="mt-3.5 rounded-xl border border-white/5 bg-zinc-950/70 px-3 py-1.5 text-[11px] font-mono text-zinc-500 max-w-sm mx-auto truncate">
                  Detail: {errorMsg}
                </div>
              )}

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="default"
                  size="default"
                  onClick={() => refetch()}
                  className="gap-2 px-5 active:scale-95 shadow-md font-semibold"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </Button>

                <Link href="/trips">
                  <Button variant="outline" size="default" className="gap-2 px-5 active:scale-95">
                    <Map className="w-4 h-4" />
                    <span>View Trip History</span>
                  </Button>
                </Link>

                <Link href="/">
                  <Button variant="ghost" size="default" className="gap-2 px-4 text-zinc-400 hover:text-white active:scale-95">
                    <Home className="w-4 h-4" />
                    <span>Homepage</span>
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Error Disambiguation 5: Other Generic Errors */}
          {isValidTripId && isError && !isLoading && !is401 && !is403 && !is404 && !is500 && (
            <Card className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-card/60 p-8 sm:p-12 text-center shadow-2xl backdrop-blur-2xl animate-in fade-in duration-300">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(239,68,68,0.08),transparent_70%)]" />
              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-950/40 text-red-400 shadow-inner">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>

              <Typography variant="h3" className="font-bold text-white text-xl">
                Unable to Load Itinerary
              </Typography>

              <Typography variant="muted" as="p" className="mx-auto mt-2 max-w-md text-sm text-zinc-300">
                {errorMsg || `Trip with ID #${tripId} could not be loaded at this time.`}
              </Typography>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button variant="default" size="sm" onClick={() => refetch()} className="gap-1.5 px-4 active:scale-95 shadow-md">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </Button>
                <Link href="/trips">
                  <Button variant="outline" size="sm" className="px-4 active:scale-95">
                    View Trip History
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Loaded Trip Details: Reusing TripRecommendation */}
          {isValidTripId && trip && !isLoading && !isError && (
            <TripRecommendation
              trip={trip}
              onReset={() => router.push("/")}
              onTripUpdated={(updated) => {
                queryClient.setQueryData(tripKeys.detail(tripId), updated);
                queryClient.setQueryData<TripResponse[]>(tripKeys.lists(), (old) =>
                  old ? old.map((t) => (t.id === tripId ? updated : t)) : []
                );
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
