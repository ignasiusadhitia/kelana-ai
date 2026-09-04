"use client";

import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/toast";

// ARCHITECTURE: PWA Service Worker Registration & Network Status Monitor
// Registers /sw.js on client mount and surfaces offline/online connectivity notifications.

export function PwaRegister() {
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Register Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            // Check for updates on interval / page load
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    toast.info("A new version is available. Reload to update.", {
                      title: "Update Ready",
                    });
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.warn("[PWA] ServiceWorker registration failed:", error);
          });
      });
    }

    // 2. Network connectivity listeners
    const handleOnline = () => {
      if (!isFirstMount.current) {
        toast.success("Back online. Connected to KelanaAI services.", {
          title: "Network Restored",
        });
      }
    };

    const handleOffline = () => {
      toast.info(
        "You are offline. Cached itineraries and pages remain accessible.",
        {
          title: "Offline Mode",
          duration: 6000,
        }
      );
    };

    const handleAppInstalled = () => {
      toast.success("KelanaAI was successfully added to your home screen!", {
        title: "App Installed",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("appinstalled", handleAppInstalled);

    isFirstMount.current = false;

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return null;
}
