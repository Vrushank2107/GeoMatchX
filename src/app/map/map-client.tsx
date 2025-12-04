"use client";

import dynamic from "next/dynamic";

import type { MapWorker } from "@/app/map/page";
import { Card, CardContent } from "@/components/ui/card";

const MapView = dynamic(() => import("@/components/map-view").then((mod) => mod.MapView), { ssr: false });

type MapClientProps = {
  workers: MapWorker[];
};

export default function MapClient({ workers }: MapClientProps) {
  return (
    <div className="space-y-6">
      <MapView workers={workers} />
    </div>
  );
}


