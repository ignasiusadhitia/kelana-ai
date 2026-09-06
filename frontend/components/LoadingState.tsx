"use client";

import { useEffect, useState } from "react";
import { Globe, Zap, Map, Lightbulb, Sparkles } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Logo } from "@/components/Logo";
import { Portal } from "@/components/ui/portal";

/**
 * COMPONENT: LoadingState
 * Displays a progressive generation ticker with dynamic phase transitions,
 * Lucide vector status icons, and the official circular KelanaAI animated compass logo.
 * Teleports directly to document.body via React Portal to guarantee a true viewport guard.
 */

const LOADING_STEPS = [
  { icon: Globe, text: "Scouting neighborhood walking routes & authentic venues..." },
  { icon: Zap, text: "Calculating optimal daily budget allocations..." },
  { icon: Map, text: "Structuring morning, afternoon, and evening plans..." },
  { icon: Lightbulb, text: "Verifying local transit lines & practical insider tips..." },
  { icon: Sparkles, text: "Finalizing your itinerary details..." },
];

interface LoadingStateProps {
  fullScreen?: boolean;
}

/**
 * Animated loading indicator displaying sequential itinerary compilation phases,
 * pulse spinners, and skeleton placeholders.
 */
export function LoadingState({ fullScreen = true }: LoadingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Progressive phase ticker timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Lock background scroll when portal overlay is active
  useEffect(() => {
    if (fullScreen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [fullScreen]);

  const StepIcon = LOADING_STEPS[currentStep].icon;

  const cardContent = (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-900/98 p-8 sm:p-10 text-center text-white shadow-2xl shadow-black ring-1 ring-white/10 backdrop-blur-2xl">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.2),transparent_70%)]" />

      {/* Official KelanaAI Circular Compass Animated Beacon */}
      <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
        {/* Animated Outer Pulse Ring */}
        <div className="absolute h-full w-full animate-ping rounded-full bg-primary/25 duration-1000" />
        <div className="absolute h-16 w-16 animate-pulse rounded-full bg-primary/30 blur-sm" />

        {/* Official Vector Logo */}
        <div className="relative z-10 drop-shadow-xl transition-transform hover:scale-110">
          <Logo size={56} className="animate-pulse shadow-lg shadow-blue-500/20" />
        </div>
      </div>

      {/* Main Title */}
      <Typography variant="h2" className="tracking-tight text-white font-extrabold">
        Generating Your Itinerary
      </Typography>
      <Typography variant="caption" className="mt-1.5 text-zinc-400 block max-w-sm mx-auto">
        Finding local spots, transit options, and calculating daily budget breakdown.
      </Typography>

      {/* Progressive Step Ticker */}
      <div className="mt-7 mx-auto max-w-md rounded-2xl border border-white/10 bg-zinc-950/80 p-4 backdrop-blur-md">
        <div className="flex items-center gap-3 text-left">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-blue-400">
            <StepIcon className="w-4 h-4" />
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

      {/* Status Badge */}
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/80 px-3.5 py-1">
        <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
        <Typography as="span" variant="muted" className="text-zinc-300 font-medium text-xs">
          Generating Itinerary • Please wait...
        </Typography>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <Portal>
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Generating travel itinerary"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200 select-none cursor-wait"
        >
          <div className="w-full max-w-lg">{cardContent}</div>
        </div>
      </Portal>
    );
  }

  return cardContent;
}
