
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  Palette, 
  Briefcase, 
  Gamepad2, 
  Calendar, 
  MapPin, 
  ArrowRight,
  ShoppingBag,
  X,
  ChevronRight,
  QrCode,
  ShieldCheck,
  User,
  Lock,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      { name: "ONE VIBE Open Mic", desc: "Scène libre pour se révéler." },
      { name: "DJ Battle", desc: "Duels rythmés arbitrés par le public." }
    ],
    image: getImg('music-vibe'),
    badge: "GRAND SHOW"
  },
  {
    title: "VIBE CREATIVE",
    icon: <Palette className="w-4 h-4 text-purple-400" />,
    description: "Création artistique pure, visuelle et stylistique.",
    activities: [
      { name: "Fashion Show", desc: "Présentations de jeunes créateurs." },
      { name: "Live Painting", desc: "Fresques monumentales en direct." },
      { name: "Creative Market", desc: "Designers, mode et art visuel." }
    ],
    image: getImg('creative-vibe'),
    badge: "FASHION SHOW"
  },
  {
    title: "VIBE BUSINESS",
    icon: <Briefcase className="w-4 h-4 text-blue-400" />,
    description: "Impulsion entrepreneuriale et concrétisation.",
    activities: [
      { name: "ONE VIBE Pitch", desc: "Projets audacieux face aux mentors." },
      { name: "Startup & Brand Village", desc: "Marques et initiatives d'avenir." },
      { name: "ONE VIBE Connect", desc: "Rencontres B2B stratégiques." }
    ],
    image: getImg('business-vibe'),
    badge: "ONE VIBE PITCH"
  },
  {
    title: "VIBE DIGITAL",
    icon: <Gamepad2 className="w-4 h-4 text-teal-400" />,
    description: "Culture numérique, gaming et nouveaux médias.",
    activities: [
      { name: "Gaming / E-sport", desc: "Tournois intenses avec cashprize." },
      { name: "Content Challenge", desc: "Créations de contenus viraux." },
      { name: "Digital Experience", desc: "Immersion interactive & démos." }
    ],
    image: getImg('digital-vibe'),
    badge: "GAMING CHALLENGE"
  }
];

const defaultProgram = [
  { time: "12:00", title: "Ouverture des Portes", desc: "Immersion et ouverture des villages thématiques.", imageUrl: getImg('hero-bg') },
  { time: "14:00", title: "VIBE DIGITAL Tournament", desc: "Grande finale e-sport.", imageUrl: getImg('digital-vibe') },
  { time: "16:00", title: "Creative Showcase", desc: "Défilé et performances artistiques.", imageUrl: getImg('creative-vibe') },
  { time: "19:00", title: "Main Stage Concert", desc: "Têtes d'affiches nationales.", imageUrl: getImg('music-vibe') },
  { time: "22:00", title: "Clôture", desc: "Fin de l'événement.", imageUrl: getImg('moment-1') }
];

const faqs = [
  { q: "Où se déroule ONE VIBE FEST ?", a: "À l'INEPSS le 26 Juin." },
  { q: "Quels sont les horaires ?", a: "De 12h00 à 22h00." },
  { q: "Faut-il un compte ?", a: "Oui, vous devez vous inscrire avant de pouvoir réserver votre pass." }
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

  const talentsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'talents');
  }, [firestore]);
  const { data: dynamicTalents } = useCollection(talentsCollectionRef);

  const registrationsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'registrations');
  }, [firestore]);

  const heroImage = festivalSettings?.heroImageUrl || getImg('hero-bg');
  const activeProgram = dynamicProgram && dynamicProgram.length > 0 ? [...dynamicProgram].sort((a,b) => a.time.localeCompare(b.time)) : defaultProgram;
  const activeTalents = dynamicTalents && dynamicTalents.length > 0 ? dynamicTalents : null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<'PASS' | 'EXPOSITOR'>('PASS');
  const [modalStep, setModalStep] = useState<'AUTH' | 'FORM' | 'PAYMENT' | 'TICKET'>('AUTH');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('SIGNUP');
  
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    passCategory: 'STANDARD',
    paymentMethod: 'MOBILE_MONEY',
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
        toast({ title: "Compte créé !", description: "Vous pouvez maintenant continuer votre inscription." });
      } else {
        await signInWithEmailAndPassword(auth, authData.email, authData.password);
        toast({ title: "Connexion réussie !" });
      }
      setModalStep('FORM');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erreur d'authentification", description: err.message });
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
      title: formType === 'PASS' ? "Billet généré !" : "Candidature reçue !",
      description: "Votre demande a été enregistrée avec succès.",
    });
  };

  return (
    <div className="bg-background text-foreground font-sans antialiased min-h-screen selection:bg-primary selection:text-white">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <a href="#" className="flex flex-col leading-none select-none group">
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
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-[9px] text-primary lowercase">{user.email}</span>
                <button onClick={() => signOut(auth!)} className="text-[9px] text-muted-foreground hover:text-white">DÉCONNEXION</button>
              </div>
            ) : (
              <a href="/admin" className="text-secondary hover:underline text-[10px]">ADMIN</a>
            )}
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
            <span className="text-primary">26 Juin 2027</span>
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
            Rejoignez l'énergie créative. Inscrivez-vous maintenant pour réserver votre place à l'INEPSS.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button onClick={() => handleOpenForm('PASS', 'STANDARD')} size="lg" className="h-14 px-8 text-xs font-bold rounded-full bg-primary text-white uppercase tracking-wider">
              S'INSCRIRE & RÉSERVER <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-xs font-bold rounded-full border-white/20 text-white bg-black/20 uppercase tracking-wider">
              <a href="#programme">VOIR LE PROGRAMME</a>
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
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">La diversité au cœur du festival</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {universes.map((uni, idx) => (
              <Card key={idx} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group">
                <div className="relative h-48 w-full">
                  <Image src={uni.image} alt={uni.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <div className="p-2 bg-black/60 rounded-lg backdrop-blur-md">{uni.icon}</div>
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
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">CHOISIR SON EXPÉRIENCE</h2>
          <p className="text-sm mb-12 text-white/80">Inscrivez-vous d'abord pour accéder à la billetterie sécurisée.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="bg-background text-foreground rounded-2xl p-8 border-none shadow-2xl">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">PASS STANDARD</h3>
              <div className="text-4xl font-black mb-4">10.000 <span className="text-sm font-bold text-muted-foreground">FC</span></div>
              <ul className="text-left text-xs space-y-3 mb-8 text-muted-foreground">
                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Accès complet aux 4 univers</li>
                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Concerts & Tournois</li>
              </ul>
              <Button onClick={() => handleOpenForm('PASS', 'STANDARD')} className="w-full h-12 rounded-full font-bold bg-primary text-white text-xs uppercase tracking-widest">RÉSERVER MON PASS</Button>
            </Card>

            <Card className="bg-black text-white rounded-2xl p-8 border border-white/10 relative shadow-2xl">
              <div className="absolute top-6 right-6 bg-secondary text-black text-[9px] font-black px-2 py-0.5 rounded-full">PREMIUM</div>
              <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-2">PASS VIP</h3>
              <div className="text-4xl font-black mb-4 text-secondary">30.000 <span className="text-sm font-bold text-white/60">FC</span></div>
              <ul className="text-left text-xs space-y-3 mb-8 text-white/60">
                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-secondary" /> Accès coupe-file INEPSS</li>
                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-secondary" /> Espace Front-stage exclusif</li>
              </ul>
              <Button onClick={() => handleOpenForm('PASS', 'VIP')} className="w-full h-12 rounded-full font-bold bg-white text-black text-xs uppercase tracking-widest">DEVENIR VIP</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black py-12 border-t border-white/10 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center leading-none mb-8">
            <div className="text-2xl font-black tracking-tighter text-primary uppercase">ONE VIBE</div>
            <div className="text-[10px] font-bold tracking-widest text-white/40 uppercase">FEST | 2027</div>
          </div>
          <div className="flex justify-center gap-8 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-8">
            <a href="#univers" className="hover:text-white transition-colors">Univers</a>
            <a href="#programme" className="hover:text-white transition-colors">Programme</a>
            <a href="/admin" className="text-secondary">Admin Access</a>
          </div>
          <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">© 2027 ONE VIBE FEST. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

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
                    <h3 className="text-2xl font-black uppercase mb-2">Inscription requise</h3>
                    <p className="text-xs text-muted-foreground">Créez votre compte pour réserver votre pass ONE VIBE.</p>
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
                      {authMode === 'SIGNUP' ? "J'AI DÉJÀ UN COMPTE" : "CRÉER UN NOUVEAU COMPTE"}
                    </button>
                  </div>
                </div>
              )}

              {modalStep === 'FORM' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-black uppercase mb-1">{formType === 'PASS' ? "Votre Pass" : "Exposant"}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Finalisez vos informations</p>
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
                      {formType === 'EXPOSITOR' && (
                        <>
                          <Input 
                            placeholder="Nom de la marque" 
                            required 
                            className="bg-black border-white/10 h-12 text-sm rounded-xl"
                            value={formData.company}
                            onChange={e => setFormData({...formData, company: e.target.value})}
                          />
                          <Textarea 
                            placeholder="Votre projet en quelques mots" 
                            className="bg-black border-white/10 rounded-xl text-sm"
                            value={formData.message}
                            onChange={e => setFormData({...formData, message: e.target.value})}
                          />
                        </>
                      )}
                      {formType === 'PASS' && (
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-[11px] text-muted-foreground">
                          Catégorie : <span className="text-white font-bold">{formData.passCategory}</span>
                          <br />
                          Prix : <span className="text-primary font-bold">{formData.passCategory === 'VIP' ? '30.000' : '10.000'} FC</span>
                        </div>
                      )}
                    </div>
                    
                    <Button type="submit" className="w-full h-12 bg-secondary text-black font-black rounded-xl text-xs uppercase tracking-widest">
                      CONFIRMER L'INSCRIPTION
                    </Button>
                  </form>
                </div>
              )}

              {modalStep === 'TICKET' && (
                <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto text-secondary">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase text-white">INSCRIPTION RÉUSSIE</h3>
                    <p className="text-xs text-muted-foreground mt-2">Votre pass pour l'INEPSS est prêt !</p>
                  </div>
                  
                  <div className="bg-white text-black p-6 rounded-2xl space-y-4 text-left shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary rotate-45 translate-x-8 -translate-y-8" />
                    <div className="border-b border-neutral-200 pb-4">
                      <div className="text-[10px] font-black text-primary uppercase mb-1">ONE VIBE FEST 2027</div>
                      <div className="text-xl font-black uppercase truncate">{formData.name}</div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase">{formType === 'PASS' ? `PASS ${formData.passCategory}` : 'EXPOSANT'}</div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="p-2 border-2 border-black rounded-xl bg-neutral-50 shrink-0">
                        <QrCode className="w-16 h-16 text-black" />
                      </div>
                      <div className="text-[10px] space-y-1">
                        <div className="font-mono font-bold text-neutral-800">{generatedTicket}</div>
                        <div className="font-bold">INEPSS | 26 JUIN</div>
                        <div className="text-neutral-500">Ouverture 12:00</div>
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={() => setIsModalOpen(false)} className="w-full bg-primary text-white font-bold uppercase text-xs rounded-xl h-12 tracking-widest">
                    FERMER
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
