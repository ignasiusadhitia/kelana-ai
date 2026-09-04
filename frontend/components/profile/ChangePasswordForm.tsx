"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff, ShieldCheck, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { changePasswordSchema, ChangePasswordFormValues } from "@/schemas/authSchema";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
/**
 * COMPONENT: ChangePasswordForm
 * Secure password change form with current password verification & eye visibility toggles.
 */

export function ChangePasswordForm() {
  const { changePassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Toggle password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<ChangePasswordFormValues> = async (values) => {
    setIsSubmitting(true);
    setIsSuccess(false);
    try {
      await changePassword({
        current_password: values.currentPassword,
        new_password: values.newPassword,
      });
      setIsSuccess(true);
      reset();
      setTimeout(() => setIsSuccess(false), 4000);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to change password. Please verify your current password.",
        { title: "Password Change Failed" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-3xl border border-white/10 bg-card/60 p-6 sm:p-8 backdrop-blur-2xl shadow-xl">
      <div className="mb-6">
        <Typography variant="h3" className="text-xl font-bold text-white tracking-tight">
          Security & Password
        </Typography>
        <Typography variant="muted" className="text-xs text-zinc-400 mt-1">
          Ensure your account is using a secure, strong password.
        </Typography>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Current Password Field */}
        <div>
          <label htmlFor="currentPassword" className="flex items-center gap-1.5 mb-2 cursor-pointer">
            <Lock className="w-4 h-4 text-zinc-400" />
            <Typography as="span" variant="kicker" className="text-zinc-300 text-xs">
              Current Password
            </Typography>
          </label>
          <div className="relative">
            <Input
              id="currentPassword"
              {...register("currentPassword")}
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Enter your current password"
              error={!!errors.currentPassword}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition"
              aria-label={showCurrentPassword ? "Hide password" : "Show password"}
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.currentPassword && (
            <Typography variant="caption" className="mt-1.5 font-medium text-red-400 block">
              {errors.currentPassword.message}
            </Typography>
          )}
        </div>

        {/* New Password Field */}
        <div>
          <label htmlFor="newPassword" className="flex items-center gap-1.5 mb-2 cursor-pointer">
            <Lock className="w-4 h-4 text-blue-400" />
            <Typography as="span" variant="kicker" className="text-zinc-300 text-xs">
              New Password
            </Typography>
          </label>
          <div className="relative">
            <Input
              id="newPassword"
              {...register("newPassword")}
              type={showNewPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              error={!!errors.newPassword}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition"
              aria-label={showNewPassword ? "Hide password" : "Show password"}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <Typography variant="caption" className="mt-1.5 font-medium text-red-400 block">
              {errors.newPassword.message}
            </Typography>
          )}
        </div>

        {/* Confirm New Password Field */}
        <div>
          <label htmlFor="confirmNewPassword" className="flex items-center gap-1.5 mb-2 cursor-pointer">
            <Lock className="w-4 h-4 text-blue-400" />
            <Typography as="span" variant="kicker" className="text-zinc-300 text-xs">
              Confirm New Password
            </Typography>
          </label>
          <div className="relative">
            <Input
              id="confirmNewPassword"
              {...register("confirmNewPassword")}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repeat your new password"
              error={!!errors.confirmNewPassword}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmNewPassword && (
            <Typography variant="caption" className="mt-1.5 font-medium text-red-400 block">
              {errors.confirmNewPassword.message}
            </Typography>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="default"
            size="sm"
            className="w-full sm:w-auto gap-2 px-6 shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 font-semibold text-xs h-10"
          >
            {isSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Password Updated!</span>
              </>
            ) : isSubmitting ? (
              <span>Updating Password...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Update Password</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
