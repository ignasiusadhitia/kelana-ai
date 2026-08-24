/**
 * CONSTANTS: Application-wide Trip Constants & Defaults
 */

export interface TravelStyleOption {
  id: string;
  label: string;
  icon: string;
  description?: string;
}

// Preset travel styles available for one-click selection
export const TRAVEL_STYLE_OPTIONS: TravelStyleOption[] = [
  { id: "Backpacker", label: "Backpacker", icon: "🎒", description: "Budget & Transit" },
  { id: "Solo", label: "Solo", icon: "🧭", description: "Flexible & Cultural" },
  { id: "Family", label: "Family", icon: "👨‍👩‍👧", description: "Relaxed & Kid-friendly" },
  { id: "Luxury", label: "Luxury", icon: "👑", description: "5-Star & Premium" },
  { id: "Adventure", label: "Adventure", icon: "🌿", description: "Outdoor & Nature" },
  { id: "Romantic", label: "Romantic", icon: "✨", description: "Couples & Scenic" },
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
