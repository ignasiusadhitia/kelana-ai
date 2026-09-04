"use client";

import Link from "next/link";
import { Compass, Home, Map, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * CUSTOM 404 NOT FOUND PAGE
 * Displayed when users navigate to a non-existent URL or deleted itinerary.
 * Matches 100% of the KelanaAI dark mode design system, ambient glow, and vector aesthetics.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Viewport */}
      <main className="relative flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        {/* Ambient Top & Center Glow Orbs */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-full max-w-3xl bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_70%)]" />

        <div className="relative mx-auto w-full max-w-lg text-center">
          <Card className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/60 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl">
            {/* Top Accent Gradient Border Glow */}
            <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

            {/* Center Compass Icon Beacon */}
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-950/40 text-blue-400 shadow-xl shadow-blue-500/10">
              <div className="absolute inset-0 rounded-2xl bg-blue-500/20 animate-ping opacity-20 duration-1000" />
              <Compass className="w-10 h-10 animate-[spin_12s_linear_infinite]" />
            </div>

            {/* 404 Numerical Kick Tag */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-300 mb-3">
              404 • Page Not Found
            </span>

            {/* Main Headline */}
            <Typography variant="h1" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Route Not Found
            </Typography>

            {/* Subtitle Message */}
            <Typography variant="muted" as="p" className="mt-3 text-xs sm:text-sm text-zinc-300 max-w-sm mx-auto leading-relaxed">
              The page or travel route you are looking for does not exist, has expired, or the link entered is incorrect.
            </Typography>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="default" size="default" className="w-full sm:w-auto gap-2 px-5 active:scale-95 shadow-md font-semibold">
                  <Home className="w-4 h-4" />
                  <span>Trip Planner</span>
                </Button>
              </Link>

              <Link href="/trips" className="w-full sm:w-auto">
                <Button variant="outline" size="default" className="w-full sm:w-auto gap-2 px-5 active:scale-95">
                  <Map className="w-4 h-4" />
                  <span>Trip History</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>

              <Link href="/chat" className="w-full sm:w-auto">
                <Button variant="ghost" size="default" className="w-full sm:w-auto gap-2 px-4 text-zinc-400 hover:text-white active:scale-95">
                  <span>Ask AI</span>
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
