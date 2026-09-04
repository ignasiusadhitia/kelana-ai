"use client";

import { useEffect } from "react";

// ARCHITECTURE: Production DevTools & Inspection Lockdown
// Active strictly in production builds (NODE_ENV === "production"):
// 1. Neutralizes React DevTools global hook to prevent component inspection.
// 2. Disables context menu (right-click -> Inspect Element).
// 3. Intercepts common DevTools shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U, Cmd+Option+I/J/C).

export function DisableDevtools() {
  useEffect(() => {
    // Only enforce in production environments
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    // 1. Neutralize React DevTools Extension Hook
    try {
      const win = window as unknown as {
        __REACT_DEVTOOLS_GLOBAL_HOOK__?: Record<string, unknown>;
      };
      if (
        win.__REACT_DEVTOOLS_GLOBAL_HOOK__ &&
        typeof win.__REACT_DEVTOOLS_GLOBAL_HOOK__ === "object"
      ) {
        for (const [key, value] of Object.entries(
          win.__REACT_DEVTOOLS_GLOBAL_HOOK__
        )) {
          win.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] =
            typeof value === "function" ? () => {} : null;
        }
      }
    } catch {
      // Ignore if hook is sealed
    }

    // 2. Prevent Right-Click Context Menu (Inspect Element)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 3. Intercept Inspection Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        return;
      }

      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // Ctrl+Shift+I / Cmd+Option+I (Inspect)
      // Ctrl+Shift+J / Cmd+Option+J (Console)
      // Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
      if (
        isCtrlOrMeta &&
        (e.shiftKey || e.altKey) &&
        ["i", "j", "c", "I", "J", "C"].includes(e.key)
      ) {
        e.preventDefault();
        return;
      }

      // Ctrl+U / Cmd+U (View Source)
      if (isCtrlOrMeta && ["u", "U"].includes(e.key)) {
        e.preventDefault();
        return;
      }

      // Ctrl+S / Cmd+S (Save Page)
      if (isCtrlOrMeta && ["s", "S"].includes(e.key)) {
        e.preventDefault();
        return;
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
