"use client";

import { useSyncExternalStore, ReactNode } from "react";
import { createPortal } from "react-dom";

const emptySubscribe = () => () => {};

/**
 * ATOMIC UI PRIMITIVE: Portal
 * Escapes parent CSS stacking contexts, transforms, and overflow-hidden rules
 * by teleporting overlay elements directly into document.body.
 * Uses useSyncExternalStore for SSR-safe client mounting without cascading renders.
 */
export function Portal({ children }: { children: ReactNode }) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient || typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}
