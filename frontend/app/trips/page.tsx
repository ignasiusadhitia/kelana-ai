"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import {
  Plus,
  Search,
  AlertTriangle,
  RotateCcw,
  Map,
  Trash2,
} from "lucide-react";

import {
  getTrips,
  deleteTripService,
  restoreTripService,
  permanentDeleteTripService,
} from "@/services/tripService";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { TripCard } from "@/components/TripCard";
import { EmptyState } from "@/components/EmptyState";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/hooks/useAuth";
import { tripKeys } from "@/lib/queryKeys";
import { TripResponse } from "@/types/trip";

import { TripFiltersToolbar, SortOption } from "@/components/trips/TripFiltersToolbar";
import { TripPagination } from "@/components/trips/TripPagination";
import { TripSkeletonGrid } from "@/components/trips/TripSkeletonGrid";
import { UnauthenticatedTripsPrompt } from "@/components/trips/UnauthenticatedTripsPrompt";

// Lazy-load confirmation dialog
const ConfirmDialog = dynamic(
  () => import("@/components/ui/confirm-dialog").then((mod) => mod.ConfirmDialog),
  { ssr: false }
);

const ITEMS_PER_PAGE = 9;

function TripsContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const highlightParam = searchParams.get("highlight");
  const initialHighlightId = highlightParam ? Number(highlightParam) : null;

  const [viewTab, setViewTab] = useState<"active" | "trash">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 200);
  const [selectedStyle, setSelectedStyle] = useState<string>("ALL");
  const [sortMode, setSortMode] = useState<SortOption>("latest");
  const [currentPage, setCurrentPage] = useState(1);

  const [tripToSoftDelete, setTripToSoftDelete] = useState<number | null>(null);
  const [tripToPermanentDelete, setTripToPermanentDelete] = useState<number | null>(null);
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

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Route Protection: Automatically redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login?redirect=/trips");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Fetch active trips
  const {
    data: activeTrips = [],
    isLoading: isActiveLoading,
    isError: isActiveError,
    error: activeError,
    refetch: refetchActive,
  } = useQuery({
    queryKey: tripKeys.lists(),
    queryFn: () => getTrips("active"),
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  });

  // Fetch trash trips
  const {
    data: trashTrips = [],
    isLoading: isTrashLoading,
    isError: isTrashError,
    error: trashError,
    refetch: refetchTrash,
  } = useQuery({
    queryKey: ["trips", "trash"],
    queryFn: () => getTrips("trash"),
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  });

  const displayedTrips = viewTab === "active" ? activeTrips : trashTrips;
  const isLoading = viewTab === "active" ? isActiveLoading : isTrashLoading;
  const isError = viewTab === "active" ? isActiveError : isTrashError;
  const currentError = viewTab === "active" ? activeError : trashError;

  // Soft Delete Mutation (Move to Trash)
  const softDeleteMutation = useMutation({
    mutationFn: (id: number) => deleteTripService(id),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: tripKeys.lists() });
      const previousActive = queryClient.getQueryData<TripResponse[]>(tripKeys.lists()) || [];

      queryClient.setQueryData<TripResponse[]>(tripKeys.lists(), (old) =>
        old ? old.filter((t) => t.id !== id) : []
      );

      return { previousActive };
    },
    onError: (err, _id, context) => {
      if (context?.previousActive) {
        queryClient.setQueryData(tripKeys.lists(), context.previousActive);
      }
      toast.error(
        err instanceof Error ? err.message : "Failed to move trip to trash.",
        { title: "Action Failed" }
      );
    },
    onSuccess: () => {
      toast.info("Trip moved to Trash. You can restore it anytime from the Trash tab.", {
        title: "Moved to Trash",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      queryClient.invalidateQueries({ queryKey: ["trips", "trash"] });
    },
  });

  // Restore Trip Mutation
  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreTripService(id),
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to restore trip.",
        { title: "Restore Failed" }
      );
    },
    onSuccess: (restoredTrip) => {
      toast.success(`Trip to ${restoredTrip.destination} restored successfully!`, {
        title: "Trip Restored",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      queryClient.invalidateQueries({ queryKey: ["trips", "trash"] });
    },
  });

  // Permanent Delete Mutation (Hard Delete)
  const permanentDeleteMutation = useMutation({
    mutationFn: (id: number) => permanentDeleteTripService(id),
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to permanently delete trip.",
        { title: "Delete Failed" }
      );
    },
    onSuccess: () => {
      toast.success("Trip permanently deleted from database.", {
        title: "Permanently Deleted",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      queryClient.invalidateQueries({ queryKey: ["trips", "trash"] });
    },
  });

  const handleConfirmSoftDelete = () => {
    if (tripToSoftDelete !== null) {
      softDeleteMutation.mutate(tripToSoftDelete, {
        onSettled: () => setTripToSoftDelete(null),
      });
    }
  };

  const handleConfirmPermanentDelete = () => {
    if (tripToPermanentDelete !== null) {
      permanentDeleteMutation.mutate(tripToPermanentDelete, {
        onSettled: () => setTripToPermanentDelete(null),
      });
    }
  };

  // Extract unique travel styles for filter pills
  const availableStyles = useMemo(() => {
    const styles = new Set<string>();
    displayedTrips.forEach((t) => {
      styles.add(t.travel_style || "Solo");
    });
    return Array.from(styles);
  }, [displayedTrips]);

  // Filter and sort computation
  const filteredAndSortedTrips = useMemo(() => {
    let result = [...displayedTrips];

    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.destination.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.travel_style || "Solo").toLowerCase().includes(q)
      );
    }

    if (selectedStyle !== "ALL") {
      result = result.filter((t) => (t.travel_style || "Solo") === selectedStyle);
    }

    result.sort((a, b) => {
      if (sortMode === "latest") return b.id - a.id;
      if (sortMode === "oldest") return a.id - b.id;
      if (sortMode === "highest-budget") return Number(b.budget) - Number(a.budget);
      if (sortMode === "lowest-budget") return Number(a.budget) - Number(b.budget);
      return 0;
    });

    return result;
  }, [displayedTrips, debouncedSearchQuery, selectedStyle, sortMode]);

  const totalPages = Math.ceil(filteredAndSortedTrips.length / ITEMS_PER_PAGE) || 1;
  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTrips.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedTrips, currentPage]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStyleChange = (style: string) => {
    setSelectedStyle(style);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: "active" | "trash") => {
    setViewTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="relative mx-auto max-w-5xl space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Typography variant="h1">
              {viewTab === "active" ? "Trip History" : "Trash Bin"}
            </Typography>
            {!isLoading && (
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  viewTab === "trash"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    : "border-primary/30 bg-primary/10 text-primary"
                }`}
              >
                {displayedTrips.length}{" "}
                {displayedTrips.length === 1 ? "Trip" : "Trips"}
              </span>
            )}
          </div>
          <Typography variant="muted" className="mt-1">
            {viewTab === "active"
              ? "Browse, manage, and explore your saved travel itineraries."
              : "Review soft-deleted itineraries. You can restore them or delete permanently."}
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          {/* Active / Trash Navigation Pills */}
          <div className="inline-flex rounded-xl border border-white/10 bg-zinc-900/80 p-1 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => handleTabChange("active")}
              className={`cursor-pointer inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                viewTab === "active"
                  ? "bg-primary text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Active</span>
              {activeTrips.length > 0 && (
                <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                  {activeTrips.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("trash")}
              className={`cursor-pointer inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                viewTab === "trash"
                  ? "bg-amber-500 text-black font-extrabold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Trash</span>
              {trashTrips.length > 0 && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                    viewTab === "trash" ? "bg-black/20 text-black" : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {trashTrips.length}
                </span>
              )}
            </button>
          </div>

          <Link href="/">
            <Button variant="default" size="sm" className="gap-1.5 shadow-sm active:scale-95">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Plan New Trip</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Interactive Search & Filters Toolbar */}
      {isAuthenticated && displayedTrips.length > 0 && (
        <TripFiltersToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          sortMode={sortMode}
          onSortChange={setSortMode}
          selectedStyle={selectedStyle}
          onStyleChange={handleStyleChange}
          availableStyles={availableStyles}
          totalTripsCount={displayedTrips.length}
        />
      )}

      {/* 3. Loading Skeleton Grid */}
      {isLoading && <TripSkeletonGrid />}

      {/* 4. Unauthenticated State */}
      {!isAuthLoading && !isAuthenticated && <UnauthenticatedTripsPrompt />}

      {/* 5. Error State */}
      {isAuthenticated && isError && !isLoading && (
        <Card className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-card/40 p-8 sm:p-12 text-center backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(239,68,68,0.08),transparent_70%)]" />
          <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-950/40 text-red-400 shadow-inner">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <Typography variant="h3" className="font-bold text-white">
            Failed to Load Trips
          </Typography>

          <Typography variant="muted" as="p" className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            {currentError instanceof Error ? currentError.message : "Unable to connect to database."}
          </Typography>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => (viewTab === "active" ? refetchActive() : refetchTrash())}
              className="gap-2 px-5 shadow-sm active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </Button>
          </div>
        </Card>
      )}

      {/* 6. Empty State (No trips at all in current tab) */}
      {!isLoading && !isError && isAuthenticated && displayedTrips.length === 0 && (
        viewTab === "active" ? (
          <EmptyState
            title="No trips saved yet."
            description="Plan your first trip on the homepage to start building your travel history."
            actionText="Plan a Trip"
            actionHref="/"
          />
        ) : (
          <Card className="flex flex-col items-center justify-center p-8 sm:p-12 text-center border-dashed border-white/10 bg-zinc-900/30 rounded-3xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-zinc-800/60 text-zinc-400 shadow-inner mb-3">
              <Trash2 className="w-6 h-6 text-zinc-500" />
            </div>
            <Typography variant="h3" className="text-white">
              Trash Bin is Empty
            </Typography>
            <Typography variant="muted" as="p" className="mt-1.5 max-w-sm text-zinc-400 text-xs">
              No soft-deleted itineraries found in trash. Deleted trips will be kept here safely until permanently erased.
            </Typography>
            <div className="mt-5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setViewTab("active")}
                className="gap-1.5 px-4 text-xs font-semibold"
              >
                <Map className="w-3.5 h-3.5 text-blue-400" />
                <span>Return to Active Trips</span>
              </Button>
            </div>
          </Card>
        )
      )}

      {/* 7. Empty Search State */}
      {!isLoading && !isError && displayedTrips.length > 0 && filteredAndSortedTrips.length === 0 && (
        <Card className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-zinc-800/60 text-zinc-400 shadow-inner mb-3">
            <Search className="w-6 h-6" />
          </div>
          <Typography variant="h3" className="text-white">
            No matching trips found
          </Typography>
          <Typography variant="muted" as="p" className="mt-1.5 max-w-sm text-zinc-400 text-xs">
            No itinerary matched &ldquo;{searchQuery}&rdquo;. Try clearing your search keyword.
          </Typography>
          <div className="mt-5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedStyle("ALL");
              }}
              className="px-5 shadow-sm active:scale-95 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        </Card>
      )}

      {/* 8. Trip Cards Grid */}
      {!isLoading && !isError && paginatedTrips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              mode={viewTab}
              onDelete={setTripToSoftDelete}
              onRestore={(id) => restoreMutation.mutate(id)}
              onPermanentDelete={setTripToPermanentDelete}
              isHighlighted={trip.id === activeHighlightId}
            />
          ))}
        </div>
      )}

      {/* 9. Pagination Controls */}
      {!isLoading && !isError && (
        <TripPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalFilteredCount={filteredAndSortedTrips.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      )}

      {/* 10. Modal Dialog: Soft Delete (Move to Trash) */}
      <ConfirmDialog
        isOpen={tripToSoftDelete !== null}
        onClose={() => setTripToSoftDelete(null)}
        onConfirm={handleConfirmSoftDelete}
        isLoading={softDeleteMutation.isPending}
        title="Move Itinerary to Trash?"
        description="This itinerary will be moved to the Trash bin. You can restore it back to your active list at any time."
        confirmText="Move to Trash"
        cancelText="Keep Trip"
        variant="destructive"
        icon={<Trash2 className="w-5 h-5 text-amber-400" />}
      />

      {/* 11. Modal Dialog: Permanent Delete (Hard Delete) */}
      <ConfirmDialog
        isOpen={tripToPermanentDelete !== null}
        onClose={() => setTripToPermanentDelete(null)}
        onConfirm={handleConfirmPermanentDelete}
        isLoading={permanentDeleteMutation.isPending}
        title="Permanently Delete Trip?"
        description="This action is irreversible and cannot be undone. This itinerary and all AI recommendations will be permanently erased from the database."
        confirmText="Yes, Delete Forever"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}

export default function TripsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main className="relative flex-1 px-4 py-8 pb-24 sm:pb-8 sm:px-6 lg:px-8">
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

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
