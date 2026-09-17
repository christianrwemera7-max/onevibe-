
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

import { useUser, useAuth } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [isAuthPending, setIsAuthPending] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsAuthPending(true);
    try {
      if (authMode === 'SIGNUP') {
        await createUserWithEmailAndPassword(auth, authData.email, authData.password);
        toast({ title: "Bienvenue !", description: "Votre compte a été créé avec succès." });
      } else {
        await signInWithEmailAndPassword(auth, authData.email, authData.password);
        toast({ title: "Content de vous revoir !", description: "Connexion établie." });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erreur", description: "Identifiants invalides ou problème réseau." });
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
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-2">Connectez-vous pour entrer dans le festival</p>
          </div>

          <Card className="bg-white/5 border-white/10 text-white p-8 rounded-[2rem] backdrop-blur-xl border-t-primary/20 shadow-2xl">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="email" 
                    placeholder="Email" 
                    required 
                    className="bg-black/50 border-white/10 pl-12 h-14 text-sm rounded-2xl focus:ring-primary"
                    value={authData.email}
                    onChange={e => setAuthData({...authData, email: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
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
              <Button disabled={isAuthPending} type="submit" className="w-full h-14 bg-primary text-white font-black rounded-2xl text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                {isAuthPending ? "SYNCHRONISATION..." : (authMode === 'SIGNUP' ? "CRÉER MON ACCÈS" : "DÉVERROUILLER LA VIBE")}
              </Button>
            </form>
            <div className="mt-6 text-center border-t border-white/5 pt-6">
              <button 
                onClick={() => setAuthMode(authMode === 'SIGNUP' ? 'LOGIN' : 'SIGNUP')}
                className="text-[10px] text-muted-foreground hover:text-white uppercase font-black tracking-widest transition-colors"
              >
                {authMode === 'SIGNUP' ? "DÉJÀ MEMBRE ? CONNEXION" : "PAS ENCORE DE COMPTE ? S'INSCRIRE"}
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative">
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Image src="https://picsum.photos/seed/vibe1/1920/1080" alt="Hero" fill className="object-cover opacity-40 grayscale" priority data-ai-hint="festival atmosphere" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 w-full relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/40 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.3em] text-primary">
              <Zap className="w-4 h-4" /> 26 JUIN 2027 • INEPSS • KINSHASA
            </div>
            
            <h1 className="text-[25px] md:text-[25px] font-black leading-tight tracking-tighter uppercase italic">
              L'ÉNERGIE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">SANS LIMITES</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-white text-[12px] uppercase font-bold tracking-[0.4em] italic opacity-80">
              Musique • Art • Business • Digital
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Button asChild size="lg" className="h-14 px-10 text-[10px] font-black rounded-full bg-primary text-white uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-105 transition-all">
                <a href="https://omtevents.com" target="_blank">
                  ACHETER MON BILLET <ExternalLink className="ml-3 w-4 h-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-10 text-[10px] font-black rounded-full border-white/20 hover:bg-white/5 text-white uppercase tracking-[0.2em]">
                <Link href="/univers">EXPLORER LE FESTIVAL</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-neutral-950/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "LE PROGRAMME", href: "/programme", desc: "Showcases, concerts et tournois.", color: "text-primary" },
              { title: "LES UNIVERS", href: "/univers", desc: "4 mondes à découvrir.", color: "text-accent" },
              { title: "EXPOSANTS", href: "/exposants", desc: "Réservez votre stand.", color: "text-secondary" }
            ].map((card, i) => (
              <Link key={i} href={card.href} className="group p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:border-white/20 transition-all hover:-translate-y-2">
                <h3 className={cn("text-[20px] font-black uppercase italic mb-3", card.color)}>{card.title}</h3>
                <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-6">{card.desc}</p>
                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
