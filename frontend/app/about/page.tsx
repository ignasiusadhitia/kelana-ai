"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Sparkles,
  Cpu,
  Database,
  ShieldCheck,
  Layers,
  ArrowRight,
  Code2,
  CheckCircle2,
  Server,
  Zap,
  Bot,
  ExternalLink,
  GitBranch,
  Lock,
  Globe,
  Activity,
  Terminal,
  FileCode,
  Workflow,
  Search,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";

/**
 * PAGE: About & Architecture
 * Enterprise-grade architectural specification and technical overview of KelanaAI.
 * Demonstrates decoupled BFF topology, Model 3 Chat-to-Blueprint grounding,
 * destination-scoped vector RAG, and production security controls.
 */
export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<"topology" | "breakthroughs" | "cloud">("topology");

  // Telemetry metrics highlighting key engineering design accomplishments
  const systemMetrics = [
    { label: "BFF Proxy Architecture", value: "Zero-CORS", sub: "Same-origin cookie encapsulation" },
    { label: "Token Limit Protection", value: "14-Day Limit", sub: "Modular leg segmentation (>14d)" },
    { label: "Vector Precision Filter", value: "0.35 Cosine", sub: "Destination-scoped threshold" },
    { label: "Automated Test Suites", value: "26/26 PASS", sub: "100% backend unit coverage" },
  ];

  // 6 Architecture Pillars
  const architecturePillars = [
    {
      id: "frontend",
      title: "Frontend & Edge Proxy",
      badge: "Next.js 16 • React 19",
      icon: Layers,
      color: "text-blue-400",
      bgColor: "bg-blue-950/40 border-blue-500/20",
      description:
        "Modern App Router user interface built with React 19 and Tailwind CSS v4. Operates as an edge Backend-For-Frontend (BFF) proxy that encapsulates upstream API tokens, streams AI responses via SSE, and renders interactive day accordions with dynamic time-block badges.",
      specifications: [
        { label: "Protocol", value: "Server-Sent Events (SSE) & HTTP/2" },
        { label: "Rendering", value: "Edge SSR + Static Generation (SSG)" },
        { label: "PWA Engine", value: "Vanilla Service Worker (Cache-First Shell)" },
      ],
      highlights: [
        "Edge-rendered API proxy route handlers (zero CORS)",
        "Native Server-Sent Events (SSE) token streaming",
        "Resilient multi-level markdown & time-block badges",
        "Full PWA with offline caching & 1-click installation",
      ],
    },
    {
      id: "backend",
      title: "Backend REST Engine",
      badge: "FastAPI • Python 3.12",
      icon: Server,
      color: "text-emerald-400",
      bgColor: "bg-emerald-950/40 border-emerald-500/20",
      description:
        "High-throughput asynchronous Python microservice engine built with FastAPI and SQLAlchemy 2.0. Manages itinerary synthesis, multi-turn state machines, Model 3 Chat-to-Blueprint relational binding, and standardized PEP 257 documentation.",
      specifications: [
        { label: "ASGI Server", value: "Uvicorn (Asynchronous Event Loop)" },
        { label: "Validation", value: "Pydantic v2 Strict Contract Enforcers" },
        { label: "Rate Limiting", value: "Sliding-Window Memory Throttler" },
      ],
      highlights: [
        "Model 3 Chat-to-Blueprint relational context injection",
        "Pydantic v2 strict request & response contracts",
        "Sliding-window rate limiting on LLM endpoints",
        "100% English PEP 257 docstrings across all modules",
      ],
    },
    {
      id: "ai",
      title: "AI Foundation Engine",
      badge: "Amazon Bedrock • Nova Lite",
      icon: Cpu,
      color: "text-purple-400",
      bgColor: "bg-purple-950/40 border-purple-500/20",
      description:
        "Direct integration with Amazon Bedrock utilizing the Amazon Nova Lite foundation model. Deterministically structures multi-day travel itineraries with granular timeline allocations, authentic local dining anchors, and strict 14-day duration limit guardrails.",
      specifications: [
        { label: "Model ID", value: "amazon.nova-lite-v1:0" },
        { label: "API Client", value: "Boto3 Converse API (Token Streaming)" },
        { label: "Safety Shield", value: "Dual-Layer Prompt Injection Defense" },
      ],
      highlights: [
        "Deterministic itinerary & time-block structuring",
        "Intelligent modular breakdown for trips >14 days",
        "Authentic local dining & anti-placeholder directives",
        "Dual-layer heuristic & classifier injection guardrails",
      ],
    },
    {
      id: "rag",
      title: "Knowledge Base RAG",
      badge: "Amazon Bedrock KB • OpenSearch",
      icon: Sparkles,
      color: "text-amber-400",
      bgColor: "bg-amber-950/40 border-amber-500/20",
      description:
        "Managed vector retrieval querying indexed travel policies, visa frameworks, and customs documentation. Employs universal destination-scoped filtering to eliminate cross-destination guide contamination.",
      specifications: [
        { label: "Vector Store", value: "OpenSearch Serverless Vector Index" },
        { label: "Metric", value: "Cosine Similarity (Cutoff: 0.35)" },
        { label: "Isolation", value: "Universal Destination-Scoped Filtering" },
      ],
      highlights: [
        "Universal destination-scoped vector filtering",
        "Vector similarity search with cosine thresholding",
        "Transparent source URI & chunk citations",
        "Autonomous out-of-domain query refusal",
      ],
    },
    {
      id: "database",
      title: "Database & Identity",
      badge: "Neon • PostgreSQL 16",
      icon: Database,
      color: "text-cyan-400",
      bgColor: "bg-cyan-950/40 border-cyan-500/20",
      description:
        "Serverless PostgreSQL on Neon utilizing connection pooling for low-latency concurrency. Employs HttpOnly session cookies to secure user identity against XSS exploitation with relational integrity.",
      specifications: [
        { label: "Engine", value: "PostgreSQL 16 (SSL Required Connection Pool)" },
        { label: "Session TTL", value: "7 Days (Synchronized with JWT Cookie)" },
        { label: "Cascade", value: "Foreign Key Binding (trip_id ON DELETE SET NULL)" },
      ],
      highlights: [
        "HttpOnly, Secure, SameSite=Lax cookie sessions",
        "Bcrypt password hashing & 7-day token sync",
        "Cascading deletes & soft-delete audit trail",
        "Relational Chat-to-Blueprint binding (trip_id)",
      ],
    },
    {
      id: "security",
      title: "Security & Infrastructure",
      badge: "Vercel + FastAPI Cloud",
      icon: ShieldCheck,
      color: "text-rose-400",
      bgColor: "bg-rose-950/40 border-rose-500/20",
      description:
        "Multi-cloud deployment isolating global edge delivery on Vercel from scalable containerized backend execution on FastAPI Cloud, fortified by production AST compiler stripping and DevTools lockdown.",
      specifications: [
        { label: "Route Guard", value: "Next.js 16 Edge Middleware (proxy.ts)" },
        { label: "Compiler", value: "AST Console Stripping & Hidden Source Maps" },
        { label: "DevTools", value: "F12 & Shortcut Lockdown in Production" },
      ],
      highlights: [
        "Automated CI/CD git deployment pipeline",
        "Strict CORS whitelist & proxy network isolation",
        "Production DevTools lockdown (F12, inspect blocked)",
        "Zero client-side API credential leakage",
      ],
    },
  ];

  // 6 Deep Dive Technical Breakthroughs
  const breakthroughs = [
    {
      icon: Bot,
      title: "Model 3: Chat-to-Blueprint Relational Grounding",
      badge: "Relational Sync",
      desc: "Solves the traditional disconnect between static itineraries and conversational AI. Saved trip blueprints bind directly to chat threads via `trip_id` foreign keys. The synthesis engine automatically injects destination, duration, budget, and daily activities into conversation prompts, enabling travelers to iteratively refine itineraries and apply modifications back to the blueprint in-place.",
    },
    {
      icon: Workflow,
      title: "Modular Breakdown Policy for Long Trips (>14 Days)",
      badge: "Context Protection",
      desc: "Prevents LLM output truncation and token exhaustion on extended journeys. When inquiries exceed 14 days, the engine automatically partitions the trip into balanced regional legs (6–7 days each) with proportional budget pacing. It halts generation to let travelers choose which leg to detail first, ensuring deep, un-truncated local recommendations.",
    },
    {
      icon: Search,
      title: "Universal Destination-Scoped Vector Isolation",
      badge: "Anti-Hallucination",
      desc: "Eliminates cross-destination guide contamination. Knowledge Base vector queries inherit the destination scope of the inquiry, ensuring documents for indexed destinations (e.g., Kyoto) never leak into inquiries for other regions (e.g., Maldives). When travelers query unindexed global destinations, the system synthesizes authentic itineraries without fabricating regulatory claims.",
    },
    {
      icon: Lock,
      title: "Enterprise Defense-in-Depth & DevTools Lockdown",
      badge: "Hardened Security",
      desc: "Complete elimination of `localStorage` token storage in favor of `HttpOnly`, `SameSite=Lax` cookies. Next.js 16 edge middleware (`proxy.ts`) guards authenticated routes before client hydration. Production builds employ AST compiler transformations to strip `console.log` statements and block browser inspect keyboard shortcuts (`F12`, `Ctrl+Shift+I/J/C`, `Ctrl+U`).",
    },
    {
      icon: Zap,
      title: "Progressive Web App (PWA) & Offline Resiliency",
      badge: "Offline Native",
      desc: "Engineered to W3C PWA standards with Web App Manifest (`manifest.ts`), maskable icons, and a custom Service Worker (`public/sw.js`). Implements a cache-first caching strategy for the application shell and assets, dynamic API passthrough, and an instant styled offline view (`/offline`) with network reconnection listeners.",
    },
    {
      icon: FileCode,
      title: "100% English Codebase & Documentation Standard",
      badge: "Code Quality",
      desc: "Strictly unified documentation with 100% English PEP 257 docstrings across all Python backend models, routes, schemas, services, and test suites. Frontend components, hooks, providers, and utility functions feature comprehensive TSDoc / JSDoc type annotations and usage descriptions.",
    },
  ];

  // Cloud Infrastructure Telemetry Table
  const cloudInfrastructure = [
    {
      service: "Frontend Web & BFF Edge",
      platform: "Vercel Edge Network",
      runtime: "Next.js 16.3.2 (App Router & Turbopack)",
      region: "Global Edge Anycast",
      protocol: "HTTPS / HTTP/2 + W3C PWA",
      status: "Operational",
    },
    {
      service: "Backend REST API",
      platform: "FastAPI Cloud",
      runtime: "Python 3.12 + Uvicorn ASGI",
      region: "Containerized Cloud",
      protocol: "REST & Server-Sent Events (SSE)",
      status: "Operational",
    },
    {
      service: "Managed Relational Database",
      platform: "Neon Serverless",
      runtime: "PostgreSQL 16 (Connection Pooled)",
      region: "ap-southeast-1 / us-east-1",
      protocol: "SSL-Encrypted Wire Protocol",
      status: "Operational",
    },
    {
      service: "Foundation LLM Synthesis",
      platform: "Amazon Bedrock",
      runtime: "Amazon Nova Lite (v1:0)",
      region: "ap-southeast-2 (Sydney)",
      protocol: "Boto3 Converse Streaming API",
      status: "Operational",
    },
    {
      service: "Vector Knowledge Base (RAG)",
      platform: "Amazon Bedrock KB",
      runtime: "OpenSearch Serverless Vector Store",
      region: "ap-southeast-2 (Sydney)",
      protocol: "Cosine Similarity Hybrid Search",
      status: "Operational",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="relative flex-1 px-4 py-8 pb-24 sm:pb-16 sm:px-6 lg:px-8">
        {/* Ambient Top Lighting Glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[550px] w-full max-w-5xl bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.18),transparent_70%)]" />

        <div className="relative mx-auto max-w-5xl space-y-12 sm:space-y-16">
          {/* Hero Section */}
          <section className="text-center max-w-3xl mx-auto pt-4 sm:pt-8">
            {/* Status Pills */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/50 px-3.5 py-1 text-xs font-semibold text-blue-300 shadow-sm backdrop-blur-md mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
              <span>Enterprise Architecture • Release v0.2.0 • MIT Open Source</span>
            </div>

            {/* Logo & Headline */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <Logo size={46} className="shadow-lg shadow-blue-500/20" />
              <Typography variant="h1" className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                About Kelana<span className="text-blue-400">AI</span>
              </Typography>
            </div>

            {/* Subtitle / Value Proposition */}
            <Typography
              variant="muted"
              className="text-base sm:text-lg text-zinc-300 leading-relaxed"
            >
              An enterprise-grade, cloud-native travel intelligence platform that combines foundation LLMs with destination-scoped vector retrieval (RAG) and bidirectional chat-to-blueprint synchronization.
            </Typography>

            {/* Action CTAs */}
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

              <a
                href="https://github.com/ignasiusadhitia/kelana-ai"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center"
              >
                <Button variant="secondary" size="lg" className="gap-2 text-zinc-300 active:scale-95">
                  <GitBranch className="w-4 h-4 text-zinc-400" />
                  <span>Repository</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                </Button>
              </a>
            </div>
          </section>

          {/* System Telemetry & Key Metrics Grid */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {systemMetrics.map((metric, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-card/60 p-4 sm:p-5 backdrop-blur-md shadow-sm text-center"
              >
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  {metric.label}
                </div>
                <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {metric.value}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  {metric.sub}
                </div>
              </div>
            ))}
          </section>

          {/* Tab Navigation Controls */}
          <section className="space-y-8">
            <div className="flex items-center justify-center">
              <div className="inline-flex p-1.5 rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("topology")}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "topology"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Architecture Topology</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("breakthroughs")}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "breakthroughs"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Core Capabilities</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("cloud")}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "cloud"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Cloud Telemetry</span>
                </button>
              </div>
            </div>

            {/* TAB 1: ARCHITECTURE TOPOLOGY */}
            {activeTab === "topology" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center max-w-xl mx-auto mb-8">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-400">System Topology</span>
                  <Typography variant="h2" className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    Decoupled Microservice Topology
                  </Typography>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-2">
                    A zero-CORS Backend-For-Frontend architecture separating edge asset delivery from scalable Python asynchronous execution and AWS Bedrock inference.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {architecturePillars.map((pillar) => {
                    const IconComp = pillar.icon;
                    return (
                      <Card
                        key={pillar.id}
                        className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-card/80 hover:-translate-y-1 shadow-lg"
                      >
                        <div>
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
                        </div>

                        <div>
                          {/* Technical Spec Matrix */}
                          <div className="rounded-xl border border-white/5 bg-zinc-950/40 p-3 mb-4 space-y-1.5 text-[11px]">
                            {pillar.specifications.map((spec, i) => (
                              <div key={i} className="flex items-center justify-between text-zinc-400">
                                <span className="font-semibold text-zinc-500">{spec.label}:</span>
                                <span className="text-zinc-300 font-mono text-[10px]">{spec.value}</span>
                              </div>
                            ))}
                          </div>

                          {/* Bullet Highlights */}
                          <div className="space-y-1.5 border-t border-white/5 pt-3">
                            {pillar.highlights.map((h, i) => (
                              <div key={i} className="flex items-center gap-2 text-[11px] text-zinc-300 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                <span>{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: CORE BREAKTHROUGHS */}
            {activeTab === "breakthroughs" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center max-w-xl mx-auto mb-8">
                  <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Engineering Innovations</span>
                  <Typography variant="h2" className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    Technical Breakthroughs
                  </Typography>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-2">
                    Architectural solutions resolving prompt truncation, conversational drift, cross-destination leakage, and client-side credential exposure.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {breakthroughs.map((b, idx) => {
                    const IconComp = b.icon;
                    return (
                      <Card
                        key={idx}
                        className="rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl shadow-lg hover:border-white/20 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-950/40 text-blue-400">
                            <IconComp className="w-5 h-5" />
                          </div>
                          <Badge variant="secondary" className="text-[10px]">
                            {b.badge}
                          </Badge>
                        </div>
                        <Typography variant="h3" className="text-base font-bold text-white mb-2">
                          {b.title}
                        </Typography>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {b.desc}
                        </p>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: CLOUD TELEMETRY & LIVE SERVICES */}
            {activeTab === "cloud" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center max-w-xl mx-auto mb-8">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Live Deployments</span>
                  <Typography variant="h2" className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    Cloud Infrastructure Topology
                  </Typography>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-2">
                    Production runtime matrix orchestrating edge compute on Vercel, containerized microservices on FastAPI Cloud, serverless PostgreSQL on Neon, and Amazon Bedrock.
                  </p>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl shadow-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/10 bg-white/5 uppercase tracking-wider text-[11px] font-bold text-zinc-300">
                      <tr>
                        <th className="px-5 py-3.5">Service Component</th>
                        <th className="px-5 py-3.5">Platform</th>
                        <th className="px-5 py-3.5">Runtime / Engine</th>
                        <th className="px-5 py-3.5">Region</th>
                        <th className="px-5 py-3.5">Protocol</th>
                        <th className="px-5 py-3.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-zinc-300">
                      {cloudInfrastructure.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-white">
                            {row.service}
                          </td>
                          <td className="px-5 py-3.5 text-zinc-300">
                            {row.platform}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-[11px] text-zinc-400">
                            {row.runtime}
                          </td>
                          <td className="px-5 py-3.5 text-zinc-400">
                            {row.region}
                          </td>
                          <td className="px-5 py-3.5 text-zinc-400">
                            {row.protocol}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* Capstone Showcase & Heritage */}
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
                    KelanaAI is the final capstone showcase for the Alkademi AI Native Software Engineer Bootcamp. Engineered as an enterprise SaaS product, it illustrates complete cloud-native mastery: PostgreSQL relational modeling, high-throughput asynchronous FastAPI microservices, Amazon Bedrock foundation model orchestration, Next.js edge routing, and defense-in-depth security hardening.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 w-full sm:w-auto shrink-0">
                  <Link href="/" className="w-full">
                    <Button size="lg" className="w-full gap-2 font-bold shadow-md shadow-blue-500/20 active:scale-95">
                      <Compass className="w-4 h-4" />
                      <span>Plan a Trip</span>
                    </Button>
                  </Link>
                  <Link href="/trips" className="w-full">
                    <Button variant="outline" size="default" className="w-full gap-2 text-xs active:scale-95">
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
