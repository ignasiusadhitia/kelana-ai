import type { MetadataRoute } from "next";

// ARCHITECTURE: Progressive Web App (PWA) Manifest
// Defines application identity, icons, splash screen colors, and standalone display mode
// for browser install prompts across desktop and mobile devices.

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KelanaAI — Intelligent Travel Planner",
    short_name: "KelanaAI",
    description:
      "Plan your next trip with custom day-by-day itineraries, daily budget breakdowns, and curated local recommendations.",
    start_url: "/",
    id: "/",
    scope: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    orientation: "portrait-primary",
    lang: "en",
    dir: "ltr",
    categories: ["travel", "lifestyle", "productivity"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
