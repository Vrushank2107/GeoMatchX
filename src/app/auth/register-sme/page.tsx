"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function RegisterSmePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-3xl border border-white/40 bg-white/80 p-8 shadow-xl dark:border-zinc-900 dark:bg-zinc-950/80">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">SME onboarding</p>
        <h1 className="text-3xl font-semibold">Request workspace access</h1>
        <p className="text-sm text-zinc-500">Tell us about your operations footprint and upcoming missions.</p>
      </div>
      <form className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Company name
            <Input required />
          </label>
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Work email
            <Input type="email" required />
          </label>
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            HQ city
            <Input required />
          </label>
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Industries served
            <Input placeholder="Energy, hospitality..." />
          </label>
        </div>
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
          Deployment needs
          <Textarea placeholder="Upcoming briefs, geographies, compliance expectations..." required />
        </label>
        <Button type="submit" className="w-full" disabled>
          Request access (UI only)
        </Button>
      </form>
    </div>
  );
}


