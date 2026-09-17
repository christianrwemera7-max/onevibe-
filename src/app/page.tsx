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
  User as UserIcon,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';

import { useUser, useAuth, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Countdown } from '@/components/Countdown';

export default function LandingPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [authData, setAuthData] = useState({ email: '', password: '', name: '', phone: '' });
  const [isAuthPending, setIsAuthPending] = useState(false);

  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(settingsRef);
  
  const ticketingUrl = settings?.ticketingUrl || 'https://omtevents.com';

  const isValidUrl = (url?: string) => url && (url.startsWith('http://') || url.startsWith('https://'));

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setIsAuthPending(true);
    try {
      if (authMode === 'SIGNUP') {
        const userCredential = await createUserWithEmailAndPassword(auth, authData.email, authData.password);
        
        await addDoc(collection(firestore, 'registrations'), {
          userId: userCredential.user.uid,
          name: authData.name,
          email: authData.email,
          phone: authData.phone,
          type: 'PASS',
          passCategory: 'STANDARD',
          createdAt: new Date().toISOString(),
          ticketCode: `OVF-MEMBER-${Math.floor(1000 + Math.random() * 9000)}`
        });

        toast({ title: "Bienvenue !", description: "Accès festival activé et profil enregistré." });
      } else {
        await signInWithEmailAndPassword(auth, authData.email, authData.password);
        toast({ title: "Content de vous revoir !", description: "Synchronisation établie." });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erreur", description: err.message || "Identifiants incorrects." });
    } finally {
      setIsAuthPending(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(255,0,128,0.1),transparent_50%)]" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full relative z-10">
          <div className="text-center mb-12">
            <div className="text-[25px] font-black tracking-tighter text-white uppercase inline-flex items-center gap-2 italic">
              ONE<span className="text-primary">VIBE</span> <Sparkles className="text-primary w-5 h-5" />
            </div>
            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.4em] mt-3 italic opacity-60">Dimension 2027</p>
          </div>

          <Card className="bg-white/5 border-white/10 text-white p-10 rounded-[3rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-30" />
            <form onSubmit={handleAuth} className="space-y-5 relative z-10">
              <div className="space-y-4">
                {authMode === 'SIGNUP' && (
                  <>
                    <div className="relative">
                      <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <Input 
                        placeholder="Nom complet" 
                        required 
                        className="bg-black/40 border-white/10 pl-12 h-14 text-sm rounded-2xl focus:ring-primary font-medium"
                        value={authData.name}
                        onChange={e => setAuthData({...authData, name: e.target.value})}
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <Input 
                        placeholder="Téléphone" 
                        required 
                        className="bg-black/40 border-white/10 pl-12 h-14 text-sm rounded-2xl focus:ring-primary font-medium"
                        value={authData.phone}
                        onChange={e => setAuthData({...authData, phone: e.target.value})}
                      />
                    </div>
                  </>
                )}
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <Input 
                    type="email" 
                    placeholder="E-mail" 
                    required 
                    className="bg-black/40 border-white/10 pl-12 h-14 text-sm rounded-2xl focus:ring-primary font-medium"
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
                    className="bg-black/40 border-white/10 pl-12 h-14 text-sm rounded-2xl focus:ring-primary font-medium"
                    value={authData.password}
                    onChange={e => setAuthData({...authData, password: e.target.value})}
                  />
                </div>
              </div>
              <Button disabled={isAuthPending} type="submit" className="w-full h-14 bg-primary text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                {isAuthPending ? "SYNCHRO..." : (authMode === 'SIGNUP' ? "S'INSCRIRE" : "DÉVERROUILLER")}
              </Button>
            </form>
            <div className="mt-8 text-center border-t border-white/5 pt-6 relative z-10">
              <button 
                onClick={() => setAuthMode(authMode === 'SIGNUP' ? 'LOGIN' : 'SIGNUP')}
                className="text-[8px] text-muted-foreground hover:text-white uppercase font-black tracking-[0.3em] transition-colors italic"
              >
                {authMode === 'SIGNUP' ? "DÉJÀ MEMBRE ? CONNEXION" : "NOUVEAU ICI ? CRÉER COMPTE"}
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative bg-black h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image 
          src={isValidUrl(settings?.heroImageUrl) ? settings!.heroImageUrl : "https://picsum.photos/seed/vibe1/1920/1080"} 
          alt="Hero" 
          fill 
          className="object-cover opacity-60 brightness-75 scale-105" 
          priority 
          data-ai-hint="stadium concert lights" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 w-full h-full relative z-10 flex items-center justify-center text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl text-[9px] font-black uppercase tracking-[0.4em] text-white italic">
            <Zap className="w-4 h-4 text-primary" /> 26 JUIN 2027 • INEPSS • KINSHASA
          </div>
          
          <h1 className="text-[25px] font-black leading-tight tracking-tighter uppercase italic text-white drop-shadow-2xl">
            UNE ÉNERGIE <br />
            <span className="text-primary">MULTIDIMENSIONNELLE</span>
          </h1>
          
          <div className="pt-4">
            <Countdown />
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12 items-center">
            <Button asChild size="lg" className="h-16 px-12 text-[10px] font-black rounded-full bg-primary text-white uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(255,0,128,0.4)] hover:scale-105 transition-all">
              <a href={ticketingUrl} target="_blank">
                BILLETTERIE <ExternalLink className="ml-3 w-4 h-4" />
              </a>
            </Button>
            <Link href="/explore" className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:text-primary transition-all italic">
              EXPLORER <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
