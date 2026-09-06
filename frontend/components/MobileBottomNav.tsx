"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Compass, Map, MessageSquare, User, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * COMPONENT: MobileBottomNav (Floating Dock Navigation for Mobile)
 * Premium floating pill bottom navigation bar for mobile viewports (< 640px).
 * Automatically hidden on /chat so the chat input and virtual keyboard have 100% unobstructed screen space.
 */

interface MobileBottomNavProps {
  onPlanTrip?: () => void;
}

/**
 * Floating dock navigation bar for mobile viewports (< 640px),
 * offering quick switching between Home, Trips, Chat, and Profile.
 */
export function MobileBottomNav({ onPlanTrip }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const isHome = pathname === "/";
  const isChat = pathname.startsWith("/chat");
  const isTrips = pathname.startsWith("/trips");
    const isProfile = pathname === "/profile" || pathname === "/login" || pathname === "/register";

  // Hide floating dock on chat page to ensure clean full-screen typing experience
  if (isChat) {
    return null;
  }

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

  const navItems = [
    {
      label: "Planner",
      href: "/",
      icon: Compass,
      isActive: isHome,
      onClick: handlePlanClick,
    },
    {
      label: "Chat",
      href: "/chat",
      icon: MessageSquare,
      isActive: isChat,
    },
    {
      label: "Trips",
      href: "/trips",
      icon: Map,
      isActive: isTrips,
    },
    {
      label: isAuthenticated ? (user?.name ? user.name.split(" ")[0] : "Profile") : "Sign In",
      href: isAuthenticated ? "/profile" : "/login",
      icon: isAuthenticated ? User : LogIn,
      isActive: isProfile,
    },
  ];

  return (
    <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pt-1 pointer-events-none pb-safe">
      <nav className="pointer-events-auto mx-auto max-w-md rounded-2xl border border-white/10 bg-zinc-950/85 p-1 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        <div className="grid grid-cols-4 gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={item.onClick}
                className={`relative flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-200 active:scale-95 ${
                  item.isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      item.isActive ? "text-blue-400" : "text-zinc-400"
                    }`}
                  />
                  {item.isActive && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                  )}
                </div>
                <span
                  className={`mt-1.5 text-[11px] font-medium tracking-tight truncate max-w-[90px] transition-colors ${
                    item.isActive ? "text-white font-semibold" : "text-zinc-400"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
