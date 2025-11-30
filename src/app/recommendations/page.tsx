"use client";

import { useEffect, useState } from "react";
import { RecommendationList } from "@/components/recommendation-list";
import { LoadingState } from "@/components/loading-state";

type Recommendation = {
  id: string;
  worker: any;
  matchScore: number;
  driver: string;
};

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch("/api/recommend");
        if (!response.ok) {
          throw new Error("Unable to load recommendations");
        }
        const data = await response.json();
        setRecommendations(data.recommendations);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchRecommendations();
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Intelligence layer</p>
          <h1 className="text-3xl font-semibold">Smart recommendations</h1>
        </div>
        <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Intelligence layer</p>
        <h1 className="text-3xl font-semibold">Smart recommendations</h1>
        <p className="text-sm text-zinc-500">
          Weighted scoring incorporates mission-fit, recency, proximity, and reliability so you can act fast with confidence.
        </p>
      </div>
      <RecommendationList recommendations={recommendations} />
    </div>
  );
}


