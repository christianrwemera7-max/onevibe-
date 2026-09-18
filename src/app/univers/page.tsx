
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Music, Palette, Gamepad2, ArrowRight, Ticket } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const activeUniverses = [
  {
    id: "music",
    title: "VIBE MUSIC",
    icon: <Music className="w-5 h-5 text-primary" />,
    description: "Le cœur battant du festival. Des concerts explosifs et des DJ sets uniques.",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800",
  },
  {
    id: "creative",
    title: "VIBE CREATIVE",
    icon: <Palette className="w-5 h-5 text-accent" />,
    description: "L'art sous toutes ses formes. Mode underground et street-art en direct.",
    image: "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?q=80&w=800",
  },
  {
    id: "digital",
    title: "VIBE DIGITAL",
    icon: <Gamepad2 className="w-5 h-5 text-secondary" />,
    description: "Technologie avancée et divertissement numérique. E-sport et VR.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800",
  }
];

export default function UniversPage() {
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(settingsRef);
  
  const ticketingUrl = settings?.ticketingUrl || 'https://omtevents.com';

  const isValidUrl = (url?: string) => url && (url.startsWith('http://') || url.startsWith('https://'));

  const getUniverseImage = (id: string, defaultImg: string) => {
    if (!settings) return defaultImg;
    const customImg = settings[`${id}Img`];
    return isValidUrl(customImg) ? customImg : defaultImg;
  };

  const getUniverseDesc = (id: string, defaultDesc: string) => {
    if (!settings) return defaultDesc;
    return settings[`${id}Desc`] || defaultDesc;
  };

  return (
    <div className="pt-28 pb-20 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-[22px] md:text-[30px] font-black tracking-tighter uppercase italic mb-3">LES 3 UNIVERS</h1>
          <p className="text-[8px] text-muted-foreground uppercase tracking-[0.4em] font-bold italic">Explorez les dimensions de ONE VIBE</p>
          <div className="w-12 h-1 bg-primary mx-auto mt-5 rounded-full" />
        </div>

        <div className="mb-12 text-center">
          <Button asChild size="default" className="bg-primary text-white font-black text-[9px] uppercase h-11 px-8 rounded-full tracking-widest shadow-lg shadow-primary/20 transition-all">
            <a href={ticketingUrl} target="_blank">
              <Ticket className="w-3.5 h-3.5 mr-2" /> RÉSERVER MON BILLET
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {activeUniverses.map((uni) => (
            <Link key={uni.id} href={`/univers/${uni.id}`} className="group block">
              <Card className="bg-white/5 border-white/5 rounded-[2rem] overflow-hidden p-5 hover:border-primary/30 transition-all flex flex-col h-full justify-between">
                <div className="space-y-5">
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900">
                    <Image 
                      src={getUniverseImage(uni.id, uni.image)} 
                      alt={uni.title} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" 
                    />
                    <div className="absolute top-3 left-3 p-2 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                      {uni.icon}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-[16px] md:text-[18px] font-black uppercase italic text-white flex items-center justify-between">
                      {uni.title}
                      <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </h2>
                    <p className="text-[10px] md:text-[11px] text-muted-foreground leading-relaxed italic opacity-80">{getUniverseDesc(uni.id, uni.description)}</p>
                  </div>
                </div>
                <div className="mt-5 text-[8px] font-black text-primary uppercase tracking-widest italic group-hover:underline">
                  Voir le programme →
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
