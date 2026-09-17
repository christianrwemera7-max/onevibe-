
import React from 'react';
import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-24 border-t border-white/5 bg-black">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="text-3xl font-black tracking-tighter text-white uppercase mb-10 flex items-center justify-center gap-3">
          ONE<span className="text-primary">VIBE</span> <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div className="flex flex-wrap justify-center gap-10 mb-12 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          <a href="#" className="hover:text-white transition-colors">CONTACT</a>
          <a href="#" className="hover:text-white transition-colors">DEVENIR PARTENAIRE</a>
          <a href="#" className="hover:text-white transition-colors">PRESSE</a>
          <a href="#" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="h-px w-24 bg-white/10 mx-auto mb-12" />
        <div className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.4em] opacity-40 italic">
          ONE VIBE FEST • 26 JUIN 2027 • INEPSS • KINSHASA
        </div>
      </div>
    </footer>
  );
}
