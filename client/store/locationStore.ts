import { create } from 'zustand';

export interface GeoData {
  lat: number;
  lng: number;
  area: string;
  city: string;
  state: string;
  pincode: string;
  fullAddress: string;
  confidence: number;
}

interface LocationState {
  locationName: string;
  coordinates: { lat: number; lng: number } | null;
  geoData: GeoData | null;
  setLocation: (name: string, coords?: { lat: number; lng: number }, geo?: GeoData) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  locationName: 'Select Location', // Default empty state
  coordinates: null,
  geoData: null,
  setLocation: (name, coords, geo) => set({ locationName: name, coordinates: coords || null, geoData: geo || null }),
}));
