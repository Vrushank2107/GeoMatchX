"use client";

import { useState, useEffect } from "react";
import { SignalHigh, Briefcase } from "lucide-react";
import Link from "next/link";

import type { SearchFilters } from "@/components/search-bar";
import { SearchBar } from "@/components/search-bar";
import { LoadingState } from "@/components/loading-state";
import { WorkerCard } from "@/components/worker-card";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-client";

export type SearchWorker = {
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

export type SearchJob = {
  id: string;
  title: string;
  company: string;
  budget: string;
  location: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  requiredSkills: string[];
  description: string;
  job_id?: number;
};

type SearchResponse = {
  results: SearchWorker[];
  total: number;
};

export default function SearchClient() {
  const { isWorker, isSME } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchWorker[]>([]);
  const [jobs, setJobs] = useState<SearchJob[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showJobs, setShowJobs] = useState(isWorker);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [lastFilters, setLastFilters] = useState<SearchFilters | null>(null);

  // When auth state changes, update toggle to default to jobs view for workers
  useEffect(() => {
    if (isWorker) {
      setShowJobs(true);
    } else {
      setShowJobs(false);
    }
  }, [isWorker]);

  useEffect(() => {
    if (isWorker && showJobs) {
      // Fetch jobs for workers when Jobs view is selected
      fetch("/api/jobs")
        .then((res) => res.json())
        .then((data) => setJobs(data.jobs || []))
        .catch(console.error);
    }
  }, [isWorker, showJobs]);

  async function fetchResults(filters: SearchFilters, pageToLoad: number) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...filters, page: pageToLoad, pageSize }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch matches");
      }
      const data = (await response.json()) as SearchResponse;
      setResults(data.results || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSearch(filters: SearchFilters) {
    setLastFilters(filters);
    setPage(1);
    await fetchResults(filters, 1);
  }

  function handleApplySuccess() {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => setJobs(data.jobs || []))
      .catch(console.error);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-8">
      <SearchBar onSubmit={handleSearch} isLoading={isLoading} />
      
      {isWorker && (
        <div className="flex gap-2">
          <Button
            variant={showJobs ? "default" : "outline"}
            onClick={() => {
              setShowJobs(true);
              // Fetch jobs when Jobs button is clicked
              fetch("/api/jobs")
                .then((res) => res.json())
                .then((data) => setJobs(data.jobs || []))
                .catch(console.error);
            }}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Jobs
          </Button>
          <Button
            variant={!showJobs ? "default" : "outline"}
            onClick={() => setShowJobs(false)}
          >
            Workers
          </Button>
        </div>
      )}

      {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-200">{error}</p>}
      
      {isLoading && <LoadingState />}
      
      {isWorker && showJobs && !isLoading && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">
            Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{jobs.length}</span> available jobs
          </p>
          {jobs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-800">
              <Briefcase className="mx-auto h-6 w-6 text-indigo-500" />
              <p className="mt-4 text-lg font-semibold">No jobs available</p>
              <p className="text-sm text-zinc-500">Check back later for new opportunities.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  showApplyButton={true}
                  onApplySuccess={handleApplySuccess}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {(!isWorker || !showJobs) && !isLoading && results.length === 0 && (
        <div className="rounded-3xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-800">
          <SignalHigh className="mx-auto h-6 w-6 text-indigo-500" />
          <p className="mt-4 text-lg font-semibold">Run your first search</p>
          <p className="text-sm text-zinc-500">Filter by skill, radius, or city to view live operators.</p>
        </div>
      )}
      
      {(!isWorker || !showJobs) && !isLoading && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">
            Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{total}</span> matching operators
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {results.map((worker) => (
              <WorkerCard 
                key={worker.id} 
                worker={worker} 
                actionHref={`/workers/${worker.id}`}
                showRecruitButton={isSME}
              />
            ))}
          </div>

          {lastFilters && totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-xs text-zinc-500">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isLoading}
                  onClick={() => {
                    if (lastFilters && page > 1) {
                      const newPage = page - 1;
                      setPage(newPage);
                      fetchResults(lastFilters, newPage);
                    }
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => {
                    if (lastFilters && page < totalPages) {
                      const newPage = page + 1;
                      setPage(newPage);
                      fetchResults(lastFilters, newPage);
                    }
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


