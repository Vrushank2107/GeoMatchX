"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { JobCard } from "@/components/job-card";
import { LoadingState } from "@/components/loading-state";

export type JobsPageJob = {
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

export default function JobsPage() {
  const { isWorker } = useAuth();
  const [jobs, setJobs] = useState<JobsPageJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/jobs");
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }
        const data = await response.json();
        setJobs(data.jobs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchJobs();
  }, []);

  function handleApplySuccess() {
    // Refresh jobs or update UI as needed
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => setJobs(data.jobs || []))
      .catch(console.error);
  }

  return (
    <AuthGuard requireAuth>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Job Listings</p>
          <h1 className="text-3xl font-semibold">Available Jobs</h1>
          <p className="text-sm text-zinc-500">
            {isWorker 
              ? "Browse and apply for jobs that match your skills." 
              : "View all available job postings."}
          </p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-zinc-500">No jobs available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                showApplyButton={isWorker}
                onApplySuccess={handleApplySuccess}
              />
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

