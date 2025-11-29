"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function RegisterWorkerPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-3xl border border-white/40 bg-white/80 p-8 shadow-xl dark:border-zinc-900 dark:bg-zinc-950/80">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Operator onboarding</p>
        <h1 className="text-3xl font-semibold">Join GeoMatchX</h1>
        <p className="text-sm text-zinc-500">Share your experience summary and availability. A CX partner will verify your credentials.</p>
      </div>
      <form className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Full name
            <Input required />
          </label>
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Email
            <Input type="email" required />
          </label>
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Skill focus
            <Input placeholder="Electrical, Hospitality..." required />
          </label>
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            City
            <Input required />
          </label>
        </div>
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
          Experience summary
          <Textarea placeholder="Highlight projects and certifications..." required />
        </label>
        <Button type="submit" className="w-full" disabled>
          Submit profile (UI only)
        </Button>
      </form>
    </div>
  );
}


