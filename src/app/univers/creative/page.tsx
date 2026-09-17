"use client";

import React from 'react';
import { Palette, ArrowLeft, Shirt, Brush, Layers, Sparkles, Ticket } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';

const activities = [
  { title: "Streetwear Runway & Pop-up", time: "16:00 - 17:30", desc: "Présentation exclusive des créateurs avant-gardistes de la capitale avec défilé alternatif.", icon: <Shirt className="w-5 h-5 text-accent" /> },
  { title: "Live Neon Graffiti Session", time: "13:00 - 19:00", desc: "Des artistes transforment des pans de murs en fresques géantes réagissant aux lumières de la nuit.", icon: <Brush className="w-5 h-5 text-accent" /> },
  { title: "Galerie d'Art Futuriste", time: "Continu", desc: "Expositions éphémères mêlant sculptures physiques, peintures modernes et art génératif.", icon: <Layers className="w-5 h-5 text-accent" /> },
  { title: "Custom Upcycling Workshop", time: "14:00 - 16:00", desc: "Apportez vos vêtements pour les faire personnaliser en direct par des designers résidents.", icon: <Sparkles className="w-5 h-5 text-accent" /> }
];

export default function CreativeUniversePage() {
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(settingsRef);

  const ticketingUrl = settings?.ticketingUrl || 'https://omtevents.com';

  return (
    <div className="pt-32 pb-20 bg-neutral-950 min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link href="/univers" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour aux univers
          </Link>
          
          <Button asChild size="sm" className="bg-primary text-white font-black text-[9px] uppercase tracking-widest h-9 px-4 rounded-full">
            <a href={ticketingUrl} target="_blank"><Ticket className="w-3.5 h-3.5 mr-1" /> RÉSERVER CET UNIVERS</a>
          </Button>
        </div>

        <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
          <Image src="https://picsum.photos/seed/creadet/1200/600" alt="Vibe Creative" fill className="object-cover brightness-90" data-ai-hint="fashion runway streetart" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute bottom-8 left-8 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 text-accent border border-accent/30 text-[9px] font-black uppercase tracking-widest rounded-full">
              <Palette className="w-3 h-3" /> ART & DESIGN
            </div>
            <h1 className="text-[25px] font-black uppercase italic drop-shadow-xl">VIBE CREATIVE</h1>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-[14px] font-black tracking-widest uppercase text-muted-foreground border-b border-white/5 pb-4 italic">LES ACTIVITÉS AU PROGRAMME</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((act, i) => (
              <Card key={i} className="p-6 bg-white/5 border-white/5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-accent/20 transition-all">
                <div className="space-y-3">
                  <div className="p-3 bg-accent/10 w-fit rounded-xl border border-accent/20">
                    {act.icon}
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-white">{act.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed italic">{act.desc}</p>
                </div>
                <div className="text-[9px] font-mono font-bold text-accent bg-accent/10 w-fit px-3 py-0.5 rounded-full uppercase">
                  {act.time}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Section de conversion inférieure de l'univers */}
        <div className="pt-8 text-center">
          <Button asChild size="lg" className="bg-primary text-white font-black text-[10px] uppercase h-14 px-8 rounded-full tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            <a href={ticketingUrl} target="_blank">
              <Ticket className="w-4 h-4 mr-2" /> ACCÉDER À VIBE CREATIVE (PRENDRE MON PASS)
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}