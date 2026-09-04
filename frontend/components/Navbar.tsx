"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LogIn, LogOut, Download } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { usePwaInstall } from "@/hooks/usePwaInstall";

/**
 * COMPONENT: Navbar (Personalized Multi-User Navigation)
 * Adaptive navigation bar showing personalized welcome greeting, user profile, and auth actions.
 */

interface NavbarProps {
  onPlanTrip?: () => void;
}

export function Navbar({ onPlanTrip }: NavbarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { isInstallable, installApp } = usePwaInstall();

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
  const isProfile = pathname === "/profile";

  // Extract first name for personalized greeting
  const firstName = user?.name ? user.name.split(" ")[0] : "Traveler";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between py-2.5 sm:py-3.5">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group text-left transition-opacity hover:opacity-90 active:scale-95 shrink-0"
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

        {/* Center: Personalized Welcome Greeting */}
        {isAuthenticated && user && (
          <div className="hidden md:flex items-center gap-2 rounded-full border border-white/5 bg-zinc-900/60 px-3.5 py-1 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <Typography variant="muted" className="text-xs text-zinc-300 font-medium">
              Welcome back, <span className="font-bold text-white">{firstName}</span>
            </Typography>
          </div>
        )}

        {/* Desktop Navigation Links */}
        <nav className="hidden sm:flex items-center gap-4 md:gap-5">
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
            href="/chat"
            className={`text-xs font-medium transition-colors ${
              pathname === "/chat"
                ? "text-white font-semibold"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Chat
          </Link>

          <Link
            href="/about"
            className={`text-xs font-medium transition-colors ${
              pathname === "/about"
                ? "text-white font-semibold"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            About
          </Link>

          {isInstallable && (
            <button
              type="button"
              onClick={installApp}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1.5 text-xs font-medium text-blue-300 hover:bg-blue-500/20 hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Install KelanaAI App"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-border">
              {/* Profile Link */}
              <Link
                href="/profile"
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  isProfile
                    ? "bg-secondary text-white font-semibold"
                    : "text-zinc-300 hover:bg-secondary/60 hover:text-white"
                }`}
              >
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Profile</span>
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                className="cursor-pointer inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:bg-destructive/15 hover:text-destructive transition-all active:scale-95"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-secondary/60 transition-all active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 text-zinc-400" />
                <span>Sign In</span>
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-hover active:scale-95"
              >
                <span>Register</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Header Quick Actions */}
        <div className="flex sm:hidden items-center gap-2">
          {isInstallable && (
            <button
              type="button"
              onClick={installApp}
              className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-300 active:scale-95 cursor-pointer"
              title="Install App"
            >
              <Download className="w-3 h-3" />
              <span>Install</span>
            </button>
          )}

          {isAuthenticated ? (
            <Link
              href="/profile"
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-secondary/80 px-2.5 py-1 text-xs font-semibold text-zinc-200 active:scale-95"
            >
              <User className="w-3 h-3 text-blue-400" />
              <span>{firstName}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1 rounded-full bg-primary/20 border border-primary/40 px-3 py-1 text-xs font-semibold text-blue-300 active:scale-95"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
