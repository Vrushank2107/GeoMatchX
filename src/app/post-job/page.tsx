"use client";

import PostJobForm from "./post-job-form";
import { Card, CardContent } from "@/components/ui/card";

export default function PostJobPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">SME intake</p>
          <h1 className="text-3xl font-semibold">Post a brief</h1>
          <p className="text-sm text-zinc-500">Provide context, timeline, and budget signals to route the right crews.</p>
        </div>
        <PostJobForm />
      </div>
      <Card className="border-0 bg-zinc-900 text-white">
        <CardContent className="space-y-4 pt-6">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">How it works</p>
          <ol className="space-y-4 text-sm text-zinc-200">
            <li>
              1. Share your mission, budget guardrails, and location stack. Attach any compliance notes (MSA / HSE frameworks).
            </li>
            <li>2. Matching engine prioritizes operators based on capability set, proximity, and reliability scores.</li>
            <li>3. CX desk provides a curated bench and coordinates alignment calls within 24 hours.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}


