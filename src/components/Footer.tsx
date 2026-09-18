
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

  if (!mounted) return null;

  return (
    <footer className="py-4 border-t border-white/5 bg-black text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Contact Mini */}
          <div className="flex items-center gap-4">
            <div className="text-[12px] font-black tracking-tighter uppercase italic flex items-center gap-1.5">
              {eventName} <Sparkles className="w-3 h-3 text-primary" />
            </div>
            <div className="hidden sm:flex items-center gap-3 border-l border-white/10 pl-4">
              <a href="mailto:konektrevolution@gmail.com" className="text-muted-foreground hover:text-white transition-colors">
                <Mail className="w-3 h-3" />
              </a>
              <a href="https://wa.me/243994472599" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors">
                <Phone className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Réseaux Alignés */}
          <div className="flex items-center gap-3">
            {[
              { url: instagramUrl, icon: <Instagram className="w-3.5 h-3.5" /> },
              { url: twitterUrl, icon: <Twitter className="w-3.5 h-3.5" /> },
              { url: facebookUrl, icon: <Facebook className="w-3.5 h-3.5" /> },
              { url: tiktokUrl, icon: <TikTokIcon className="w-3.5 h-3.5" /> }
            ].map((social, i) => (
              <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                {social.icon}
              </a>
            ))}
          </div>

          {/* Lieu Discret */}
          <div className="text-[8px] font-black uppercase tracking-tighter italic text-white/40 hidden md:block">
            {eventLocation.split('•')[1]?.trim() || 'KINSHASA'}
          </div>
        </div>
      </div>
    </footer>
  );
}
