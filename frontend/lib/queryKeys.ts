/**
 * QUERY KEY FACTORY
 * Standardized, type-safe TanStack Query keys across KelanaAI frontend.
 * Eliminates string literal typos and provides surgical cache invalidation.
 */

export const tripKeys = {
  all: ["trips"] as const,
  lists: () => [...tripKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...tripKeys.lists(), filters] as const,
  details: () => [...tripKeys.all, "detail"] as const,
  detail: (id: number) => [...tripKeys.details(), id] as const,
};
