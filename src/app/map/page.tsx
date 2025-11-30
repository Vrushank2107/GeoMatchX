"use client";

import { useEffect, useState } from "react";
import MapClient from "./map-client";
import { LoadingState } from "@/components/loading-state";
import type { Worker } from "@/lib/mockData";

export default function MapPage() {
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
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Coverage intelligence</p>
          <h1 className="text-3xl font-semibold">Live worker density and proximity</h1>
        </div>
        <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      </div>
    );
  }

  return <MapClient workers={workers} />;
}

