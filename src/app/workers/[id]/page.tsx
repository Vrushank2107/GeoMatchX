"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BadgeCheck, Mail, MapPin, Star } from "lucide-react";

import { getWorkerById, type Worker } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/loading-state";

export default function WorkerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`/api/profile/${id}`);
        if (response.status === 404) {
          router.push("/workers");
          return;
        }
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to load profile");
        }
        const data = (await response.json()) as Worker;
        setWorker(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [id, router]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !worker) {
    return (
      <div className="space-y-8">
        <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-200">
          {error || "Worker not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">GeoMatchX verified</p>
            <h1 className="text-3xl font-semibold">{worker.name}</h1>
            <p className="text-sm text-zinc-500">{worker.headline}</p>
          </div>
          <div className="flex items-center gap-3 rounded-full bg-indigo-50 px-4 py-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
            <Star className="h-4 w-4" />
            {worker.rating.toFixed(1)} · {worker.experience}+ yrs
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-900/70">
            <MapPin className="h-4 w-4" />
            {worker.location.city}, {worker.location.country}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-900/70">
            Availability: {worker.availability}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-900/70">
            Rate: ${worker.hourlyRate}/hr
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <section>
              <h2 className="text-lg font-semibold">About</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{worker.bio}</p>
            </section>
            <section>
              <h3 className="text-sm font-semibold text-zinc-500">Core skills</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {worker.skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-1.5 text-sm text-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200">
                    <BadgeCheck className="h-4 w-4 text-indigo-500" />
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-lg font-semibold">Engage this operator</h2>
            <p className="text-sm text-zinc-500">Share project context, mobilization date, and budget guardrails. Our CX team will coordinate within 24h.</p>
            <Button className="w-full" asChild>
              <a href="mailto:cx@geomatchx.com">
                Contact deployment desk
                <Mail className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


