"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft, MapPin, Navigation, TrendingUp } from 'lucide-react';
import { useLocationStore } from '@/store/locationStore';

const POPULAR_CITIES = [
  { name: 'Mumbai, Maharashtra', lat: 19.0760, lng: 72.8777 },
  { name: 'Delhi, NCR', lat: 28.7041, lng: 77.1025 },
  { name: 'Bengaluru, Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai, Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { name: 'Hyderabad, Telangana', lat: 17.3850, lng: 78.4867 }
];

export default function SearchPage() {
  const router = useRouter();
  const { setLocation } = useLocationStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Debounced API fetching for autocomplete (same engine as Map)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Bias towards Indian coordinates by default if none provided
        const lat = 20.5937;
        const lng = 78.9629;
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&lat=${lat}&lng=${lng}`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.features || []);
        }
      } catch (err) {
        console.error("Auto-Complete failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectResult = (name: string, lat: number, lng: number) => {
    setLocation(`📍 ${name}`, { lat, lng });
    router.push('/home'); // Send them to the feed with the new target area!
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
       const best = searchResults[0];
       const [lon, lat] = best.geometry.coordinates;
       const name = best.properties.name || best.properties.city || "Exact Location";
       handleSelectResult(name, lat, lon);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50">
      {/* Header & Search Engine */}
      <header className="px-3 py-4 border-b border-slate-200 sticky top-0 bg-white z-20 shadow-sm flex items-center gap-2">
        <button 
          onClick={() => router.back()} 
          className="p-2.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <form onSubmit={onSubmit} className="flex-1 relative">
          <input 
            autoFocus
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search matching homes, areas..." 
            className="w-full bg-slate-100 placeholder:text-slate-400 text-slate-900 font-bold tracking-tight text-[15px] px-5 py-3 rounded-full outline-none focus:ring-2 focus:ring-[#801786]/20 focus:bg-white border focus:border-[#801786] transition-all shadow-inner"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            {isSearching ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-[#801786] rounded-full animate-spin"></div>
            ) : (
                <Search className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </form>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 bg-white overflow-y-auto">
        
        {/* Dynamic Auto-Complete Results */}
        {searchQuery.trim() && (
          <div className="flex flex-col divide-y divide-slate-100">
             {searchResults.length > 0 ? searchResults.map((res: any, idx: number) => {
                const name = res.properties.name || "Unknown Place";
                const street = res.properties.street || res.properties.city || res.properties.state || "Exact Location";
                const [lon, lat] = res.geometry.coordinates; // GeoJSON puts Longitude first
                return (
                  <button 
                    key={idx}
                    type="button"
                    onClick={() => handleSelectResult(name, lat, lon)}
                    className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors flex items-center gap-4 active:bg-slate-100"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-[#801786]" />
                    </div>
                    <div className="flex flex-col pr-4">
                        <span className="text-slate-900 font-extrabold text-[15px] line-clamp-1">{name}</span>
                        <span className="text-slate-500 font-medium text-xs line-clamp-1 mt-0.5">{street}</span>
                    </div>
                  </button>
                )
             }) : (
                !isSearching && (
                  <div className="p-8 flex flex-col items-center justify-center text-center">
                     <Search className="w-12 h-12 text-slate-200 mb-3" />
                     <h3 className="text-slate-800 font-bold">No exact matches</h3>
                     <p className="text-slate-500 text-sm mt-1">Try searching broadly, like "Mumbai" instead of a street.</p>
                  </div>
                )
             )}
          </div>
        )}

        {/* Empty State: Popular Suggestions instead of No Recent Searches */}
        {!searchQuery.trim() && (
          <div className="p-5">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> POPULAR SUGGESTIONS
            </h2>
            <div className="flex flex-col gap-2">
               <button 
                 onClick={() => {
                   if ('geolocation' in navigator) {
                     navigator.geolocation.getCurrentPosition((pos) => {
                       handleSelectResult("My Current Location", pos.coords.latitude, pos.coords.longitude);
                     });
                   }
                 }}
                 className="flex items-center gap-4 p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-100 transition-colors active:scale-[0.98]"
               >
                 <div className="w-10 h-10 bg-[#801786] rounded-full flex items-center justify-center shadow-lg shadow-[#801786]/20">
                   <Navigation className="w-5 h-5 fill-white text-white rotate-45" />
                 </div>
                 <div className="flex flex-col text-left">
                   <span className="font-bold text-[#801786]">Use Current Location</span>
                   <span className="text-xs text-[#801786]/70 font-medium">GPS Satellite Search</span>
                 </div>
               </button>

               <div className="h-px bg-slate-100 my-2" />

               {POPULAR_CITIES.map((city, idx) => (
                 <button 
                   key={idx}
                   onClick={() => handleSelectResult(city.name, city.lat, city.lng)}
                   className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors active:bg-slate-100"
                 >
                   <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                     <MapPin className="w-5 h-5 text-slate-400" />
                   </div>
                   <div className="text-left">
                     <span className="font-bold text-slate-800 block">{city.name}</span>
                   </div>
                 </button>
               ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
