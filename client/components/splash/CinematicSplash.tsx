"use client";

import React, { useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

export default function CinematicSplash({ onComplete }: { onComplete: () => void }) {
  const controlsBg = useAnimationControls();
  const controlsLogo = useAnimationControls();
  const controlsPulse = useAnimationControls();

  useEffect(() => {
    // 2.5 second timeline
    const runSequence = async () => {
      
      // Step 1: Initial pop-in
      controlsLogo.start({
        scale: [0, 1.2, 1],
        opacity: [0, 1, 1],
        rotate: [15, -5, 0],
        transition: { duration: 0.8, type: "spring", bounce: 0.5 }
      });
      
      controlsPulse.start({
        scale: [1, 2.5],
        opacity: [0.8, 0],
        transition: { duration: 1.2, ease: "easeOut" }
      });

      await new Promise(r => setTimeout(r, 1200));

      // Step 2: Background transitions to white
      controlsBg.start({
        backgroundColor: "#FFFFFF",
        transition: { duration: 0.8, ease: "easeInOut" }
      });
      
      // Logo pulses then explodes towards the camera
      controlsLogo.start({
        scale: [1, 0.9, 15],
        opacity: [1, 1, 0],
        transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.4, 1] }
      });

      await new Promise(r => setTimeout(r, 900));
      
      // Call router navigation
      onComplete();
    };

    runSequence();
  }, [controlsBg, controlsLogo, controlsPulse, onComplete]);

  return (
    <motion.div 
      animate={controlsBg}
      initial={{ backgroundColor: "#0F172A" }} // Deep slate navy to match typical purple/blue gradients
      className="relative w-full h-[100dvh] overflow-hidden flex items-center justify-center font-sans"
    >
      
      {/* Huge blurry glowing orb behind the logo mapping to purple */}
      <motion.div 
         animate={controlsPulse}
         initial={{ scale: 0, opacity: 0 }}
         className="absolute w-64 h-64 bg-[#7e22ce] rounded-full blur-3xl z-0"
      />

      <motion.div 
         animate={controlsLogo}
         initial={{ scale: 0, opacity: 0 }}
         className="relative z-10 w-48 h-48 flex items-center justify-center drop-shadow-2xl"
      >
         <img src="/logo.png" alt="Homyvo Logo" className="w-[160px] object-contain drop-shadow-lg" />
      </motion.div>
      
    </motion.div>
  );
}
