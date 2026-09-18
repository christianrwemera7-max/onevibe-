
"use client";

import React, { useState, useEffect } from 'react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  return (
    <footer className="pt-8 pb-6 border-t border-white/5 bg-black text-white relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[200px] bg-primary/5 blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
          
          {/* Identité Compacte */}
          <div className="space-y-2">
            <div className="text-[16px] font-black tracking-tighter uppercase italic flex items-center gap-2">
              {eventName} <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-[9px] text-muted-foreground leading-relaxed italic max-w-[200px] opacity-60">
              Culture, Innovation & Style.
            </p>
          </div>

          {/* Contact & Réseaux en ligne sur Mobile */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex flex-col gap-1.5">
              <a href="mailto:konektrevolution@gmail.com" className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-white transition-colors">
                <Mail className="w-3 h-3 text-primary/60" /> <span className="hidden sm:inline">konektrevolution@gmail.com</span>
              </a>
              <a href="https://wa.me/243994472599" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-white transition-colors">
                <Phone className="w-3 h-3 text-primary/60" /> 0994472599
              </a>
            </div>

            <div className="flex gap-2">
              {[
                { url: instagramUrl, icon: <Instagram className="w-3.5 h-3.5" /> },
                { url: twitterUrl, icon: <Twitter className="w-3.5 h-3.5" /> },
                { url: facebookUrl, icon: <Facebook className="w-3.5 h-3.5" /> },
                { url: tiktokUrl, icon: <TikTokIcon className="w-3.5 h-3.5" /> }
              ].map((social, i) => (
                <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors bg-white/[0.02]">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Localisation Mini */}
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white/[0.03] px-3 py-2 rounded-lg border border-white/5 hover:border-primary/30 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0" />
            <div className="text-[9px] font-black uppercase tracking-tighter italic text-white/80">
              {eventLocation.split('•')[1]?.trim() || 'KINSHASA'}
            </div>
          </a>
        </div>

        {/* Copyright Minimaliste */}
        <div className="pt-6 border-t border-white/5 flex flex-row justify-between items-center opacity-40">
          <div className="text-[8px] text-muted-foreground uppercase font-black tracking-widest italic">
            © 2027 {eventName}
          </div>
          <div className="flex items-center gap-1.5 text-[8px] font-black text-white tracking-widest uppercase italic">
            <Globe className="w-2.5 h-2.5" /> KIN VIBE
          </div>
        </div>
      </div>
    </footer>
  );
}
