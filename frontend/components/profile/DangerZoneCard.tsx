"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";

// COMPONENT: DangerZoneCard
// Account deletion trigger with ConfirmDialog integration (Session 8 GDPR / Privacy)

export function DangerZoneCard() {
  const { deleteAccount, user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      setIsDialogOpen(false);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete account. Please try again.",
        { title: "Deletion Failed" }
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="rounded-3xl border border-red-500/20 bg-red-950/10 p-6 sm:p-8 backdrop-blur-2xl shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <Typography variant="h3" className="text-xl font-bold text-red-400 tracking-tight">
            Danger Zone
          </Typography>
        </div>

        <Typography variant="muted" className="text-xs text-zinc-300 leading-relaxed max-w-xl">
          Permanently delete your KelanaAI account and remove all personal records. This action immediately deletes all {user?.total_trips || 0} saved travel itineraries and cannot be reversed.
        </Typography>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-red-500/15">
          <div className="flex items-start gap-2 text-xs text-red-300/80">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>Once deleted, your account and itineraries cannot be recovered.</span>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="gap-2 px-5 font-semibold text-xs h-10 shadow-lg shadow-red-950/50 self-start sm:self-auto active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account Permanently?"
        description={`Are you sure you want to permanently delete your account (${user?.email})? All your saved travel itineraries, AI recommendations, and account data will be permanently wiped.`}
        confirmText="Yes, Delete Account"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </>
  );
}
