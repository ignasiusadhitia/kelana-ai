import { Logo } from "@/components/Logo";
import { Typography } from "@/components/ui/typography";

/**
 * GLOBAL LOADING SCREEN
 * Automatic Next.js App Router loading boundary displayed during route transitions
 * and initial page streaming. Built with KelanaAI's signature dark aesthetic.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page content"
      className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground px-4 selection:bg-primary selection:text-primary-foreground"
    >
      {/* Ambient Radial Background Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-full max-w-2xl bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_70%)]" />

      {/* Loading Center Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm mx-auto">
        {/* Glowing Compass Beacon */}
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-500/20 bg-blue-950/40 p-3 shadow-2xl shadow-blue-500/10 backdrop-blur-xl">
          {/* Subtle Outer Ping Wave */}
          <div className="absolute inset-0 rounded-3xl bg-blue-500/15 animate-ping opacity-30 duration-1000" />
          
          {/* Official KelanaAI Compass Logo */}
          <Logo size={44} className="relative transition-transform animate-pulse" />
        </div>

        {/* Status Headline */}
        <Typography
          variant="h3"
          className="text-lg sm:text-xl font-bold tracking-tight text-white"
        >
          Loading KelanaAI...
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="muted"
          className="mt-1.5 text-xs text-zinc-400 font-medium"
        >
          Preparing your travel experience...
        </Typography>

        {/* Animated Gradient Progress Indicator */}
        <div className="mt-6 w-48 h-1 overflow-hidden rounded-full bg-zinc-800/80 border border-white/5">
          <div className="h-full w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 rounded-full animate-[shimmer_1.8s_infinite_linear] [background-size:200%_100%]" />
        </div>
      </div>
    </div>
  );
}
