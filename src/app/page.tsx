"use client";

import { useEffect, useState } from "react";
import { getJobs, getRecommendations, getWorkers } from "@/lib/mockData";
import HomeClient from "./home-client";

export default function Home() {
  const [workers, setWorkers] = useState(getWorkers());
  const [jobs, setJobs] = useState(getJobs());
  const [recommendations, setRecommendations] = useState(getRecommendations());

  useEffect(() => {
    setWorkers(getWorkers());
    setJobs(getJobs());
    setRecommendations(getRecommendations());
  }, []);

  return (
    <HomeClient workers={workers} jobs={jobs} recommendations={recommendations} />
  );
}
