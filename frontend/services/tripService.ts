import { TripRequest, TripResponse } from "@/types/trip";
import { API_ENDPOINTS } from "@/constants/trip";

/**
 * SERVICE LAYER: Centralized HTTP Service for trip data operations.
 * Isolates data fetching, error normalization, and network requests from UI components.
 * Follows DB-First Read patterns (PostgreSQL reads are fast and free; AI Bedrock is invoked only on generation).
 */

/**
 * Retrieves all saved trips from the persistent database.
 * @returns Promise resolving to an array of TripResponse objects.
 */
export async function getTrips(): Promise<TripResponse[]> {
  const response = await fetch(API_ENDPOINTS.TRIPS, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to fetch trips (${response.status})`
    );
  }

  return response.json();
}

/**
 * Retrieves a single trip with full itinerary details by its numeric ID.
 * @param id The unique trip identifier.
 * @returns Promise resolving to the requested TripResponse.
 */
export async function getTrip(id: number): Promise<TripResponse> {
  const response = await fetch(`${API_ENDPOINTS.TRIPS}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Trip with id ${id} not found (${response.status})`
    );
  }

  return response.json();
}

/**
 * Creates a new trip and triggers AI itinerary generation.
 * @param payload TripRequest parameters (destination, duration, budget, travel style).
 * @returns Promise resolving to the created TripResponse.
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

/**
 * Updates the total budget for an existing trip in PostgreSQL and recalculates limits.
 * @param id The unique trip identifier.
 * @param budget The new positive numeric budget.
 * @returns Promise resolving to the updated TripResponse.
 */
export async function updateTripBudget(
  id: number,
  budget: number
): Promise<TripResponse> {
  const response = await fetch(`${API_ENDPOINTS.TRIPS}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ budget }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to update budget (${response.status})`
    );
  }

  return response.json();
}

/**
 * Regenerates AI itinerary for an existing trip via Amazon Bedrock and saves to PostgreSQL.
 * @param id The unique trip identifier.
 * @returns Promise resolving to the regenerated itinerary data.
 */
export async function regenerateTripAi(
  id: number
): Promise<{ trip_id: number; destination: string; recommendation: string }> {
  const response = await fetch(`${API_ENDPOINTS.TRIPS}/${id}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to regenerate itinerary (${response.status})`
    );
  }

  return response.json();
}

/**
 * Deletes a trip by ID from the database.
 * @param id The unique trip identifier.
 */
export async function deleteTripService(id: number): Promise<void> {
  const response = await fetch(`${API_ENDPOINTS.TRIPS}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to delete trip (${response.status})`
    );
  }
}
