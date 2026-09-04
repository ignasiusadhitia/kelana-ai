import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { PwaRegister } from "@/components/PwaRegister";
import { DisableDevtools } from "@/components/DisableDevtools";
import "./globals.css";

// ARCHITECTURE: Root Layout Shell & Context Boundary
// Configures global typography fonts, PWA metadata, dark-mode viewport color, TanStack Query, and AuthProvider.

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "KelanaAI — Intelligent Travel & Budget Itinerary Planner",
  description:
    "Plan your next trip with custom day-by-day itineraries, daily budget breakdowns, and curated local recommendations.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KelanaAI",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

/**
 * Root application layout wrapper injecting global providers and CSS styles.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {process.env.NODE_ENV === "production" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  if (typeof window !== 'undefined' && typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
                    for (var key in window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                      window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] === 'function' ? function(){} : null;
                    }
                  }
                } catch(e) {}
              `,
            }}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <DisableDevtools />
        <QueryProvider>
          <AuthProvider>
            <PwaRegister />
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
