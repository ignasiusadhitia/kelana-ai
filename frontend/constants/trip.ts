/**
 * CONSTANTS: Application-wide Trip Constants & Defaults
 */

export interface TravelStyleOption {
  id: string;
  label: string;
  icon: string;
  iconColor: string;
  description?: string;
}

// 8 Curated preset travel styles + 1 Custom creates a perfect 3x3 grid
export const TRAVEL_STYLE_OPTIONS: TravelStyleOption[] = [
  { id: "Backpacker", label: "Backpacker", icon: "backpack", iconColor: "text-orange-400", description: "Budget & Transit" },
  { id: "Solo", label: "Solo", icon: "compass", iconColor: "text-blue-400", description: "Flexible & Cultural" },
  { id: "Family", label: "Family", icon: "users", iconColor: "text-teal-400", description: "Relaxed & Kid-friendly" },
  { id: "Couple", label: "Couple", icon: "heart", iconColor: "text-rose-400", description: "Couples & Scenic" },
  { id: "Luxury", label: "Luxury", icon: "crown", iconColor: "text-amber-400", description: "5-Star & Premium" },
  { id: "Adventure", label: "Adventure", icon: "mountain", iconColor: "text-emerald-400", description: "Outdoor & Nature" },
  { id: "Culinary", label: "Culinary", icon: "utensils", iconColor: "text-amber-500", description: "Street Food & Dining" },
  { id: "Wellness", label: "Wellness", icon: "flower2", iconColor: "text-indigo-400", description: "Spa & Relaxation" },
];

// Default initial state values for the travel form
export const DEFAULT_TRIP_VALUES = {
  destination: "",
  budget: "",
  days: "",
  travel_style: "Family",
};

// Internal API route endpoints
export const API_ENDPOINTS = {
  TRIPS: "/api/v1/trips",
} as const;
