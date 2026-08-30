export function TripSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-44 rounded-3xl border border-white/10 bg-card/40 animate-pulse p-5"
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
        </div>
      ))}
    </div>
  );
}
