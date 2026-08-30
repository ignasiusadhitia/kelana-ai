"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  User,
  Mail,
  Calendar,
  LogOut,
  ShieldCheck,
  LayoutDashboard,
  UserPen,
  KeyRound,
} from "lucide-react";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { TravelerPreferencesCard } from "@/components/profile/TravelerPreferencesCard";
import { TravelAnalyticsGrid } from "@/components/profile/TravelAnalyticsGrid";
import { DangerZoneCard } from "@/components/profile/DangerZoneCard";

type ProfileTab = "overview" | "edit-profile" | "security";

function ProfileSkeleton() {
  return (
    <div className="relative mx-auto max-w-5xl space-y-6 animate-pulse">
      {/* Header Banner Card Skeleton */}
      <div className="rounded-3xl border border-white/10 bg-card/40 p-6 sm:p-8 backdrop-blur-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="h-20 w-20 shrink-0 rounded-2xl bg-zinc-800/70 border border-white/5" />
          <div className="flex-1 space-y-3 text-center sm:text-left w-full">
            <div className="h-5 w-32 rounded-full bg-zinc-800/60 mx-auto sm:mx-0" />
            <div className="h-8 w-48 sm:w-64 rounded-xl bg-zinc-800/80 mx-auto sm:mx-0" />
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
              <div className="h-4 w-36 rounded-md bg-zinc-800/50" />
              <div className="h-4 w-40 rounded-md bg-zinc-800/50" />
            </div>
          </div>
          <div className="h-9 w-24 rounded-xl bg-zinc-800/60 shrink-0" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2">
        <div className="h-10 w-28 rounded-xl bg-zinc-800/60" />
        <div className="h-10 w-28 rounded-xl bg-zinc-800/60" />
        <div className="h-10 w-28 rounded-xl bg-zinc-800/60" />
      </div>

      {/* 3-Column Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl border border-white/10 bg-card/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 rounded bg-zinc-800/60" />
              <div className="h-8 w-8 rounded-xl bg-zinc-800/50" />
            </div>
            <div className="h-8 w-16 rounded-lg bg-zinc-800/80" />
            <div className="h-3 w-32 rounded bg-zinc-800/40" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Always refresh latest travel analytics metrics whenever user navigates to profile
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  // Generate traveler initials
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  // Format creation timestamp
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Profile Viewport */}
      <main className="relative flex-1 px-4 py-8 pb-24 sm:pb-8 sm:px-6 lg:px-8">
        {/* Ambient Top Glow Orbs */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-96 w-full max-w-5xl bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_60%)]" />

        {/* Loading State */}
        {isLoading && <ProfileSkeleton />}

        {/* Loaded Profile Content */}
        {!isLoading && user && (
          <div className="relative mx-auto max-w-5xl space-y-6 animate-in fade-in duration-300">
            {/* Header Banner Card */}
            <Card className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/70 p-6 sm:p-8 backdrop-blur-2xl shadow-xl">
              <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl" />

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                {/* Avatar */}
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-500 text-2xl font-black text-white shadow-xl shadow-blue-500/20">
                  {initials || <User className="w-8 h-8" />}
                  <div
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-2 border-background"
                    title="Verified Account"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-0.5 text-xs font-semibold text-blue-300 mb-2">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>Traveler Profile</span>
                  </div>

                  <Typography variant="h2" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
                    {user.name}
                  </Typography>

                  <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Member since {joinedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Sign Out Action */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="gap-2 border-red-500/30 text-red-300 hover:bg-red-950/40 hover:text-red-200 active:scale-95 shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </Card>

            {/* Profile Tab Navigation Bar */}
            <div className="flex items-center gap-2 border-b border-border/80 pb-3 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95 whitespace-nowrap ${
                  activeTab === "overview"
                    ? "bg-primary text-white shadow-md shadow-blue-500/20 ring-1 ring-primary/40"
                    : "border border-border bg-secondary/80 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Overview & Stats</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("edit-profile")}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95 whitespace-nowrap ${
                  activeTab === "edit-profile"
                    ? "bg-primary text-white shadow-md shadow-blue-500/20 ring-1 ring-primary/40"
                    : "border border-border bg-secondary/80 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                <UserPen className="w-3.5 h-3.5" />
                <span>Profile & Preferences</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95 whitespace-nowrap ${
                  activeTab === "security"
                    ? "bg-primary text-white shadow-md shadow-blue-500/20 ring-1 ring-primary/40"
                    : "border border-border bg-secondary/80 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Security & Privacy</span>
              </button>
            </div>

            {/* Tab 1: Overview & Travel Analytics */}
            {activeTab === "overview" && (
              <div className="animate-in fade-in duration-200">
                <TravelAnalyticsGrid user={user} />
              </div>
            )}

            {/* Tab 2: Edit Profile & Preferences */}
            {activeTab === "edit-profile" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <EditProfileForm />
                <TravelerPreferencesCard />
              </div>
            )}

            {/* Tab 3: Security & Privacy */}
            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <ChangePasswordForm />
                <DangerZoneCard />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile App Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
