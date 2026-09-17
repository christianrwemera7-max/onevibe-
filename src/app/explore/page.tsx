
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles, LayoutGrid, Star, Calendar, Store } from 'lucide-react';
import Link from 'next/link';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';

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

  const navButtons = [
    { 
      title: "DÉCOUVRIR LES UNIVERS DU FESTIVAL", 
      href: "/univers", 
      icon: <LayoutGrid className="w-5 h-5" />,
      desc: "3 dimensions à explorer" 
    },
    { 
      title: "DÉCOUVRIR LES GUESTS PRÉVUS", 
      href: "/guests", 
      icon: <Star className="w-5 h-5" />,
      desc: "L'élite de la scène 2027" 
    },
    { 
      title: "DÉCOUVRIR LE PROGRAMME (LE FLOW DU JOUR J)", 
      href: "/programme", 
      icon: <Calendar className="w-5 h-5" />,
      desc: "Timing millimétré" 
    },
    { 
      title: "RÉSERVER VOTRE STAND AUPRÈS DES ORGANISATEURS", 
      href: "/exposants", 
      icon: <Store className="w-5 h-5" />,
      desc: "Boostez votre business" 
    }
  ];

  return (
    <div className="pt-32 pb-20 bg-black min-h-screen">
      {/* Teaser Section */}
      {teaserUrl && getYoutubeId(teaserUrl) && (
        <section className="mb-24 relative">
          <div className="max-w-5xl mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-[0.3em] mb-4">
                <Sparkles className="w-4 h-4" /> IMMERSION TOTALE
              </div>
              <h1 className="text-[25px] font-black uppercase italic mb-4 tracking-tighter">TEASER OFFICIEL DE ONE VIBE FEST</h1>
              <div className="w-16 h-1 bg-primary/20 mx-auto mt-6 rounded-full" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-white/5"
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

      {/* Navigation Buttons Section */}
      <section className="py-12 bg-transparent relative">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {navButtons.map((btn, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i + 0.4 }}
              >
                <Button 
                  asChild
                  className="w-full h-20 sm:h-16 bg-primary hover:bg-primary/90 text-white rounded-[1.5rem] sm:rounded-full flex items-center justify-between px-8 sm:px-12 group transition-all hover:scale-[1.02] shadow-[0_10px_40px_rgba(255,0,128,0.3)]"
                >
                  <Link href={btn.href}>
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        {React.cloneElement(btn.icon as React.ReactElement, { className: 'w-4 h-4' })}
                      </div>
                      <div className="text-left">
                        <div className="text-[11px] sm:text-[13px] font-black uppercase italic tracking-tight leading-tight">
                          {btn.title}
                        </div>
                        <div className="text-[7px] sm:text-[8px] font-bold opacity-70 uppercase tracking-widest mt-0.5">
                          {btn.desc}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 shrink-0 group-hover:translate-x-2 transition-transform hidden sm:block" />
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Background visual flair */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[150px]" />
      </div>
    </div>
  );
}
