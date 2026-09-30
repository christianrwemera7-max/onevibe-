"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { User, Ticket, Star, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function TalentsPage() {
  const firestore = useFirestore();
  const talentsRef = useMemoFirebase(() => firestore ? collection(firestore, 'talents') : null, [firestore]);
  const { data: talents } = useCollection(talentsRef);

  const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'festival') : null, [firestore]);
  const { data: settings } = useDoc(settingsRef);
  
  const ticketingUrl = settings?.ticketingUrl || 'https://omtevents.com';

  const categories = ["MUSIC", "CREATIVE", "BUSINESS", "DIGITAL"];

  return (
    <div className="pt-24 md:pt-32 pb-24 bg-background min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none z-0 opacity-20" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 md:gap-3 text-white font-black text-[9px] md:text-[12px] uppercase tracking-[0.4em] md:tracking-[0.5em] mb-4 md:mb-6 italic opacity-80"
          >
            <Sparkles className="w-3 md:w-4 h-3 md:h-4 fill-white" /> L'ÉLITE 2027
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[32px] md:text-[70px] font-black tracking-tighter uppercase italic leading-none text-white"
          >
            LINE <span className="text-white opacity-40">UP</span>
          </motion.h1>
          <div className="w-16 md:w-20 h-1 md:h-1.5 bg-white/40 mx-auto mt-6 md:mt-8 rounded-full shadow-2xl" />
        </div>

        <div className="mb-12 md:mb-20 text-center px-4">
          <Button asChild size="lg" className="bg-secondary text-black font-black text-[11px] md:text-[12px] h-14 md:h-16 px-8 md:px-14 rounded-2xl tracking-widest shadow-[0_0_40px_rgba(0,255,255,0.4)] transition-all hover:scale-105 border-none italic w-full sm:w-auto">
            <a href={ticketingUrl} target="_blank">
              <Ticket className="w-5 md:w-6 h-5 md:h-6 mr-2 md:mr-3" /> RÉSERVER MON BILLET
            </a>
          </Button>
        </div>

        {categories.map((cat) => {
          const catTalents = talents?.filter(t => t.category === cat) || [];
          if (catTalents.length === 0) return null;

          return (
            <section key={cat} className="mb-16 md:mb-32">
              <div className="flex items-center gap-4 md:gap-8 mb-10 md:mb-16 overflow-hidden">
                <h2 className="text-[10px] md:text-[14px] font-black text-white uppercase tracking-[0.4em] md:tracking-[0.6em] italic whitespace-nowrap">
                  {cat} <span className="text-white/50 hidden sm:inline">DIVISION</span>
                </h2>
                <div className="flex-1 h-px bg-white/20" />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-12">
                {catTalents.map((talent, idx) => (
                  <motion.div 
                    key={talent.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="group"
                  >
                    <div className="relative aspect-[3/4] rounded-2xl md:rounded-[2.5rem] overflow-hidden mb-4 md:mb-6 border-2 md:border-4 border-white/10 shadow-2xl bg-white/5 group-hover:border-white/40 transition-all duration-700">
                      {talent.imageUrl ? (
                        <Image 
                          src={talent.imageUrl} 
                          alt={talent.name} 
                          fill 
                          className="object-cover transition-all duration-1000 group-hover:scale-110 grayscale-[15%] group-hover:grayscale-0 brightness-[0.85] group-hover:brightness-100"
                          unoptimized={true}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                          <User className="w-10 md:w-12 h-10 md:h-12 text-white/10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                    </div>
                    <div className="space-y-1.5 md:space-y-2 px-2">
                      <h3 className="text-[14px] md:text-[18px] font-black text-white uppercase italic tracking-tight truncate">{talent.name}</h3>
                      <div className="inline-flex px-2 md:px-3 py-0.5 md:py-1 bg-white/10 border border-white/20 rounded-lg text-[7px] md:text-[9px] text-white font-black uppercase tracking-widest italic">
                        {talent.role}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          );
        })}

        {(!talents || talents.length === 0) && (
          <div className="text-center py-20 md:py-32 bg-white/[0.02] rounded-[2rem] md:rounded-[3rem] border border-white/5 border-dashed">
            <p className="text-[10px] md:text-[12px] text-white/20 uppercase font-black tracking-[0.4em] italic">Annonce du casting prochainement...</p>
          </div>
        )}
      </div>
    </div>
  );
}