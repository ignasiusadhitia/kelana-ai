import Link from "next/link";
import { AlertTriangle, Lock, LogIn, UserPlus, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

/**
 * COMPONENT: ErrorState (Enhanced with Contextual Auth Gates & 100% Vector Icons)
 * Graceful error view presented when unauthenticated or when network/AI generation fails.
 */

interface ErrorStateProps {
  onRetry: () => void;
  message?: string;
}

/**
 * Error state display offering recovery actions, retry triggers,
 * and contextual login/register gates when encountering authentication rejections.
 */
export function ErrorState({
  onRetry,
  message = "We encountered an issue preparing your travel plan. Please check your connection and try again.",
}: ErrorStateProps) {
  // Determine if error is an authentication guard rejection
  const isAuthError =
    message.toLowerCase().includes("authentication") ||
    message.toLowerCase().includes("bearer") ||
    message.toLowerCase().includes("unauthorized") ||
    message.toLowerCase().includes("credentials") ||
    message.toLowerCase().includes("login") ||
    message.toLowerCase().includes("401");

  if (isAuthError) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-950/30 via-zinc-900/90 to-zinc-950 p-8 sm:p-10 text-center text-white shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
        {/* Ambient Blue Glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.15),transparent_70%)]" />

        {/* Lock Icon */}
        <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/30 shadow-lg shadow-blue-500/10">
          <Lock className="h-8 w-8 text-blue-400" />
        </div>

        <Typography variant="h2" className="text-white text-xl sm:text-2xl font-bold tracking-tight">
          Sign In Required to Generate Itineraries
        </Typography>

        <Typography variant="lead" className="mt-2 text-zinc-300 max-w-md mx-auto block text-sm sm:text-base font-normal">
          Please sign in or create a free account to generate travel itineraries and save them to your dashboard.
        </Typography>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/login">
            <Button
              type="button"
              variant="default"
              className="gap-2 px-5 active:scale-95 shadow-md shadow-blue-500/20 font-semibold"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Button>
          </Link>

          <Link href="/register">
            <Button
              type="button"
              variant="outline"
              className="gap-2 px-5 active:scale-95 border-white/15 hover:bg-white/10"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </Button>
          </Link>

          <Button
            type="button"
            variant="ghost"
            onClick={onRetry}
            className="gap-2 text-zinc-400 hover:text-white"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Edit Parameters</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-destructive/30 bg-gradient-to-b from-red-950/30 via-zinc-900/90 to-zinc-950 p-8 sm:p-10 text-center text-white shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
      {/* Ambient Red Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.15),transparent_70%)]" />

      {/* Warning Icon */}
      <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/30 shadow-lg shadow-red-500/10">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>

      <Typography variant="h2" className="text-white text-xl sm:text-2xl font-bold tracking-tight">
        Unable to Complete Travel Plan
      </Typography>

      <Typography variant="lead" className="mt-2 text-zinc-300 max-w-md mx-auto block text-sm sm:text-base font-normal">
        {message}
      </Typography>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          variant="destructive"
          onClick={onRetry}
          className="gap-2 active:scale-95 shadow-md"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={onRetry}
          className="gap-2 active:scale-95 border border-white/10"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Edit Parameters</span>
        </Button>
      </div>
    </div>
  );
}
