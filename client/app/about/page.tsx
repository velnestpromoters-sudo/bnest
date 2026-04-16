"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="relative w-full min-h-screen bg-white font-sans text-slate-900 pb-10">
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 py-4">
        <button 
           onClick={() => router.back()} 
           className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all rounded-full"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex-1 text-center pr-10">About Homyvo</h1>
      </div>

      {/* Content Envelope */}
      <div className="p-6 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="w-full flex items-center justify-center mb-6">
            <img src="/logo.svg" alt="Homyvo Logo" className="w-[120px] h-[120px] object-contain drop-shadow-xl" />
         </div>
         
         <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Homyvo</h2>
            <p className="text-sm font-bold text-purple-600 bg-purple-50 inline-block px-3 py-1 rounded-full border border-purple-100">
               Version 1.0.0
            </p>
         </div>

         <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-sm text-center">
            <p className="text-slate-600 text-sm leading-relaxed font-medium mb-4">
               Welcome to Homyvo! The user interface and comprehensive capabilities for this 'About' portal will be architected and deployed in a future release cycle.
            </p>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-6">
               Stay tuned for updates.
            </p>
         </div>

         <div className="w-full mt-12 flex flex-col items-center gap-1 opacity-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by Homyvo AI Engine</p>
            <p className="text-[10px] font-semibold text-slate-300">© 2026 All Rights Reserved.</p>
         </div>
      </div>
    </div>
  );
}
