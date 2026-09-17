
"use client";

import React from 'react';
import { Sparkles, Mail, Phone, MapPin, Globe, Instagram, Twitter, Facebook } from 'lucide-react';
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
    <footer className="pt-24 pb-12 border-t border-white/5 bg-black text-white relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          
          <div className="space-y-6 col-span-1 md:col-span-1">
            <div className="flex flex-col leading-none">
              <div className="text-[24px] font-black tracking-tighter uppercase italic flex items-center gap-2">
                {eventName} <Sparkles className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed italic max-w-xs">
              Le rendez-vous incontournable de la culture, de l'innovation et du style au cœur de Kinshasa. Une expérience multidimensionnelle.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic">CONTACTEZ-NOUS</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary transition-colors">
                  <Mail className="w-4 h-4 text-white/60" />
                </div>
                <div>
                  <div className="text-[8px] uppercase font-black text-muted-foreground">Email</div>
                  <div className="text-[10px] font-bold">contact@onevibefest.com</div>
                </div>
              </div>
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary transition-colors">
                  <Phone className="w-4 h-4 text-white/60" />
                </div>
                <div>
                  <div className="text-[8px] uppercase font-black text-muted-foreground">WhatsApp</div>
                  <div className="text-[10px] font-bold">+243 89 000 0000</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic">NAVIGATION</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors italic">DEVENIR PARTENAIRE</a></li>
              <li><a href="#" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors italic">ESPACE PRESSE</a></li>
              <li><a href="#" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors italic">FAQ / AIDE</a></li>
              <li><a href="#" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors italic">MENTIONS LÉGALES</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic">LOCALISATION</h3>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-white/40 shrink-0 mt-1" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-tighter leading-tight italic">
                  {eventLocation.split('•')[1]?.trim() || 'INEPSS'}
                </div>
                <div className="text-[9px] text-muted-foreground uppercase mt-1">KINSHASA, RDC</div>
              </div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <div className="text-[8px] font-black uppercase text-primary mb-1">PROCHAINE ÉDITION</div>
              <div className="text-[10px] font-bold italic">{eventLocation.split('•')[0]?.trim() || 'JUIN 2027'}</div>
            </div>
          </div>

        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.3em] italic">
            © {new Date().getFullYear()} {eventName} FEST • TOUS DROITS RÉSERVÉS.
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black text-white/20 tracking-widest uppercase italic">
            <Globe className="w-3 h-3" /> DESIGNED FOR KINSHASA VIBE
          </div>
        </div>
      </div>
    </footer>
  );
}
