"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, Compass, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Button, buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

/**
 * Progressive Web App offline fallback page rendered when network connectivity is lost.
 */
export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Logo & Offline Status Visual */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl">
              <Logo size={48} />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <WifiOff className="w-4 h-4" />
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <WifiOff className="w-3.5 h-3.5" />
              Offline Mode Active
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              No Internet Connection
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
              KelanaAI is operating in offline mode. Content and itineraries you
              previously loaded in this session remain accessible. Reconnect to
              generate new trips or chat with AI travel assistants.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={handleReload}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Try Reconnecting
            </Button>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full sm:w-auto inline-flex items-center justify-center gap-2 border-zinc-800 hover:bg-zinc-800/60 text-zinc-300"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* Offline Tips Box */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-left text-xs text-zinc-400 space-y-2">
            <div className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              Offline Capabilities
            </div>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li>Review cached day-by-day itineraries and budget summaries.</li>
              <li>Read saved travel recommendations and local tips.</li>
              <li>New AI generations require an active internet connection.</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
