'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[1000] bg-background flex items-center justify-center overflow-hidden"
    >
      <div className="relative z-10 flex flex-col items-center">
        {/* CERCLE DE PROGRESSION FLUIDE */}
        <div className="w-24 h-24 md:w-32 md:h-32 relative mb-8">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-t-2 border-secondary rounded-full shadow-[0_0_30px_rgba(0,255,255,0.5)]"
          />
          <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
        </div>
        
        <div className="text-[10px] font-black text-white/40 uppercase tracking-[1em] italic animate-pulse">
          VIBE LOADING
        </div>
      </div>

      {/* BARRE DE PROGRESSION MINIMALISTE */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-40 h-0.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.2, ease: "easeInOut" }}
          className="h-full bg-secondary/80"
        />
      </div>
    </motion.div>
  );
}