"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
}

export default function MapBackground({ coordinates }: { coordinates: { lat: number, lng: number } | null }) {
  const defaultCenter: [number, number] = [11.0168, 76.9558]; // Coimbatore default
  const position: [number, number] = coordinates ? [coordinates.lat, coordinates.lng] : defaultCenter;

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer 
        center={position} 
        zoom={12} 
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
        {coordinates && <Marker position={position} />}
        <MapUpdater center={position} />
      </MapContainer>
    </div>
  );
}
