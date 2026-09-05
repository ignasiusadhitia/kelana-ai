/**
 * SERVICE LAYER: Centralized HTTP Service for Trip Data Operations.
 * Manages trip generation, retrieval, updates, and soft/hard deletion flows.
 */

import { TripRequest, TripResponse } from "@/types/trip";
import { API_ENDPOINTS } from "@/constants/trip";

function getAuthHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
  };
}

/**
 * Retrieves saved trips belonging to the authenticated user.
 * Supports status="active" (default) and status="trash".
 */
export async function getTrips(
  statusOrContext?: "active" | "trash" | unknown
): Promise<TripResponse[]> {
  const status =
    typeof statusOrContext === "string" && (statusOrContext === "active" || statusOrContext === "trash")
      ? statusOrContext
      : "active";
  const url = `${API_ENDPOINTS.TRIPS}?status=${encodeURIComponent(status)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
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
 * Retrieves a single trip with full itinerary details by ID with ownership verification.
 */
export async function getTrip(id: string | number): Promise<TripResponse> {
  const response = await fetch(`${API_ENDPOINTS.TRIPS}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
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
 * Creates a new trip bound to the authenticated user and triggers AI itinerary generation.
 */
export async function createTripService(
  payload: TripRequest
): Promise<TripResponse> {
  const response = await fetch(API_ENDPOINTS.TRIPS, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error (${response.status})`);
  }

  return response.json();
}

/**
 * Updates the total budget for an existing trip with ownership validation.
 */
export async function updateTripBudget(
  id: string | number,
  budget: number
): Promise<TripResponse> {
  const response = await fetch(`${API_ENDPOINTS.TRIPS}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
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
 * Regenerates AI itinerary for an existing trip with ownership validation.
 */
export async function regenerateTripAi(
  id: string | number
): Promise<{ trip_id: string; destination: string; recommendation: string }> {
  const response = await fetch(`${API_ENDPOINTS.TRIPS}/${id}/generate`, {
    method: "POST",
    headers: getAuthHeaders(),
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
 * Applies a new AI itinerary text to an existing trip Blueprint without touching
 * destination, days, budget, or travel style (Chat-to-Blueprint promotion — Kasus A).
 */
export async function updateTripRecommendation(
  id: string | number,
  aiRecommendation: string
): Promise<TripResponse> {
  const response = await fetch(`${API_ENDPOINTS.TRIPS}/${id}/recommendation`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ai_recommendation: aiRecommendation }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to apply itinerary to Blueprint (${response.status})`
    );
  }

  return response.json();
}

/**
 * Soft-deletes a trip by ID (moves to trash bin).
 */
export async function deleteTripService(id: string | number): Promise<void> {
  const response = await fetch(`${API_ENDPOINTS.TRIPS}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to delete trip (${response.status})`
    );
  }
}

/**
 * Restores a soft-deleted trip back to the active dashboard.
 */
export async function restoreTripService(id: string | number): Promise<TripResponse> {
  const response = await fetch(`${API_ENDPOINTS.TRIPS}/${id}/restore`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to restore trip (${response.status})`
    );
  }

  return response.json();
}

/**
 * Permanently deletes a trip from the database (irreversible hard delete).
 */
export async function permanentDeleteTripService(id: string | number): Promise<void> {
  const response = await fetch(`${API_ENDPOINTS.TRIPS}/${id}/permanent`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to permanently delete trip (${response.status})`
    );
  }
}
