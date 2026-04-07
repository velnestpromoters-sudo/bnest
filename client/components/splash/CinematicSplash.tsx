"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CinematicSplash({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    // Match the 43-frame timeline perfectly (2.4 seconds total animation span)
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); 
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-white overflow-hidden flex items-center justify-center">
      
      {/* 1. Raw White Background & Logo Cinematic Reveal */}
      <div className="absolute inset-0 bg-white z-0" />
      <motion.div
        initial={{ scale: 0.3, opacity: 0, filter: 'blur(20px)' }}
        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }} 
        className="relative z-10 w-48 h-48 md:w-64 md:h-64 flex items-center justify-center"
      >
        <img src="/logo.png" alt="Homyvo Logo" className="w-full h-full object-contain" />
      </motion.div>

      {/* 2. Layered 3D Diagonal Blinds Wrapper */}
      {/* Natively rotated exactly like the images, splitting apart across the Y axis */}
      <motion.div 
        initial={{ x: "-50%", y: "-50%", rotate: -45 }}
        className="absolute z-20 flex flex-col pointer-events-none w-[400vw] h-[400vh] left-[50%] top-[50%]"
      >
        
        {/* Strip 1: Pink/Fuchsia (Top Most Layer) */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: "-150vh" }}
          transition={{ duration: 1.4, delay: 0.4, ease: [0.76, 0, 0.24, 1] }}
          className="w-full h-[80vh] shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative z-50 border-b border-[#f355c7]/40"
          style={{ background: 'linear-gradient(90deg, #ec38b7 0%, #d0229c 100%)' }}
        />

        {/* Strip 2: Magenta */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: "-150vh" }}
          transition={{ duration: 1.3, delay: 0.25, ease: [0.76, 0, 0.24, 1] }}
          className="w-full h-[80vh] shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative z-40 border-b border-[#d0229c]/40"
          style={{ background: 'linear-gradient(90deg, #d0229c 0%, #a61c92 100%)' }}
        />

        {/* Strip 3: Center Velvet Purple (Quickly Dissolves to reveal Logo) */}
        <motion.div
          initial={{ y: 0, opacity: 1, scaleY: 1 }}
          animate={{ y: "-50vh", opacity: 0, scaleY: 0.2 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
          className="w-full h-[80vh] shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative z-30 origin-top"
          style={{ background: 'linear-gradient(90deg, #a61c92 0%, #801786 100%)' }}
        />

        {/* Strip 4: Deep Indigo */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: "150vh" }}
          transition={{ duration: 1.3, delay: 0.25, ease: [0.76, 0, 0.24, 1] }}
          className="w-full h-[80vh] shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative z-20 border-t border-[#801786]/40"
          style={{ background: 'linear-gradient(90deg, #801786 0%, #5d187b 100%)' }}
        />

        {/* Strip 5: Navy Dark Base */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: "150vh" }}
          transition={{ duration: 1.4, delay: 0.4, ease: [0.76, 0, 0.24, 1] }}
          className="w-full h-[80vh] shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative z-10 border-t border-[#5d187b]/40"
          style={{ background: 'linear-gradient(90deg, #5d187b 0%, #321669 100%)' }}
        />

      </motion.div>
    </div>
  );
}
