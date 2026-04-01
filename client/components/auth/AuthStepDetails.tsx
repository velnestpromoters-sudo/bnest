import React from 'react';
import { useAuthModalStore } from '@/store/authModalStore';
import { UserCircle2, ArrowRight, ArrowLeft, Phone } from 'lucide-react';

export default function AuthStepDetails() {
  const { name, mobile, gender, setField, nextStep, prevStep } = useAuthModalStore();

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Numeric only
    if (val.length <= 10) setField('mobile', val);
  };

  const isFormValid = name.trim().length > 1 && mobile.length === 10 && gender !== null;

  return (
    <div className="w-full flex flex-col pt-4 relative">
      <button onClick={prevStep} className="absolute -top-4 -left-2 p-2 text-white/50 hover:text-white transition-colors">
         <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/20 mx-auto">
         <UserCircle2 className="w-8 h-8 text-[#FF6A3D]" />
      </div>
      
      <h2 className="text-2xl font-black text-white mb-2 tracking-tight text-center">Your Details</h2>
      <p className="text-white/50 text-sm font-medium mb-6 leading-relaxed text-center">
        Enhance your Bnest experience with a tailored profile.
      </p>

      {/* Inputs Container */}
      <div className="space-y-4 mb-8">
          
          {/* Name */}
          <div className="relative">
            <label className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1 block ml-1">Full Legal Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-black/40 border border-white/20 text-white font-bold text-base px-5 py-3 rounded-xl focus:outline-none focus:border-[#FF6A3D] transition-colors"
            />
          </div>

          {/* Mobile */}
          <div className="relative">
            <label className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1 block ml-1">Mobile Number</label>
            <div className="relative flex items-center">
                <div className="absolute left-4 border-r border-white/20 pr-3 flex items-center pointer-events-none">
                    <span className="text-white/50 font-bold text-base">+91</span>
                </div>
                <input 
                  type="tel"
                  value={mobile}
                  onChange={handleMobileChange}
                  placeholder="000 000 0000"
                  className="w-full bg-black/40 border border-white/20 text-white font-bold text-base pl-16 pr-5 py-3 rounded-xl focus:outline-none focus:border-[#FF6A3D] transition-colors"
                />
            </div>
          </div>

          {/* Gender Selector */}
          <div className="relative pt-2">
            <label className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-2 block ml-1 text-center">Select Gender</label>
            <div className="flex items-center justify-center gap-2 p-1 bg-black/40 border border-white/10 rounded-xl">
               {['male', 'female', 'other'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setField('gender', g)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all duration-300 ${
                        gender === g 
                        ? 'bg-[#FF6A3D] text-white shadow-lg' 
                        : 'text-white/50 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
               ))}
            </div>
          </div>

      </div>

      <button 
        onClick={() => isFormValid && nextStep()}
        disabled={!isFormValid}
        className="w-full bg-[#FF6A3D] hover:bg-[#ff5522] text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(255,106,61,0.3)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
      >
        Continue <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
