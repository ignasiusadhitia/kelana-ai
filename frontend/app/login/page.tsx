"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, LogIn, Loader2, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { loginSchema, LoginFormValues } from "@/schemas/authSchema";

function LoginFormContent() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/trips";

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      setIsSubmitting(true);
      await login(values, redirectUrl);
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : "Failed to sign in. Please verify your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-md">
      <Card className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/75 p-7 sm:p-9 shadow-2xl backdrop-blur-2xl">
        {/* Top Accent Gradient Orbs */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-blue-500/15 blur-2xl" />

        {/* Logo Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-950/40 p-2 shadow-inner mb-3">
            <Logo size={36} className="shadow-md shadow-blue-500/20" />
          </div>

          <Typography variant="h2" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Welcome Back
          </Typography>
          <Typography variant="caption" className="text-zinc-400 mt-1 max-w-xs block">
            Sign in to access your saved itineraries and personalized travel history.
          </Typography>
        </div>

        {/* Server Error Banner */}
        {serverError && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/50 p-3 text-xs text-red-300 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Login Form with noValidate */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Mail className="w-4 h-4" />
              </span>
              <Input
                type="email"
                autoComplete="email"
                placeholder="e.g. traveler@kelana.ai"
                className={`pl-10 transition-colors ${
                  errors.email ? "border-red-500/80 focus-visible:ring-red-500/30" : ""
                }`}
                {...register("email")}
                autoFocus
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-400 animate-in fade-in">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.email.message}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Lock className="w-4 h-4" />
              </span>
              <Input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••••••"
                className={`pl-10 pr-10 transition-colors ${
                  errors.password ? "border-red-500/80 focus-visible:ring-red-500/30" : ""
                }`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-400 animate-in fade-in">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.password.message}</span>
              </p>
            )}
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl text-sm font-bold gap-2 active:scale-95 shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Switch to Register */}
        <div className="mt-6 pt-5 border-t border-border/60 text-center">
          <Typography variant="muted" className="text-xs text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href={redirectUrl !== "/trips" ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"}
              className="font-semibold text-primary hover:text-blue-400 transition-colors inline-flex items-center gap-0.5 active:scale-95"
            >
              <span>Create Account</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </Typography>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      <main className="relative flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-full max-w-2xl bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.14),transparent_70%)]" />
        <Suspense fallback={<Loader2 className="w-8 h-8 text-primary animate-spin" />}>
          <LoginFormContent />
        </Suspense>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
