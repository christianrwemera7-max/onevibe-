
"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export function Footer() {
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(settingsRef);

  const eventName = settings?.eventName || 'ONE VIBE';
  const eventLocation = settings?.eventLocation || '26 JUIN 2027 • INEPSS • KINSHASA';

  return (
    <footer className="py-20 border-t border-white/5 bg-black">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="text-[20px] font-black tracking-tighter text-white uppercase mb-8 flex items-center justify-center gap-3">
          {eventName} <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex flex-wrap justify-center gap-8 mb-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          <a href="#" className="hover:text-white transition-colors">CONTACT</a>
          <a href="#" className="hover:text-white transition-colors">PARTENAIRES</a>
          <a href="#" className="hover:text-white transition-colors">PRESSE</a>
          <a href="#" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="h-px w-20 bg-white/10 mx-auto mb-10" />
        <div className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.4em] opacity-40 italic">
          {eventName} FEST • {eventLocation}
        </div>
      </div>
    </footer>
  );
}
