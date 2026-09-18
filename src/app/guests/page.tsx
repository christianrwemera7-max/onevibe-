
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Star, User, Ticket } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const categories = ["MUSIC", "CREATIVE", "BUSINESS", "DIGITAL"];

export default function TalentsPage() {
  const firestore = useFirestore();
  const talentsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'talents');
  }, [firestore]);
  const { data: talents } = useCollection(talentsRef);

  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(settingsRef);
  
  const ticketingUrl = settings?.ticketingUrl || 'https://omtevents.com';

  return (
    <div className="pt-28 pb-16 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-primary font-black text-[8px] uppercase tracking-[0.3em] mb-4">
            <Star className="w-3.5 h-3.5" /> L'ÉLITE 2027
          </div>
          <h1 className="text-[22px] md:text-[30px] font-black tracking-tighter uppercase italic leading-tight">
            LES <span className="text-primary">TALENTS</span>
          </h1>
          <div className="w-12 h-1 bg-primary/20 mx-auto mt-5 rounded-full" />
        </div>

        <div className="mb-12 text-center">
          <Button asChild size="default" className="bg-primary text-white font-black text-[9px] uppercase h-11 px-8 rounded-full tracking-widest shadow-lg shadow-primary/20 transition-all">
            <a href={ticketingUrl} target="_blank">
              <Ticket className="w-3.5 h-3.5 mr-2" /> RÉSERVER MON BILLET
            </a>
          </Button>
        </div>

        {categories.map((cat) => {
          const catTalents = talents?.filter(t => t.category === cat) || [];
          if (catTalents.length === 0) return null;

          return (
            <section key={cat} className="mb-16 md:mb-20">
              <h2 className="text-[10px] md:text-[11px] font-black text-white/30 uppercase tracking-[0.4em] mb-10 italic flex items-center gap-4">
                <span>{cat}</span>
                <div className="flex-1 h-px bg-white/5" />
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {catTalents.map((talent, idx) => (
                  <motion.div 
                    key={talent.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group"
                  >
                    <div className="relative aspect-square rounded-2xl md:rounded-[2rem] overflow-hidden mb-4 border border-white/5 shadow-xl bg-white/5">
                      {talent.imageUrl ? (
                        <Image 
                          src={talent.imageUrl} 
                          alt={talent.name} 
                          fill 
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                          <User className="w-8 h-8 text-white/10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-[12px] md:text-[13px] font-black text-white uppercase italic tracking-tight">{talent.name}</h3>
                      <p className="text-[8px] text-primary font-black uppercase tracking-widest">{talent.role}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          );
        })}

        {(!talents || talents.length === 0) && (
          <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/5 border-dashed">
            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest italic">Annonce du casting prochainement...</p>
          </div>
        )}
      </div>
    </div>
  );
}
