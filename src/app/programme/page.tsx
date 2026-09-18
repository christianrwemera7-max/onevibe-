
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Clock, Ticket, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const defaultProgram = [
  { time: "12:00", title: "Ouverture des Portes", desc: "Immersion et ouverture des villages thématiques.", imageUrl: "https://picsum.photos/seed/open/800/600" },
  { time: "14:00", title: "VIBE DIGITAL Tournament", desc: "Grande finale e-sport sur scène centrale.", imageUrl: "https://picsum.photos/seed/esport/800/600" },
  { time: "16:00", title: "Creative Showcase", desc: "Défilé et performances artistiques en live.", imageUrl: "https://picsum.photos/seed/show/800/600" },
  { time: "19:00", title: "Main Stage Concert", desc: "Têtes d'affiches nationales et internationales.", imageUrl: "https://picsum.photos/seed/concert/800/600" },
  { time: "22:00", title: "Clôture", desc: "Fin de l'événement et after-party.", imageUrl: "https://picsum.photos/seed/after/800/600" }
];

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
    <div className="pt-28 pb-20 bg-neutral-950 min-h-screen">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-primary font-black text-[8px] uppercase tracking-[0.3em] mb-4">
            <Zap className="w-3.5 h-3.5" /> LE FLOW DU JOUR J
          </div>
          <h1 className="text-[22px] md:text-[30px] font-black tracking-tighter uppercase italic mb-3">AGENDA 2027</h1>
          <div className="w-12 h-1 bg-primary mx-auto mt-5 rounded-full" />
        </div>

        <div className="mb-16 text-center">
          <Button asChild className="bg-primary text-white font-black text-[9px] uppercase h-12 px-10 rounded-full tracking-widest shadow-xl shadow-primary/20 transition-all">
            <a href={ticketingUrl} target="_blank">
              <Ticket className="w-3.5 h-3.5 mr-2" /> RÉSERVER MON BILLET
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8">
          {activeProgram.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative h-[300px] md:h-[380px] rounded-3xl md:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-black"
            >
              <Image 
                src={item.imageUrl || `https://picsum.photos/seed/prog${idx}/800/600`} 
                alt={item.title} 
                fill 
                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              
              <div className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/30 backdrop-blur-md rounded-full">
                <Clock className="w-3 h-3 text-primary" />
                <span className="text-[10px] md:text-[11px] font-black text-primary italic font-mono">{item.time}</span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 space-y-1.5">
                <h3 className="text-[15px] md:text-[17px] font-black uppercase tracking-tight text-white italic leading-tight">{item.title}</h3>
                <p className="text-[9px] md:text-[10px] text-white/70 italic leading-relaxed max-w-sm line-clamp-2">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {(!activeProgram || activeProgram.length === 0) && (
          <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/5 border-dashed">
            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest italic">Programmation en cours de finalisation...</p>
          </div>
        )}
      </div>
    </div>
  );
}
