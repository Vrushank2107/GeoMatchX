"use client";

import { useState } from "react";
import { SignalHigh } from "lucide-react";

import type { SearchFilters } from "@/components/search-bar";
import { SearchBar } from "@/components/search-bar";
import { LoadingState } from "@/components/loading-state";
import { WorkerCard } from "@/components/worker-card";
import type { Worker } from "@/lib/mockData";

type SearchResponse = {
  results: Worker[];
  total: number;
};

export default function SearchClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Worker[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(filters: SearchFilters) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/mock/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch matches");
      }
      const data = (await response.json()) as SearchResponse;
      setResults(data.results);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <SearchBar onSubmit={handleSearch} isLoading={isLoading} />
      {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-200">{error}</p>}
      {isLoading && <LoadingState />}
      {!isLoading && results.length === 0 && (
        <div className="rounded-3xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-800">
          <SignalHigh className="mx-auto h-6 w-6 text-indigo-500" />
          <p className="mt-4 text-lg font-semibold">Run your first search</p>
          <p className="text-sm text-zinc-500">Filter by skill, radius, or city to view live operators.</p>
        </div>
      )}
      {!isLoading && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">
            Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{total}</span> matching operators
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {results.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


