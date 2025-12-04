"use client";

import { useEffect, useState } from "react";
import HomeClient from "./home-client";
import { useAuth } from "@/lib/auth-client";
import type { Worker, Job, Recommendation } from "@/lib/mockData";

export default function Home() {
  const { user, isAuthenticated, isLoading: authLoading, isWorker, isSME } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch workers (public API)
        const workersResponse = await fetch("/api/workers");
        if (workersResponse.ok) {
          const workersData = await workersResponse.json();
          setWorkers(workersData.results?.slice(0, 6) || []); // Show first 6 workers
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      fetchData();
    }
  }, [isAuthenticated, authLoading]);

  return (
    <HomeClient 
      workers={workers} 
      jobs={jobs} 
      recommendations={recommendations}
      isLoading={isLoading || authLoading}
      isAuthenticated={isAuthenticated}
      user={user}
      isWorker={isWorker}
      isSME={isSME}
    />
  );
}
