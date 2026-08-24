import { TripRequest, TripResponse } from "@/types/trip";
import { API_ENDPOINTS } from "@/constants/trip";

/**
 * SERVICE LAYER: HTTP Service to interact with internal Next.js API Routes.
 * Isolates data fetching and error normalization from UI components.
 */

/**
 * Creates a trip record and triggers itinerary generation.
 * @param payload TripRequest parameters including destination, duration, budget, and travel style.
 * @returns Promise resolving to the created TripResponse.
 * @throws Error with descriptive error detail on failure.
 */
export async function createTripService(
  payload: TripRequest
): Promise<TripResponse> {
  const response = await fetch(API_ENDPOINTS.TRIPS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error (${response.status})`);
  }

  return response.json();
}
