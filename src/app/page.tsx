
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  Palette, 
  Briefcase, 
  Gamepad2, 
  ArrowRight,
  X,
  ChevronRight,
  QrCode,
  ShieldCheck,
  Lock,
  Mail,
  LogOut,
  Sparkles,
  ExternalLink,
  Store,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

import imagesData from './lib/placeholder-images.json';
import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser, useAuth } from '@/firebase';
import { collection, addDoc, doc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, OperationType } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

const imageList = imagesData.placeholderImages;
const getImg = (id: string) => imageList.find(img => img.id === id)?.imageUrl || 'https://picsum.photos/seed/vibe/600/400';

const universes = [
  {
    title: "VIBE MUSIC",
    icon: <Music className="w-5 h-5 text-pink-500" />,
    description: "Vibrations et connexions sonores majeures avec les têtes d'affiches du moment.",
    activities: [
      { name: "Concerts & Showcases", desc: "Invités majeurs + talents de demain." },
      { name: "DJ Battle", desc: "Duels rythmés arbitrés par le public." }
    ],
    image: getImg('music-vibe')
  },
  {
    title: "VIBE CREATIVE",
    icon: <Palette className="w-5 h-5 text-purple-500" />,
    description: "Le carrefour de la création artistique pure, visuelle et stylistique.",
    activities: [
      { name: "Fashion Show", desc: "Présentations de jeunes créateurs." },
      { name: "Live Painting", desc: "Fresques monumentales en direct." }
    ],
    image: getImg('creative-vibe')
  },
  {
    title: "VIBE BUSINESS",
    icon: <Briefcase className="w-5 h-5 text-blue-500" />,
    description: "Impulsion entrepreneuriale et concrétisation des projets innovants.",
    activities: [
      { name: "Startup & Brand Village", desc: "Marques et initiatives d'avenir." },
      { name: "ONE VIBE Connect", desc: "Rencontres B2B stratégiques." }
    ],
    image: getImg('business-vibe')
  },
  {
    title: "VIBE DIGITAL",
    icon: <Gamepad2 className="w-5 h-5 text-teal-500" />,
    description: "Culture numérique, gaming, e-sport et nouveaux médias interactifs.",
    activities: [
      { name: "Gaming / E-sport", desc: "Tournois intenses avec cashprize." },
      { name: "Digital Experience", desc: "Immersion interactive & démos." }
    ],
    image: getImg('digital-vibe')
  }
];

const defaultProgram = [
  { time: "12:00", title: "Ouverture des Portes", desc: "Immersion et ouverture des villages thématiques." },
  { time: "14:00", title: "VIBE DIGITAL Tournament", desc: "Grande finale e-sport sur scène centrale." },
  { time: "16:00", title: "Creative Showcase", desc: "Défilé et performances artistiques en live." },
  { time: "19:00", title: "Main Stage Concert", desc: "Têtes d'affiches nationales et internationales." },
  { time: "22:00", title: "Clôture", desc: "Fin de l'événement et after-party." }
];

export default function VibeFestLanding() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [isAuthPending, setIsAuthPending] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'FORM' | 'TICKET'>('FORM');
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [generatedTicket, setGeneratedTicket] = useState<string | null>(null);

  const settingsDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: festivalSettings } = useDoc(settingsDocRef);

  const programCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'program');
  }, [firestore]);
  const { data: dynamicProgram } = useCollection(programCollectionRef);

  const registrationsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'registrations');
  }, [firestore]);

  const heroImage = festivalSettings?.heroImageUrl || getImg('hero-bg');
  const activeProgram = dynamicProgram && dynamicProgram.length > 0 ? [...dynamicProgram].sort((a,b) => a.time.localeCompare(b.time)) : defaultProgram;

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

  const handleOpenExpositorForm = () => {
    setModalStep('FORM');
    setIsModalOpen(true);
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationsRef || !user) return;

    const uniqueTicketId = `OVF-STAND-${Math.floor(100000 + Math.random() * 900000)}`;
    const submissionData = {
      userId: user.uid,
      name: formData.name,
      email: user.email,
      phone: formData.phone,
      type: 'EXPOSITOR',
      ticketCode: uniqueTicketId,
      createdAt: new Date().toISOString()
    };

    addDoc(registrationsRef, submissionData).catch((error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: registrationsRef.path,
        operation: OperationType.CREATE,
        requestResourceData: submissionData,
      }, error));
    });

    setGeneratedTicket(uniqueTicketId);
    setModalStep('TICKET');
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-white font-black text-[10px] tracking-widest uppercase italic">Nucleus synchronisation...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-10">
            <div className="text-3xl font-black tracking-tighter text-white uppercase inline-flex items-center gap-2">
              ONE<span className="text-primary">VIBE</span> <Sparkles className="text-primary w-5 h-5" />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-2">Identifiez-vous pour accéder au festival</p>
          </div>

          <Card className="bg-white/5 border-white/10 text-white p-8 rounded-3xl backdrop-blur-xl border-t-primary/20">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="email" 
                    placeholder="Email" 
                    required 
                    className="bg-black/50 border-white/10 pl-10 h-12 text-sm rounded-xl focus:ring-primary"
                    value={authData.email}
                    onChange={e => setAuthData({...authData, email: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="Mot de passe" 
                    required 
                    className="bg-black/50 border-white/10 pl-10 h-12 text-sm rounded-xl focus:ring-primary"
                    value={authData.password}
                    onChange={e => setAuthData({...authData, password: e.target.value})}
                  />
                </div>
              </div>

              <Button disabled={isAuthPending} type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
                {isAuthPending ? "TRAITEMENT..." : (authMode === 'SIGNUP' ? "CRÉER MON COMPTE" : "ACCÉDER À LA VIBE")}
              </Button>
            </form>

            <div className="mt-6 text-center border-t border-white/5 pt-6">
              <button 
                onClick={() => setAuthMode(authMode === 'SIGNUP' ? 'LOGIN' : 'SIGNUP')}
                className="text-[10px] text-muted-foreground hover:text-white uppercase font-bold tracking-widest transition-colors"
              >
                {authMode === 'SIGNUP' ? "DÉJÀ INSCRIT ? CONNECTEZ-VOUS" : "NOUVEAU ? CRÉEZ UN COMPTE"}
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground font-sans antialiased min-h-screen selection:bg-primary selection:text-white">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <a href="#" className="flex flex-col leading-none">
            <div className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase">
              ONE<span className="text-primary">VIBE</span>
            </div>
            <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">FEST | 2027</div>
          </a>
          
          <div className="hidden lg:flex items-center gap-8 font-bold text-[10px] uppercase tracking-widest">
            <a href="#univers" className="hover:text-primary transition-colors text-muted-foreground">ACTIVITÉS</a>
            <a href="#programme" className="hover:text-primary transition-colors text-muted-foreground">PROGRAMME</a>
            <a href="#exposants" className="hover:text-primary transition-colors text-muted-foreground">EXPOSANTS</a>
            
            {user.email === 'christianrwemera4@gmail.com' && (
              <a href="/admin" className="text-secondary hover:text-secondary/80 flex items-center gap-2 border border-secondary/20 px-3 py-1 rounded-full bg-secondary/5 transition-all">
                <Lock className="w-3 h-3" /> ADMIN
              </a>
            )}

            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <div className="flex flex-col items-end">
                <span className="text-[8px] text-muted-foreground uppercase">ADMIN CONNECTÉ</span>
                <span className="text-primary text-[9px] lowercase font-mono">{user.email}</span>
              </div>
              <button onClick={() => signOut(auth!)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <Button 
            size="sm" 
            asChild
            className="font-bold rounded-full bg-primary hover:bg-primary/90 text-white text-[10px] px-6 lg:hidden"
          >
            <a href="https://omtevents.com" target="_blank" rel="noopener noreferrer">BILLETS</a>
          </Button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <Image src={heroImage} alt="Festival background" fill className="object-cover opacity-60" priority data-ai-hint="festival atmosphere" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/70" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 w-full relative z-10 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md mb-8 text-[11px] font-bold uppercase tracking-wider text-primary shadow-xl"
          >
            <Zap className="w-3.5 h-3.5" /> 26 JUIN 2027 • INEPSS • KINSHASA
          </motion.div>

          <h1 className="text-6xl md:text-[10rem] font-black leading-[0.8] tracking-tighter mb-8 uppercase italic">
            ONE VIBE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary animate-pulse">GENERATION</span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
            <Button 
              asChild
              size="lg" 
              className="h-20 px-12 text-[11px] font-black rounded-full bg-primary text-white uppercase tracking-[0.25em] shadow-[0_0_40px_rgba(255,0,128,0.4)] hover:scale-105 transition-all"
            >
              <a href="https://omtevents.com" target="_blank" rel="noopener noreferrer">
                ACHETER MON BILLET <ExternalLink className="ml-2 w-5 h-5" />
              </a>
            </Button>
            <Button 
              onClick={handleOpenExpositorForm}
              variant="outline"
              size="lg" 
              className="h-20 px-12 text-[11px] font-black rounded-full border-white/20 hover:bg-white/5 text-white uppercase tracking-[0.25em] transition-all"
            >
              RÉSERVER UN STAND
            </Button>
          </div>
        </div>
      </section>

      {/* UNIVERS / ACTIVITÉS */}
      <section id="univers" className="py-32 bg-black border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6">EXPLOREZ LES UNIVERS</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.5em] font-bold">Découvrez le cœur du festival</p>
            <div className="w-24 h-1.5 bg-primary mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {universes.map((uni, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden mb-8 shadow-2xl border border-white/5">
                  <Image src={uni.image} alt={uni.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                  <div className="absolute top-8 left-8 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 text-white">
                    {uni.icon}
                  </div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">{uni.title}</h3>
                    <div className="w-10 h-1 bg-primary rounded-full" />
                  </div>
                </div>
                <div className="px-2 space-y-4">
                  <p className="text-muted-foreground text-xs leading-relaxed italic">{uni.description}</p>
                  <ul className="space-y-2">
                    {uni.activities.map((act, aIdx) => (
                      <li key={aIdx} className="flex items-start gap-2">
                        <ArrowRight className="w-3 h-3 text-primary mt-1 shrink-0" />
                        <span className="text-[10px] font-bold uppercase text-white/80">{act.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPOSANTS SECTION */}
      <section id="exposants" className="py-32 bg-neutral-900 border-b border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="inline-block p-3 bg-secondary/10 rounded-2xl border border-secondary/20 mb-4">
                <Store className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">
                EXPOSEZ <br />
                <span className="text-secondary">VOTRE VIBE</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed italic">
                Vous êtes une marque, un créateur ou une startup ? Profitez d'une visibilité exceptionnelle auprès de milliers de festivaliers passionnés.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                  <div className="text-3xl font-black text-white mb-1">5000+</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Visiteurs attendus</div>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                  <div className="text-3xl font-black text-white mb-1">50+</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Stands disponibles</div>
                </div>
              </div>
              <Button 
                onClick={handleOpenExpositorForm}
                size="lg" 
                className="h-16 px-10 text-[11px] font-black rounded-full bg-secondary text-black uppercase tracking-[0.2em] hover:scale-105 transition-all"
              >
                RÉSERVER MON STAND MAINTENANT
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative aspect-square lg:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <Image src={getImg('market-fashion')} alt="Exhibitor stand" fill className="object-cover" data-ai-hint="fashion pop-up" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 p-8 bg-black/40 backdrop-blur-xl rounded-[2rem] border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="text-xl font-black text-white uppercase italic">Impact Maximum</div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed italic">Nos espaces sont conçus pour favoriser les interactions et maximiser votre conversion commerciale.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PROGRAMME */}
      <section id="programme" className="py-32 bg-neutral-950">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black tracking-tighter uppercase italic text-center">LE FLOW DU JOUR</h2>
            <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-[0.3em] mt-3">Programmation Officielle • 26.06.27</p>
          </div>
          
          <div className="space-y-6">
            {activeProgram.map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group p-8 bg-white/5 border border-white/5 rounded-[2rem] hover:border-primary/40 hover:bg-white/[0.08] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-10 w-full md:w-auto">
                  <div className="text-4xl font-black text-primary italic font-mono min-w-[120px]">{item.time}</div>
                  <div className="h-10 w-px bg-white/10 hidden md:block" />
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-2 italic max-w-md">{item.desc}</p>
                  </div>
                </div>
                <div className="self-end md:self-center">
                  <ChevronRight className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors translate-x-0 group-hover:translate-x-2 duration-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
            {user.email === 'christianrwemera4@gmail.com' && (
              <a href="/admin" className="text-primary hover:scale-105 transition-transform">ESPACE ADMIN</a>
            )}
          </div>
          <div className="h-px w-24 bg-white/10 mx-auto mb-12" />
          <div className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.4em] opacity-40">
            ONE VIBE FEST • 2027 • KINSHASA • TOUS DROITS RÉSERVÉS
          </div>
        </div>
      </footer>

      {/* MODAL EXPOSANTS */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="bg-neutral-900 border border-white/10 rounded-[2.5rem] p-12 max-w-lg w-full relative text-white shadow-[0_0_100px_rgba(0,0,0,0.5)]"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-2 text-muted-foreground hover:text-white transition-colors rounded-full hover:bg-white/5"><X className="w-8 h-8" /></button>
              
              {modalStep === 'FORM' && (
                <div className="space-y-10">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-secondary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-secondary/20">
                      <Store className="w-8 h-8 text-secondary" />
                    </div>
                    <h3 className="text-4xl font-black uppercase tracking-tighter italic">RÉSERVATION STAND</h3>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-widest mt-3 font-bold">Rejoignez l'aventure ONE VIBE FEST 2027</p>
                  </div>

                  <form onSubmit={handleSubmitRegistration} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-2 block ml-1">NOM DE LA MARQUE / PROJET</label>
                        <Input 
                          placeholder="Votre marque" 
                          required 
                          className="bg-black/50 border-white/10 h-16 text-sm rounded-2xl focus:ring-secondary focus:border-secondary"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-2 block ml-1">TÉLÉPHONE DE CONTACT</label>
                        <Input 
                          placeholder="+243 ..." 
                          required 
                          type="tel"
                          className="bg-black/50 border-white/10 h-16 text-sm rounded-2xl focus:ring-secondary focus:border-secondary"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                      <div className="p-5 bg-secondary/5 rounded-2xl border border-secondary/20 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">TYPE D'ESPACE</span>
                        <span className="text-secondary text-[11px] font-black uppercase italic tracking-widest">EXPOSANT VIBE</span>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full h-16 bg-secondary text-black font-black rounded-2xl text-[11px] uppercase tracking-widest shadow-xl shadow-secondary/10 hover:scale-[1.02] active:scale-95 transition-all">
                      SOUMETTRE MON DOSSIER
                    </Button>
                  </form>
                </div>
              )}

              {modalStep === 'TICKET' && (generatedTicket && (
                <div className="text-center space-y-10 py-6">
                  <div className="w-24 h-24 bg-secondary/10 rounded-[2rem] flex items-center justify-center mx-auto text-secondary animate-pulse border border-secondary/20 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                    <ShieldCheck className="w-12 h-12" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black uppercase italic">DOSSIER REÇU</h3>
                    <p className="text-[11px] text-muted-foreground mt-3 uppercase font-bold tracking-widest leading-relaxed">Merci pour votre intérêt ! Notre équipe étudiera votre demande avec le plus grand soin.</p>
                  </div>
                  
                  <div className="bg-white text-black p-10 rounded-[3rem] space-y-8 text-left shadow-2xl relative overflow-hidden group">
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-secondary/10 rounded-full blur-[80px] group-hover:scale-110 transition-transform" />
                    <div className="border-b-2 border-dashed border-neutral-200 pb-8 relative z-10">
                      <div className="text-[11px] font-black text-secondary uppercase mb-2 tracking-widest">ONE VIBE FEST STAND</div>
                      <div className="text-3xl font-black uppercase tracking-tighter">{formData.name}</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">VIBE MARKET • 2027 • KINSHASA</div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-8 items-center relative z-10">
                      <div className="p-4 bg-neutral-50 rounded-[2rem] border border-neutral-100">
                        <QrCode className="w-20 h-20 text-black" />
                      </div>
                      <div className="text-[10px] space-y-2 font-bold w-full">
                        <div className="font-mono text-secondary text-base bg-secondary/5 p-2 rounded-xl text-center border border-secondary/10">{generatedTicket}</div>
                        <div className="uppercase tracking-widest text-center pt-2">STATUS : EN ATTENTE</div>
                        <div className="text-muted-foreground text-[9px] uppercase tracking-widest text-center">RÉPONSE PRÉVUE SOUS 48H</div>
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={() => setIsModalOpen(false)} className="w-full bg-primary text-white font-black uppercase text-[11px] rounded-2xl h-16 tracking-[0.25em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                    RETOUR AU FESTIVAL
                  </Button>
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
