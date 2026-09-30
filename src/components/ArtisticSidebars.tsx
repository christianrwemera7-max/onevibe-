'use client';

import React from 'react';
import { Star } from 'lucide-react';

const SidebarContent = () => (
  <div className="flex flex-col gap-12 py-10 items-center animate-scroll-vibe">
    {[...Array(30)].map((_, i) => (
      <div key={i} className="flex flex-col items-center gap-12">
        {/* ÉTOILE BRILLANTE */}
        <div className="relative">
          <Star className="w-4 h-4 text-white fill-white animate-pulse" />
          <div className="absolute inset-0 bg-white/20 blur-lg rounded-full scale-150" />
        </div>
        
        {/* TEXTE VERTICAL DÉFILANT */}
        <div className="[writing-mode:vertical-rl] text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-secondary whitespace-nowrap italic opacity-80">
          ONE VIBE FEST 2027
        </div>

        {/* ÉTOILE SECONDAIRE */}
        <Star className="w-2 h-2 text-secondary/40 fill-secondary/20" />
      </div>
    ))}
  </div>
);

export function ArtisticSidebars() {
  return (
    <>
      {/* BARRE GAUCHE */}
      <div className="fixed left-0 top-0 w-6 md:w-12 h-full bg-black/40 border-r border-white/5 z-[60] overflow-hidden flex flex-col items-center backdrop-blur-sm">
        <SidebarContent />
      </div>
      
      {/* BARRE DROITE */}
      <div className="fixed right-0 top-0 w-6 md:w-12 h-full bg-black/40 border-l border-white/5 z-[60] overflow-hidden flex flex-col items-center backdrop-blur-sm">
        <SidebarContent />
      </div>
    </>
  );
}