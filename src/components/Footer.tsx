"use client";

import React, { useState, useEffect } from 'react';
import { Mail, Phone, Instagram, Twitter, Facebook, Sparkles } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const DEFAULT_LOGO_URL = "https://res.cloudinary.com/dvz91qth6/image/upload/v1740261394/one-vibe-logo_t9v6v9.png";

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

  const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'festival') : null, [firestore]);
  const { data: settings } = useDoc(settingsRef);

  const logoUrl = settings?.logoUrl || DEFAULT_LOGO_URL;
  const instagramUrl = settings?.instagramUrl || '#';
  const twitterUrl = settings?.twitterUrl || '#';
  const facebookUrl = settings?.facebookUrl || '#';
  const tiktokUrl = settings?.tiktokUrl || '#';

  if (!mounted) return null;

  return (
    <footer className="bg-secondary pt-16 pb-12 text-black relative overflow-hidden font-display rounded-t-[3rem] mt-0">
      <div className="max-w-7xl mx-auto relative z-10 px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 mb-16">
          
          <div className="space-y-8">
            <div className="relative h-16 w-auto flex items-center">
              <img 
                src={logoUrl} 
                alt="ONE VIBE" 
                className="h-16 w-auto object-contain brightness-110" 
                style={{ filter: 'invert(31%) sepia(97%) saturate(2252%) hue-rotate(314deg) brightness(101%) contrast(105%)' }}
              />
            </div>
            <p className="text-[11px] text-black font-black leading-relaxed italic uppercase tracking-tight max-w-xs">
              L'EXPERIENCE MULTIDIMENSIONNELLE ULTIME. <br />MUSIQUE • CREATIVITÉ • DIGITAL.
            </p>
            <div className="flex items-center gap-4">
              {[
                { url: instagramUrl, icon: <Instagram className="w-5 h-5" /> },
                { url: twitterUrl, icon: <Twitter className="w-5 h-5" /> },
                { url: facebookUrl, icon: <Facebook className="w-5 h-5" /> },
                { url: tiktokUrl, icon: <TikTokIcon className="w-5 h-5" /> }
              ].map((social, i) => (
                <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center text-black hover:bg-black/20 transition-all border border-black/10">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black italic border-l-2 border-black pl-4">PLAN DU SITE</h3>
            <ul className="space-y-4">
              {[
                { label: "Accueil", href: "/" },
                { label: "Les Univers", href: "/univers" },
                { label: "Le Line-up", href: "/guests" },
                { label: "L'Agenda", href: "/programme" },
                { label: "Merch", href: "/merch" }
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-[12px] font-black uppercase text-black/70 hover:text-black transition-colors italic flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-black rounded-full" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black italic border-l-2 border-black pl-4">CONTACT</h3>
            <ul className="space-y-5">
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center shrink-0 border border-black/10">
                  <Mail className="w-5 h-5 text-black" />
                </div>
                <a href="mailto:konektrevolution@gmail.com" className="text-[11px] font-black uppercase hover:text-black transition-colors italic tracking-tight truncate">konektrevolution@gmail.com</a>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center shrink-0 border border-black/10">
                  <Phone className="w-5 h-5 text-black" />
                </div>
                <a href="https://wa.me/243994472599" target="_blank" className="text-[11px] font-black uppercase hover:text-black transition-colors italic tracking-tight">+243 994 472 599</a>
              </li>
            </ul>
          </div>

          <div className="space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black italic border-l-2 border-black pl-4">PRO</h3>
            <div className="flex flex-col gap-4">
              <Button asChild className="h-12 bg-black text-secondary text-[10px] font-black uppercase tracking-[0.1em] rounded-xl hover:scale-105 transition-all shadow-xl italic border-none">
                <Link href="/exposants">RÉSERVER UN STAND</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-black/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-[9px] font-black text-black/40 uppercase tracking-[0.5em] italic order-2 md:order-1">
            © 2027 ONE VIBE FEST • KINSHASA
          </div>
          <div className="flex items-center gap-8 order-1 md:order-2">
            <div className="text-[10px] font-black text-black/60 uppercase tracking-[0.5em] italic flex items-center gap-3">
              VIBE ONLY <Sparkles className="w-3 h-3 text-black animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}