
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles, LayoutGrid, Star, Calendar, Store, ShoppingBag } from 'lucide-react';
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
      title: "DÉCOUVRIR LES UNIVERS", 
      href: "/univers", 
      icon: <LayoutGrid className="w-4 h-4" />,
      desc: "3 dimensions à explorer" 
    },
    { 
      title: "DÉCOUVRIR LES GUESTS", 
      href: "/guests", 
      icon: <Star className="w-4 h-4" />,
      desc: "L'élite de la scène actuelle" 
    },
    { 
      title: "VOIR LE PROGRAMME", 
      href: "/programme", 
      icon: <Calendar className="w-4 h-4" />,
      desc: "Le flow du jour J" 
    },
    { 
      title: "ONE VIBE MERCH", 
      href: "/merch", 
      icon: <ShoppingBag className="w-4 h-4" />,
      desc: "T-shirts & Merch officiels" 
    },
    { 
      title: "RESERVER VOTRE STAND", 
      href: "/exposants", 
      icon: <Store className="w-4 h-4" />,
      desc: "Boostez votre business" 
    }
  ];

  return (
    <div className="pt-28 pb-16 bg-black min-h-screen">
      {/* Teaser Section */}
      {teaserUrl && getYoutubeId(teaserUrl) && (
        <section className="mb-16 md:mb-20 relative">
          <div className="max-w-5xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8 md:mb-12"
            >
              <div className="inline-flex items-center gap-2 text-primary font-black text-[8px] md:text-[9px] uppercase tracking-[0.3em] mb-5">
                <Sparkles className="w-3.5 h-3.5" /> IMMERSION TOTALE
              </div>
              
              <h1 className="flex flex-col items-center leading-none mb-6">
                <span className="text-[28px] md:text-[45px] font-black uppercase italic tracking-tighter text-white">
                  TEASER <span className="text-primary">OFFICIEL</span>
                </span>
                <span className="text-[10px] md:text-[14px] font-black uppercase tracking-[0.4em] text-white/20 mt-1 italic">
                  {settings?.eventName || 'ONE VIBE FEST'}
                </span>
              </h1>
              
              <div className="w-12 h-1 bg-primary/30 mx-auto rounded-full" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative aspect-video rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-white/5"
            >
              <iframe 
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${getYoutubeId(teaserUrl)}?autoplay=0&mute=0&controls=1`}
                title="Teaser"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Navigation Buttons Section */}
      <section className="py-8 bg-transparent relative">
        <div className="max-w-3xl mx-auto px-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {navButtons.map((btn, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i + 0.3 }}
              >
                <Button 
                  asChild
                  className="w-full h-16 md:h-18 bg-[#b5005b] hover:bg-[#9d004e] text-white rounded-2xl md:rounded-full flex items-center justify-between px-6 md:px-10 group transition-all hover:scale-[1.01] shadow-lg border-none"
                >
                  <Link href={btn.href}>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        {btn.icon}
                      </div>
                      <div className="text-left">
                        <div className="text-[11px] md:text-[13px] font-black uppercase italic tracking-tight leading-tight">
                          {btn.title}
                        </div>
                        <div className="text-[7px] md:text-[8px] font-bold opacity-70 uppercase tracking-widest mt-0.5">
                          {btn.desc}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0 group-hover:translate-x-1.5 transition-transform hidden sm:block" />
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual flair */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-[-10%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
