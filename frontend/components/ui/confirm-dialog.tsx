"use client";

import * as React from "react";
import { Trash2, Info } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Portal } from "@/components/ui/portal";

// ATOMIC PRIMITIVE: Custom Confirmation Dialog Modal
// Replaces browser native window.confirm() with an accessible, glassmorphic confirmation modal matching the KelanaAI design system.

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

/**
 * Accessible confirmation modal dialog with customizable title, description,
 * destructive action styling, and keyboard escape handling.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  isLoading = false,
  icon,
}: ConfirmDialogProps) {
  // Close on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Lock background scroll when open
  React.useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={description ? "confirm-dialog-desc" : undefined}
        onClick={(e) => {
          if (e.target === e.currentTarget && !isLoading) {
            onClose();
          }
        }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-900/95 p-6 sm:p-7 text-foreground shadow-2xl shadow-black ring-1 ring-white/10 backdrop-blur-2xl animate-in zoom-in-95 duration-150">
          {/* Ambient Top Glow */}
          <div
            className={`pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full blur-3xl ${
              variant === "destructive" ? "bg-red-500/15" : "bg-blue-500/15"
            }`}
          />

          {/* Dialog Header */}
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-xl shadow-inner ${
                variant === "destructive"
                  ? "border-red-500/30 bg-red-950/40 text-red-400"
                  : "border-blue-500/30 bg-blue-950/40 text-blue-400"
              }`}
            >
              {icon || (variant === "destructive" ? <Trash2 className="w-5 h-5 text-red-400" /> : <Info className="w-5 h-5 text-blue-400" />)}
            </div>

            <div className="flex-1 min-w-0">
              <Typography
                id="confirm-dialog-title"
                variant="h3"
                className="font-bold text-white tracking-tight"
              >
                {title}
              </Typography>

              {description && (
                <Typography
                  id="confirm-dialog-desc"
                  variant="muted"
                  className="mt-1.5 text-xs leading-relaxed text-zinc-400"
                >
                  {description}
                </Typography>
              )}
            </div>
          </div>

          {/* Dialog Actions */}
          <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs px-4"
            >
              {cancelText}
            </Button>

            <Button
              type="button"
              variant={variant === "destructive" ? "destructive" : "default"}
              size="sm"
              onClick={onConfirm}
              disabled={isLoading}
              className="text-xs px-4 shadow-sm"
            >
              {isLoading ? "Processing..." : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
