"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Compass, Sparkles, Map } from "lucide-react";

/**
 * COMPONENT: MobileBottomNav
 * Native App-style Bottom Navigation Bar for mobile viewports (< 640px).
 * Features 100% Lucide vector icons, thumb-friendly one-hand navigation,
 * frosted glass blur, safe-area insets, and active status indicators.
 */

interface MobileBottomNavProps {
  onPlanTrip?: () => void;
}

export function MobileBottomNav({ onPlanTrip }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === "/";
  const isTrips = pathname.startsWith("/trips");

  const handlePlanClick = (e: React.MouseEvent) => {
    if (isHome) {
      e.preventDefault();
      onPlanTrip?.();
      const el = document.getElementById("planner");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push("/");
    }
  };

  return (
    <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 pb-safe">
      {/* Frosted Glass Container with Ambient Edge Border */}
      <div className="mx-auto flex max-w-lg items-center justify-around border-t border-white/10 bg-zinc-950/85 px-3 py-2 backdrop-blur-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
        {/* Tab 1: Trip Planner */}
        <Link
          href="/"
          onClick={handlePlanClick}
          className={`flex flex-1 flex-col items-center gap-1 py-1 text-center transition-transform active:scale-90 ${
            isHome ? "text-primary font-semibold" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <div
            className={`flex h-7 w-12 items-center justify-center rounded-full transition-all ${
              isHome
                ? "bg-primary/20 text-blue-400 ring-1 ring-primary/40 shadow-sm"
                : "bg-transparent text-zinc-400"
            }`}
          >
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight">Planner</span>
        </Link>

        {/* Center Quick Action: New Plan FAB */}
        <button
          type="button"
          onClick={handlePlanClick}
          className="group relative -top-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/40 ring-4 ring-zinc-950 transition-transform active:scale-90"
          aria-label="Create new travel plan"
        >
          <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-45" />
        </button>

        {/* Tab 2: Trip History Dashboard */}
        <Link
          href="/trips"
          className={`flex flex-1 flex-col items-center gap-1 py-1 text-center transition-transform active:scale-90 ${
            isTrips ? "text-primary font-semibold" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <div
            className={`flex h-7 w-12 items-center justify-center rounded-full transition-all ${
              isTrips
                ? "bg-primary/20 text-blue-400 ring-1 ring-primary/40 shadow-sm"
                : "bg-transparent text-zinc-400"
            }`}
          >
            <Map className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight">My Trips</span>
        </Link>
      </div>
    </div>
  );
}
