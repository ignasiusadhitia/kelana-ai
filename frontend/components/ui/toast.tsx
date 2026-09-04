"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { Portal } from "@/components/ui/portal";

// 5 PILARS OF PRODUCTION-GRADE TOAST NOTIFICATIONS:
// 1. Global Context & Standalone Dispatcher (`toast.success()`, `useToast()`)
// 2. Pause-on-Hover & Configurable Auto-Dismiss Lifecycle (4000ms default)
// 3. 4 Semantic Variant Tokens (Success, Error, Info, Loading)
// 4. Full A11y Standards (`role="status"`, `aria-live="polite"`, keyboard dismiss)
// 5. Stacked Viewport Queue via React Portal (`z-[9999]`)

export type ToastVariant = "success" | "error" | "info" | "loading";

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

export interface ToastOptions {
  title?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (message: string, variant?: ToastVariant, options?: ToastOptions) => string;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// Global event bus listener for non-hook callers
type ToastListener = (toasts: ToastItem[]) => void;
let globalToasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();

function notifyListeners() {
  listeners.forEach((listener) => listener([...globalToasts]));
}

/**
 * Standalone imperative Toast Dispatcher callable anywhere across the application.
 */
export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return dispatchGlobalToast(message, "success", options);
  },
  error: (message: string, options?: ToastOptions) => {
    return dispatchGlobalToast(message, "error", options);
  },
  info: (message: string, options?: ToastOptions) => {
    return dispatchGlobalToast(message, "info", options);
  },
  loading: (message: string, options?: ToastOptions) => {
    return dispatchGlobalToast(message, "loading", options);
  },
  dismiss: (id: string) => {
    globalToasts = globalToasts.filter((t) => t.id !== id);
    notifyListeners();
  },
};

function dispatchGlobalToast(message: string, variant: ToastVariant, options?: ToastOptions): string {
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
  const newToast: ToastItem = {
    id,
    message,
    variant,
    title: options?.title,
    duration: options?.duration ?? (variant === "loading" ? 0 : 4000),
  };
  globalToasts = [newToast, ...globalToasts].slice(0, 5); // Keep maximum 5 stacked toasts
  notifyListeners();
  return id;
}

/**
 * Context Provider wrapping application tree to manage toast state.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleUpdate = (updated: ToastItem[]) => setToasts(updated);
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info", options?: ToastOptions) => {
      return dispatchGlobalToast(message, variant, options);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    toast.dismiss(id);
  }, []);

  const dismissAll = useCallback(() => {
    globalToasts = [];
    notifyListeners();
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast, dismissAll }}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

/**
 * React Hook accessing the Toast System.
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toasts: globalToasts,
      toast,
      dismissToast: toast.dismiss,
    };
  }
  return {
    ...context,
    toast,
  };
}

/**
 * Individual Toast Notification Card with Pause-on-Hover and Accessible Semantics.
 */
function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(item.duration || 4000);
  const [isPaused, setIsPaused] = useState(false);

  const startTimer = useCallback(() => {
    if (!item.duration || item.duration <= 0) return;
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss(item.id);
    }, remainingTimeRef.current);
  }, [item.duration, item.id, onDismiss]);

  const pauseTimer = useCallback(() => {
    if (!item.duration || item.duration <= 0) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    setIsPaused(true);
  }, [item.duration]);

  const resumeTimer = useCallback(() => {
    if (!item.duration || item.duration <= 0) return;
    setIsPaused(false);
    startTimer();
  }, [item.duration, startTimer]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startTimer]);

  const variantStyles = {
    success: {
      container:
        "border-emerald-500/30 bg-emerald-950/90 text-emerald-100 shadow-emerald-950/60 ring-emerald-500/20",
      iconBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      container:
        "border-red-500/30 bg-red-950/90 text-red-100 shadow-red-950/60 ring-red-500/20",
      iconBg: "bg-red-500/20 text-red-400 border-red-500/30",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    info: {
      container:
        "border-blue-500/30 bg-blue-950/90 text-blue-100 shadow-blue-950/60 ring-blue-500/20",
      iconBg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    loading: {
      container:
        "border-zinc-700 bg-zinc-900/95 text-zinc-100 shadow-black/80 ring-white/10",
      iconBg: "bg-primary/20 text-primary border-primary/30",
      icon: (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ),
    },
  }[item.variant];

  return (
    <div
      role={item.variant === "error" ? "alert" : "status"}
      aria-live={item.variant === "error" ? "assertive" : "polite"}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      className={`pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-2xl ring-1 transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in ${
        variantStyles.container
      } ${isPaused ? "scale-[1.02]" : ""}`}
    >
      {/* Variant Icon Beacon */}
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border ${variantStyles.iconBg}`}
      >
        {variantStyles.icon}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 pt-0.5">
        {item.title && (
          <p className="text-xs font-bold text-white tracking-tight mb-0.5">
            {item.title}
          </p>
        )}
        <p className="text-xs font-medium leading-relaxed opacity-95">
          {item.message}
        </p>
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="cursor-pointer -mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/60 transition hover:bg-white/15 hover:text-white"
        aria-label="Dismiss toast notification"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Viewport Toaster View Container rendering stacked notifications via React Portal.
 */
export function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <Portal>
      <div
        aria-label="Notifications"
        className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-[9999] flex flex-col-reverse items-center sm:items-end gap-2.5 max-w-sm mx-auto sm:mx-0 pointer-events-none"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={onDismiss} />
        ))}
      </div>
    </Portal>
  );
}
