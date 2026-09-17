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
    <div className="pt-32 pb-20 bg-neutral-950 min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-[0.3em] mb-4">
            <Zap className="w-4 h-4" /> LE FLOW DU JOUR J
          </div>
          <h1 className="text-[25px] font-black tracking-tighter uppercase italic mb-4">AGENDA 2027</h1>
          <div className="w-16 h-1 bg-primary mx-auto mt-6 rounded-full" />
        </div>

        {/* CTA Conversion de tête UNIQUE */}
        <div className="mb-20 text-center">
          <Button asChild className="bg-primary text-white font-black text-[10px] uppercase h-14 px-10 rounded-full tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
            <a href={ticketingUrl} target="_blank">
              <Ticket className="w-4 h-4 mr-2" /> RÉSERVER MON BILLET POUR LE SHOW
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activeProgram.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative h-[400px] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-black"
            >
              <Image 
                src={item.imageUrl || `https://picsum.photos/seed/prog${idx}/800/600`} 
                alt={item.title} 
                fill 
                className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                data-ai-hint="festival activity event"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              
              <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 backdrop-blur-md rounded-full">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className="text-[12px] font-black text-primary italic font-mono">{item.time}</span>
              </div>

              <div className="absolute bottom-8 left-8 right-8 space-y-2">
                <h3 className="text-[18px] font-black uppercase tracking-tight text-white italic leading-tight">{item.title}</h3>
                <p className="text-[11px] text-white/70 italic leading-relaxed max-w-sm line-clamp-2">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {(!activeProgram || activeProgram.length === 0) && (
          <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/5 border-dashed">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest italic">Le programme détaillé arrive très bientôt...</p>
          </div>
        )}
      </div>
    </div>
  );
}
