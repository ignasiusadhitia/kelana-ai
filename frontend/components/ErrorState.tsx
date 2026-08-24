import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

/**
 * COMPONENT: ErrorState
 * Graceful error view presented when network or AI generation requests fail.
 * Utilizes atomic Typography and Button UI primitives.
 */

interface ErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export function ErrorState({
  onRetry,
  message = "We encountered an issue preparing your travel plan. Please check your connection and try again.",
}: ErrorStateProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-destructive/30 bg-gradient-to-b from-red-950/30 via-zinc-900/90 to-zinc-950 p-8 sm:p-10 text-center text-white shadow-2xl backdrop-blur-xl">
      {/* Ambient Red Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.15),transparent_70%)]" />

      {/* Warning Icon */}
      <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/30 shadow-lg shadow-red-500/10">
        <svg
          className="h-8 w-8 text-red-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 7.5h.008v.008H12v-.008z"
          />
        </svg>
      </div>

      <Typography variant="h2" className="text-white">
        Unable to Complete Travel Plan
      </Typography>
      <Typography variant="lead" className="mt-2 text-zinc-300 max-w-md mx-auto block">
        {message}
      </Typography>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          variant="destructive"
          onClick={onRetry}
        >
          <span>🔄</span>
          <span>Try Again</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={onRetry}
        >
          <span>✏️</span>
          <span>Edit Parameters</span>
        </Button>
      </div>
    </div>
  );
}
