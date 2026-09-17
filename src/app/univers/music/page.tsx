"use client";

import React from 'react';
import { Music, ArrowLeft, Disc, Mic2, Radio, Star } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

const activities = [
  { title: "Main Stage Live Concerts", time: "19:00 - 22:00", desc: "Têtes d'affiches nationales et internationales sur une scène monumentale dotée d'effets visuels immersifs.", icon: <Star className="w-5 h-5 text-primary" /> },
  { title: "DJ Battles & Open Air Set", time: "16:00 - 18:30", desc: "Les meilleurs collectifs de DJ s'affrontent sur des rythmes afrobeat, amapiano et electro.", icon: <Disc className="w-5 h-5 text-primary" /> },
  { title: "Open Mic & Urban Cypher", time: "14:00 - 15:30", desc: "Un espace d'expression brute pour les nouveaux talents de la scène rap et slam de Kinshasa.", icon: <Mic2 className="w-5 h-5 text-primary" /> },
  { title: "Immersion Soundsystem", time: "Continu", desc: "Une installation sonore haute fidélité pour vibrer au rythme de la basse toute la journée.", icon: <Radio className="w-5 h-5 text-primary" /> }
];

export default function MusicUniversePage() {
  return (
    <div className="pt-32 pb-20 bg-neutral-950 min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 space-y-12">
        <Link href="/univers" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour aux univers
        </Link>

        <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
          <Image src="https://picsum.photos/seed/musdet/1200/600" alt="Vibe Music" fill className="object-cover brightness-75" data-ai-hint="concert crowd neon" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute bottom-8 left-8 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary border border-primary/30 text-[9px] font-black uppercase tracking-widest rounded-full">
              <Music className="w-3 h-3" /> DIMENSION SONORE
            </div>
            <h1 className="text-[25px] font-black uppercase italic">VIBE MUSIC</h1>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-[14px] font-black tracking-widest uppercase text-muted-foreground border-b border-white/5 pb-4 italic">LES ACTIVITÉS AU PROGRAMME</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((act, i) => (
              <Card key={i} className="p-6 bg-white/5 border-white/5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-primary/20 transition-all">
                <div className="space-y-3">
                  <div className="p-3 bg-primary/10 w-fit rounded-xl border border-primary/20">
                    {act.icon}
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-white">{act.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed italic">{act.desc}</p>
                </div>
                <div className="text-[9px] font-mono font-bold text-primary bg-primary/10 w-fit px-3 py-0.5 rounded-full uppercase">
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
