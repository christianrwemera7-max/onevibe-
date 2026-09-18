
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Clock, Ticket, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-primary font-black text-[8px] uppercase tracking-[0.3em] mb-4">
            <Zap className="w-3.5 h-3.5" /> LE FLOW DU JOUR J
          </div>
          <h1 className="text-[20px] md:text-[25px] font-black tracking-tighter uppercase italic mb-3">AGENDA 2027</h1>
          <div className="w-12 h-0.5 bg-primary/30 mx-auto mt-2 rounded-full" />
        </div>

        <div className="space-y-4">
          {activeProgram.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start gap-5 p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.07] transition-colors"
            >
              <div className="shrink-0 flex flex-col items-center justify-center bg-primary/10 border border-primary/20 w-14 h-14 rounded-xl">
                <span className="text-[10px] font-black text-primary font-mono italic">{item.time}</span>
              </div>
              
              <div className="space-y-1 pt-1">
                <h3 className="text-[13px] md:text-[14px] font-black uppercase tracking-tight text-white flex items-center gap-2">
                  <Zap className="w-3 h-3 text-primary" /> {item.title}
                </h3>
                <p className="text-[10px] text-muted-foreground italic leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button asChild className="bg-primary text-white font-black text-[9px] uppercase h-11 px-8 rounded-full tracking-widest shadow-lg shadow-primary/20 transition-all">
            <a href={ticketingUrl} target="_blank">
              <Ticket className="w-3.5 h-3.5 mr-2" /> RÉSERVER MON BILLET
            </a>
          </Button>
        </div>

        {(!activeProgram || activeProgram.length === 0) && (
          <div className="text-center py-12 border border-white/5 border-dashed rounded-3xl">
            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest italic">Chargement du flow...</p>
          </div>
        )}
      </div>
    </div>
  );
}
