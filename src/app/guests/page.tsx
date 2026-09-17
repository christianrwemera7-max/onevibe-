
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Star, User } from 'lucide-react';
import Image from 'next/image';

const categories = ["MUSIC", "CREATIVE", "BUSINESS", "DIGITAL"];

export default function TalentsPage() {
  const firestore = useFirestore();
  const talentsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'talents');
  }, [firestore]);
  const { data: talents } = useCollection(talentsRef);

  return (
    <div className="pt-32 pb-20 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-[0.3em] mb-4">
            <Star className="w-4 h-4" /> L'ÉLITE 2027
          </div>
          <h1 className="text-[25px] font-black tracking-tighter uppercase italic leading-tight">
            LES <span className="text-primary">TALENTS</span>
          </h1>
          <div className="w-16 h-1 bg-primary/20 mx-auto mt-6 rounded-full" />
        </div>

        {categories.map((cat) => {
          const catTalents = talents?.filter(t => t.category === cat) || [];
          if (catTalents.length === 0) return null;

          return (
            <section key={cat} className="mb-24">
              <h2 className="text-[12px] font-black text-white/40 uppercase tracking-[0.4em] mb-12 italic flex items-center gap-4">
                <span>{cat}</span>
                <div className="flex-1 h-px bg-white/5" />
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
                {catTalents.map((talent, idx) => (
                  <motion.div 
                    key={talent.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                  >
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-6 border border-white/5 shadow-2xl bg-white/5">
                      {talent.imageUrl ? (
                        <Image 
                          src={talent.imageUrl} 
                          alt={talent.name} 
                          fill 
                          className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                          data-ai-hint="portrait artist festival"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                          <User className="w-10 h-10 text-white/10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[14px] font-black text-white uppercase italic tracking-tight">{talent.name}</h3>
                      <p className="text-[9px] text-primary font-black uppercase tracking-widest">{talent.role}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          );
        })}

        {(!talents || talents.length === 0) && (
          <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/5 border-dashed">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest italic">Annonce des premiers talents très prochainement...</p>
          </div>
        )}
      </div>
    </div>
  );
}
