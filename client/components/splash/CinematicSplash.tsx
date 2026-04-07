"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CinematicSplash({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    // Extending time slightly to account for the smooth opening
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); 
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-white overflow-hidden flex items-center justify-center">
      
      {/* 1. White Background completely closed off entirely until the shutter opens! */}
      <div className="absolute inset-0 bg-white z-0" />
      
      {/* Target Logo to slowly reveal */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }} 
        className="relative z-10 w-48 h-48 md:w-64 md:h-64 flex items-center justify-center"
      >
        <img src="/logo.svg" alt="Homyvo Logo" className="w-full h-full object-contain" />
      </motion.div>

      {/* 2. Full Purple Canvas (5 closed diagonal blocks) */}
      {/* 
         They begin at scaleY: 1, completely covering 100% of the screen.
         They then open little by little by shrinking (scaleY: 0) to their respective edges, 
         exactly like a shutter opening slowly! 
      */}
      <motion.div 
        initial={{ x: "-50%", y: "-50%", rotate: -45 }}
        className="absolute z-20 flex flex-col pointer-events-none w-[400vw] h-[400vh] left-[50%] top-[50%]"
      >
        
        {/* Strip 1 - Pink origin-top */}
        <motion.div
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
          className="w-full h-[80vh] shadow-[0_30px_80px_rgba(0,0,0,0.9)] relative z-50 origin-top border-b border-[#f355c7]/40"
          style={{ background: 'linear-gradient(90deg, #ec38b7 0%, #d0229c 100%)' }}
        />

        {/* Strip 2 - Magenta origin-top */}
        <motion.div
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 1.4, delay: 0.25, ease: "easeInOut" }}
          className="w-full h-[80vh] shadow-[0_30px_80px_rgba(0,0,0,0.9)] relative z-40 origin-top border-b border-[#d0229c]/40"
          style={{ background: 'linear-gradient(90deg, #d0229c 0%, #a61c92 100%)' }}
        />

        {/* Strip 3 - Center Velvet Purple - opening precisely from the dead center */}
        <motion.div
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 1.2, delay: 0.1, ease: "easeInOut" }}
          className="w-full h-[80vh] shadow-[0_0px_80px_rgba(0,0,0,0.9)] relative z-30 origin-center"
          style={{ background: 'linear-gradient(90deg, #a61c92 0%, #801786 100%)' }}
        />

        {/* Strip 4 - Deep Indigo origin-bottom */}
        <motion.div
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 1.4, delay: 0.25, ease: "easeInOut" }}
          className="w-full h-[80vh] shadow-[0_30px_80px_rgba(0,0,0,0.9)] relative z-20 origin-bottom border-t border-[#801786]/40"
          style={{ background: 'linear-gradient(90deg, #801786 0%, #5d187b 100%)' }}
        />

        {/* Strip 5 - Navy Dark Base origin-bottom */}
        <motion.div
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
          className="w-full h-[80vh] shadow-[0_30px_80px_rgba(0,0,0,0.9)] relative z-10 origin-bottom border-t border-[#5d187b]/40"
          style={{ background: 'linear-gradient(90deg, #5d187b 0%, #321669 100%)' }}
        />

      </motion.div>
    </div>
  );
}
