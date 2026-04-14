"use client";
import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, CheckCircle2, Circle, Truck, Key, Home, Handshake, MapPin, XCircle, AlertTriangle } from 'lucide-react';

const STAGES = [
  { id: 'contact_unlocked', label: 'Contact Unlocked', icon: Key },
  { id: 'visited', label: 'House Visited', icon: MapPin },
  { id: 'negotiating', label: 'Negotiation', icon: Handshake },
  { id: 'finalized', label: 'Deal Finalized', icon: Home }
];

export default function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params as any) as { id: string };
  const id = unwrappedParams.id;
  const router = useRouter();
  const { token, user } = useAuthStore();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchTracking = async () => {
       if (!token) return;
       try {
          const res = await fetch(`/api/interactions/${id}`, {
             headers: { 'Authorization': `Bearer ${token}` }
          });
          const json = await res.json();
          if (json.success) setData(json.data);
       } catch (e) {
          console.error(e);
       } finally {
          setLoading(false);
       }
    };
    fetchTracking();
  }, [id, token]);

  const handleUpdateStage = async (newStage: string) => {
     setUpdating(true);
     setShowConfirmModal(false);
     try {
        const res = await fetch(`/api/interactions/${id}/stage`, {
           method: 'PUT',
           headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
           },
           body: JSON.stringify({ stage: newStage })
        });
        const json = await res.json();
        if (json.success) {
           setData(json.data);
        }
     } catch (e) {
        console.error(e);
     } finally {
        setUpdating(false);
     }
  };

  if (loading) return (
     <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#801786] border-t-transparent flex items-center justify-center rounded-full animate-spin" />
     </div>
  );

  if (!data) return <div className="p-10 text-center font-bold">Pipeline Tracking not found.</div>;

  const currentStageIndex = STAGES.findIndex(s => s.id === data.interactionStage);
  const isOwner = user?._id === data.property?.ownerId?._id;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white p-4 shadow-sm border-b sticky top-0 z-20 flex justify-between items-center">
         <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
               <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <h1 className="text-xl font-black text-slate-800">Pipeline Tracker</h1>
         </div>
      </header>

      <div className="max-w-md mx-auto w-full p-5 pt-8">
         {/* Property Identity Card */}
         <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-4 flex gap-4 mb-8">
            <img src={data.property?.images?.[0] || 'https://via.placeholder.com/150'} className="w-20 h-20 rounded-2xl object-cover" alt="prop" />
            <div className="flex flex-col justify-center">
               <h2 className="font-black text-lg text-slate-800 leading-tight mb-1 line-clamp-1">{data.property?.title}</h2>
               <p className="text-sm font-bold text-slate-500 mb-1">{data.property?.location?.area}</p>
               <p className="text-xs font-black text-[#801786]">₹{data.property?.rent?.toLocaleString()} /mo</p>
            </div>
         </div>

         <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 pt-8 pb-10">
            <h3 className="text-center font-black text-xl text-slate-800 mb-2">Deal Progress</h3>
            <p className="text-center text-sm text-slate-500 mb-10 tracking-tight">Both you and the {isOwner ? 'tenant' : 'owner'} can update this pipeline timeline dynamically.</p>

            {/* Amazon-style Vertical Timeline */}
            <div className="relative pl-6 space-y-12">
               {/* Line passing through */}
               <div className="absolute top-2 bottom-2 left-6 ml-4 w-1 flex flex-col overflow-hidden bg-slate-100 rounded-full">
                  <div 
                     className="w-full bg-[#ec38b7] transition-all duration-1000 ease-in-out origin-top"
                     style={{ height: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
                  />
               </div>

               {STAGES.map((stage, idx) => {
                  const isCompleted = currentStageIndex >= idx;
                  const isCurrent = currentStageIndex === idx;
                  const Icon = stage.icon;
                  
                  return (
                     <div key={stage.id} className="relative flex items-center gap-6 z-10 group">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isCompleted ? 'bg-[#ec38b7] border-[#fce9f6] scale-110 shadow-lg shadow-pink-200' : 'bg-white border-slate-200 text-slate-300'}`}>
                           {isCompleted && !isCurrent ? (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                           ) : (
                              <Icon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-slate-300'}`} />
                           )}
                        </div>
                        
                        <div className="flex-1 pt-1">
                           <h4 className={`font-black text-base transition-colors duration-500 ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                              {stage.label}
                           </h4>
                           {isCurrent && (
                              <p className="text-[11px] font-bold text-[#ec38b7] uppercase tracking-widest mt-1 animate-pulse">Current Stage</p>
                           )}
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Advanced Owner/Tenant Actions */}
         <div className="mt-8 flex flex-col gap-3 relative z-10">
            {data.interactionStage === 'rejected' ? (
                <div className="w-full bg-red-50 border border-red-100 text-red-600 font-black py-4 rounded-2xl text-center shadow-inner text-sm mb-2 flex items-center justify-center gap-2">
                   <XCircle className="w-5 h-5" /> Deal Rejected & Closed
                </div>
            ) : currentStageIndex < STAGES.length - 1 ? (
               <button 
                  disabled={updating}
                  onClick={() => {
                     if (STAGES[currentStageIndex + 1].id === 'finalized') {
                        setShowConfirmModal(true);
                     } else {
                        handleUpdateStage(STAGES[currentStageIndex + 1].id);
                     }
                  }}
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-black active:scale-95 transition-all text-sm mb-2"
               >
                  {updating ? 'Updating Pipeline...' : `Mark as "${STAGES[currentStageIndex + 1].label}"`}
               </button>
            ) : (
               <div className="w-full bg-green-50 border border-green-100 text-green-600 font-black py-4 rounded-2xl text-center shadow-inner text-sm mb-2 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Deal Finalized Successfully
               </div>
            )}
            
            <button 
               onClick={() => window.open(`tel:${data.property?.ownerId?.mobile}`, '_self')}
               className="w-full bg-indigo-50 text-indigo-700 font-bold py-4 rounded-2xl border border-indigo-100 hover:bg-indigo-100 active:scale-95 transition-all text-sm"
            >
               Call {isOwner ? 'Tenant' : 'Owner'} Directly
            </button>
         </div>

         {/* Conformation Popup */}
         {showConfirmModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 fade-in duration-200">
                   <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-blue-50 text-blue-500 flex items-center justify-center rounded-full border border-blue-100">
                         <AlertTriangle className="w-8 h-8" />
                      </div>
                   </div>
                   <h3 className="text-xl font-black text-center text-slate-900 mb-2">Finalize Deal</h3>
                   <p className="text-center text-sm text-slate-500 mb-6 px-2 leading-relaxed">
                      Please confirm if you successfully finalized renting this property. If rejected, the deal closes and the contact slot is freed.
                   </p>
                   
                   <div className="flex flex-col gap-3">
                       <button 
                          onClick={() => handleUpdateStage('finalized')}
                          className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                       >
                          <CheckCircle2 className="w-5 h-5" /> Yes, Deal Confirmed
                       </button>
                       <button 
                          onClick={() => handleUpdateStage('rejected')}
                          className="w-full py-3.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                       >
                          <XCircle className="w-5 h-5" /> No, Deal Rejected
                       </button>
                       <button 
                          onClick={() => setShowConfirmModal(false)}
                          className="w-full py-3 mt-1 text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors"
                       >
                          Cancel
                       </button>
                   </div>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
