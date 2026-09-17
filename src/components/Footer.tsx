"use client";

import React from 'react';
import { Sparkles, Mail, Phone, MapPin, Globe, Instagram, Twitter, Facebook } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1 .05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
  </svg>
);

export function Footer() {
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(settingsRef);

  const eventName = settings?.eventName || 'ONE VIBE';
  const eventLocation = settings?.eventLocation || '26 JUIN 2027 • INEPSS • KINSHASA';
  
  const instagramUrl = settings?.instagramUrl || '#';
  const twitterUrl = settings?.twitterUrl || '#';
  const facebookUrl = settings?.facebookUrl || '#';
  const tiktokUrl = settings?.tiktokUrl || '#';

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventLocation)}`;

  return (
    <footer className="pt-12 pb-8 border-t border-white/5 bg-black text-white relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-primary/5 blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 items-center">
          
          <div className="space-y-4">
            <div className="text-[20px] font-black tracking-tighter uppercase italic flex items-center gap-2">
              {eventName} <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed italic max-w-xs">
              Le rendez-vous incontournable de la culture, de l'innovation et du style au cœur de Kinshasa.
            </p>
            <div className="flex gap-3">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors hover:border-primary">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors hover:border-primary">
                <Twitter className="w-4 h-4" />
              </a>
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors hover:border-primary">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors hover:border-primary">
                <TikTokIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">CONTACT</h3>
            <div className="space-y-2">
              <a href="mailto:konektrevolution@gmail.com" className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5 text-primary" /> konektrevolution@gmail.com
              </a>
              <a href="https://wa.me/243994472599" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5 text-primary" /> 0994472599
              </a>
            </div>
          </div>

          <div>
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10 hover:border-primary transition-colors">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-tighter italic text-white">
                  {eventLocation.split('•')[1]?.trim() || 'INEPSS • KINSHASA'}
                </div>
                <div className="text-[8px] text-muted-foreground uppercase mt-0.5">Ouvrir dans Google Maps</div>
              </div>
            </a>
          </div>

        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em] italic">
            © {new Date().getFullYear()} {eventName} FEST • TOUS DROITS RÉSERVÉS.
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-black text-white/20 tracking-widest uppercase italic">
            <Globe className="w-3 h-3" /> KINSHASA VIBE
          </div>
        </div>
      </div>
    </footer>
  );
}
