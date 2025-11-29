"use client";

import dynamic from "next/dynamic";

import type { Worker } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";

const MapView = dynamic(() => import("@/components/map-view").then((mod) => mod.MapView), { ssr: false });

type MapClientProps = {
  workers: Worker[];
};

export default function MapClient({ workers }: MapClientProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Coverage intelligence</p>
        <h1 className="text-3xl font-semibold">Live worker density and proximity</h1>
        <p className="text-sm text-zinc-500">
          Use map overlays to cluster talent pools and prioritize deployment corridors.
        </p>
      </div>
      <MapView workers={workers} />
      <Card>
        <CardContent className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
          <p>
            Need private labels or dark mode tiles? Set <code>NEXT_PUBLIC_MAP_TILE_URL</code> in your environment to
            change the provider.
          </p>
          <p>Pair this map with the search workspace to narrow down to micro-corridors before engagement.</p>
        </CardContent>
      </Card>
    </div>
  );
}


