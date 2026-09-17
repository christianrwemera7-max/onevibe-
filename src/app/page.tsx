
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
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  const { user } = useUser();
  const { toast } = useToast();
  
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<'PASS' | 'EXPOSITOR'>('PASS');
  const [modalStep, setModalStep] = useState<'AUTH' | 'FORM' | 'TICKET'>('AUTH');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('SIGNUP');
  
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    passCategory: 'STANDARD',
    company: '',
    message: ''
  });
  const [generatedTicket, setGeneratedTicket] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, email: user.email || '', name: user.displayName || prev.name }));
    }
  }, [user]);

  const handleOpenForm = (type: 'PASS' | 'EXPOSITOR', category?: string) => {
    setFormType(type);
    if (category) {
      setFormData(prev => ({ ...prev, passCategory: category }));
    }
    setModalStep(user ? 'FORM' : 'AUTH');
    setIsModalOpen(true);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    try {
      if (authMode === 'SIGNUP') {
        await createUserWithEmailAndPassword(auth, authData.email, authData.password);
        toast({ title: "Bienvenue !", description: "Votre compte a été créé avec succès." });
      } else {
        await signInWithEmailAndPassword(auth, authData.email, authData.password);
        toast({ title: "Bon retour !", description: "Connexion réussie." });
      }
      setModalStep('FORM');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez vérifier vos identifiants." });
    }
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationsRef || !user) return;

    const uniqueTicketId = `OVF-2027-${Math.floor(100000 + Math.random() * 900000)}`;
    const submissionData = {
      userId: user.uid,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      type: formType,
      passCategory: formType === 'PASS' ? formData.passCategory : null,
      company: formType === 'EXPOSITOR' ? formData.company : null,
      message: formData.message,
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
    toast({
      title: "C'est fait !",
      description: "Votre réservation est confirmée.",
    });
  };

  return (
    <div className="bg-background text-foreground font-sans antialiased min-h-screen selection:bg-primary selection:text-white">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <a href="#" className="flex flex-col leading-none group">
            <div className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase">
              ONE<span className="text-primary">VIBE</span>
            </div>
            <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1">
              <span>FEST</span>
              <span className="text-primary font-light">|</span>
              <span className="text-white">2027</span>
            </div>
          </a>
          
          <div className="hidden lg:flex items-center gap-6 font-bold text-xs uppercase tracking-widest">
            <a href="#univers" className="hover:text-primary transition-colors text-muted-foreground text-[10px]">UNIVERS</a>
            <a href="#programme" className="hover:text-primary transition-colors text-muted-foreground text-[10px]">PROGRAMME</a>
            <a href="#pass" className="hover:text-primary transition-colors text-muted-foreground text-[10px]">PASS</a>
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-[9px] text-primary">{user.email}</span>
                <button onClick={() => signOut(auth!)} className="text-[9px] text-muted-foreground hover:text-white">QUITTER</button>
              </div>
            )}
            {!user && <a href="/admin" className="text-secondary text-[10px]">ADMIN</a>}
          </div>

          <Button size="sm" onClick={() => handleOpenForm('PASS', 'STANDARD')} className="font-bold rounded-full bg-primary hover:bg-primary/90 text-white text-[10px] px-6">
            PRENDRE MON PASS
          </Button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <Image src={heroImage} alt="Festival background" fill className="object-cover opacity-50" priority data-ai-hint="festival crowd" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-black/60" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 w-full relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6 text-[10px] font-semibold uppercase tracking-wider">
            <span className="text-primary">26 JUIN 2027</span>
            <span className="text-white/20">|</span>
            <span className="text-secondary">INEPSS</span>
            <span className="text-white/20">|</span>
            <span className="text-white">12:00 - 22:00</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tight mb-4 uppercase">
            ONE VIBE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">FEST | 2027</span>
          </h1>

          <p className="text-sm md:text-xl text-muted-foreground max-w-xl font-medium mb-8 mx-auto md:mx-0">
            L'inscription est désormais ouverte. Connectez-vous pour obtenir votre pass numérique et rejoindre la vibe.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button onClick={() => handleOpenForm('PASS', 'STANDARD')} size="lg" className="h-14 px-8 text-xs font-bold rounded-full bg-primary text-white uppercase tracking-wider">
              S'INSCRIRE & RÉSERVER <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* UNIVERS */}
      <section id="univers" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl uppercase mb-2 font-black tracking-tight">
              4 UNIVERS. <span className="text-secondary">1 ÉNERGIE.</span>
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Vivez l'expérience INEPSS</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {universes.map((uni, idx) => (
              <Card key={idx} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group">
                <div className="relative h-48 w-full">
                  <Image src={uni.image} alt={uni.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <h3 className="text-xl font-black text-white tracking-wide uppercase">{uni.title}</h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-xs mb-6 leading-relaxed">{uni.description}</p>
                  <div className="space-y-2">
                    {uni.activities.map((act, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-[11px] group/item hover:bg-white/10 transition-colors">
                        <div>
                          <span className="font-bold text-white block">{act.name}</span>
                          <span className="text-[10px] text-muted-foreground">{act.desc}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PASS */}
      <section id="pass" className="py-24 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">LE PASS NUMÉRIQUE</h2>
          <p className="text-sm mb-12 text-white/80">Inscription obligatoire pour sécuriser votre billet.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="bg-background text-foreground rounded-2xl p-8 border-none shadow-2xl">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">PASS STANDARD</h3>
              <div className="text-4xl font-black mb-4">10.000 <span className="text-sm font-bold text-muted-foreground">FC</span></div>
              <Button onClick={() => handleOpenForm('PASS', 'STANDARD')} className="w-full h-12 rounded-full font-bold bg-primary text-white text-xs uppercase tracking-widest">OBTENIR LE PASS</Button>
            </Card>

            <Card className="bg-black text-white rounded-2xl p-8 border border-white/10 relative shadow-2xl">
              <div className="absolute top-6 right-6 bg-secondary text-black text-[9px] font-black px-2 py-0.5 rounded-full">PREMIUM</div>
              <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-2">PASS VIP</h3>
              <div className="text-4xl font-black mb-4 text-secondary">30.000 <span className="text-sm font-bold text-white/60">FC</span></div>
              <Button onClick={() => handleOpenForm('PASS', 'VIP')} className="w-full h-12 rounded-full font-bold bg-white text-black text-xs uppercase tracking-widest">ACCÈS VIP</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* MODAL CHECKOUT / AUTH */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 20 }} 
              className="bg-neutral-950 border border-white/10 rounded-2xl p-8 max-w-md w-full relative text-white"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
              
              {modalStep === 'AUTH' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-black uppercase mb-2">{authMode === 'SIGNUP' ? 'INSCRIPTION' : 'CONNEXION'}</h3>
                    <p className="text-xs text-muted-foreground">Rejoignez la vibe pour réserver votre pass.</p>
                  </div>
                  
                  <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2">
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input 
                          type="email" 
                          placeholder="Email" 
                          required 
                          className="bg-black border-white/10 pl-10 h-12 text-sm rounded-xl"
                          value={authData.email}
                          onChange={e => setAuthData({...authData, email: e.target.value})}
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input 
                          type="password" 
                          placeholder="Mot de passe" 
                          required 
                          className="bg-black border-white/10 pl-10 h-12 text-sm rounded-xl"
                          value={authData.password}
                          onChange={e => setAuthData({...authData, password: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full h-12 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-widest">
                      {authMode === 'SIGNUP' ? "CRÉER MON COMPTE" : "SE CONNECTER"}
                    </Button>
                  </form>
                  
                  <div className="text-center">
                    <button 
                      onClick={() => setAuthMode(authMode === 'SIGNUP' ? 'LOGIN' : 'SIGNUP')}
                      className="text-[10px] text-muted-foreground hover:text-primary uppercase font-bold tracking-widest"
                    >
                      {authMode === 'SIGNUP' ? "DÉJÀ INSCRIT ? CONNECTEZ-VOUS" : "PAS DE COMPTE ? INSCRIVEZ-VOUS"}
                    </button>
                  </div>
                </div>
              )}

              {modalStep === 'FORM' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-black uppercase mb-1">FINALISATION</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Validez vos coordonnées</p>
                  </div>

                  <form onSubmit={handleSubmitRegistration} className="space-y-4">
                    <div className="space-y-3">
                      <Input 
                        placeholder="Nom complet" 
                        required 
                        className="bg-black border-white/10 h-12 text-sm rounded-xl"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                      <Input 
                        placeholder="Téléphone" 
                        required 
                        type="tel"
                        className="bg-black border-white/10 h-12 text-sm rounded-xl"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                      {formType === 'PASS' && (
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-[11px] text-muted-foreground text-center">
                          TYPE DE PASS : <span className="text-primary font-bold">{formData.passCategory}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button type="submit" className="w-full h-12 bg-secondary text-black font-black rounded-xl text-xs uppercase tracking-widest">
                      RÉSERVER MON BILLET
                    </Button>
                  </form>
                </div>
              )}

              {modalStep === 'TICKET' && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto text-secondary">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase">VOTRE PASS EST PRÊT</h3>
                    <p className="text-xs text-muted-foreground mt-2">Rendez-vous à l'INEPSS le 26 Juin.</p>
                  </div>
                  
                  <div className="bg-white text-black p-6 rounded-2xl space-y-4 text-left shadow-2xl">
                    <div className="border-b border-neutral-200 pb-4">
                      <div className="text-[10px] font-black text-primary uppercase">ONE VIBE FEST 2027</div>
                      <div className="text-xl font-black uppercase truncate">{formData.name}</div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase">PASS {formData.passCategory}</div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <QrCode className="w-16 h-16 text-black" />
                      <div className="text-[10px] space-y-1">
                        <div className="font-mono font-bold">{generatedTicket}</div>
                        <div className="font-bold">INEPSS | 12:00 - 22:00</div>
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={() => setIsModalOpen(false)} className="w-full bg-primary text-white font-bold uppercase text-xs rounded-xl h-12 tracking-widest">
                    TERMINER
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
