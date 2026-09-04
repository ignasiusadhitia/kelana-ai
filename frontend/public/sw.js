// KelanaAI Service Worker — Lightweight PWA Offline & Shell Cache
// Version: kelana-ai-pwa-v1

const CACHE_NAME = "kelana-ai-pwa-v1";
const PRECACHE_ASSETS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

// Install: Cache critical assets and activate immediately
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        // Safe pre-cache: don't fail the entire install if a single optional route is unavailable
        await Promise.allSettled(
          PRECACHE_ASSETS.map(async (url) => {
            try {
              const res = await fetch(url, { cache: "no-cache" });
              if (res.ok) {
                await cache.put(url, res);
              }
            } catch {
              // Non-critical precache misses fall back gracefully to network-first
            }
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Purge old cache versions and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: Strategy dispatch
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only intercept GET requests
  if (request.method !== "GET") {
    return;
  }

  // Bypass chrome extensions, dev hot-reloads, and non-http(s)
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Bypass backend API and Next.js internal development routes
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("/_next/webpack-hmr") ||
    url.port === "8000" // Backend API port
  ) {
    return;
  }

  // 1. Navigation requests (HTML pages): Network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) {
            return cachedPage;
          }
          const offlinePage = await caches.match("/offline");
          if (offlinePage) {
            return offlinePage;
          }
          const rootPage = await caches.match("/");
          return rootPage || new Response("Offline", { status: 503 });
        })
    );
    return;
  }

  // 2. Static assets (images, fonts, _next/static): Stale-while-revalidate
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff2|woff|ttf|css)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. All other requests: Network fallback to cache
  event.respondWith(
    fetch(request).catch(async () => {
      const match = await caches.match(request);
      return match || new Response(null, { status: 504 });
    })
  );
});
