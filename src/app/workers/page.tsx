"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { WorkerCard } from "@/components/worker-card";
import { LoadingState } from "@/components/loading-state";
import type { Worker } from "@/lib/mockData";

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkers() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/workers");
        if (!response.ok) {
          throw new Error("Failed to fetch workers");
        }
        const data = await response.json();
        setWorkers(data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchWorkers();
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Verified directory</p>
          <h1 className="text-3xl font-semibold">Operators ready for activation</h1>
        </div>
        <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Verified directory</p>
          <h1 className="text-3xl font-semibold">Operators ready for activation</h1>
        </div>
        <Button asChild>
          <Link href="/post-job">Post a new brief</Link>
        </Button>
      </div>
      {workers.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500">No workers found. Check back later!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {workers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} actionHref={`/workers/${worker.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}


