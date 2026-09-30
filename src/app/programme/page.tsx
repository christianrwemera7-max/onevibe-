"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Ticket, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const defaultProgram = [
  { time: "12:00", title: "Ouverture des Portes", desc: "Immersion et ouverture des villages thématiques." },
  { time: "14:00", title: "VIBE DIGITAL Tournament", desc: "Grande finale e-sport sur scène centrale." },
  { time: "16:00", title: "Creative Showcase", desc: "Défilé et performances artistiques en live." },
  { time: "19:00", title: "Main Stage Concert", desc: "Têtes d'affiches nationales et internationales." },
  { time: "22:00", title: "Clôture", desc: "Fin de l'événement et after-party." }
];

export function ProgramItem({ time, title, desc, idx }: { time: string, title: string, desc: string, idx: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="group flex items-start gap-6"
    >
      <div className="shrink-0 pt-1">
        <div className="text-[12px] font-black text-white font-mono italic bg-white/10 border border-white/20 px-3 py-1 rounded-lg">
          {time}
        </div>
      </div>
      
      <div className="space-y-1.5 pb-8 border-b border-white/10 flex-1 group-last:border-none">
        <h3 className="text-[14px] md:text-[16px] font-black uppercase tracking-tight text-white flex items-center gap-2">
          <span className="text-white text-[10px]">⚡</span> {title}
        </h3>
        <p className="text-[11px] text-white/70 italic leading-relaxed opacity-80">{desc}</p>
      </div>
    </motion.div>
  );
}

export default function ProgrammePage() {
  const firestore = useFirestore();
  
  const programCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'program');
  }, [firestore]);
  const { data: dynamicProgram } = useCollection(programCollectionRef);

  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(settingsRef);
  
  const ticketingUrl = settings?.ticketingUrl || 'https://omtevents.com';

  const activeProgram = dynamicProgram && dynamicProgram.length > 0 
    ? [...dynamicProgram].sort((a,b) => a.time.localeCompare(b.time)) 
    : defaultProgram;

  return (
    <div className="pt-32 pb-24 bg-background min-h-screen">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-white font-black text-[9px] uppercase tracking-[0.4em] mb-4 italic opacity-70">
            ⚡ LE FLOW DU JOUR J
          </div>
          <h1 className="text-[26px] md:text-[36px] font-black tracking-tighter uppercase italic text-white leading-none">AGENDA <span className="opacity-40">2027</span></h1>
          <div className="w-16 h-1 bg-white/40 mx-auto mt-6 rounded-full shadow-2xl" />
        </div>

        <div className="space-y-0">
          {activeProgram.map((item, idx) => (
            <ProgramItem 
              key={idx} 
              time={item.time} 
              title={item.title} 
              desc={item.desc} 
              idx={idx} 
            />
          ))}
        </div>

        <div className="mt-20 text-center">
          <Button asChild className="bg-secondary text-black font-black text-[12px] h-16 px-14 rounded-2xl tracking-widest shadow-[0_0_40px_rgba(0,255,255,0.4)] transition-all hover:scale-105 border-none italic">
            <a href={ticketingUrl} target="_blank">
              <Ticket className="w-6 h-6 mr-3" /> RÉSERVER MON BILLET
            </a>
          </Button>
          <p className="mt-4 text-[9px] text-white/30 font-black uppercase italic tracking-widest">Le programme peut être sujet à des ajustements ⚡</p>
        </div>
      </div>
    </div>
  );
}
