"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * CUSTOM 500 / RUNTIME ERROR BOUNDARY
 * Catches unhandled errors within the route segment and presents a recovery interface.
 * Matches 100% of the KelanaAI dark mode design system, ambient glow, and vector aesthetics.
 */
export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Viewport */}
      <main className="relative flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        {/* Ambient Red Glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-full max-w-3xl bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1),transparent_70%)]" />

        <div className="relative mx-auto w-full max-w-lg text-center">
          <Card className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-card/60 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl">
            {/* Ambient Top Glow */}
            <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-red-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />

            {/* Center Warning Icon Beacon */}
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/30 bg-red-950/40 text-red-400 shadow-xl shadow-red-500/10">
              <div className="absolute inset-0 rounded-2xl bg-red-500/20 animate-ping opacity-20 duration-1000" />
              <AlertTriangle className="w-10 h-10" />
            </div>

            {/* 500 Numerical Kick Tag */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-red-300 mb-3">
              500 • System Error
            </span>

            {/* Main Headline */}
            <Typography variant="h1" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Internal Server Error
            </Typography>

            {/* Subtitle Message */}
            <Typography variant="muted" as="p" className="mt-3 text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
              An unexpected server error occurred while processing this request. Please try reloading the page or return to the homepage.
            </Typography>

            {error?.digest && (
              <div className="mt-4 rounded-xl border border-white/5 bg-zinc-950/70 px-3 py-1.5 text-[11px] font-mono text-zinc-500 max-w-xs mx-auto truncate">
                Digest: {error.digest}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Button
                variant="default"
                size="default"
                onClick={() => reset()}
                className="w-full sm:w-auto gap-2 px-5 active:scale-95 shadow-md font-semibold"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </Button>

              <Link href="/trips" className="w-full sm:w-auto">
                <Button variant="outline" size="default" className="w-full sm:w-auto gap-2 px-5 active:scale-95">
                  <span>View Trip History</span>
                </Button>
              </Link>

              <Link href="/" className="w-full sm:w-auto">
                <Button variant="ghost" size="default" className="w-full sm:w-auto gap-2 px-4 text-zinc-400 hover:text-white active:scale-95">
                  <Home className="w-4 h-4" />
                  <span>Homepage</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile App Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}
