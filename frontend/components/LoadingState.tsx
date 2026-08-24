import { useEffect, useState } from "react";
import { Typography } from "@/components/ui/typography";
import { Logo } from "@/components/Logo";

/**
 * COMPONENT: LoadingState
 * Displays a progressive generation ticker with dynamic phase transitions
 * and the official circular KelanaAI animated compass logo.
 */

const LOADING_STEPS = [
  { icon: "🌍", text: "Scouting neighborhood walking routes & authentic venues..." },
  { icon: "⚡", text: "Calculating optimal daily budget allocations..." },
  { icon: "🗺️", text: "Structuring thematic morning, afternoon, and evening plans..." },
  { icon: "💡", text: "Verifying local transit lines & practical insider tips..." },
  { icon: "✨", text: "Finalizing your bespoke curated travel blueprint..." },
];

export function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  // Progressive phase ticker timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-card-border bg-gradient-to-b from-zinc-900/90 via-zinc-900/95 to-zinc-950 p-8 sm:p-12 text-center text-white shadow-2xl backdrop-blur-xl">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.15),transparent_70%)]" />

      {/* Official KelanaAI Circular Compass Animated Beacon */}
      <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
        {/* Animated Outer Pulse Ring */}
        <div className="absolute h-full w-full animate-ping rounded-full bg-primary/20 duration-1000" />
        <div className="absolute h-16 w-16 animate-pulse rounded-full bg-primary/30 blur-sm" />
        
        {/* Official Vector Logo */}
        <div className="relative z-10 drop-shadow-xl transition-transform hover:scale-110">
          <Logo size={56} className="animate-pulse shadow-lg shadow-blue-500/20" />
        </div>
      </div>

      {/* Main Title */}
      <Typography variant="h2" className="tracking-tight text-white">
        Crafting Your Custom Itinerary
      </Typography>
      <Typography variant="caption" className="mt-1 text-muted-foreground block">
        Mapping neighborhood routes, transit timings, and daily budget limits
      </Typography>

      {/* Progressive Step Ticker */}
      <div className="mt-8 mx-auto max-w-md rounded-2xl border border-white/5 bg-zinc-950/70 p-4 backdrop-blur-md">
        <div className="flex items-center gap-3 text-left">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-base">
            {LOADING_STEPS[currentStep].icon}
          </span>
          <div className="min-w-0 flex-1">
            <Typography as="span" variant="kicker" className="block text-[10px] text-blue-400">
              Phase {currentStep + 1} of {LOADING_STEPS.length}
            </Typography>
            <Typography variant="caption" className="font-medium text-zinc-200 truncate block">
              {LOADING_STEPS[currentStep].text}
            </Typography>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-teal-400 transition-all duration-700 ease-out"
            style={{
              width: `${((currentStep + 1) / LOADING_STEPS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Status Tag */}
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/80 px-3.5 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
        <Typography as="span" variant="muted" className="text-muted-foreground font-medium">
          Curator Mode Active
        </Typography>
      </div>
    </div>
  );
}
