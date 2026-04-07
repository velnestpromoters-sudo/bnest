"use client";

import React, { useEffect } from 'react';

export default function CinematicSplash({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    // Exact 4000ms hold phase as per MASTER PROMPT 
    const timer = setTimeout(() => {
      onComplete();
    }, 4000); 
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-white overflow-hidden flex items-center justify-center">
      
      <style>{`
        .strip-top {
          animation: stripSlideTop 4000ms both;
          will-change: transform;
        }
        .strip-bottom {
          animation: stripSlideBottom 4000ms both;
          will-change: transform;
        }
        .logo-reveal {
          animation: logoReveal 4000ms both;
          will-change: transform, opacity, filter;
        }

        /* 30% of 4000ms = 1200ms (ENTRY) */
        /* 55% of 4000ms = 2200ms (CROSS REVEAL EXIT) */
        
        @keyframes stripSlideTop {
          0%   { transform: scaleX(1.05) translateY(-150%); animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
          30%  { transform: scaleX(1.05) translateY(0%);    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
          55%  { transform: scaleX(1.05) translateY(-150%); }
          100% { transform: scaleX(1.05) translateY(-150%); }
        }

        @keyframes stripSlideBottom {
          0%   { transform: scaleX(1.05) translateY(150%); animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
          30%  { transform: scaleX(1.05) translateY(0%);   animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
          55%  { transform: scaleX(1.05) translateY(150%); }
          100% { transform: scaleX(1.05) translateY(150%); }
        }

        /* 40% = 1600ms, 65% = 2600ms */
        @keyframes logoReveal {
          0%   { opacity: 0; filter: blur(6px); transform: scale(0.85); }
          40%  { opacity: 0; filter: blur(6px); transform: scale(0.85); animation-timing-function: ease-out; }
          65%  { opacity: 1; filter: blur(0px); transform: scale(1); }
          100% { opacity: 1; filter: blur(0px); transform: scale(1); }
        }
      `}</style>

      {/* 2. Target Logo To Reveal Perfectly In The Center */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none logo-reveal m-auto">
        <img 
          src="/logo.svg" 
          alt="Homyvo Logo" 
          className="w-48 h-48 md:w-64 md:h-64 object-contain" 
        />
      </div>

      {/* 3. 6 Diagonal Strips Mask Container (Overlapping Purple/Blue Gradient Tones) */}
      <div 
        className="absolute z-20 flex flex-row pointer-events-none w-[200vw] h-[200vh] left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 -rotate-[35deg]"
      >
        {/* Strip 1 : Outside LEFT-TOP */}
        <div className="strip-top flex-1 shadow-[0_0px_15px_4px_rgba(0,0,0,0.4)]" 
             style={{ background: 'linear-gradient(to bottom, #6b21a8, #5b21b6)', animationDelay: '0ms' }} />
        
        {/* Strip 2 : Outside RIGHT-BOTTOM */}
        <div className="strip-bottom flex-1 shadow-[0_0px_15px_4px_rgba(0,0,0,0.4)]" 
             style={{ background: 'linear-gradient(to bottom, #5b21b6, #4c1d95)', animationDelay: '120ms' }} />

        {/* Strip 3 : Outside LEFT-TOP */}
        <div className="strip-top flex-1 shadow-[0_0px_15px_4px_rgba(0,0,0,0.4)]" 
             style={{ background: 'linear-gradient(to bottom, #4c1d95, #3b0764)', animationDelay: '240ms' }} />

        {/* Strip 4 : Outside RIGHT-BOTTOM */}
        <div className="strip-bottom flex-1 shadow-[0_0px_15px_4px_rgba(0,0,0,0.4)]" 
             style={{ background: 'linear-gradient(to bottom, #3b0764, #3730a3)', animationDelay: '360ms' }} />

        {/* Strip 5 : Outside LEFT-TOP */}
        <div className="strip-top flex-1 shadow-[0_0px_15px_4px_rgba(0,0,0,0.4)]" 
             style={{ background: 'linear-gradient(to bottom, #3730a3, #312e81)', animationDelay: '480ms' }} />

        {/* Strip 6 : Outside RIGHT-BOTTOM */}
        <div className="strip-bottom flex-1 shadow-[0_0px_15px_4px_rgba(0,0,0,0.4)]" 
             style={{ background: 'linear-gradient(to bottom, #312e81, #1e1b4b)', animationDelay: '600ms' }} />
      </div>

    </div>
  );
}
