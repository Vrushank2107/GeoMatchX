"use client";

import { useEffect, useState } from "react";
import { getWorkers } from "@/lib/mockData";
import MapClient from "./map-client";

export default function MapPage() {
  const [workers, setWorkers] = useState(getWorkers());

  useEffect(() => {
    setWorkers(getWorkers());
  }, []);

  return <MapClient workers={workers} />;
}

