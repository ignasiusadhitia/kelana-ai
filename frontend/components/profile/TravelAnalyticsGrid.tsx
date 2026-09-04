"use client";

import Link from "next/link";
import {
  Map,
  DollarSign,
  Calendar,
  MapPin,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { UserProfile } from "@/types/auth";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * COMPONENT: TravelAnalyticsGrid
 * Displays rich aggregated travel metrics (Planned Budget, Days Explored, Destination Chips).
 */

interface TravelAnalyticsGridProps {
  user: UserProfile;
}

export function TravelAnalyticsGrid({ user }: TravelAnalyticsGridProps) {
  const totalTrips = user.total_trips || 0;
  const totalBudget = user.total_budget || 0;
  const totalDays = user.total_days || 0;
  const destinations = user.destinations || [];

  return (
    <div className="space-y-6">
      {/* 3-Column Core Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Saved Itineraries */}
        <Card className="rounded-2xl border border-white/10 bg-card/60 p-5 backdrop-blur-xl transition hover:border-zinc-700">
          <div className="flex items-center justify-between">
            <Typography variant="kicker" className="text-xs text-zinc-400">
              Saved Itineraries
            </Typography>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Map className="w-4 h-4" />
            </span>
          </div>
          <Typography variant="h2" className="mt-2 text-3xl font-black text-white">
            {totalTrips}
          </Typography>
          <Typography variant="muted" className="text-[11px] text-zinc-400 mt-1 block">
            {totalTrips === 1 ? "1 trip planned" : `${totalTrips} total trips created`}
          </Typography>
        </Card>

        {/* Metric 2: Total Planned Budget */}
        <Card className="rounded-2xl border border-white/10 bg-card/60 p-5 backdrop-blur-xl transition hover:border-zinc-700">
          <div className="flex items-center justify-between">
            <Typography variant="kicker" className="text-xs text-zinc-400">
              Total Planned Budget
            </Typography>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <Typography variant="h2" className="mt-2 text-3xl font-black text-emerald-400">
            ${totalBudget.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Typography>
          <Typography variant="muted" className="text-[11px] text-zinc-400 mt-1 block">
            Estimated cumulative budget
          </Typography>
        </Card>

        {/* Metric 3: Total Days Explored */}
        <Card className="rounded-2xl border border-white/10 bg-card/60 p-5 backdrop-blur-xl transition hover:border-zinc-700">
          <div className="flex items-center justify-between">
            <Typography variant="kicker" className="text-xs text-zinc-400">
              Total Days Explored
            </Typography>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <Typography variant="h2" className="mt-2 text-3xl font-black text-white">
            {totalDays} <span className="text-base font-semibold text-zinc-400">Days</span>
          </Typography>
          <Typography variant="muted" className="text-[11px] text-zinc-400 mt-1 block">
            Planned adventure days
          </Typography>
        </Card>
      </div>

      {/* Destinations Planned Tag Showcase Card */}
      <Card className="rounded-3xl border border-white/10 bg-card/60 p-6 sm:p-7 backdrop-blur-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <Typography variant="h3" className="text-base font-bold text-white tracking-tight">
              Destinations Planned
            </Typography>
            <span className="inline-flex items-center justify-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-bold text-blue-300 border border-blue-500/20">
              {destinations.length}
            </span>
          </div>

          {destinations.length > 0 && (
            <Link
              href="/trips"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 self-start sm:self-auto font-medium"
            >
              <span>Explore Itineraries</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {destinations.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {destinations.map((dest, idx) => (
              <span
                key={`${dest}-${idx}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-all hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-white"
              >
                <MapPin className="w-3 h-3 text-blue-400" />
                <span>{dest}</span>
              </span>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center space-y-3 rounded-2xl border border-dashed border-white/10 bg-zinc-900/30">
            <Typography variant="muted" className="text-xs text-zinc-400 block max-w-sm mx-auto">
              No destinations planned yet. Generate your first custom AI itinerary to start building your travel roadmap!
            </Typography>
            <Link href="/" className="inline-block">
              <Button variant="default" size="sm" className="gap-1.5 text-xs font-semibold">
                <Plus className="w-3.5 h-3.5" />
                <span>Create Your First Trip</span>
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Quick Action Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <Link href="/trips" className="w-full sm:w-auto">
          <Button variant="secondary" className="w-full sm:w-auto gap-2 active:scale-95 text-xs h-10">
            <Map className="w-4 h-4 text-blue-400" />
            <span>Manage All Saved Trips</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>

        <Link href="/" className="w-full sm:w-auto">
          <Button variant="default" className="w-full sm:w-auto gap-2 active:scale-95 text-xs h-10 shadow-md shadow-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plan New Itinerary</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
