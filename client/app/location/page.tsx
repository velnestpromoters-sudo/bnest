"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Search, Navigation } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useLocationStore } from '@/store/locationStore';

// Next.js: Leaflet accesses window, so dynamically import it with SSR completely disabled
const MapBackground = dynamic(() => import('@/components/map/MapBackground'), { ssr: false });

export default function LocationSelector() {
  const router = useRouter();
  const { setLocation, coordinates } = useLocationStore();
  const [search, setSearch] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  
  // Mock districts
  const districts = ['Coimbatore', 'Chennai', 'Bangalore', 'Kochi', 'Trivandrum', 'Hyderabad'];

  const handleDetectLocation = () => {
    if (!('geolocation' in navigator)) return alert("Geolocation not supported");
    
    setIsDetecting(true);
    
    // Aggressive Dual-Fallback Detection System (Mappls -> BigDataCloud)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          let detected = null;

          // 1. Ask Secure API Proxy (Mappls Enterprise)
          try {
            const mapplsRes = await fetch(`/api/location?lat=${latitude}&lng=${longitude}`);
            const mapplsData = await mapplsRes.json();
            if (mapplsData.success && mapplsData.location) {
              detected = mapplsData.location;
            }
          } catch (proxyErr) {
             console.warn("Mappls Proxy Failed", proxyErr);
          }

          // 2. Safely Fallback to BigDataCloud Free API
          if (!detected) {
            const bdcRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const bdcData = await bdcRes.json();
            detected = bdcData.locality || bdcData.city || bdcData.principalSubdivision;
          }

          const finalLocation = detected || 'Unknown Area';
          setLocation(`📍 ${finalLocation}`, { lat: latitude, lng: longitude });
          
          // Cinematic pause to show the spinning "Triangulating Make..." UI & let map fly to marker
          setTimeout(() => {
             setIsDetecting(false);
             router.push('/home'); 
          }, 1500);
          
        } catch (error) {
          console.error("Total Geocoding failure", error);
          setIsDetecting(false);
          alert("Could not detect location securely. Please select manually.");
        }
      },
      (err) => {
        setIsDetecting(false);
        alert("Please enable GPS permissions to use this feature.");
      }
    );
  };

  const handleManualSelect = (district: string) => {
     setLocation(`📍 ${district}`); // Coords are null, map will revert to default
     router.push('/home');
  };

  return (
    <div className="relative min-h-[100dvh] bg-black flex flex-col overflow-hidden">
      
      {/* 1. Underlying Map Engine */}
      <MapBackground coordinates={coordinates} />

      {/* 2. Glassmorphism Screen Overlay (Dims map and creates blur) */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 pointer-events-none" />

      {/* 3. Interactive UI Layer */}
      <div className="relative z-20 flex flex-col h-full flex-1">
          <header className="bg-white/90 backdrop-blur-md px-5 py-5 flex items-center gap-4 sticky top-0 shadow-sm border-b border-white/20">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-black/5 active:scale-95 transition">
              <ArrowLeft className="w-6 h-6 text-slate-800" />
            </button>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 drop-shadow-sm">Select Location</span>
          </header>

          <div className="p-5 flex-1 max-w-md mx-auto w-full overflow-y-auto">
            
            {/* Search Bar */}
            <div className="mb-6 relative group shadow-md rounded-3xl">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-[#FF6A3D] transition-colors" />
              </div>
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for your district..." 
                className="w-full pl-14 pr-5 py-4 rounded-3xl bg-white/95 backdrop-blur-md border border-white/50 outline-none text-slate-900 focus:shadow-lg focus:border-[#FF6A3D] transition-all text-sm font-semibold placeholder:font-medium placeholder:text-slate-400"
              />
            </div>

            {/* Huge Auto-Detect Target */}
            <button 
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className={`w-full flex items-center gap-4 p-5 bg-[#FF6A3D]/90 backdrop-blur-xl border border-[#FF6A3D]/40 rounded-3xl mb-6 shadow-xl active:scale-[0.98] transition-all text-left group overflow-hidden relative ${isDetecting ? 'opacity-80 pointer-events-none' : 'hover:bg-[#FF6A3D]'}`}
            >
              {/* Animated ping effect */}
              {isDetecting && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}

              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md shrink-0 relative z-10">
                 {isDetecting ? (
                    <div className="w-5 h-5 border-2 border-[#FF6A3D] border-t-transparent rounded-full animate-spin"></div>
                 ) : (
                    <Navigation className="w-5 h-5 text-[#FF6A3D] fill-[#FF6A3D]/20 animate-bounce" />
                 )}
              </div>
              <div className="flex-1 relative z-10">
                 <h4 className="text-white font-black text-lg tracking-tight shadow-black/10 text-shadow-sm">
                   {isDetecting ? 'Triangulating Map...' : 'Detect Exact Location'}
                 </h4>
                 <p className="text-orange-100 text-xs mt-0.5 font-medium">Uses GPS for hyper-precision</p>
              </div>
            </button>

            {/* List */}
            <div className="mb-10">
              <h3 className="text-slate-600 font-extrabold uppercase tracking-widest text-[10px] mb-3 ml-2 drop-shadow-sm">Popular Districts</h3>
              <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-3xl overflow-hidden shadow-lg">
                {districts.filter(d => d.toLowerCase().includes(search.toLowerCase())).map((district, index) => (
                  <button 
                    key={district}
                    onClick={() => handleManualSelect(district)}
                    className={`w-full text-left p-4 font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-3 transition-colors ${index !== districts.length - 1 ? 'border-b border-slate-100/50' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                       <MapPin className="w-4 h-4 text-slate-500" />
                    </div>
                    {district}
                  </button>
                ))}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
