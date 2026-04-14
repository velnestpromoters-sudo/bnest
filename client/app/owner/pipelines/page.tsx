"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Key, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function OwnerPipelinesPage() {
  const router = useRouter();
  const token = useAuthStore(state => state.token);
  
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerPipelines = async () => {
       if (!token) return;
       try {
          const res = await fetch('/api/interactions/owner/all', {
             headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
             setInteractions(data.data);
          }
       } catch (err) {
          console.error("Pipeline fetch error:", err);
       } finally {
          setLoading(false);
       }
    };
    
    fetchOwnerPipelines();
  }, [token]);

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] pb-24 font-sans text-gray-900 overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm px-4 py-4 flex items-center justify-between z-10 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/owner/dashboard')} 
            className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-[#111827]" />
          </button>
          <h1 className="text-xl font-extrabold tracking-tight text-[#111827]">Active Pipeline Deals</h1>
        </div>
        <span className="text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1.5">
           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
           {interactions.length} Tracking
        </span>
      </div>

      <div className="p-4 flex flex-col gap-4 mt-2 max-w-4xl mx-auto">
        {loading ? (
             <div className="flex flex-col items-center justify-center mt-24">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent flex items-center justify-center rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-bold animate-pulse">Syncing Owner Pipelines...</p>
             </div>
        ) : interactions.length === 0 ? (
          <div className="mt-24 flex flex-col items-center justify-center text-center px-6">
             <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mb-5 shadow-inner">
               <Users className="w-8 h-8 text-indigo-300" />
             </div>
             <h2 className="text-2xl font-black text-[#111827] mb-2 tracking-tight">No unlocked deals yet!</h2>
             <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-8">
               Once a tenant pays the unlocking fee for any of your properties, their tracking pipeline will appear right here dynamically.
             </p>
             <button 
                onClick={() => router.push('/owner/dashboard')} 
                className="font-bold text-[#801786] bg-purple-50 hover:bg-purple-100 border border-purple-200 shadow-sm px-8 py-3.5 rounded-full transition-all active:scale-95"
             >
                Return to Dashboard
             </button>
          </div>
        ) : (
          interactions.map(interaction => (
            <div 
              key={interaction._id} 
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 p-4 transition-transform hover:-translate-y-1 hover:shadow-md" 
            >
               <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-slate-100">
                     <img src={interaction.property?.images?.[0] || 'https://via.placeholder.com/150'} alt="prop" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex flex-col py-0.5 w-full">
                     <h3 className="font-extrabold text-slate-900 text-sm leading-tight line-clamp-1 mb-1">{interaction.property?.title}</h3>
                     <p className="text-xs font-semibold text-slate-500 bg-slate-100 self-start px-2 py-0.5 rounded-md mb-2">{interaction.property?.location?.area}</p>
                     
                     <div className="flex justify-between items-end w-full">
                         <div className="flex items-center gap-2">
                             <img 
                                src={interaction.user?.profileImage || 'https://via.placeholder.com/150'} 
                                onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(interaction.user?.name || 'User')}&background=random` }}
                                className="w-6 h-6 rounded-full object-cover border border-slate-200" 
                                alt="tenant" 
                             />
                             <div>
                                <p className="text-[11px] font-bold text-slate-800 leading-none mb-0.5">{interaction.user?.name}</p>
                                <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{interaction.interactionStage?.replace("_", " ")}</p>
                             </div>
                         </div>
                         <button 
                            onClick={() => router.push(`/tracking/${interaction._id}`)}
                            className="bg-[#ec38b7] text-white text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                         >
                            <Key className="w-3.5 h-3.5" /> Track Status
                         </button>
                     </div>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
