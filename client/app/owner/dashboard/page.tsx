"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

export default function OwnerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const logout = useAuthStore(state => state.logout);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    // Basic auth wrap
    if (!isAuthenticated) {
      router.push('/home');
      return;
    }
    
    // Fetch owner's properties logic would go here
    const fetchProps = async () => {
      try {
         const token = useAuthStore.getState().token;
         const res = await fetch(`/api/properties`, {
             headers: { 'Authorization': `Bearer ${token}` }
         });
         const data = await res.json();
         // Filter to only this owner's if the backend doesn't automatically
         if (data.success) {
            setProperties(data.data.filter((p: any) => p.ownerId === user?._id || p.ownerId?._id === user?._id));
         }
      } catch (err) { console.error(err); }
    };
    fetchProps();
  }, [isAuthenticated, router, user]);

  const handleLogout = () => {
      logout();
      router.push('/home');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white p-6 shadow-sm border-b sticky top-0 z-10 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div className="flex justify-between items-start w-full md:w-auto">
           <div>
              <h1 className="text-2xl font-black text-gray-900">Owner Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.name || 'Owner'}</p>
           </div>
           
           {/* Mobile Logout (Hidden on Desktop) */}
           <button 
              onClick={handleLogout}
              className="md:hidden text-xs text-red-500 font-bold px-3 py-1 border border-red-200 rounded-full hover:bg-red-50"
           >
              Logout
           </button>
        </div>
        
        <div className="flex gap-4 mt-4 md:mt-0 items-center">
           <button 
              onClick={() => router.push('/home')}
              className="text-[#801786] font-bold text-base hover:bg-purple-50 px-4 py-2.5 rounded-full transition-colors cursor-pointer"
           >
             Home
           </button>
           <button 
              onClick={() => router.push('/owner/add-property/step-1')}
              className="flex-1 md:flex-none bg-[#801786] text-white px-5 py-2.5 rounded-full font-bold shadow hover:bg-[#a61c92] transition-colors"
           >
             + Add Property
           </button>
           
           {/* Desktop Logout Button */}
           <button 
              onClick={handleLogout}
              className="hidden md:block bg-gray-100 text-gray-700 font-bold px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors shadow-sm border border-gray-200"
           >
             Logout
           </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 mt-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8 flex items-center justify-between">
            <div>
               <p className="text-gray-500 font-medium">Total Active Listings</p>
               <h2 className="text-4xl font-black text-gray-900 mt-1">{properties.length}</h2>
            </div>
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
               <svg className="w-8 h-8 text-[#801786]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            </div>
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-4">My Listings</h3>
        
        {properties.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
             <p className="text-gray-500 mb-4">You haven't listed any properties yet.</p>
             <button 
                onClick={() => router.push('/owner/add-property/step-1')}
                className="text-[#801786] font-bold hover:underline"
             >
               Create your first listing →
             </button>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'thin' }}>
             {properties.map((prop: any) => (
                <div key={prop._id} className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col gap-3 min-w-[220px] max-w-[220px] snap-center shrink-0 shadow-sm relative transition-transform hover:-translate-y-1">
                   <div className="absolute top-4 right-4 z-10 px-2 py-0.5 bg-green-100/90 backdrop-blur-sm text-green-700 text-[10px] uppercase tracking-wider font-bold rounded-full shadow-sm border border-green-200">
                      Active
                   </div>
                   <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {prop.images && prop.images[0] ? (
                         <img src={prop.images[0]} alt="Property" className="w-full h-full object-cover" />
                      ) : (
                         <span className="text-xs text-gray-400 flex items-center justify-center w-full h-full">No Image</span>
                      )}
                   </div>
                   <div className="flex flex-col px-1">
                      <h4 className="font-bold text-gray-900 line-clamp-1 text-sm">{prop.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 font-medium">{prop.location?.area || 'Area not specified'}</p>
                      <p className="text-[#801786] font-black mt-2">₹{prop.rent.toLocaleString()}<span className="text-xs font-semibold text-gray-400">/mo</span></p>
                   </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
