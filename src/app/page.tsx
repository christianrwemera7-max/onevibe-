
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight,
  Sparkles,
  ExternalLink,
  Zap,
  Mail,
  Lock,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';

import { useUser, useAuth, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [isAuthPending, setIsAuthPending] = useState(false);

  // Fetch settings for ticketing link
  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(settingsRef);
  
  const ticketingUrl = settings?.ticketingUrl || 'https://omtevents.com';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsAuthPending(true);
    try {
      if (authMode === 'SIGNUP') {
        await createUserWithEmailAndPassword(auth, authData.email, authData.password);
        toast({ title: "Bienvenue !", description: "Accès festival activé." });
      } else {
        await signInWithEmailAndPassword(auth, authData.email, authData.password);
        toast({ title: "Content de vous revoir !", description: "Synchronisation établie." });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erreur", description: "Identifiants incorrects." });
    } finally {
      setIsAuthPending(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
          <div className="text-center mb-10">
            <div className="text-[25px] font-black tracking-tighter text-white uppercase inline-flex items-center gap-2">
              ONE<span className="text-primary">VIBE</span> <Sparkles className="text-primary w-5 h-5" />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.3em] mt-2 italic">Entrez dans la dimension VIBE</p>
          </div>

          <Card className="bg-white/5 border-white/10 text-white p-10 rounded-[2.5rem] backdrop-blur-2xl border-t-primary/20 shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-50" />
            <form onSubmit={handleAuth} className="space-y-4 relative z-10">
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <Input 
                    type="email" 
                    placeholder="E-mail" 
                    required 
                    className="bg-black/50 border-white/10 pl-12 h-14 text-sm rounded-2xl focus:ring-primary"
                    value={authData.email}
                    onChange={e => setAuthData({...authData, email: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <Input 
                    type="password" 
                    placeholder="Mot de passe" 
                    required 
                    className="bg-black/50 border-white/10 pl-12 h-14 text-sm rounded-2xl focus:ring-primary"
                    value={authData.password}
                    onChange={e => setAuthData({...authData, password: e.target.value})}
                  />
                </div>
              </div>
              <Button disabled={isAuthPending} type="submit" className="w-full h-14 bg-primary text-white font-black rounded-2xl text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                {isAuthPending ? "CONNEXION..." : (authMode === 'SIGNUP' ? "CRÉER MON ACCÈS" : "DÉVERROUILLER")}
              </Button>
            </form>
            <div className="mt-8 text-center border-t border-white/5 pt-6 relative z-10">
              <button 
                onClick={() => setAuthMode(authMode === 'SIGNUP' ? 'LOGIN' : 'SIGNUP')}
                className="text-[9px] text-muted-foreground hover:text-white uppercase font-black tracking-[0.2em] transition-colors italic"
              >
                {authMode === 'SIGNUP' ? "DÉJÀ MEMBRE ? SE CONNECTER" : "PAS DE COMPTE ? S'INSCRIRE"}
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative">
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Image 
            src={settings?.heroImageUrl || "https://picsum.photos/seed/vibe1/1920/1080"} 
            alt="Hero" 
            fill 
            className="object-cover opacity-40 grayscale brightness-50" 
            priority 
            data-ai-hint="festival lights energy" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 w-full relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/20 border border-primary/40 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.3em] text-primary">
              <Zap className="w-4 h-4" /> 26 JUIN 2027 • INEPSS • KINSHASA
            </div>
            
            <h1 className="text-[25px] font-black leading-tight tracking-tighter uppercase italic">
              L'ÉNERGIE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">SANS LIMITES</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-white text-[11px] uppercase font-black tracking-[0.4em] italic opacity-70">
              Musique • Art • Business • Digital
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center mt-12">
              <Button asChild size="lg" className="h-16 px-12 text-[10px] font-black rounded-full bg-primary text-white uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-105 transition-all">
                <a href={ticketingUrl} target="_blank">
                  PRENDRE MON PASS <ExternalLink className="ml-3 w-4 h-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-16 px-12 text-[10px] font-black rounded-full border-white/20 hover:bg-white/10 text-white uppercase tracking-[0.2em]">
                <Link href="/univers">DÉCOUVRIR LES UNIVERS</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-neutral-950 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "LE FLOW", href: "/programme", desc: "Line-up et horaires.", color: "text-primary" },
              { title: "LES DIMENSIONS", href: "/univers", desc: "4 univers immersifs.", color: "text-accent" },
              { title: "EXPOSANTS", href: "/exposants", desc: "Boostez votre business.", color: "text-secondary" }
            ].map((card, i) => (
              <Link key={i} href={card.href} className="group p-10 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all hover:-translate-y-2">
                <h3 className={cn("text-[22px] font-black uppercase italic mb-3", card.color)}>{card.title}</h3>
                <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.2em] mb-8 leading-relaxed italic">{card.desc}</p>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-all">
                  VOIR PLUS <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
