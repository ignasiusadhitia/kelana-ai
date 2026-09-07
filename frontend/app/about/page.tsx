"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  MapPin,
  Calendar,
  Wallet,
  Sparkles,
  Bot,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  Code2,
  Heart,
  ChevronDown,
  Globe,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";

/**
 * PAGE: About KelanaAI
 * Human-centric introduction to KelanaAI's mission, user workflow,
 * design principles, FAQ, and project background.
 */
export default function AboutPage() {
  // Simple interactive FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const steps = [
    {
      step: "01",
      icon: MapPin,
      title: "Tell us your travel style & budget",
      description:
        "Choose your destination, duration, budget, and travel style—whether you are backpacking solo, traveling as a couple, or taking the whole family.",
    },
    {
      step: "02",
      icon: Calendar,
      title: "Receive a realistic day-by-day plan",
      description:
        "Get a structured itinerary organized into sensible morning, afternoon, and evening blocks, complete with authentic local food spots and daily spend targets.",
    },
    {
      step: "03",
      icon: Bot,
      title: "Refine with AI & save your blueprint",
      description:
        "Chat with KelanaAI to swap activities, tailor dietary preferences, or ask about visa rules—then save the updated plan to your account to review anytime.",
    },
  ];

  const values = [
    {
      icon: Clock,
      title: "Sensible Pacing",
      description:
        "We plan 2 to 3 meaningful activities per day so you have real time to explore, eat, and relax—never exhausting schedules with 10 rushed stops.",
    },
    {
      icon: Sparkles,
      title: "Authentic Local Flavor",
      description:
        "Recommendations point to verified neighborhood food alleys, markets, and regional dishes, avoiding generic placeholders like 'eat at a local restaurant'.",
    },
    {
      icon: ShieldCheck,
      title: "Verified Travel Information",
      description:
        "Answers to visa questions, payment methods, and local customs are retrieved from curated, authoritative guides so you don't rely on outdated forum rumors.",
    },
    {
      icon: Wallet,
      title: "Transparent Budget Pacing",
      description:
        "Budgets are split into practical daily allocations for lodging, food, and transit, tailored directly to your chosen travel persona and home currency.",
    },
  ];

  const faqs = [
    {
      question: "Is KelanaAI free to use?",
      answer:
        "Yes, KelanaAI is completely free to use. It was developed as an open-source project to demonstrate modern AI-driven product engineering.",
    },
    {
      question: "How are the budget estimates calculated?",
      answer:
        "Budget calculations combine your total trip budget with standard spending ratios tailored to your travel style (e.g. backpacker, couple, luxury, family). It estimates reasonable allocations for lodging, food, transit, and activities per day.",
    },
    {
      question: "What destinations can I plan for?",
      answer:
        "You can generate travel plans for any city or country worldwide. For select destinations like Japan and Indonesia, we also provide verified knowledge base guides covering immigration rules, transit IC cards, and payment habits.",
    },
    {
      question: "What if my trip is longer than two weeks?",
      answer:
        "To ensure every day receives detailed, high-quality recommendations without text cutoffs, trips over 14 days are broken down into regional legs (6–7 days each). You can choose which leg to plan first and build your itinerary step by step.",
    },
    {
      question: "Can I edit an itinerary after creating it?",
      answer:
        "Yes! Every trip you save has an 'Ask AI about this Trip' button. This opens a chat thread that already knows your trip details, allowing you to ask for adjustments and update your blueprint with a single click.",
    },
    {
      question: "Is my personal data safe?",
      answer:
        "We do not track your browsing activity, display advertisements, or sell your data. Your account credentials and saved trips are private and securely stored.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Top Navigation */}
      <Navbar />

      <main className="relative flex-1 px-4 py-8 pb-24 sm:pb-16 sm:px-6 lg:px-8">
        {/* Ambient Top Lighting Glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[450px] w-full max-w-5xl bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_70%)]" />

        <div className="relative mx-auto max-w-5xl space-y-16 sm:space-y-20">
          {/* HERO SECTION */}
          <section className="text-center max-w-2xl mx-auto pt-4 sm:pt-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-3.5 py-1 text-xs font-semibold text-blue-300 shadow-sm backdrop-blur-md mb-6">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Travel Planning, Simplified</span>
            </div>

            <div className="flex items-center justify-center gap-3 mb-4">
              <Logo size={44} className="shadow-md shadow-blue-500/20" />
              <Typography variant="h1" className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                About Kelana<span className="text-blue-400">AI</span>
              </Typography>
            </div>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mt-4">
              Planning a trip shouldn&apos;t feel like a second job. KelanaAI turns your destination ideas into realistic daily itineraries, helps you budget sensibly, and answers practical travel questions—all in one place.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/">
                <Button size="lg" className="gap-2 font-semibold shadow-lg shadow-blue-500/25 active:scale-95">
                  <Compass className="w-4 h-4" />
                  <span>Start Planning</span>
                </Button>
              </Link>

              <Link href="/chat">
                <Button variant="outline" size="lg" className="gap-2 active:scale-95">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <span>Chat with Travel AI</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </section>

          {/* THE PROBLEM WE SOLVE */}
          <section className="rounded-3xl border border-white/10 bg-card/40 p-6 sm:p-8 backdrop-blur-md shadow-sm">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">The Problem</span>
              <Typography variant="h2" className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Why We Built KelanaAI
              </Typography>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-blue-400 font-bold text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  The 30-Tab Headache
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Vacation research often means drowning in dozens of open tabs—blog posts, flight checkers, currency converters, and fragmented notes that are hard to organize.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-blue-400 font-bold text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  Unrealistic Itineraries
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Generic travel itineraries frequently pack too many sights into a single day, turning what should be a restful holiday into an exhausting marathon.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-blue-400 font-bold text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  Outdated Information
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Relying on random forum comments for visa requirements or local payment methods can lead to costly surprises at the airport or border control.
                </p>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Workflow</span>
              <Typography variant="h2" className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                How It Works
              </Typography>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2">
                From high-level travel intent to a customized daily blueprint in three simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {steps.map((s, idx) => {
                const IconComp = s.icon;
                return (
                  <Card
                    key={idx}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl transition-all hover:border-white/20 shadow-md"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-950/40 text-blue-400">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-black text-white/15">
                        {s.step}
                      </span>
                    </div>

                    <Typography variant="h3" className="text-base font-bold text-white mb-2">
                      {s.title}
                    </Typography>

                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      {s.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* OUR PRINCIPLES */}
          <section className="space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Philosophy</span>
              <Typography variant="h2" className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                What We Care About
              </Typography>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2">
                Guiding principles that shape how KelanaAI generates your itineraries.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {values.map((val, idx) => {
                const IconComp = val.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 rounded-2xl border border-white/10 bg-card/60 p-5 backdrop-blur-xl shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-950/40 text-purple-400">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <Typography variant="h4" className="text-sm font-bold text-white">
                        {val.title}
                      </Typography>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {val.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FAQ SECTION */}
          <section className="space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Questions</span>
              <Typography variant="h2" className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Frequently Asked Questions
              </Typography>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-md overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-white hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-blue-400" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ABOUT THE CREATOR & PROJECT HERITAGE */}
          <section className="pt-4">
            <Card className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-950/30 via-card/70 to-indigo-950/20 p-8 sm:p-10 shadow-xl backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider">
                    <Code2 className="w-4 h-4" />
                    <span>Open Source & Capstone Heritage</span>
                  </div>

                  <Typography variant="h2" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Behind the Project
                  </Typography>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    KelanaAI was designed and built by <strong>Ignasius Adhitia</strong> as the capstone project for the <strong>Alkademi AI Native Software Engineer Bootcamp</strong>. It is released as open-source software under the MIT License, combining Next.js, Python FastAPI, Amazon Bedrock, and PostgreSQL.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      Made with care
                    </span>
                    <span>•</span>
                    <span>Free & Open Source</span>
                    <span>•</span>
                    <a
                      href="https://github.com/ignasiusadhitia/kelana-ai"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline"
                    >
                      <span>View on GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link href="/">
                    <Button size="lg" className="gap-2 font-bold shadow-md shadow-blue-500/20 active:scale-95">
                      <Compass className="w-4 h-4" />
                      <span>Plan Your Next Trip</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Floating Dock */}
      <MobileBottomNav />
    </div>
  );
}
