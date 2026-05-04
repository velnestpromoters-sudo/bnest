import { create } from 'zustand';

interface LocationState {
  locationName: string;
  coordinates: { lat: number; lng: number } | null;
  setLocation: (name: string, coords?: { lat: number; lng: number }) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  locationName: 'Select Location', // Default empty state
  coordinates: null,
  setLocation: (name, coords) => set({ locationName: name, coordinates: coords || null }),
}));
