"use client";

/**
 * PAGE: Global Error Boundary (500 Root Level)
 * Catches unhandled exceptions that occur within the root layout or root providers.
 * Defines its own <html> and <body> elements as required by Next.js App Router.
 */

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 font-sans p-4 antialiased selection:bg-blue-600 selection:text-white">
        {/* Ambient Radial Background Glow */}
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
          <div className="h-96 w-96 max-w-full rounded-full bg-red-600/10 blur-[120px]" />
          <div className="h-80 w-80 max-w-full rounded-full bg-blue-600/10 blur-[140px]" />
        </div>

        <div className="relative w-full max-w-md text-center">
          <div className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-zinc-900/80 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
            {/* Ambient Corner Glows */}
            <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-red-500/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />

            {/* Icon Beacon */}
            <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-950/50 text-red-400 shadow-xl shadow-red-500/10">
              <div className="absolute inset-0 rounded-2xl bg-red-500/20 animate-ping opacity-25 duration-1000" />
              <AlertOctagon className="w-8 h-8" />
            </div>

            {/* Badge Tag */}
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-300">
              <span>500 • Critical System Error</span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Critical System Error
            </h1>

            {/* Description */}
            <p className="mt-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-sm mx-auto">
              The application encountered an unexpected internal error within the root layout. Please try reloading or return to the homepage.
            </p>

            {error?.digest && (
              <p className="mt-3 text-[11px] font-mono text-zinc-500 truncate bg-zinc-950/60 py-1 px-2.5 rounded-lg border border-white/5">
                Ref: {error.digest}
              </p>
            )}

            {/* Action Buttons */}
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => reset()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-800/70 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold px-5 py-2.5 transition-all active:scale-95"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Homepage</span>
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
