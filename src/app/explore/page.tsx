"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export default function ExplorePage() {
  const firestore = useFirestore();

  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(settingsRef);
  
  const teaserUrl = settings?.teaserUrl;

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="pt-32 pb-20 bg-black min-h-screen">
      {/* Teaser Section - The Entrance to discovery */}
      {teaserUrl && getYoutubeId(teaserUrl) && (
        <section className="mb-32 relative">
          <div className="max-w-5xl mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-[0.3em] mb-4">
                <Sparkles className="w-4 h-4" /> IMMERSION TOTALE
              </div>
              <h1 className="text-[25px] font-black uppercase italic mb-4 tracking-tighter">LE TEASER 2027</h1>
              <div className="w-16 h-1 bg-primary/20 mx-auto mt-6 rounded-full" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative aspect-video rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-white/5"
            >
              <iframe 
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${getYoutubeId(teaserUrl)}?autoplay=0&mute=0&controls=1`}
                title="ONE VIBE FEST Teaser"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Navigation Hub */}
      <section className="py-20 bg-neutral-950 border-y border-white/5 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-[100px]" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "LE FLOW", href: "/programme", color: "text-primary", desc: "Agenda complet" },
              { title: "TALENTS", href: "/guests", color: "text-white", desc: "Les Masters" },
              { title: "UNIVERS", href: "/univers", color: "text-secondary", desc: "3 Dimensions" },
              { title: "STANDS", href: "/exposants", color: "text-accent", desc: "Business Vibe" }
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.4 }}
              >
                <Link href={card.href} className="group block p-12 bg-black/40 backdrop-blur-xl border border-white/5 rounded-[3rem] hover:border-white/15 transition-all hover:-translate-y-2 shadow-xl shadow-black h-full">
                  <div className={cn("text-[22px] font-black uppercase italic mb-4", card.color)}>{card.title}</div>
                  <p className="text-muted-foreground text-[9px] uppercase font-black tracking-[0.2em] mb-12 italic opacity-60">{card.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest group-hover:text-white transition-colors">DÉCOUVRIR</span>
                    <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
