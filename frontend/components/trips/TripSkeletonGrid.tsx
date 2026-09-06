/**
 * COMPONENT: TripSkeletonGrid & TripCardSkeleton
 * Shimmering skeleton cards displayed while itineraries are being loaded or fetched.
 */
export function TripCardSkeleton({
  isHighlighted = false,
}: {
  isHighlighted?: boolean;
}) {
  return (
    <div
      className={`h-44 rounded-3xl border bg-card/40 animate-pulse p-5 transition-all ${
        isHighlighted
          ? "border-blue-500/40 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20"
          : "border-white/10"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-zinc-800" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-28 rounded bg-zinc-800" />
          <div className="h-3 w-20 rounded bg-zinc-800/60" />
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        <div className="h-5 w-16 rounded-full bg-zinc-800" />
        <div className="h-5 w-20 rounded-full bg-zinc-800" />
      </div>
      <div className="mt-4 pt-3 border-t border-border/40 flex justify-end">
        <div className="h-4 w-20 rounded bg-zinc-800/60" />
      </div>
    </div>
  );
}

/**
 * Skeleton loading placeholder grid rendering pulse placeholder cards
 * while trips are fetched from the API.
 */
export function TripSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <TripCardSkeleton key={i} />
      ))}
    </div>
  );
}
