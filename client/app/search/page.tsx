"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft as ArrowLeftLucide, Search as SearchLucide, SlidersHorizontal, TrendingUp, MapPin } from 'lucide-react';
import { useLocationStore } from '@/store/locationStore';
import { PropertyCard } from '@/components/property/PropertyCard';

export default function SearchPage() {
  const router = useRouter();
  const { setLocation, locationName, coordinates } = useLocationStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Geographic Coordinate Search Hook
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const rawText = searchQuery.toLowerCase();
        
        // Lightweight geographic stripper (removes nouns so Nominatim doesn't fail)
        const cleanForGeo = rawText
            .replace(/\b(pg|boys|girls|rent|house|apartment|bhk|room|flat|villa|mens|womens|in|near|around|for)\b/gi, '')
            .replace(/\s+/g, ' ')
            .trim();

        const targetGeo = cleanForGeo || rawText.trim();
        
        let lat = null;
        let lng = null;

        // 1. Forward Geocode the Cleaned Location String natively
        try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(targetGeo)}&limit=1`, {
                headers: { 'User-Agent': 'bnest-geo-engine' }
            });
            const geoData = await geoRes.json();
            if (geoData && geoData.length > 0) {
                lat = geoData[0].lat;
                lng = geoData[0].lon;
            }
        } catch (e) { console.warn("OSM Geocoding failed", e); }

        // 2. Transmit strict coords to backend API
        const params = new URLSearchParams();
        params.append('queryText', rawText.trim());
        if (lat && lng) {
            params.append('lat', lat);
            params.append('lng', lng);
            // Engine will natively try 3KM cutoff in backend, falling back to 5KM logic natively.
        }

        const res = await fetch(`/api/properties/search?${params.toString()}&_t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        
        if (data.success) {
          setSearchResults(data.data || []);
        }
      } catch (err) {
        console.error("Geographic Search Engine Failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 700); // 700ms debounce (slightly longer to protect OSM rates)

    return () => clearTimeout(timer);
  }, [searchQuery]);


  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50">
      {/* Header & Smart Search Input */}
      <header className="px-3 py-4 border-b border-slate-200 sticky top-0 bg-white z-20 shadow-sm flex items-center gap-2">
        <button 
          onClick={() => router.back()} 
          className="p-2.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeftLucide className="w-6 h-6 text-slate-700" />
        </button>
        <div className="flex-1 relative flex items-center">
          <input 
            autoFocus
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Try "boys pg under 6000 near peelamedu"' 
            className="w-full bg-slate-100 placeholder:text-slate-400 text-slate-900 font-bold tracking-tight text-[14px] pl-5 pr-12 py-3 rounded-full outline-none focus:ring-2 focus:ring-[#801786]/20 focus:bg-white border border-transparent focus:border-[#801786] transition-all shadow-inner"
          />
          <div className="absolute right-4 pointer-events-none">
            {isSearching ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-[#801786] rounded-full animate-spin"></div>
            ) : (
                <SearchLucide className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
      </header>

      {/* Main Engine Results */}
      <main className="flex-1 bg-slate-50 overflow-y-auto">
        
        {/* Dynamic Display */}
        {searchQuery.trim() ? (
           <div className="p-4 space-y-4">
              <div className="flex items-center justify-between px-1 mb-2">
                 <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    {searchResults.length} Results Found
                 </h2>
                 <p className="text-xs text-red-500 font-mono">DEBUG: {searchQuery}</p>
                 <button className="flex items-center gap-1.5 text-xs font-bold text-[#801786] bg-[#801786]/10 px-3 py-1.5 rounded-full">
                    <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
                 </button>
              </div>

              {searchResults.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {searchResults.map((item) => (
                       <PropertyCard 
                          key={item._id}
                          id={item._id}
                          image={item.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'}
                          rent={item.rent}
                          location={`${item.location?.area || 'Area'}, ${item.location?.city || 'City'}`}
                          matchScore={item.matchScore > 0 ? item.matchScore : undefined}
                          moveInStatus={item.moveInReady ? 'Move-in Ready' : undefined}
                       />
                    ))}
                 </div>
              ) : (
                 !isSearching && (
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center mt-6">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <SearchLucide className="w-8 h-8 text-slate-300" />
                       </div>
                       <h3 className="text-slate-800 font-extrabold text-lg mb-1">No exact matches found</h3>
                       <p className="text-slate-500 text-sm max-w-[250px] mx-auto leading-relaxed">
                          Try simplifying your search. For example, instead of 'beautiful single room', try <b>'1bhk'</b>.
                       </p>
                    </div>
                 )
              )}
           </div>
        ) : (
           <div className="p-5 flex flex-col items-center justify-center h-full opacity-50">
              <SearchLucide className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-slate-400 text-sm font-semibold">Start typing to search properties</p>
           </div>
        )}
      </main>
    </div>
  );
}
