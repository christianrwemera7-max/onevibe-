
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Clock } from 'lucide-react';

const defaultProgram = [
  { time: "12:00", title: "Ouverture des Portes", desc: "Immersion et ouverture des villages thématiques." },
  { time: "14:00", title: "VIBE DIGITAL Tournament", desc: "Grande finale e-sport sur scène centrale." },
  { time: "16:00", title: "Creative Showcase", desc: "Défilé et performances artistiques en live." },
  { time: "19:00", title: "Main Stage Concert", desc: "Têtes d'affiches nationales et internationales." },
  { time: "22:00", title: "Clôture", desc: "Fin de l'événement et after-party." }
];

export default function ProgrammePage() {
  const firestore = useFirestore();
  
  const programCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'program');
  }, [firestore]);
  const { data: dynamicProgram } = useCollection(programCollectionRef);

  const activeProgram = dynamicProgram && dynamicProgram.length > 0 
    ? [...dynamicProgram].sort((a,b) => a.time.localeCompare(b.time)) 
    : defaultProgram;

  return (
    <div className="pt-32 pb-20 bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-24">
          <h1 className="text-[25px] font-black tracking-tighter uppercase italic mb-4">LE FLOW</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.5em] font-bold italic">Le timing millimétré du 26 Juin 2027</p>
          <div className="w-16 h-1 bg-primary mx-auto mt-6 rounded-full" />
        </div>

        <div className="space-y-12 relative">
          <div className="absolute left-[20px] top-0 bottom-0 w-px bg-white/10 md:left-1/2 md:-translate-x-1/2" />
          
          {activeProgram.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className={`flex flex-col md:flex-row items-start md:items-center gap-10 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="flex-1 w-full">
                <div className="group p-8 bg-white/5 border border-white/5 rounded-[2.5rem] hover:border-primary/40 hover:bg-white/[0.08] transition-all shadow-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-[22px] font-black text-primary italic font-mono">{item.time}</span>
                  </div>
                  <h3 className="text-[16px] font-black uppercase tracking-tight text-white mb-3">{item.title}</h3>
                  <p className="text-[11px] text-muted-foreground italic leading-relaxed opacity-80">{item.desc}</p>
                </div>
              </div>
              
              <div className="z-10 w-10 h-10 rounded-full bg-black border-4 border-primary shadow-[0_0_20px_rgba(255,0,128,0.4)] flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>

              <div className="flex-1 hidden md:block" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
