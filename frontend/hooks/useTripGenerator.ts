import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TripRequest, TripResponse, TripSummaryInfo } from "@/types/trip";
import { createTripService } from "@/services/tripService";
import { toast } from "@/components/ui/toast";
import { tripKeys } from "@/lib/queryKeys";

// PATTERN: Custom Hook + TanStack Query Mutation + LocalStorage Persistence
const STORAGE_KEY = "kelana_saved_trips_v1";

/**
 * Lazy initializer to safely read saved trip history from localStorage on initial render.
 */
function getInitialSavedTrips(): TripResponse[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Custom hook orchestrating trip creation, server state, and local persistence.
 */
export function useTripGenerator() {
  const queryClient = useQueryClient();
  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [summaryInfo, setSummaryInfo] = useState<TripSummaryInfo | null>(null);
  const [savedTrips, setSavedTrips] = useState<TripResponse[]>(getInitialSavedTrips);

  // Helper to persist a newly created trip into browser localStorage
  const persistTrip = (newTrip: TripResponse) => {
    try {
      setSavedTrips((prev) => {
        const filtered = prev.filter((t) => t.id !== newTrip.id);
        const updated = [newTrip, ...filtered].slice(0, 10); // Retain latest 10 plans
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {
      // Storage unavailable or disabled
    }
  };

  // TanStack Query Mutation managing the asynchronous generation lifecycle
  const tripMutation = useMutation({
    mutationFn: (payload: TripRequest) => createTripService(payload),
    onMutate: (variables) => {
      setSummaryInfo({
        destination: variables.destination,
        budget: variables.budget,
      });
      setTrip(null);
    },
    onSuccess: (data) => {
      persistTrip(data);
      // Invalidate trips cache so dashboard is instantly refreshed
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
    },
    retry: 1,
  });

  /**
   * Triggers the trip generation mutation and returns the created TripResponse.
   */
  const generateTrip = async (payload: TripRequest): Promise<TripResponse> => {
    return await tripMutation.mutateAsync(payload);
  };

  /**
   * Loads a previously saved trip into active display.
   */
  const loadSavedTrip = (saved: TripResponse) => {
    setTrip(saved);
    tripMutation.reset();
  };

  /**
   * Removes a saved trip from history and localStorage.
   */
  const deleteSavedTrip = (id: number) => {
    setSavedTrips((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to update localStorage:", e);
      }
      return updated;
    });
    if (trip?.id === id) {
      setTrip(null);
    }
    toast.info("Removed trip from quick history.", { title: "Quick History" });
  };

  /**
   * Resets active trip view and mutation state.
   */
  const resetTrip = () => {
    setTrip(null);
    tripMutation.reset();
  };

  // Normalized human-readable error message
  const rawErrorMessage = tripMutation.error
    ? tripMutation.error instanceof Error
      ? tripMutation.error.message
      : "We encountered an issue preparing your travel plan. Please check your connection and try again."
    : null;

  const errorMessage = rawErrorMessage
    ? rawErrorMessage.toLowerCase().includes("bearer") ||
      rawErrorMessage.toLowerCase().includes("authentication") ||
      rawErrorMessage.toLowerCase().includes("401")
      ? "Authentication required. Please sign in or create an account to generate itineraries."
      : rawErrorMessage
    : null;

  return {
    trip,
    isLoading: tripMutation.isPending,
    error: errorMessage,
    summaryInfo,
    savedTrips,
    generateTrip,
    loadSavedTrip,
    deleteSavedTrip,
    resetTrip,
  };
}
