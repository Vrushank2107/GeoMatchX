"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapViewWorker = {
  id: string;
  name: string;
  headline: string;
  rating: number;
  location: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
};

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

type MapViewProps = {
  candidates: MapViewWorker[];
  mapUrl?: string;
};

export function MapView({ candidates, mapUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL }: MapViewProps) {
  // Filter candidates with valid location data
  const workersWithLocation = useMemo(() => {
    return candidates.filter(
      (candidate) =>
        candidate.location &&
        candidate.location.lat != null &&
        candidate.location.lng != null &&
        !isNaN(candidate.location.lat) &&
        !isNaN(candidate.location.lng)
    );
  }, [candidates]);

  const center = useMemo(() => {
    if (!workersWithLocation.length) return { lat: 20.5937, lng: 78.9629 }; // Default to India center
    const avgLat =
      workersWithLocation.reduce((sum, candidate) => sum + (candidate.location.lat || 0), 0) /
      workersWithLocation.length;
    const avgLng =
      workersWithLocation.reduce((sum, candidate) => sum + (candidate.location.lng || 0), 0) /
      workersWithLocation.length;
    return { lat: avgLat, lng: avgLng };
  }, [workersWithLocation]);

  return (
    <div className="h-[500px] w-full overflow-hidden rounded-3xl border border-zinc-200 shadow-xl dark:border-zinc-800">
      <MapContainer center={[center.lat, center.lng]} zoom={4} scrollWheelZoom className="h-full w-full">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors' url={mapUrl ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
        {workersWithLocation.map((candidate) => (
          <Marker
            key={candidate.id}
            position={[candidate.location.lat!, candidate.location.lng!]}
            icon={icon}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{candidate.name}</p>
                <p className="text-xs text-zinc-500">{candidate.headline}</p>
                <p className="text-xs text-indigo-600">Rating {candidate.rating.toFixed(1)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}


