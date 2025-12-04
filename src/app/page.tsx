"use client";

import { useEffect, useState } from "react";
import HomeClient from "./home-client";
import { useAuth } from "@/lib/auth-client";

export type HomeWorker = {
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

export type HomeJob = {
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
};

export type HomeRecommendation = {
  id: string;
  worker: HomeWorker;
  matchScore: number;
  driver: string;
};

export default function Home() {
  const { user, isAuthenticated, isLoading: authLoading, isWorker, isSME } = useAuth();
  const [workers, setWorkers] = useState<HomeWorker[]>([]);
  const [jobs, setJobs] = useState<HomeJob[]>([]);
  const [recommendations, setRecommendations] = useState<HomeRecommendation[]>([]);
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
