"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import VideoCard from '@/components/reel/VideoCard';
import SearchBar from '@/components/common/SearchBar';
import BottomBar from '@/components/common/BottomBar';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { useAuthModalStore } from '@/store/authModalStore';

import api from '@/lib/api';

interface PropertyFeedData {
  _id: string;
  images: string[];
  rent: number;
  location: {
    area?: string;
    city?: string;
  };
  matchScore?: number;
  moveInReady?: boolean;
}

export default function HomeReelPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { openModal } = useAuthModalStore();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const logout = useAuthStore(state => state.logout);

  const handleProfileClick = () => {
    if (!isAuthenticated) return openModal();
    if (user?.role === 'owner') return router.push('/owner/dashboard');
    if (user?.role === 'tenant') setShowLogoutMenu(!showLogoutMenu);
  };

  const handleLogout = () => {
      logout();
      setShowLogoutMenu(false);
  };

  
  // States
  const [activeSlide, setActiveSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { locationName, setLocation } = useLocationStore();
  const [properties, setProperties] = useState<PropertyFeedData[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  // Sync API Properties
  useEffect(() => {
    const loadFeed = async () => {
      try {
        const res = await api.get('/properties');
        if (res.data.success) {
          setProperties(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load property feed", err);
      } finally {
        setIsLoadingFeed(false);
      }
    };
    loadFeed();
  }, []);

  // 1. Dual-Fallback Geolocation Architecture (Mappls Proxy -> BigDataCloud)
  useEffect(() => {
    // Only detect if user hasn't physically set their location manually yet
    if (locationName === '📍 Select Location' && 'geolocation' in navigator) {
      setLocation('Locating...');
      
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            let detected = null;

            // Strategy 1: Attempt highly-accurate Mappls via secure Backend Proxy
            try {
              const mapplsRes = await fetch(`/api/location?lat=${latitude}&lng=${longitude}`);
              const mapplsData = await mapplsRes.json();
              if (mapplsData.success && mapplsData.location) {
                detected = mapplsData.location;
              }
            } catch (proxyErr) {
               console.warn("Mappls proxy crashed natively.", proxyErr);
            }

            // Strategy 2: If Mappls failed (or returned false), blindly default to BigDataCloud
            if (!detected) {
               console.log("Failing gracefully to BigDataCloud fallback...");
               const bdcRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
               const bdcData = await bdcRes.json();
               detected = bdcData.locality || bdcData.city || bdcData.principalSubdivision;
            }

            setLocation(`📍 ${detected || 'Unknown Area'}`, { lat: latitude, lng: longitude });

          } catch (error) {
            console.error('Total Geocoding failure:', error);
            setLocation('📍 Select Location');
          }
        },
        (err) => {
          console.warn('Geolocation denied or failed:', err);
          setLocation('📍 Select Location');
        }
      );
    }
  }, [locationName, setLocation]);

  // 2. Scroll Logic to detect Active Video (Intersection Observer technique via scrolling)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const slideHeight = container.clientHeight;
    // Calculate which slide is currently most visible
    const newActiveIndex = Math.round(container.scrollTop / slideHeight);
    
    if (newActiveIndex !== activeSlide) {
      setActiveSlide(newActiveIndex);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden">
      
      {/* Header overlays that sit above the snapping videos */}
      <div className="absolute top-0 left-0 right-0 z-[50] p-5 mt-2 flex items-center justify-center pointer-events-none">
         <div className="w-full pointer-events-auto">
             <SearchBar />
         </div>
      </div>

      {/* Snap Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        {isLoadingFeed ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#FF6A3D] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white/60 font-medium animate-pulse">Loading amazing homes...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-5 text-center">
            <h2 className="text-2xl font-black text-white mb-2">No Homes Nearby</h2>
            <p className="text-white/50 text-sm">Be the first to list a property in your city.</p>
          </div>
        ) : (
          properties.map((reel, index) => (
            <VideoCard 
              key={reel._id || index.toString()}
              id={reel._id}
              video="" // Video disabled in favor of photo arrays
              images={reel.images}
              rent={reel.rent}
              area={reel.location?.area || 'Unknown Area'}
              district={reel.location?.city || 'Unknown City'}
              matchScore={reel.matchScore || 0}
              moveInReady={Boolean(reel.moveInReady)}
              isActive={index === activeSlide}
            />
          ))
        )}
      </div>

      <BottomBar location={locationName} viewMode="reel" />

      {/* CSS to hide scrollbar cross-browser */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
