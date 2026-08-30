"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Calendar, Save, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { updateProfileSchema, UpdateProfileFormValues } from "@/schemas/authSchema";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
// COMPONENT: EditProfileForm
// Handles display name updates with Zod schema validation & optimistic sync (Session 8 Profile Enhancement)

export function EditProfileForm() {
  const { user, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || "",
    },
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<UpdateProfileFormValues> = async (values) => {
    setIsSubmitting(true);
    setIsSaved(false);
    try {
      await updateProfile({ name: values.name });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update profile name. Please try again.",
        { title: "Update Failed" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Card className="rounded-3xl border border-white/10 bg-card/60 p-6 sm:p-8 backdrop-blur-2xl shadow-xl">
      <div className="mb-6">
        <Typography variant="h3" className="text-xl font-bold text-white tracking-tight">
          Personal Information
        </Typography>
        <Typography variant="muted" className="text-xs text-zinc-400 mt-1">
          Update your traveler name and account details.
        </Typography>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Full Name Field */}
        <div>
          <label htmlFor="name" className="flex items-center gap-1.5 mb-2 cursor-pointer">
            <User className="w-4 h-4 text-blue-400" />
            <Typography as="span" variant="kicker" className="text-zinc-300 text-xs">
              Full Name
            </Typography>
          </label>
          <Input
            id="name"
            {...register("name")}
            type="text"
            placeholder="e.g. Ignasius Adhitia"
            error={!!errors.name}
          />
          {errors.name && (
            <Typography variant="caption" className="mt-1.5 font-medium text-red-400 block">
              {errors.name.message}
            </Typography>
          )}
        </div>

        {/* Email Address (Read-only) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-zinc-400" />
              <Typography as="span" variant="kicker" className="text-zinc-300 text-xs">
                Email Address
              </Typography>
            </label>
            <span className="text-[11px] text-zinc-400 font-mono">Primary Login ID</span>
          </div>
          <div className="relative">
            <Input
              type="email"
              value={user?.email || ""}
              disabled
              className="bg-zinc-900/60 border-zinc-800 text-zinc-400 cursor-not-allowed opacity-80 select-none font-mono text-xs"
            />
          </div>
          <Typography variant="muted" className="mt-1.5 text-[11px] text-zinc-400 block">
            Email is your permanent traveler identifier and cannot be modified.
          </Typography>
        </div>

        {/* Member Since Note */}
        {joinedDate && (
          <div className="flex items-center gap-2 pt-1 text-xs text-zinc-400">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>Account created on {joinedDate}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-3">
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            variant="default"
            size="sm"
            className="w-full sm:w-auto gap-2 px-6 shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 font-semibold text-xs h-10"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : isSubmitting ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
