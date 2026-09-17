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
    icon: <Music className="w-6 h-6 text-primary" />,
    description: "Le cœur battant du festival. Des concerts explosifs, des DJ sets hypnotiques et des têtes d'affiches uniques.",
    image: "https://picsum.photos/seed/music1/800/1000",
    imageHint: "concert stage"
  },
  {
    id: "creative",
    title: "VIBE CREATIVE",
    icon: <Palette className="w-6 h-6 text-accent" />,
    description: "L'art sous toutes ses formes. Mode underground, design futuriste, street-art en direct et galeries éphémères.",
    image: "https://picsum.photos/seed/art1/800/1000",
    imageHint: "street art fashion"
  },
  {
    id: "digital",
    title: "VIBE DIGITAL",
    icon: <Gamepad2 className="w-6 h-6 text-secondary" />,
    description: "Technologie avancée et divertissement numérique. Tournois e-sport majeurs et expériences VR/AR.",
    image: "https://picsum.photos/seed/digi1/800/1000",
    imageHint: "gaming technology"
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
    <div className="pt-32 pb-20 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-[25px] font-black tracking-tighter uppercase italic mb-4">LES 3 UNIVERS</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.5em] font-bold italic">Cliquez sur une dimension pour explorer ses activités</p>
          <div className="w-16 h-1 bg-primary mx-auto mt-6 rounded-full" />
        </div>

        {/* Bannière de conversion unique supérieure rapide */}
        <div className="mb-16 text-center">
          <Button asChild size="default" className="bg-primary text-white font-black text-[10px] uppercase h-12 px-8 rounded-full tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            <a href={ticketingUrl} target="_blank">
              <Ticket className="w-4 h-4 mr-2" /> RÉSERVER MON BILLET ACCÈS DIRECT
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activeUniverses.map((uni) => (
            <Link key={uni.id} href={`/univers/${uni.id}`} className="group block">
              <Card className="bg-white/5 border-white/5 rounded-[2.5rem] overflow-hidden p-6 hover:border-primary/40 transition-all hover:-translate-y-2 flex flex-col h-full justify-between">
                <div className="space-y-6">
                  <div className="relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden">
                    <Image 
                      src={getUniverseImage(uni.id, uni.image)} 
                      alt={uni.title} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      data-ai-hint={uni.imageHint} 
                    />
                    <div className="absolute top-4 left-4 p-3 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                      {uni.icon}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-[18px] font-black uppercase italic text-white flex items-center justify-between">
                      {uni.title}
                      <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </h2>
                    <p className="text-[11px] text-muted-foreground leading-relaxed italic opacity-80">{getUniverseDesc(uni.id, uni.description)}</p>
                  </div>
                </div>
                <div className="mt-6 text-[9px] font-black text-primary uppercase tracking-widest italic group-hover:underline">
                  Découvrir le programme de l'univers →
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
