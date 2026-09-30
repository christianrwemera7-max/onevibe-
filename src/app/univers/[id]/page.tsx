
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Ticket, Star, Music, Palette, Gamepad2, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function DynamicUniversePage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();

  const universeRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'universes', id);
  }, [firestore, id]);
  const { data: universe, isLoading } = useDoc(universeRef);

  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(settingsRef);

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!universe) return <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white"><p className="text-[10px] font-black uppercase mb-4">Univers Introuvable</p><Button asChild variant="outline" className="rounded-full"><Link href="/univers">RETOUR</Link></Button></div>;

  const getIcon = (name: string, color: string) => {
    const icons: Record<string, any> = {
      Music: <Music className={`w-4 h-4 text-${color}`} />,
      Palette: <Palette className={`w-4 h-4 text-${color}`} />,
      Gamepad2: <Gamepad2 className={`w-4 h-4 text-${color}`} />,
      Star: <Star className={`w-4 h-4 text-${color}`} />
    };
    return icons[name] || <Star className={`w-4 h-4 text-${color}`} />;
  };

  const ticketingUrl = settings?.ticketingUrl || 'https://omtevents.com';

  return (
    <div className="pt-32 pb-20 bg-neutral-950 min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link href="/univers" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour aux univers
          </Link>
          
          <Button asChild size="sm" className="bg-primary text-white font-black text-[9px] uppercase tracking-widest h-9 px-4 rounded-full shadow-lg shadow-primary/20">
            <a href={ticketingUrl} target="_blank"><Ticket className="w-3.5 h-3.5 mr-1" /> RÉSERVER MON PASS {universe.title.split(' ')[1] || 'VIBE'}</a>
          </Button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-neutral-900"
        >
          {universe.imageUrl && (
            <Image 
              src={universe.imageUrl} 
              alt={universe.title} 
              fill 
              className="object-cover brightness-90" 
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute bottom-8 left-8 space-y-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1 bg-${universe.color}/20 text-${universe.color} border border-${universe.color}/30 text-[9px] font-black uppercase tracking-widest rounded-full`}>
              {getIcon(universe.iconName, universe.color)} EXPÉRIENCE IMMERSIVE
            </div>
            <h1 className="text-[25px] font-black uppercase italic drop-shadow-xl">{universe.title}</h1>
          </div>
        </motion.div>

        <div className="space-y-8">
          <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem]">
            <h2 className="text-[12px] font-black tracking-widest uppercase text-primary mb-4 italic flex items-center gap-2">
              <Zap className="w-4 h-4" /> À PROPOS DE CETTE DIMENSION
            </h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed italic opacity-90">{universe.description}</p>
          </div>

          <div className="text-center py-10 border border-white/5 border-dashed rounded-[2rem]">
            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest italic">Le programme spécifique de cet univers sera dévoilé prochainement...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
