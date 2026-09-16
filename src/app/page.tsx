"use client";

import React, { useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

import imagesData from './lib/placeholder-images.json';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc } from 'firebase/firestore';
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
  { time: "10:00", title: "Ouverture des Portes", desc: "Immersion et ouverture des villages thématiques.", imageUrl: getImg('hero-bg') },
  { time: "11:00", title: "VIBE CREATIVE Launch", desc: "Performances en direct et défilé sur la scène centrale.", imageUrl: getImg('creative-vibe') },
  { time: "12:00", title: "ONE VIBE PITCH Arena", desc: "8 projets s'affrontent pour le prix business.", imageUrl: getImg('business-vibe') },
  { time: "14:00", title: "VIBE DIGITAL Tournament", desc: "Grande finale E-sport retransmise sur écran géant.", imageUrl: getImg('digital-vibe') },
  { time: "16:00", title: "VIBE MUSIC Open Mic", desc: "Scène ouverte suivie d'un battle de scratch légendaire.", imageUrl: getImg('music-vibe') },
  { time: "18:00", title: "LE GRAND SHOW", desc: "Performances exclusives des têtes d'affiches.", imageUrl: getImg('moment-1') },
  { time: "20:00", title: "ONE VIBE CLOSING", desc: "Remise des prix, set de clôture mémorable.", imageUrl: getImg('moment-2') }
];

const defaultTalents = [
  { name: "Alex K.", role: "Musicien & Producteur", type: "MUSIC", img: getImg('talent-artist') },
  { name: "Sonia M.", role: "Styliste Streetwear", type: "CREATIVE", img: getImg('talent-creator') },
  { name: "Idriss T.", role: "Fondateur TechVibe", type: "BUSINESS", img: getImg('talent-entrepreneur') }
];

const faqs = [
  { q: "Où se déroule ONE VIBE FEST ?", a: "Au Palais des Congrès de manière entièrement centralisée sur une seule et unique journée intense." },
  { q: "À quelle date et horaires ?", a: "Le Samedi 15 Juillet de 10h00 à 21h00 sans interruption." },
  { q: "Quel est le prix du pass ?", a: "Le Pass Standard est disponible à 10.000 FC et le Pass VIP à 30.000 FC." },
  { q: "Comment acheter mon pass ?", a: "Directement en ligne via le bouton d'inscription rapide acceptant Mobile Money et Cartes Bancaires." },
  { q: "Peut-on devenir exposant ?", a: "Oui, en soumettant votre projet directement dans la section VIBE MARKET prévue à cet effet." }
];

export default function VibeFestLanding() {
  const firestore = useFirestore();
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
  const [step, setStep] = useState<1 | 2>(1);
  const [generatedTicket, setGeneratedTicket] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    passCategory: 'STANDARD',
    paymentMethod: 'MOBILE_MONEY',
    company: '',
    message: ''
  });

  const handleOpenForm = (type: 'PASS' | 'EXPOSITOR', category?: string) => {
    setFormType(type);
    if (category) {
      setFormData(prev => ({ ...prev, passCategory: category }));
    }
    setStep(1);
    setGeneratedTicket(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectCategory = (value: string) => {
    setFormData({ ...formData, passCategory: value });
  };

  const handleSelectPayment = (value: string) => {
    setFormData({ ...formData, paymentMethod: value });
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationsRef) return;

    const uniqueTicketId = `OVF-2027-${Math.floor(100000 + Math.random() * 900000)}`;

    const submissionData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      type: formType,
      passCategory: formType === 'PASS' ? formData.passCategory : null,
      paymentMethod: formType === 'PASS' ? formData.paymentMethod : null,
      company: formType === 'EXPOSITOR' ? formData.company : null,
      message: formData.message,
      ticketCode: uniqueTicketId,
      createdAt: new Date().toISOString()
    };

    addDoc(registrationsRef, submissionData)
      .catch((error) => {
        const permissionError = new FirestorePermissionError({
          path: registrationsRef.path,
          operation: OperationType.CREATE,
          requestResourceData: submissionData,
        }, error);
        errorEmitter.emit('permission-error', permissionError);
      });

    setGeneratedTicket(uniqueTicketId);
    toast({
      title: formType === 'PASS' ? "Billet généré avec succès !" : "Candidature reçue !",
      description: formType === 'PASS' ? "Votre pass sécurisé est prêt." : "Nous examinons votre marque avec attention.",
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
              <span className="text-white group-hover:text-primary transition-colors">2027</span>
            </div>
          </a>
          
          <div className="hidden lg:flex items-center gap-6 font-bold text-xs uppercase tracking-widest">
            <a href="#univers" className="hover:text-primary transition-colors text-muted-foreground">Univers</a>
            <a href="#programme" className="hover:text-primary transition-colors text-muted-foreground">Programme</a>
            <a href="#talents" className="hover:text-primary transition-colors text-muted-foreground">Talents</a>
            <a href="#pass" className="hover:text-primary transition-colors text-muted-foreground">Pass</a>
            <a href="/admin" className="text-secondary hover:underline transition-all">Admin</a>
          </div>

          <Button size="sm" onClick={() => handleOpenForm('PASS', 'STANDARD')} className="font-bold rounded-full bg-primary hover:bg-primary/90 text-white text-xs md:text-sm px-4 md:px-6">
            PRENDRE MON PASS
          </Button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-[75vh] md:min-h-screen flex items-center pt-16 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <Image src={heroImage} alt="Festival experience background" fill className="object-cover opacity-40 mix-blend-screen" priority data-ai-hint="festival crowd" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/80" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 w-full relative z-10 py-6 md:py-12">
          <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4 md:mb-6 text-[11px] font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1 text-primary"><Calendar className="w-3.5 h-3.5" /> 15 Juillet</span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1 text-secondary"><MapPin className="w-3.5 h-3.5" /> Palais des Congrès</span>
          </div>

          <h1 className="text-4xl md:text-7xl font-black leading-[0.95] tracking-tight mb-3 uppercase">
            ONE VIBE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">FEST | 2027</span>
          </h1>

          <p className="text-xs md:text-lg text-muted-foreground max-w-lg font-medium mb-6 md:mb-8">
            Une vibe. Des talents. Des créations. Des initiatives. <br />
            <span className="text-foreground font-bold italic">Une seule énergie : la créativité.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => handleOpenForm('PASS', 'STANDARD')} size="lg" className="w-full sm:w-auto h-12 px-6 text-xs font-bold rounded-full bg-primary text-white uppercase tracking-wider">
              PRENDRE MON PASS <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-12 px-6 text-xs font-bold rounded-full border-white/20 text-white bg-black/20 uppercase tracking-wider">
              <a href="#programme">DÉCOUVRIR LE PROGRAMME</a>
            </Button>
          </div>
        </div>
      </section>

      {/* L'EXPÉRIENCE / 4 UNIVERS */}
      <section id="univers" className="py-12 md:py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-8 md:mb-12">
            <h2 className="text-xl md:text-4xl uppercase mb-1 font-black tracking-tight">
              4 UNIVERS. <span className="text-secondary">1 JOURNÉE.</span>
            </h2>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">Quatre univers. Une journée. Une communauté.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {universes.map((uni, idx) => (
              <Card key={idx} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="relative h-32 md:h-40 w-full">
                  <Image src={uni.image} alt={uni.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="p-1 bg-black/60 rounded backdrop-blur-md">{uni.icon}</div>
                    <h3 className="text-sm md:text-base font-black text-white tracking-wide">{uni.title}</h3>
                  </div>
                </div>
                <CardContent className="p-3 md:p-4">
                  <p className="text-muted-foreground text-[11px] mb-3">{uni.description}</p>
                  <div className="space-y-1.5">
                    {uni.activities.map((act, i) => (
                      <div key={i} className="p-2 rounded bg-white/5 border border-white/5 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-white block">{act.name}</span>
                          <span className="text-[10px] text-muted-foreground">{act.desc}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMME CHRONOLOGIQUE - Dynamique */}
      <section id="programme" className="py-12 md:py-20 bg-muted/5">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-xl md:text-4xl font-black uppercase tracking-tight mb-8 text-center">EXPERIENCE <span className="text-primary">CHRONOLOGIQUE</span></h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeProgram.map((prog, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-lg flex gap-3 items-center">
                {prog.imageUrl && (
                  <div className="relative w-12 h-12 rounded overflow-hidden shrink-0 bg-neutral-800">
                    <img src={prog.imageUrl} alt="" className="object-cover w-full h-full" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded inline-block mb-0.5">{prog.time}</span>
                  <h3 className="text-xs font-bold text-white uppercase truncate">{prog.title}</h3>
                  <p className="text-[10px] text-muted-foreground truncate">{prog.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LES TALENTS - Dynamique */}
      <section id="talents" className="py-12 md:py-20 bg-black">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-xl md:text-4xl font-black uppercase mb-8 text-center">LES ACTEURS DE LA <span className="text-secondary">VIBE</span></h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {activeTalents ? activeTalents.map((t) => (
              <div key={t.id} className="relative rounded-lg overflow-hidden aspect-square group bg-neutral-900">
                <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-[8px] font-bold bg-secondary text-black px-1.5 py-0.2 rounded-full inline-block mb-0.5">{t.category}</span>
                  <h3 className="text-xs font-black text-white truncate">{t.name}</h3>
                  <p className="text-[10px] text-white/60 truncate">{t.role}</p>
                </div>
              </div>
            )) : defaultTalents.map((t, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden aspect-square group bg-neutral-900">
                <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-[8px] font-bold bg-secondary text-black px-1.5 py-0.2 rounded-full inline-block mb-0.5">{t.type}</span>
                  <h3 className="text-xs font-black text-white truncate">{t.name}</h3>
                  <p className="text-[10px] text-white/60 truncate">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PASS & COMMANDE QUICK CHECKOUT */}
      <section id="pass" className="py-12 md:py-20 bg-primary text-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-xl md:text-4xl font-black uppercase tracking-tight mb-6 text-center">CHOISIR SON EXPERIENCE</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-background text-foreground rounded-xl p-5 border-none shadow-xl">
              <h3 className="text-xs font-black text-muted-foreground uppercase">PASS STANDARD</h3>
              <div className="text-2xl font-black my-1">10.000 <span className="text-xs font-bold text-muted-foreground">FC</span></div>
              <p className="text-[11px] text-muted-foreground mb-4">Accès complet à la journée pour l'ensemble des 4 univers de l'événement.</p>
              <Button onClick={() => handleOpenForm('PASS', 'STANDARD')} className="w-full h-10 rounded-full font-bold bg-primary text-white text-xs uppercase tracking-wider">RÉSERVER MON PASS</Button>
            </Card>

            <Card className="bg-black text-white rounded-xl p-5 border border-white/10 relative shadow-xl">
              <div className="absolute top-4 right-4 bg-secondary text-black text-[8px] font-black px-1.5 py-0.5 rounded">PREMIUM</div>
              <h3 className="text-xs font-black text-white/60 uppercase">PASS VIP</h3>
              <div className="text-2xl font-black my-1 text-secondary">30.000 <span className="text-xs font-bold text-white/60">FC</span></div>
              <p className="text-[11px] text-white/60 mb-4">Accès coupe-file prioritaire, espace Front-stage exclusif et networking privilégié.</p>
              <Button onClick={() => handleOpenForm('PASS', 'VIP')} className="w-full h-10 rounded-full font-bold bg-white text-black text-xs uppercase tracking-wider">DEVENIR VIP</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* VIBE MARKET */}
      <section id="market" className="py-12 md:py-20 bg-black">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h2 className="text-xl md:text-3xl font-black uppercase">VIBE <span className="text-primary">MARKET</span></h2>
              <p className="text-[11px] text-muted-foreground max-w-sm mt-0.5">Espace marques, mode, food truck et créations locales.</p>
            </div>
            <Button onClick={() => handleOpenForm('EXPOSITOR')} size="sm" variant="outline" className="w-full sm:w-auto h-10 rounded-full border-white/20 text-white font-bold text-xs uppercase tracking-wider">
              <ShoppingBag className="w-3.5 h-3.5 mr-1" /> DEVENIR EXPOSANT
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative rounded-lg overflow-hidden h-24 md:h-32 bg-neutral-900">
              <Image src={getImg('market-fashion')} alt="Fashion pop-up" fill className="object-cover opacity-80" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-2"><span className="text-[10px] md:text-xs font-black text-white text-center uppercase tracking-wider italic">STREETWEAR & ART</span></div>
            </div>
            <div className="relative rounded-lg overflow-hidden h-24 md:h-32 bg-neutral-900">
              <Image src={getImg('market-food')} alt="Food truck" fill className="object-cover opacity-80" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-2"><span className="text-[10px] md:text-xs font-black text-white text-center uppercase tracking-wider italic">FOOD & LIFESTYLE</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* PARTENAIRES */}
      <section className="py-8 bg-neutral-950 border-t border-white/5 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Ils contribuent à faire vivre la VIBE</p>
          <div className="flex flex-wrap justify-center items-center gap-6 opacity-40 grayscale text-xs font-bold text-white tracking-widest select-none">
            <span>DIGI EVENT</span>
            <span>DEG GROUP</span>
            <span>VIBE LABS</span>
            <span>CULTURE DIGITAL</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-neutral-950 border-t border-white/10">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-base font-black uppercase text-center mb-6 tracking-wide">FAQ ESSENTIELLE</h2>
          <Accordion type="single" collapsible className="space-y-1.5">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-white/10 rounded-lg px-3 bg-white/5">
                <AccordionTrigger className="font-bold text-[11px] md:text-xs hover:no-underline py-2.5 text-left text-white">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-[11px] pb-2.5 leading-relaxed">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black py-8 border-t border-white/10 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex flex-col items-center justify-center leading-none">
            <div className="text-lg font-black tracking-tighter text-primary uppercase">ONE VIBE</div>
            <div className="text-[8px] font-bold tracking-widest text-white/40 uppercase">FEST | 2027</div>
          </div>
          <p className="text-[10px] max-w-xs mx-auto">Une seule énergie : la créativité. Réalisé en partenariat avec Digi Event.</p>
          <div className="text-[9px] uppercase tracking-wider text-white/30 pt-4 border-t border-white/5">
            © 2027 ONE VIBE FEST. Tous droits réservés.
          </div>
        </div>
      </footer>

      {/* MODAL CHECKOUT */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-neutral-950 border border-white/10 rounded-xl p-5 max-w-sm w-full relative text-white max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
              
              {!generatedTicket ? (
                <>
                  <h3 className="text-lg font-black uppercase mb-1">
                    {formType === 'PASS' ? `TICKET ${formData.passCategory}` : "ESPACE EXPOSANT"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mb-4">
                    {formType === 'PASS' ? "Accès instantané sécurisé en 2 étapes." : "Présentez votre projet de marque au festival."}
                  </p>

                  <form onSubmit={handleSubmitRegistration} className="space-y-3">
                    {step === 1 ? (
                      <>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Vos coordonnées</label>
                          <Input name="name" value={formData.name} onChange={handleInputChange} required placeholder="Nom complet" className="bg-black border-white/10 h-10 text-xs rounded-lg" />
                          <Input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="Adresse email" className="bg-black border-white/10 h-10 text-xs rounded-lg" />
                          <Input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="Téléphone mobile" className="bg-black border-white/10 h-10 text-xs rounded-lg" />
                        </div>

                        {formType === 'EXPOSITOR' && (
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Détails entreprise</label>
                            <Input name="company" value={formData.company} onChange={handleInputChange} required placeholder="Nom complet de votre marque" className="bg-black border-white/10 h-10 text-xs rounded-lg" />
                            <Textarea name="message" value={formData.message} onChange={handleInputChange} placeholder="Décrivez brièvement les produits ou concepts exposés..." className="bg-black border-white/10 text-xs rounded-lg min-h-[50px]" />
                          </div>
                        )}

                        {formType === 'PASS' ? (
                          <Button type="button" onClick={() => setStep(2)} className="w-full h-10 bg-primary text-white font-bold rounded-lg text-xs uppercase tracking-wide mt-2">
                            MODE DE PAIEMENT
                          </Button>
                        ) : (
                          <Button type="submit" className="w-full h-10 bg-primary text-white font-bold rounded-lg text-xs uppercase tracking-wide mt-2">
                            SOUMETTRE MA CANDIDATURE
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Type de pass souhaité</label>
                          <Select value={formData.passCategory} onValueChange={handleSelectCategory}>
                            <SelectTrigger className="bg-black border-white/10 h-10 text-xs rounded-lg text-white">
                              <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-900 border-white/10 text-white">
                              <SelectItem value="STANDARD">Standard - 10.000 FC</SelectItem>
                              <SelectItem value="VIP">VIP - 30.000 FC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Sélectionner un moyen de paiement</label>
                          <Select value={formData.paymentMethod} onValueChange={handleSelectPayment}>
                            <SelectTrigger className="bg-black border-white/10 h-10 text-xs rounded-lg text-white">
                              <SelectValue placeholder="Méthode" />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-900 border-white/10 text-white">
                              <SelectItem value="MOBILE_MONEY">Mobile Money (M-Pesa, Orange, Airtel)</SelectItem>
                              <SelectItem value="CARD">Carte Bancaire (Visa / Mastercard)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="p-2.5 bg-white/5 border border-white/5 rounded-lg text-[10px] text-muted-foreground">
                          Montant total à régler : <span className="text-white font-bold">{formData.passCategory === 'VIP' ? '30.000 FC' : '10.000 FC'}</span>.
                        </div>

                        <div className="flex gap-2 pt-1">
                          <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3 h-10 border-white/10 text-white text-xs">RETOUR</Button>
                          <Button type="submit" className="w-2/3 h-10 bg-secondary text-black font-black rounded-lg text-xs uppercase tracking-wide">CONFIRMER</Button>
                        </div>
                      </div>
                    )}
                  </form>
                </>
              ) : (
                <div className="text-center space-y-4 py-2 animate-in fade-in zoom-in-95">
                  <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center mx-auto text-secondary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black uppercase text-white">Billet d'entrée disponible</h3>
                  <p className="text-[11px] text-muted-foreground">Votre pass officiel unique a bien été généré pour le festival :</p>
                  
                  <div className="bg-white text-black p-3 rounded-lg space-y-2.5 text-left shadow-2xl">
                    <div className="flex justify-between items-start border-b border-neutral-200 pb-1.5">
                      <div>
                        <div className="text-[8px] font-black tracking-widest text-primary uppercase">ONE VIBE FEST | 2027</div>
                        <div className="text-xs font-black uppercase truncate max-w-[150px]">{formData.name}</div>
                      </div>
                      <span className="text-[8px] bg-black text-white px-1.5 py-0.2 rounded font-mono font-bold">
                        PASS {formData.passCategory}
                      </span>
                    </div>

                    <div className="flex gap-2 items-center">
                      <div className="p-1 border border-black rounded bg-neutral-50 shrink-0">
                        <QrCode className="w-10 h-10 text-black" />
                      </div>
                      <div className="text-[10px] min-w-0">
                        <div className="font-mono font-bold text-neutral-800 text-[9px] truncate">{generatedTicket}</div>
                        <div className="text-[9px] text-neutral-500 font-medium">Palais des Congrès</div>
                        <div className="text-[9px] text-neutral-500 font-medium">Samedi 15 Juillet</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground">Retrouvez ce pass à tout moment dans le dashboard admin sous l'onglet <b>Billets & QR</b>.</p>
                  
                  <Button onClick={() => setIsModalOpen(false)} className="w-full bg-primary text-white font-bold uppercase text-xs rounded-lg h-10">
                    Fermer l'aperçu
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
