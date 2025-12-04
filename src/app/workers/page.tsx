"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { WorkerCard } from "@/components/worker-card";
import { LoadingState } from "@/components/loading-state";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Building2, User } from "lucide-react";

export type DirectoryWorker = {
  id: string;
  name: string;
  headline: string;
  experience: number;
  availability: string;
  hourlyRate: number;
  location: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  rating: number;
  skills: string[];
  bio: string;
};

export default function WorkersPage() {
  const { isAuthenticated, isSME, user, isWorker } = useAuth();
  const [workers, setWorkers] = useState<DirectoryWorker[]>([]);
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
        let filteredWorkers = data.results || [];
        
        // Filter out current user if they are a worker
        if (isWorker && user) {
          const currentUserId = user.id;
          // Worker IDs are in format "wkr-{user_id}", so we need to extract the numeric part
          filteredWorkers = filteredWorkers.filter((worker: DirectoryWorker) => {
            const workerIdMatch = worker.id.match(/wkr-(\d+)/);
            const workerUserId = workerIdMatch ? parseInt(workerIdMatch[1]) : null;
            return workerUserId !== currentUserId;
          });
        }
        
        setWorkers(filteredWorkers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchWorkers();
  }, [isWorker, user]);

    return (
    <AuthGuard requireAuth>
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Verified directory</p>
            <h1 className="text-3xl font-semibold">
              {isSME ? "Operators ready for activation" : "Browse fellow workers"}
            </h1>
        </div>
          {isSME && (
        <Button asChild>
          <Link href="/post-job">Post a new brief</Link>
        </Button>
          )}
        </div>
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
      </div>
        ) : workers.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500">No workers found. Check back later!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {workers.map((worker) => (
            <WorkerCard 
              key={worker.id} 
              worker={worker} 
              actionHref={`/workers/${worker.id}`}
              showRecruitButton={isSME}
            />
          ))}
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
