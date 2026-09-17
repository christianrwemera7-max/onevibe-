"use client";

import React from 'react';
import { Gamepad2, ArrowLeft, Trophy, Cpu, Smartphone, Monitor, Ticket } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';

const activities = [
  { title: "E-Sports Major Arena", time: "14:00 - 19:30", desc: "La grande arène e-sport avec écran géant pour les phases finales sur les jeux les plus compétitifs.", icon: <Trophy className="w-5 h-5 text-secondary" /> },
  { title: "VR Experience Zone", time: "Continu", desc: "Plongez dans des mondes virtuels grâce aux derniers casques VR mis à disposition du public.", icon: <Cpu className="w-5 h-5 text-secondary" /> },
  { title: "Indie Game Showcases", time: "12:00 - 17:00", desc: "Découvrez et testez en exclusivité des jeux vidéo conçus par des studios de développement africains.", icon: <Smartphone className="w-5 h-5 text-secondary" /> },
  { title: "AI & Tech Demos", time: "15:00 - 17:00", desc: "Démonstrations en temps réel d'outils interactifs propulsés par l'intelligence artificielle.", icon: <Monitor className="w-5 h-5 text-secondary" /> }
];

export default function DigitalUniversePage() {
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(settingsRef);

  const isValidUrl = (url?: string) => url && (url.startsWith('http://') || url.startsWith('https://'));
  const ticketingUrl = settings?.ticketingUrl || 'https://omtevents.com';

  return (
    <div className="pt-32 pb-20 bg-neutral-950 min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link href="/univers" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour aux univers
          </Link>
          
          <Button asChild size="sm" className="bg-primary text-white font-black text-[9px] uppercase tracking-widest h-9 px-4 rounded-full shadow-lg shadow-primary/20">
            <a href={ticketingUrl} target="_blank"><Ticket className="w-3.5 h-3.5 mr-1" /> RÉSERVER MON PASS DIGITAL</a>
          </Button>
        </div>

        <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-neutral-900">
          <Image 
            src={isValidUrl(settings?.digitalImg) ? settings!.digitalImg : "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200"} 
            alt="Vibe Digital" 
            fill 
            className="object-cover brightness-90" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute bottom-8 left-8 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/20 text-secondary border border-secondary/30 text-[9px] font-black uppercase tracking-widest rounded-full">
              <Gamepad2 className="w-3 h-3" /> TECHNOLOGIE & GAMING
            </div>
            <h1 className="text-[25px] font-black uppercase italic drop-shadow-xl">VIBE DIGITAL</h1>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-[14px] font-black tracking-widest uppercase text-muted-foreground border-b border-white/5 pb-4 italic">LES ACTIVITÉS AU PROGRAMME</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((act, i) => (
              <Card key={i} className="p-6 bg-white/5 border-white/5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-secondary/20 transition-all">
                <div className="space-y-3">
                  <div className="p-3 bg-secondary/10 w-fit rounded-xl border border-secondary/20">
                    {act.icon}
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-white">{act.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed italic">{act.desc}</p>
                </div>
                <div className="text-[9px] font-mono font-bold text-secondary bg-secondary/10 w-fit px-3 py-0.5 rounded-full uppercase">
                  {act.time}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
