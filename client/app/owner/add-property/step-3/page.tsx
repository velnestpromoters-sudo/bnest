"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyFormStore } from '@/store/usePropertyFormStore';

export default function Step3() {
  const router = useRouter();
  const { propertyType, pgDetails, preferences, moveInReady, updateField, updatePreference, updatePgDetails } = usePropertyFormStore();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/owner/add-property/step-4');
  };

  const handleSharingToggle = (num: number) => {
     const current = [...pgDetails.sharingTypes];
     if (current.includes(num)) {
        updatePgDetails('sharingTypes', current.filter(n => n !== num));
        // Remove room config if sharing type untoggled
        updatePgDetails('rooms', pgDetails.rooms.filter(r => r.sharing !== num));
     } else {
        updatePgDetails('sharingTypes', [...current, num]);
        // Add default room config
        updatePgDetails('rooms', [...pgDetails.rooms, { sharing: num, totalBeds: '', availableBeds: '' }]);
     }
  };

  const updateRoomState = (sharingNum: number, field: 'totalBeds' | 'availableBeds', value: string) => {
     const newRooms = pgDetails.rooms.map(r => {
        if (r.sharing === sharingNum) return { ...r, [field]: value };
        return r;
     });
     updatePgDetails('rooms', newRooms);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <h2 className="text-2xl font-black text-gray-900 mb-1">Preferences</h2>
       <p className="text-sm text-gray-500 mb-8">{propertyType === 'pg' ? "Configure your PG rules and bed inventory." : "What are your rules for tenants?"}</p>

       <form onSubmit={handleNext} className="flex flex-col gap-6">

          {propertyType === 'pg' && (
             <div className="bg-purple-50 p-5 rounded-2xl border border-purple-200 flex flex-col gap-5 mb-2">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">PG Type *</label>
                   <div className="grid grid-cols-3 gap-2">
                      {['boys', 'girls', 'co-living'].map(g => (
                         <button 
                            key={g} type="button"
                            onClick={() => updatePgDetails('gender', g)}
                            className={`py-3 rounded-xl font-bold text-sm capitalize border-2 transition-colors ${pgDetails.gender === g ? 'border-[#801786] bg-[#801786] text-white' : 'border-gray-200 bg-white text-gray-500'}`}
                         >
                            {g}
                         </button>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Total Rooms *</label>
                   <input 
                      type="number" required
                      value={pgDetails.totalRooms}
                      onChange={e => updatePgDetails('totalRooms', e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-[#801786] outline-none"
                   />
                </div>

                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Sharing Types Available *</label>
                   <div className="grid grid-cols-3 gap-2">
                      {[1,2,3,4,5,6].map(num => (
                         <label key={num} className={`p-3 border-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors ${pgDetails.sharingTypes.includes(num) ? 'border-[#801786] bg-white text-[#801786]' : 'border-gray-200 bg-white text-gray-500'}`}>
                            <input 
                               type="checkbox" 
                               className="accent-[#801786] w-4 h-4 cursor-pointer"
                               checked={pgDetails.sharingTypes.includes(num)}
                               onChange={() => handleSharingToggle(num)}
                            />
                            <span className="font-bold text-sm tracking-wide">{num} Sharing</span>
                         </label>
                      ))}
                   </div>
                </div>

                {pgDetails.sharingTypes.length > 0 && (
                   <div className="mt-2 flex flex-col gap-3">
                      <label className="block text-sm font-bold text-gray-700">Bed Inventory Config *</label>
                      {pgDetails.sharingTypes.sort().map(num => {
                         const room = pgDetails.rooms.find(r => r.sharing === num) || { totalBeds: '', availableBeds: '' };
                         return (
                            <div key={num} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                               <div className="font-black text-[#801786] mb-3">{num} Sharing Rooms</div>
                               <div className="grid grid-cols-2 gap-4">
                                  <div>
                                     <span className="text-xs font-bold text-gray-500 block mb-1">Total Beds</span>
                                     <input type="number" required value={room.totalBeds} onChange={e => updateRoomState(num, 'totalBeds', e.target.value)} className="w-full border p-2.5 rounded-lg outline-none focus:border-[#801786]" placeholder="e.g. 20" />
                                  </div>
                                  <div>
                                     <span className="text-xs font-bold text-gray-500 block mb-1">Available Beds</span>
                                     <input type="number" required value={room.availableBeds} onChange={e => updateRoomState(num, 'availableBeds', e.target.value)} className="w-full border p-2.5 rounded-lg outline-none focus:border-[#801786]" placeholder="e.g. 5" />
                                  </div>
                               </div>
                            </div>
                         );
                      })}
                   </div>
                )}
             </div>
          )}

          {propertyType === 'apartment' && (
             <>
                <div className="bg-white p-5 border-2 rounded-xl flex justify-between items-center shadow-sm">
                   <div>
                      <p className="font-bold text-gray-800">Bachelors Allowed?</p>
                      <p className="text-xs text-gray-500 mt-1">Accept singles, students, bachelors.</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                         type="checkbox" 
                         className="sr-only peer" 
                         checked={preferences.bachelorAllowed}
                         onChange={(e) => updatePreference('bachelorAllowed', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#801786]"></div>
                   </label>
                </div>

                <div className="bg-white p-5 border-2 rounded-xl flex justify-between items-center shadow-sm">
                   <div>
                      <p className="font-bold text-gray-800">Move-in Ready?</p>
                      <p className="text-xs text-gray-500 mt-1">Available to occupy immediately.</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                         type="checkbox" 
                         className="sr-only peer" 
                         checked={moveInReady}
                         onChange={(e) => updateField('moveInReady', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#801786]"></div>
                   </label>
                </div>

                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Max Occupants *</label>
                   <select 
                      value={preferences.maxOccupants}
                      onChange={(e) => updatePreference('maxOccupants', e.target.value)}
                      className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-[#801786] focus:ring-0 outline-none bg-white appearance-none"
                   >
                      <option value="1">1 Person</option>
                      <option value="2">2 People</option>
                      <option value="3">3 People</option>
                      <option value="4">4 People</option>
                      <option value="5+">5+ People</option>
                   </select>
                </div>
             </>
          )}

          <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t z-10 md:static md:bg-transparent md:border-0 md:p-0 md:mt-4">
             <button type="submit" className="w-full bg-[#801786] text-white font-black py-4 rounded-xl shadow-lg hover:bg-[#a61c92] transition-colors">
                Next Step →
             </button>
          </div>
       </form>
    </div>
  );
}
