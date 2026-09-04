import { z } from "zod";

// PATTERN: Schema-First Validation using Zod
// RULE: Trip duration is strictly capped at 14 days for optimal itinerary depth and LLM token constraints.
export const tripFormSchema = z.object({
  destination: z
    .string()
    .min(2, "Destination must be at least 2 characters")
    .max(100, "Destination must be less than 100 characters"),
  budget: z
    .number({ message: "Please enter a valid budget amount" })
    .positive("Budget must be greater than 0")
    .max(1_000_000, "Budget cannot exceed USD 1,000,000"),
  days: z
    .number({ message: "Please enter trip duration in days" })
    .int("Days must be an integer")
    .min(1, "Duration must be at least 1 day")
    .max(14, "Maximum duration is 14 days per curated guide"),
  travel_style: z
    .string()
    .min(2, "Please select or type a travel style")
    .max(50, "Travel style must be less than 50 characters"),
  ai_recommendation: z.string().optional(),
});

// TypeScript type inferred directly from the validation schema
export type TripFormValues = z.infer<typeof tripFormSchema>;
