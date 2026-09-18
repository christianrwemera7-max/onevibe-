
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight,
  Sparkles,
  ExternalLink,
  Zap,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Star,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';

import { useUser, useAuth, useDoc, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(settingsRef);

  const talentsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'talents');
  }, [firestore]);
  const { data: talents } = useCollection(talentsRef);
  
  const ticketingUrl = settings?.ticketingUrl || 'https://omtevents.com';
  const eventName = settings?.eventName || 'ONE VIBE';
  const eventTagline = settings?.eventTagline || 'UNE ÉNERGIE MULTIDIMENSIONNELLE';
  const eventLocation = settings?.eventLocation || '26 JUIN 2027 • INEPSS • KINSHASA';

  const isValidUrl = (url?: string) => url && (url.startsWith('http://') || url.startsWith('https://'));

  // Carousel logic
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = useMemo(() => {
    const list: string[] = [];
    if (isValidUrl(settings?.heroImageUrl)) list.push(settings.heroImageUrl);
    if (isValidUrl(settings?.heroImageUrl2)) list.push(settings.heroImageUrl2);
    if (isValidUrl(settings?.heroImageUrl3)) list.push(settings.heroImageUrl3);
    if (settings?.isCarouselEnabled && talents && talents.length > 0) {
      talents.forEach(t => {
        if (isValidUrl(t.imageUrl)) list.push(t.imageUrl);
      });
    }
    if (list.length === 0) list.push("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1920");
    return list;
  }, [settings, talents]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [images]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setIsAuthPending(true);
    try {
      if (authMode === 'SIGNUP') {
        const userCredential = await createUserWithEmailAndPassword(auth, authData.email, authData.password);
        const regData = {
          userId: userCredential.user.uid,
          name: authData.name,
          email: authData.email,
          phone: authData.phone,
          type: 'PASS',
          createdAt: new Date().toISOString(),
          ticketCode: `MEMBER-${Math.floor(1000 + Math.random() * 9000)}`
        };
        addDoc(collection(firestore, 'registrations'), regData);
        toast({ title: "Bienvenue !", description: "Compte créé." });
      } else {
        await signInWithEmailAndPassword(auth, authData.email, authData.password);
        toast({ title: "Content de vous revoir !" });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    } finally {
      setIsAuthPending(false);
    }
  };

  if (isUserLoading || !mounted) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(255,0,128,0.1),transparent_50%)]" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full relative z-10">
          <div className="text-center mb-8">
            <div className="text-[22px] font-black tracking-tighter text-white uppercase inline-flex items-center gap-2 italic">
              {eventName} <Sparkles className="text-primary w-5 h-5" />
            </div>
            <p className="text-[8px] text-muted-foreground uppercase font-black tracking-[0.4em] mt-2 italic opacity-60">Accès Privé</p>
          </div>
          <Card className="bg-white/5 border-white/10 text-white p-8 rounded-[2rem] backdrop-blur-3xl shadow-2xl relative">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-3">
                {authMode === 'SIGNUP' && (
                  <>
                    <div className="relative"><UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" /><Input placeholder="Nom complet" required className="bg-black/40 border-white/10 pl-11 h-12 text-sm rounded-xl" value={authData.name} onChange={e => setAuthData({...authData, name: e.target.value})} /></div>
                    <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" /><Input placeholder="Téléphone" required className="bg-black/40 border-white/10 pl-11 h-12 text-sm rounded-xl" value={authData.phone} onChange={e => setAuthData({...authData, phone: e.target.value})} /></div>
                  </>
                )}
                <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" /><Input type="email" placeholder="E-mail" required className="bg-black/40 border-white/10 pl-11 h-12 text-sm rounded-xl" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} /></div>
                <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" /><Input type="password" placeholder="Mot de passe" required className="bg-black/40 border-white/10 pl-11 h-12 text-sm rounded-xl" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} /></div>
              </div>
              <Button disabled={isAuthPending} type="submit" className="w-full h-12 bg-primary text-white font-black rounded-xl text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20">{isAuthPending ? "CONNEXION..." : (authMode === 'SIGNUP' ? "CRÉER UN COMPTE" : "ENTRER")}</Button>
            </form>
            <div className="mt-6 text-center border-t border-white/5 pt-4"><button onClick={() => setAuthMode(authMode === 'SIGNUP' ? 'LOGIN' : 'SIGNUP')} className="text-[8px] text-muted-foreground hover:text-white uppercase font-black tracking-[0.3em] italic">{authMode === 'SIGNUP' ? "DÉJÀ MEMBRE ?" : "S'ENREGISTRER POUR ACCÉDER"}</button></div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative bg-black min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div key={images[currentIndex]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="absolute inset-0 w-full h-full">
              {isValidUrl(images[currentIndex]) ? (
                <Image src={images[currentIndex]} alt="Hero" fill className="object-cover opacity-60 grayscale-[40%] brightness-75" priority />
              ) : (
                <div className="w-full h-full bg-neutral-900" />
              )}
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        
        <div className="max-w-5xl mx-auto px-6 w-full relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-12">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-white italic">
              <Zap className="w-3.5 h-3.5 text-primary" /> {eventLocation}
            </div>
            <h1 className="text-[24px] md:text-[40px] font-black leading-tight tracking-tighter uppercase italic text-white drop-shadow-2xl">
              {eventName} <br />
              <span className="text-primary">{eventTagline}</span>
            </h1>
            <div className="pt-2"><Countdown targetDate={settings?.eventDate} /></div>
            <div className="flex flex-col sm:flex-row gap-5 justify-center mt-10 items-center">
              <Button asChild size="lg" className="h-14 px-10 text-[9px] font-black rounded-full bg-primary text-white uppercase tracking-[0.2em] shadow-xl shadow-primary/30"><a href={ticketingUrl} target="_blank">BILLETTERIE <ExternalLink className="ml-2 w-3.5 h-3.5" /></a></Button>
              <Link href="/explore" className="group flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-white hover:text-primary italic transition-all">EXPLORER <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" /></Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Guest Preview Section */}
      {talents && talents.length > 0 && (
        <section className="py-16 md:py-24 bg-black relative border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-[0.4em]">
                  <Star className="w-3.5 h-3.5" /> L'ÉLITE DU FESTIVAL
                </div>
                <h2 className="text-[22px] md:text-[32px] font-black uppercase italic text-white leading-none">LES <span className="text-primary">GUESTS</span> CONFIRMÉS</h2>
              </div>
              <Link href="/guests" className="text-[9px] font-black uppercase text-muted-foreground hover:text-white flex items-center gap-2 transition-colors italic tracking-widest pb-1 border-b border-primary/40">VOIR TOUT LE CASTING <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {talents.slice(0, 10).map((talent, idx) => (
                <motion.div 
                  key={talent.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative"
                >
                  <div className="relative aspect-[3/4] rounded-2xl md:rounded-[2rem] overflow-hidden mb-3 border border-white/5 bg-neutral-900 shadow-xl">
                    {talent.imageUrl ? (
                      <Image src={talent.imageUrl} alt={talent.name} fill className="object-cover transition-all duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center"><User className="w-8 h-8 text-white/10" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-3 left-3 right-3 md:bottom-5 md:left-5 md:right-5">
                      <div className="text-[10px] md:text-[11px] font-black text-white uppercase italic truncate">{talent.name}</div>
                      <div className="text-[7px] md:text-[8px] text-primary font-bold uppercase tracking-widest">{talent.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
