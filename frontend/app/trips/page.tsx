"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTrips, deleteTripService } from "@/services/tripService";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { TripCard } from "@/components/TripCard";
import { EmptyState } from "@/components/EmptyState";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { CustomSelect, SelectOption } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { Search, Plus, X, Clock, History, TrendingUp, Tag, ChevronLeft, ChevronRight, AlertTriangle, RotateCcw } from "lucide-react";
import { ScrollableTrack } from "@/components/ui/scrollable-track";
import { getTravelStyleIconComponent } from "@/lib/icons";
import { useDebounce } from "@/hooks/useDebounce";
import { tripKeys } from "@/lib/queryKeys";
import { TripResponse } from "@/types/trip";

// Lazy-load portal confirmation dialog (zero overhead on initial page load)
const ConfirmDialog = dynamic(
  () => import("@/components/ui/confirm-dialog").then((mod) => mod.ConfirmDialog),
  { ssr: false }
);

// ARCHITECTURE: Multi-Page Trip History Dashboard (/trips)
// PATTERN: DB-First Reads (PostgreSQL) + Client-Side Search, Sort, Highlight Animation & Custom Dialog

const ITEMS_PER_PAGE = 9;

type SortOption = "latest" | "oldest" | "highest-budget" | "lowest-budget";

const SORT_OPTIONS: SelectOption[] = [
  { value: "latest", label: "Latest (Newest First)", icon: <Clock className="w-3.5 h-3.5 text-blue-400" /> },
  { value: "oldest", label: "Oldest (First First)", icon: <History className="w-3.5 h-3.5 text-zinc-400" /> },
  { value: "highest-budget", label: "Highest Budget", icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> },
  { value: "lowest-budget", label: "Lowest Budget", icon: <Tag className="w-3.5 h-3.5 text-amber-400" /> },
];

function TripsContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const highlightParam = searchParams.get("highlight");
  const initialHighlightId = highlightParam ? Number(highlightParam) : null;

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 200);
  const [selectedStyle, setSelectedStyle] = useState<string>("ALL");
  const [sortMode, setSortMode] = useState<SortOption>("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [tripToDelete, setTripToDelete] = useState<number | null>(null);
  const [activeHighlightId, setActiveHighlightId] = useState<number | null>(initialHighlightId);

  // Auto fade-out target highlight effect after 4.5 seconds and clean URL
  useEffect(() => {
    if (!initialHighlightId) return;

    const timer = setTimeout(() => {
      setActiveHighlightId(null);
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/trips");
      }
    }, 4500);

    return () => clearTimeout(timer);
  }, [initialHighlightId]);

  // Fetch all trips from PostgreSQL via Next.js proxy -> FastAPI
  const {
    data: trips = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: tripKeys.lists(),
    queryFn: getTrips,
    staleTime: 1000 * 30, // 30 seconds cache
  });

  // Delete trip mutation with Instant Optimistic UI Update & Error Rollback
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTripService(id),
    onMutate: async (id: number) => {
      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: tripKeys.lists() });

      // 2. Snapshot the previous trips list for rollback in case of error
      const previousTrips = queryClient.getQueryData<TripResponse[]>(tripKeys.lists()) || [];

      // 3. Optimistically remove the trip from cache immediately (0ms perceptual latency)
      queryClient.setQueryData<TripResponse[]>(tripKeys.lists(), (old) =>
        old ? old.filter((t) => t.id !== id) : []
      );

      return { previousTrips };
    },
    onError: (err, id, context) => {
      // Rollback to snapshot if mutation failed
      if (context?.previousTrips) {
        queryClient.setQueryData(tripKeys.lists(), context.previousTrips);
      }
      toast.error(
        err instanceof Error ? err.message : "Failed to delete trip from history.",
        { title: "Delete Failed" }
      );
    },
    onSuccess: () => {
      toast.success("Trip itinerary permanently deleted.", {
        title: "Trip Removed",
      });
    },
    onSettled: () => {
      // Always re-sync with server state
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
    },
  });

  const handleDeleteClick = (id: number) => {
    setTripToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (tripToDelete !== null) {
      deleteMutation.mutate(tripToDelete, {
        onSettled: () => setTripToDelete(null),
      });
    }
  };

  // Extract unique travel styles for quick filter pills
  const availableStyles = useMemo(() => {
    const styles = new Set<string>();
    trips.forEach((t) => {
      styles.add(t.travel_style || "Solo");
    });
    return Array.from(styles);
  }, [trips]);

  // Filter and sort logic (Session 7 Slide 17 Challenge & Bonus)
  const filteredAndSortedTrips = useMemo(() => {
    let result = [...trips];

    // 1. Search filter by destination or travel style (using debounced query for maximum fluid performance)
    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.destination.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.travel_style || "Solo").toLowerCase().includes(q)
      );
    }

    // 2. Filter by style pill
    if (selectedStyle !== "ALL") {
      result = result.filter((t) => (t.travel_style || "Solo") === selectedStyle);
    }

    // 3. Sort logic
    result.sort((a, b) => {
      if (sortMode === "latest") {
        return b.id - a.id;
      }
      if (sortMode === "oldest") {
        return a.id - b.id;
      }
      if (sortMode === "highest-budget") {
        return Number(b.budget) - Number(a.budget);
      }
      if (sortMode === "lowest-budget") {
        return Number(a.budget) - Number(b.budget);
      }
      return 0;
    });

    return result;
  }, [trips, debouncedSearchQuery, selectedStyle, sortMode]);

  // Pagination calculation (Session 7 Slide 20 Homework Bonus)
  const totalPages = Math.ceil(filteredAndSortedTrips.length / ITEMS_PER_PAGE) || 1;
  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTrips.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedTrips, currentPage]);

  // Reset page when search or filters change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  return (
    <div className="relative mx-auto max-w-5xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Typography variant="h1">
              Trip History
            </Typography>
            {!isLoading && (
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {trips.length} {trips.length === 1 ? "Trip" : "Trips"}
              </span>
            )}
          </div>
          <Typography variant="muted" className="mt-1">
            Browse and revisit your past AI-curated travel itineraries.
          </Typography>
        </div>

        <Link href="/">
          <Button variant="default" size="sm" className="gap-1.5 shadow-sm active:scale-95">
            <Plus className="w-4 h-4" />
            <span>Plan New Journey</span>
          </Button>
        </Link>
      </div>

      {/* Search, Filter & Sort Controls (Slide 17) */}
      {trips.length > 0 && (
        <Card className="relative z-30 overflow-visible p-4 sm:p-5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="w-4 h-4" />
              </span>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search trips by destination or style (e.g. Kyoto, Solo)..."
                className="pl-10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Custom Select Sort Dropdown */}
            <div className="flex items-center gap-2">
              <Typography as="span" variant="muted" className="text-xs shrink-0">
                Sort by:
              </Typography>
              <CustomSelect
                value={sortMode}
                onValueChange={(val) => setSortMode(val as SortOption)}
                options={SORT_OPTIONS}
                ariaLabel="Sort trips by criteria"
              />
            </div>
          </div>

          {/* Style Filter Pills with Automatic Flanking Scroll Chevrons */}
          {availableStyles.length > 1 && (
            <div className="mt-3.5 pt-3 border-t border-border flex items-center gap-2">
              <Typography as="span" variant="kicker" className="text-[10px] text-muted-foreground mr-0.5 shrink-0">
                Style:
              </Typography>

              <div className="flex-1 min-w-0">
                <ScrollableTrack className="gap-1.5" fadeWidth="w-8 sm:w-10">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStyle("ALL");
                      setCurrentPage(1);
                    }}
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-all active:scale-95 ${
                      selectedStyle === "ALL"
                        ? "bg-primary text-white"
                        : "bg-secondary text-muted-foreground hover:text-white"
                    }`}
                  >
                    All ({trips.length})
                  </button>
                  {availableStyles.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => {
                        setSelectedStyle(style);
                        setCurrentPage(1);
                      }}
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all active:scale-95 ${
                        selectedStyle === style
                          ? "bg-primary text-white shadow-sm"
                          : "bg-secondary text-muted-foreground hover:text-white"
                      }`}
                    >
                      {getTravelStyleIconComponent(style, { className: "w-3 h-3 text-blue-300" })}
                      <span>{style}</span>
                    </button>
                  ))}
                </ScrollableTrack>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 rounded-3xl border border-card-border bg-card/40 animate-pulse p-5"
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-zinc-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-28 rounded bg-zinc-800" />
                  <div className="h-3 w-20 rounded bg-zinc-800/60" />
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <div className="h-5 w-16 rounded-full bg-zinc-800" />
                <div className="h-5 w-20 rounded-full bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <Card className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-card/40 p-8 sm:p-12 text-center backdrop-blur-xl">
          {/* Ambient Red Glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(239,68,68,0.08),transparent_70%)]" />

          {/* Center Illustrated Warning Icon Badge */}
          <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-950/40 text-red-400 shadow-inner">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <Typography variant="h3" className="font-bold text-white">
            Failed to Load Trips
          </Typography>

          <Typography variant="muted" as="p" className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            {error instanceof Error ? error.message : "Unable to connect to backend database. Please ensure the server is active."}
          </Typography>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              className="gap-2 px-5 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Empty State (No trips at all in database) */}
      {!isLoading && !isError && trips.length === 0 && (
        <EmptyState
          title="No trips saved yet."
          description="Generate your first custom itinerary on the homepage to start building your travel history."
          actionText="Create a Trip Now →"
          actionHref="/"
        />
      )}

      {/* Empty Search Results State */}
      {!isLoading && !isError && trips.length > 0 && filteredAndSortedTrips.length === 0 && (
        <Card className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-zinc-800/60 text-zinc-400 shadow-inner mb-3">
            <Search className="w-6 h-6" />
          </div>
          <Typography variant="h3" className="text-white">
            No matching trips found
          </Typography>
          <Typography variant="muted" as="p" className="mt-1.5 max-w-sm text-zinc-400">
            No itinerary matched &ldquo;{searchQuery}&rdquo;. Try clearing your search keyword or changing your style filter.
          </Typography>
          <div className="mt-5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedStyle("ALL");
              }}
              className="px-5 shadow-sm"
            >
              Reset Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Grid View of Trips (with target highlight support) */}
      {!isLoading && !isError && paginatedTrips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onDelete={handleDeleteClick}
              isHighlighted={trip.id === activeHighlightId}
            />
          ))}
        </div>
      )}

      {/* Responsive, Spacious Pagination Controls for Mobile & Desktop */}
      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-4 pt-5 pb-2 border-t border-border/80">
          <Typography variant="muted" className="text-xs text-zinc-400 text-center sm:text-left">
            Showing <span className="font-semibold text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>–
            <span className="font-semibold text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedTrips.length)}</span> of{" "}
            <span className="font-semibold text-white">{filteredAndSortedTrips.length}</span> trips
          </Typography>

          <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs px-3.5 h-9 rounded-xl border-border bg-secondary/80 hover:bg-zinc-800 active:scale-95 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </Button>

            <span className="shrink-0 flex items-center justify-center px-3.5 h-9 rounded-xl bg-secondary border border-border text-xs font-bold text-white shadow-inner">
              {currentPage} <span className="text-zinc-500 font-normal mx-1">/</span> {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs px-3.5 h-9 rounded-xl border-border bg-secondary/80 hover:bg-zinc-800 active:scale-95 disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Reusable Custom Confirmation Modal */}
      <ConfirmDialog
        isOpen={tripToDelete !== null}
        onClose={() => setTripToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        title="Remove Trip Itinerary?"
        description="Are you sure you want to delete this trip from your history? This action cannot be undone."
        confirmText="Yes, Delete Trip"
        cancelText="Keep Trip"
        variant="destructive"
      />
    </div>
  );
}

export default function TripsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="relative flex-1 px-4 py-8 pb-24 sm:pb-8 sm:px-6 lg:px-8">
        {/* Ambient Top Glow Orbs */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-80 w-full max-w-4xl bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_60%)]" />

        <Suspense
          fallback={
            <div className="mx-auto max-w-5xl py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
            </div>
          }
        >
          <TripsContent />
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Native App Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}
