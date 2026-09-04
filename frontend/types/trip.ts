/**
 * SEPARATION OF CONCERNS: Domain Type Definitions
 * Typed contracts matching backend Pydantic DTOs and frontend entities.
 */

/**
 * Payload contract sent when requesting a new trip itinerary.
 */
export interface TripRequest {
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
  ai_recommendation?: string;
}

/**
 * Full trip data entity returned by the backend API and PostgreSQL.
 */
export interface TripResponse {
  id: number;
  destination: string;
  days: number;
  budget: number;
  category: string;
  daily_budget: number;
  created_at: string;
  deleted_at?: string | null;
  travel_style?: string | null;
  ai_recommendation?: string | null;
}

/**
 * Lightweight summary information displayed during loading and error states.
 */
export interface TripSummaryInfo {
  destination: string;
  budget: number | string;
}
