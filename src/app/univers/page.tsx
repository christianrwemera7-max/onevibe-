"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Music, Palette, Gamepad2, Star, ArrowRight, Ticket } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';

export default function UniversPage() {
  const firestore = useFirestore();

  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(settingsRef);

  const universesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'universes');
  }, [firestore]);
  const { data: dynamicUniverses, isLoading } = useCollection(universesRef);
  
  const ticketingUrl = settings?.ticketingUrl || 'https://omtevents.com';

  const getIcon = (name: string, color: string) => {
    const icons: Record<string, any> = {
      Music: <Music className="w-5 h-5 text-white" />,
      Palette: <Palette className="w-5 h-5 text-white" />,
      Gamepad2: <Gamepad2 className="w-5 h-5 text-white" />,
      Star: <Star className="w-5 h-5 text-white" />
    };
    return icons[name] || <Star className="w-5 h-5 text-white" />;
  };

  return (
    <div className="pt-28 pb-20 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-[22px] md:text-[30px] font-black tracking-tighter uppercase italic mb-3 text-white">LES UNIVERS</h1>
          <p className="text-[8px] text-white/40 uppercase tracking-[0.4em] font-bold italic">Explorez les dimensions de {settings?.eventName || 'ONE VIBE'}</p>
          <div className="w-12 h-1 bg-white/20 mx-auto mt-5 rounded-full" />
        </div>

        <div className="mb-12 text-center">
          <Button asChild size="lg" className="bg-secondary text-black font-black text-[11px] h-14 px-10 rounded-2xl tracking-widest shadow-[0_0_30px_rgba(0,255,255,0.3)] transition-all hover:scale-105 border-none italic">
            <a href={ticketingUrl} target="_blank">
              <Ticket className="w-5 h-5 mr-3" /> RÉSERVER MON BILLET
            </a>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : dynamicUniverses && dynamicUniverses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {dynamicUniverses.sort((a,b) => (a.order || 0) - (b.order || 0)).map((uni) => (
              <Link key={uni.id} href={`/univers/${uni.id}`} className="group block">
                <Card className="bg-white/5 border-white/5 rounded-[2rem] overflow-hidden p-5 hover:border-white/30 transition-all flex flex-col h-full justify-between shadow-2xl">
                  <div className="space-y-5">
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-white/5">
                      {uni.imageUrl && (
                        <Image 
                          src={uni.imageUrl} 
                          alt={uni.title} 
                          fill 
                          className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" 
                        />
                      )}
                      <div className="absolute top-3 left-3 p-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                        {getIcon(uni.iconName, uni.color)}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <h2 className="text-[16px] md:text-[18px] font-black uppercase italic text-white flex items-center justify-between">
                        {uni.title}
                        <ArrowRight className="w-4 h-4 text-white/50 group-hover:translate-x-1 transition-transform" />
                      </h2>
                      <p className="text-[10px] md:text-[11px] text-white/60 leading-relaxed italic opacity-80 line-clamp-3">{uni.description}</p>
                    </div>
                  </div>
                  <div className="mt-5 text-[8px] font-black text-white/40 uppercase tracking-widest italic group-hover:text-white transition-colors">
                    DÉCOUVRIR L'EXPÉRIENCE →
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-white/5 border-dashed rounded-3xl">
            <p className="text-[9px] text-white/30 font-black uppercase tracking-widest italic">Les univers arrivent bientôt...</p>
          </div>
        )}
      </div>
    </div>
  );
}
