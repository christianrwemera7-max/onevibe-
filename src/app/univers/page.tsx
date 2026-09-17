
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Music, Palette, Briefcase, Gamepad2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const universes = [
  {
    title: "VIBE MUSIC",
    icon: <Music className="w-6 h-6 text-primary" />,
    description: "Le cœur battant du festival. Des concerts explosifs, des DJ sets hypnotiques et des battles de danse urbaine.",
    activities: ["Concerts Live", "Showcases VIP", "Open Mic", "DJ Battles"],
    image: "https://picsum.photos/seed/music1/800/1000",
    imageHint: "concert stage"
  },
  {
    title: "VIBE CREATIVE",
    icon: <Palette className="w-6 h-6 text-accent" />,
    description: "L'art sous toutes ses formes. Mode, design, street-art et expositions immersives.",
    activities: ["Fashion Show", "Live Painting", "Galerie d'Art", "Custom Workshop"],
    image: "https://picsum.photos/seed/art1/800/1000",
    imageHint: "street art fashion"
  },
  {
    title: "VIBE BUSINESS",
    icon: <Briefcase className="w-6 h-6 text-secondary" />,
    description: "Le futur se construit ici. Networking, pitchs de startups et rencontres avec les leaders de demain.",
    activities: ["Pitch Contest", "Masterclasses", "Networking B2B", "Brand Village"],
    image: "https://picsum.photos/seed/biz1/800/1000",
    imageHint: "entrepreneurship pitch"
  },
  {
    title: "VIBE DIGITAL",
    icon: <Gamepad2 className="w-6 h-6 text-teal-400" />,
    description: "Technologie et divertissement numérique. Gaming, e-sport et expériences VR/AR.",
    activities: ["Tournois E-Sport", "Zone VR", "Tech Demos", "Gaming Hub"],
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

  return (
    <div className="pt-32 pb-20 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-24">
          <h1 className="text-[25px] font-black tracking-tighter uppercase italic mb-4">LES UNIVERS</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.5em] font-bold italic">4 dimensions à explorer sans limites</p>
          <div className="w-16 h-1 bg-primary mx-auto mt-6 rounded-full" />
        </div>

        <div className="space-y-32">
          {universes.map((uni, idx) => (
            <motion.div 
              key={uni.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center`}
            >
              <div className="flex-1 space-y-8">
                <div className="inline-flex p-5 bg-white/5 rounded-2xl border border-white/10 mb-2">
                  {uni.icon}
                </div>
                <h2 className="text-[22px] font-black uppercase tracking-tight italic">{uni.title}</h2>
                <p className="text-[13px] text-muted-foreground leading-relaxed italic opacity-80">{uni.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  {uni.activities.map((act) => (
                    <div key={act} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 relative w-full aspect-[4/5] max-w-[500px] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 group">
                <Image 
                  src={uni.image} 
                  alt={uni.title} 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                  data-ai-hint={uni.imageHint} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-40 text-center">
          <Card className="p-16 bg-primary/10 border-primary/20 rounded-[4rem] relative overflow-hidden text-white border">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -ml-16 -mt-16" />
            <h2 className="text-[22px] font-black uppercase italic mb-8 relative z-10">VOTRE PASS VOUS ATTEND</h2>
            <Button asChild size="lg" className="h-20 px-12 text-[10px] font-black rounded-full bg-primary text-white uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-105 transition-all relative z-10">
              <a href={ticketingUrl} target="_blank">RÉSERVER MAINTENANT</a>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
