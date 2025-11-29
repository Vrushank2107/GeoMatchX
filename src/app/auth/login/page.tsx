"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-white/40 bg-white/80 p-8 shadow-xl dark:border-zinc-900 dark:bg-zinc-950/80">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Welcome back</p>
        <h1 className="text-2xl font-semibold">Access your workspace</h1>
      </div>
      <form className="space-y-4">
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
          Email
          <Input type="email" placeholder="you@company.com" required />
        </label>
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
          Password
          <Input type="password" placeholder="••••••••" required />
        </label>
        <Button type="submit" className="w-full" disabled>
          Login (UI only)
        </Button>
      </form>
    </div>
  );
}


