"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { Worker } from "@/lib/mockData";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

type MapViewProps = {
  workers: Worker[];
  mapUrl?: string;
};

export function MapView({ workers, mapUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL }: MapViewProps) {
  const center = useMemo(() => {
    if (!workers.length) return { lat: 0, lng: 0 };
    const avgLat = workers.reduce((sum, worker) => sum + worker.location.lat, 0) / workers.length;
    const avgLng = workers.reduce((sum, worker) => sum + worker.location.lng, 0) / workers.length;
    return { lat: avgLat, lng: avgLng };
  }, [workers]);

  return (
    <div className="h-[500px] w-full overflow-hidden rounded-3xl border border-zinc-200 shadow-xl dark:border-zinc-800">
      <MapContainer center={[center.lat, center.lng]} zoom={4} scrollWheelZoom className="h-full w-full">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors' url={mapUrl ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
        {workers.map((worker) => (
          <Marker key={worker.id} position={[worker.location.lat, worker.location.lng]} icon={icon}>
            <Popup>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{worker.name}</p>
                <p className="text-xs text-zinc-500">{worker.headline}</p>
                <p className="text-xs text-indigo-600">Rating {worker.rating.toFixed(1)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}


