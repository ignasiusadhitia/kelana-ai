import Link from "next/link";
import { Lock, LogIn } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export function UnauthenticatedTripsPrompt() {
  return (
    <Card className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-card/50 p-8 sm:p-12 text-center backdrop-blur-xl animate-in fade-in duration-300">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.1),transparent_70%)]" />
      <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-950/40 text-blue-400 shadow-inner">
        <Lock className="w-7 h-7" />
      </div>
      <Typography variant="h3" className="font-bold text-white text-xl">
        Sign In to View Your Trips
      </Typography>
      <Typography variant="muted" as="p" className="mx-auto mt-2 max-w-md text-sm text-zinc-300">
        Your travel itineraries and history are private and saved securely to your account.
      </Typography>
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/login">
          <Button variant="default" size="sm" className="gap-2 px-6 shadow-md active:scale-95">
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Button>
        </Link>
        <Link href="/register">
          <Button variant="outline" size="sm" className="gap-2 px-6 active:scale-95">
            <span>Create Account</span>
          </Button>
        </Link>
      </div>
    </Card>
  );
}
