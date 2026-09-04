"use client";

import Link from "next/link";
import {
  Compass,
  Sparkles,
  Cpu,
  Database,
  ShieldCheck,
  MessageSquare,
  Cloud,
  Layers,
  ArrowRight,
  Code2,
  CheckCircle2,
  Server,
  Zap,
  Bot,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";

/**
 * PAGE: About & Architecture
 * Technical overview of KelanaAI's system topology, security model, and cloud infrastructure.
 */
export default function AboutPage() {
  const architecturePillars = [
    {
      title: "Frontend Interface",
      badge: "Next.js 16 • React 19",
      icon: Layers,
      color: "text-blue-400",
      bgColor: "bg-blue-950/40 border-blue-500/20",
      description:
        "Modern App Router interface built with React 19 and Tailwind CSS v4. Operates as a Backend-For-Frontend (BFF) proxy that encapsulates upstream API tokens and handles server-side edge routing.",
      highlights: [
        "Edge-rendered API proxy route handlers",
        "Native Server-Sent Events (SSE) streaming",
        "Full PWA with offline caching & installability",
      ],
    },
    {
      title: "Backend REST API",
      badge: "FastAPI • Python 3.12",
      icon: Server,
      color: "text-emerald-400",
      bgColor: "bg-emerald-950/40 border-emerald-500/20",
      description:
        "High-throughput asynchronous Python engine built with FastAPI and SQLAlchemy 2.0. Manages itinerary synthesis, multi-turn state machines, and relational persistence.",
      highlights: [
        "Modular domain-driven routers",
        "Pydantic v2 strict contract validation",
        "Sliding-window rate limiting on LLM endpoints",
      ],
    },
    {
      title: "AI Synthesis Engine",
      badge: "Amazon Bedrock • Nova Lite",
      icon: Cpu,
      color: "text-purple-400",
      bgColor: "bg-purple-950/40 border-purple-500/20",
      description:
        "Direct integration with Amazon Bedrock using Amazon Nova Lite. Deterministically structures multi-day travel itineraries with granular timeline allocations and localized pace modeling.",
      highlights: [
        "Deterministic JSON schema output",
        "Style-weighted budget calculations",
        "Heuristic & classifier injection guardrails",
      ],
    },
    {
      title: "Knowledge Base RAG",
      badge: "Amazon Bedrock KB",
      icon: Sparkles,
      color: "text-amber-400",
      bgColor: "bg-amber-950/40 border-amber-500/20",
      description:
        "Managed vector retrieval querying indexed travel policies, visa frameworks, and customs documentation. Eliminates hallucinations by anchoring responses in primary sources.",
      highlights: [
        "Vector similarity search with cosine thresholding",
        "Transparent source URI & chunk citations",
        "Autonomous out-of-domain query refusal",
      ],
    },
    {
      title: "Database & Identity",
      badge: "Neon • HttpOnly Cookie",
      icon: Database,
      color: "text-cyan-400",
      bgColor: "bg-cyan-950/40 border-cyan-500/20",
      description:
        "Serverless PostgreSQL on Neon utilizing connection pooling for low-latency concurrency. Employs HttpOnly session cookies to secure user identity against XSS exploitation.",
      highlights: [
        "HttpOnly, Secure, SameSite=Lax cookie sessions",
        "Bcrypt password hashing & 7-day token sync",
        "Cascading deletes & soft-delete audit trail",
      ],
    },
    {
      title: "Cloud Infrastructure",
      badge: "Vercel + FastAPI Cloud",
      icon: Cloud,
      color: "text-rose-400",
      bgColor: "bg-rose-950/40 border-rose-500/20",
      description:
        "Multi-cloud infrastructure separating global edge delivery on Vercel from scalable containerized backend execution on FastAPI Cloud with isolated environment controls.",
      highlights: [
        "Automated CI/CD git deployment pipeline",
        "Strict CORS whitelist & proxy network isolation",
        "Automated SSL termination & edge asset distribution",
      ],
    },
  ];

  const coreFeatures = [
    {
      icon: Compass,
      title: "Style-Weighted Budget Modeling",
      desc: "Calculates target daily spend across 8 distinct travel personas (Backpacker, Solo, Family, Couple, Luxury, Adventure, Culinary, Wellness) with granular expense categorization.",
    },
    {
      icon: MessageSquare,
      title: "Sliding-Window Conversation Memory",
      desc: "Preserves conversational context across extended planning sessions by combining verbatim recent turns with background summarization to eliminate context drift.",
    },
    {
      icon: ShieldCheck,
      title: "Defense-in-Depth Security",
      desc: "Multi-layer security architecture featuring pre-execution prompt classification, automated brute-force protection, HttpOnly cookie isolation, and client DevTools lockdown.",
    },
    {
      icon: Zap,
      title: "PWA Offline Resiliency",
      desc: "Installs natively across desktop and mobile platforms. Leverages a custom Service Worker to precache core assets and deliver instant offline fallbacks when network connectivity drops.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area: Standardized max-w-5xl container aligning with Navbar and Footer */}
      <main className="relative flex-1 px-4 py-8 pb-24 sm:pb-12 sm:px-6 lg:px-8">
        {/* Ambient Top Lighting Glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-full max-w-5xl bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_70%)]" />

        <div className="relative mx-auto max-w-5xl space-y-12 sm:space-y-16">
          {/* Hero Section */}
          <section className="text-center max-w-3xl mx-auto pt-4 sm:pt-8">
            {/* Architecture Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/50 px-3.5 py-1 text-xs font-semibold text-blue-300 shadow-sm backdrop-blur-md mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
              <span>Cloud-Native Architecture • Production Release</span>
            </div>

            {/* Logo & Headline */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <Logo size={42} className="shadow-lg shadow-blue-500/20" />
              <Typography variant="h1" className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                About Kelana<span className="text-blue-400">AI</span>
              </Typography>
            </div>

            {/* Subtitle / Value Proposition */}
            <Typography
              variant="muted"
              className="text-base sm:text-lg text-zinc-300 leading-relaxed"
            >
              KelanaAI is an intelligent travel logistics platform that transforms high-level travel intent into structured, budget-optimized daily itineraries and delivers verified destination intelligence via grounded AI.
            </Typography>

            {/* Quick Action CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/">
                <Button size="lg" className="gap-2 font-semibold shadow-lg shadow-blue-500/25 active:scale-95">
                  <Compass className="w-4 h-4" />
                  <span>Plan a Trip</span>
                </Button>
              </Link>

              <Link href="/chat">
                <Button variant="outline" size="lg" className="gap-2 active:scale-95">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <span>Chat with AI</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </section>

          {/* Architecture Grid Section */}
          <section className="pt-8 sm:pt-10 border-t border-border">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">System Architecture</span>
              <Typography variant="h2" className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Engineering Topology
              </Typography>
              <Typography variant="muted" className="text-sm text-zinc-400 max-w-xl mx-auto mt-2">
                A decoupled microservices architecture engineered for zero-latency client state, strict credential isolation, and deterministic AI output.
              </Typography>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {architecturePillars.map((pillar, idx) => {
                const IconComp = pillar.icon;
                return (
                  <Card
                    key={idx}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-card/80 hover:-translate-y-1 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${pillar.bgColor}`}>
                        <IconComp className={`w-5 h-5 ${pillar.color}`} />
                      </div>
                      <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-300">
                        {pillar.badge}
                      </span>
                    </div>

                    <Typography variant="h3" className="text-lg font-bold text-white mb-2">
                      {pillar.title}
                    </Typography>

                    <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                      {pillar.description}
                    </p>

                    <div className="space-y-1.5 border-t border-white/5 pt-3">
                      {pillar.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-zinc-300 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Core Capabilities Showcase */}
          <section className="pt-8 sm:pt-10 border-t border-border">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Capabilities</span>
              <Typography variant="h2" className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Core Capabilities
              </Typography>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coreFeatures.map((feat, idx) => {
                const IconComp = feat.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 rounded-2xl border border-white/5 bg-zinc-900/40 p-5 backdrop-blur-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-950/30 text-blue-400">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <Typography variant="h4" className="text-sm font-bold text-white">
                        {feat.title}
                      </Typography>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Bootcamp Capstone Section */}
          <section className="pt-2">
            <Card className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-card/80 to-indigo-950/30 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-blue-400">
                    <Code2 className="w-3.5 h-3.5" />
                    Alkademi AI Native Software Engineer Bootcamp
                  </span>
                  <Typography variant="h2" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Capstone Project Showcase
                  </Typography>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    KelanaAI was built as the capstone project for the Alkademi AI Native Software Engineer Bootcamp. Engineered as a production-grade SaaS, it demonstrates end-to-end cloud architecture: PostgreSQL relational modeling, high-throughput FastAPI microservices, Amazon Bedrock foundation model orchestration, Next.js edge routing, and enterprise security hardening.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 w-full sm:w-auto shrink-0">
                  <Link href="/" className="w-full">
                    <Button size="lg" className="w-full gap-2 font-bold shadow-md shadow-blue-500/20">
                      <Compass className="w-4 h-4" />
                      <span>Plan a Trip</span>
                    </Button>
                  </Link>
                  <Link href="/trips" className="w-full">
                    <Button variant="outline" size="default" className="w-full gap-2 text-xs">
                      <span>View Saved Trips</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
