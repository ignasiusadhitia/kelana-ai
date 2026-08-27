"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Map } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Logo } from "@/components/Logo";

/**
 * COMPONENT: Navbar
 * Adaptive navigation bar optimized for both desktop and mobile app viewports.
 * On mobile, keeps the header clean and uncluttered, leaving primary tab switching to MobileBottomNav.
 */

interface NavbarProps {
  onPlanTrip?: () => void;
}

export function Navbar({ onPlanTrip }: NavbarProps) {
  const pathname = usePathname();

  const handlePlanClick = () => {
    if (onPlanTrip) {
      onPlanTrip();
    }
    const el = document.getElementById("planner");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isHome = pathname === "/";
  const isTrips = pathname.startsWith("/trips");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between py-2.5 sm:py-3.5">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group text-left transition-opacity hover:opacity-90 active:scale-95"
        >
          <Logo size={28} className="transition-transform group-hover:scale-105" />
          <div className="flex items-center gap-2">
            <Typography as="span" className="text-base font-extrabold tracking-tight text-white">
              Kelana<span className="text-blue-400">AI</span>
            </Typography>
            <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
              Planner
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Hidden on Mobile, handled by MobileBottomNav) */}
        <nav className="hidden sm:flex items-center gap-5 md:gap-6">
          <Link
            href="/"
            onClick={isHome ? handlePlanClick : undefined}
            className={`text-xs font-medium transition-colors ${
              isHome
                ? "text-white font-semibold"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Trip Planner
          </Link>

          <Link
            href="/trips"
            className={`text-xs font-medium transition-colors ${
              isTrips
                ? "text-white font-semibold"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            My Trips
          </Link>

          <Link
            href="/"
            onClick={handlePlanClick}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-hover active:scale-95"
          >
            <span>Plan Trip</span>
            <span className="text-[10px]">→</span>
          </Link>
        </nav>

        {/* Mobile Quick Action Pill (Compact Header Action) */}
        <div className="flex sm:hidden items-center gap-2">
          {isHome ? (
            <Link
              href="/trips"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-secondary/80 px-3 py-1 text-xs font-medium text-zinc-300 active:scale-95"
            >
              <Map className="w-3.5 h-3.5 text-blue-400" />
              <span>Trips</span>
            </Link>
          ) : (
            <Link
              href="/"
              onClick={handlePlanClick}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 border border-primary/40 px-3 py-1 text-xs font-semibold text-blue-300 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>New Plan</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
