
"use client";

import React, { useState, useEffect } from 'react';
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
  User as UserIcon,
  Sparkles
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
    icon: <Music className="w-4 h-4 text-pink-400" />,
    description: "Vibrations et connexions sonores majeures.",
    activities: [
      { name: "Concerts & Showcases", desc: "Invités majeurs + talents de demain." },
      { name: "DJ Battle", desc: "Duels rythmés arbitrés par le public." }
    ],
    image: getImg('music-vibe')
  },
  {
    title: "VIBE CREATIVE",
    icon: <Palette className="w-4 h-4 text-purple-400" />,
    description: "Création artistique pure, visuelle et stylistique.",
    activities: [
      { name: "Fashion Show", desc: "Présentations de jeunes créateurs." },
      { name: "Live Painting", desc: "Fresques monumentales en direct." }
    ],
    image: getImg('creative-vibe')
  },
  {
    title: "VIBE BUSINESS",
    icon: <Briefcase className="w-4 h-4 text-blue-400" />,
    description: "Impulsion entrepreneuriale et concrétisation.",
    activities: [
      { name: "Startup & Brand Village", desc: "Marques et initiatives d'avenir." },
      { name: "ONE VIBE Connect", desc: "Rencontres B2B stratégiques." }
    ],
    image: getImg('business-vibe')
  },
  {
    title: "VIBE DIGITAL",
    icon: <Gamepad2 className="w-4 h-4 text-teal-400" />,
    description: "Culture numérique, gaming et nouveaux médias.",
    activities: [
      { name: "Gaming / E-sport", desc: "Tournois intenses avec cashprize." },
      { name: "Digital Experience", desc: "Immersion interactive & démos." }
    ],
    image: getImg('digital-vibe')
  }
];

const defaultProgram = [
  { time: "12:00", title: "Ouverture des Portes", desc: "Immersion et ouverture des villages thématiques." },
  { time: "14:00", title: "VIBE DIGITAL Tournament", desc: "Grande finale e-sport." },
  { time: "16:00", title: "Creative Showcase", desc: "Défilé et performances artistiques." },
  { time: "19:00", title: "Main Stage Concert", desc: "Têtes d'affiches nationales." },
  { time: "22:00", title: "Clôture", desc: "Fin de l'événement." }
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
  const [formType, setFormType] = useState<'PASS' | 'EXPOSITOR'>('PASS');
  const [formData, setFormData] = useState({ name: '', phone: '', passCategory: 'STANDARD' });
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
        toast({ title: "Bienvenue !", description: "Votre compte a été créé." });
      } else {
        await signInWithEmailAndPassword(auth, authData.email, authData.password);
        toast({ title: "Content de vous revoir !", description: "Connexion réussie." });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erreur", description: "Identifiants incorrects ou compte inexistant." });
    } finally {
      setIsAuthPending(false);
    }
  };

  const handleOpenForm = (type: 'PASS' | 'EXPOSITOR', category: string = 'STANDARD') => {
    setFormType(type);
    setFormData(prev => ({ ...prev, passCategory: category }));
    setModalStep('FORM');
    setIsModalOpen(true);
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationsRef || !user) return;

    const uniqueTicketId = `OVF-2027-${Math.floor(100000 + Math.random() * 900000)}`;
    const submissionData = {
      userId: user.uid,
      name: formData.name,
      email: user.email,
      phone: formData.phone,
      type: formType,
      passCategory: formType === 'PASS' ? formData.passCategory : null,
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
          <p className="text-white font-black text-[10px] tracking-widest uppercase">Initialisation de la vibe...</p>
        </div>
      </div>
    );
  }

  // GATEKEEPING: Si pas de user, on affiche l'écran de connexion
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
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-2">Connectez-vous pour entrer dans le festival</p>
          </div>

          <Card className="bg-white/5 border-white/10 text-white p-8 rounded-3xl backdrop-blur-xl">
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

              <Button disabled={isAuthPending} type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs uppercase tracking-widest">
                {isAuthPending ? "TRAITEMENT..." : (authMode === 'SIGNUP' ? "CRÉER MON COMPTE" : "ENTRER DANS LA VIBE")}
              </Button>
            </form>

            <div className="mt-6 text-center">
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

  // APP CONTENU: Affiché seulement si connecté
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
            <a href="#univers" className="hover:text-primary transition-colors text-muted-foreground">UNIVERS</a>
            <a href="#programme" className="hover:text-primary transition-colors text-muted-foreground">PROGRAMME</a>
            {/* L'espace admin n'est visible que pour l'admin spécifique */}
            {user.email === 'christianrwemera4@gmail.com' && (
              <a href="/admin" className="text-secondary hover:text-secondary/80 flex items-center gap-2 border border-secondary/20 px-3 py-1 rounded-full bg-secondary/5">
                <Lock className="w-3 h-3" /> ADMIN
              </a>
            )}
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <div className="flex flex-col items-end">
                <span className="text-[8px] text-muted-foreground">CONNECTÉ EN TANT QUE</span>
                <span className="text-primary text-[9px] lowercase font-mono">{user.email}</span>
              </div>
              <button onClick={() => signOut(auth!)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <Button size="sm" onClick={() => handleOpenForm('PASS', 'STANDARD')} className="font-bold rounded-full bg-primary hover:bg-primary/90 text-white text-[10px] px-6 lg:hidden">
            BILLETTERIE
          </Button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <Image src={heroImage} alt="Festival background" fill className="object-cover opacity-50" priority data-ai-hint="festival crowd" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/60" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 w-full relative z-10 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6 text-[10px] font-semibold uppercase tracking-wider"
          >
            <span className="text-primary">26 JUIN 2027</span>
            <span className="text-white/20">|</span>
            <span className="text-white">INEPSS</span>
          </motion.div>

          <h1 className="text-6xl md:text-9xl font-black leading-[0.85] tracking-tighter mb-6 uppercase italic">
            ONE VIBE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">GENERATION</span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button onClick={() => handleOpenForm('PASS', 'STANDARD')} size="lg" className="h-16 px-10 text-[10px] font-black rounded-full bg-primary text-white uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,0,128,0.3)] hover:scale-105 transition-transform">
              RÉSERVER MON PASS <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* UNIVERS */}
      <section id="univers" className="py-32 bg-black border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {universes.map((uni, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-6">
                  <Image src={uni.image} alt={uni.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-px bg-primary" />
                      <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Explore</span>
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase">{uni.title}</h3>
                  </div>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed px-2">{uni.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/10 bg-black text-center">
        <div className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.3em]">
          ONE VIBE FEST © 2027 • TOUS DROITS RÉSERVÉS
        </div>
      </footer>

      {/* MODAL RESERVATION */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 20 }} 
              className="bg-neutral-900 border border-white/10 rounded-[2rem] p-10 max-w-md w-full relative text-white"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 text-muted-foreground hover:text-white transition-colors"><X className="w-6 h-6" /></button>
              
              {modalStep === 'FORM' && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic">RESERVER</h3>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-2 font-bold">Validez votre participation</p>
                  </div>

                  <form onSubmit={handleSubmitRegistration} className="space-y-4">
                    <div className="space-y-3">
                      <Input 
                        placeholder="Votre nom complet" 
                        required 
                        className="bg-black/50 border-white/10 h-14 text-sm rounded-2xl"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                      <Input 
                        placeholder="Téléphone" 
                        required 
                        type="tel"
                        className="bg-black/50 border-white/10 h-14 text-sm rounded-2xl"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                      <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 text-[10px] text-center">
                        CATÉGORIE : <span className="text-primary font-black uppercase">{formData.passCategory}</span>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full h-14 bg-secondary text-black font-black rounded-2xl text-[10px] uppercase tracking-widest">
                      CONFIRMER MA RÉSERVATION
                    </Button>
                  </form>
                </div>
              )}

              {modalStep === 'TICKET' && (generatedTicket && (
                <div className="text-center space-y-8 py-4">
                  <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto text-secondary animate-pulse">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase italic">VIBE ACTIVÉE</h3>
                    <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold">Billet numérique généré avec succès</p>
                  </div>
                  
                  <div className="bg-white text-black p-8 rounded-[2rem] space-y-6 text-left shadow-2xl overflow-hidden relative">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                    <div className="border-b-2 border-dashed border-neutral-200 pb-6 relative z-10">
                      <div className="text-[10px] font-black text-primary uppercase mb-1">ONE VIBE FEST</div>
                      <div className="text-2xl font-black uppercase tracking-tighter">{formData.name}</div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase mt-1">PASS {formData.passCategory} • 26 JUIN</div>
                    </div>
                    <div className="flex gap-6 items-center relative z-10">
                      <div className="p-2 bg-neutral-100 rounded-xl">
                        <QrCode className="w-16 h-16 text-black" />
                      </div>
                      <div className="text-[9px] space-y-1 font-bold">
                        <div className="font-mono text-primary">{generatedTicket}</div>
                        <div className="uppercase">INEPSS • KINSHASA</div>
                        <div className="text-muted-foreground">12:00 - 22:00</div>
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={() => setIsModalOpen(false)} className="w-full bg-primary text-white font-black uppercase text-[10px] rounded-2xl h-14 tracking-[0.2em]">
                    PRÊT POUR LA VIBE
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
