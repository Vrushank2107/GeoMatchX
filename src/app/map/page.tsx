"use client";

import { useEffect, useState } from "react";
import MapClient from "./map-client";
import { LoadingState } from "@/components/loading-state";
import { AuthGuard } from "@/components/auth-guard";

export type MapWorker = {
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

export default function MapPage() {
  const [candidates, setWorkers] = useState<MapWorker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkers() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/candidates");
        if (!response.ok) {
          throw new Error("Failed to fetch candidates");
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

    return (
    <AuthGuard requireAuth>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Coverage intelligence</p>
          <h1 className="text-3xl font-semibold">Live candidate density and proximity</h1>
          <p className="text-sm text-zinc-500">
            Visualize candidate locations and coverage across different regions.
          </p>
        </div>
        {isLoading ? (
          <LoadingState />
        ) : error ? (
        <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
        ) : (
          <MapClient candidates={candidates} />
        )}
      </div>
    </AuthGuard>
    );
  }
