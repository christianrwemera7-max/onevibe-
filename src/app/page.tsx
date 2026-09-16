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
    icon: <Music className="w-5 h-5 text-pink-400" />,
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
    icon: <Palette className="w-5 h-5 text-purple-400" />,
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
    icon: <Briefcase className="w-5 h-5 text-blue-400" />,
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
    icon: <Gamepad2 className="w-5 h-5 text-teal-400" />,
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
  { q: "Où et quand se déroule le festival ?", a: "Le Samedi 15 Juillet 2024 de 10:00 à 21:00 au Palais des Congrès." },
  { q: "Quels sont les tarifs des pass ?", a: "Le Pass Standard est à 10.000 FC et le Pass VIP est à 30.000 FC." },
  { q: "Comment payer ou devenir exposant ?", a: "Tout se fait en ligne via les formulaires simplifiés acceptant Mobile Money et Cartes." }
];

export default function VibeFestLanding() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  // Dynamic settings & collections
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

  // Combined variables (Fallback if Firestore empty)
  const heroImage = festivalSettings?.heroImageUrl || getImg('hero-bg');
  const activeProgram = dynamicProgram && dynamicProgram.length > 0 ? [...dynamicProgram].sort((a,b) => a.time.localeCompare(b.time)) : defaultProgram;
  const activeTalents = dynamicTalents && dynamicTalents.length > 0 ? dynamicTalents : null;

  // Modals status
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

    const uniqueTicketId = `OVF-2024-${Math.floor(100000 + Math.random() * 900000)}`;

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
      description: formType === 'PASS' ? "Votre affiche souvenir avec code unique QR est prête." : "Notre équipe examine votre marque.",
    });
  };

  return (
    <div className="bg-background text-foreground font-sans antialiased min-h-screen selection:bg-primary selection:text-white">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-14 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-lg md:text-2xl font-black tracking-tighter text-primary">ONE VIBE</span>
            <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary tracking-widest uppercase">FEST</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-6 font-bold text-xs uppercase tracking-widest">
            <a href="#univers" className="hover:text-primary transition-colors text-muted-foreground">Univers</a>
            <a href="#programme" className="hover:text-primary transition-colors text-muted-foreground">Programme</a>
            <a href="#talents" className="hover:text-primary transition-colors text-muted-foreground">Talents</a>
            <a href="#pass" className="hover:text-primary transition-colors text-muted-foreground">Pass</a>
            <a href="/admin" className="text-secondary hover:underline transition-all">Admin Dashboard</a>
          </div>

          <Button size="sm" onClick={() => handleOpenForm('PASS', 'STANDARD')} className="font-bold rounded-full bg-primary hover:bg-primary/90 text-white text-xs md:text-sm px-4 md:px-6">
            MON PASS
          </Button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-[85vh] md:min-h-screen flex items-center pt-14 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <Image src={heroImage} alt="Festival experience background" fill className="object-cover opacity-40 mix-blend-screen" priority data-ai-hint="festival scene" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-black/80" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 w-full relative z-10 py-8 md:py-12">
          <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4 md:mb-8 text-xs font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1 text-primary"><Calendar className="w-3.5 h-3.5" /> 15 Juillet 2024</span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1 text-secondary"><MapPin className="w-3.5 h-3.5" /> Palais des Congrès</span>
          </div>

          <h1 className="text-4xl md:text-8xl font-black leading-[0.95] tracking-tight mb-4 uppercase">
            ONE VIBE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">FEST</span>
          </h1>

          <p className="text-sm md:text-xl text-muted-foreground max-w-xl font-medium mb-6 md:mb-10">
            Une vibe. Des talents. Des créations. <br className="hidden md:inline" />
            <span className="text-foreground font-bold">Une seule énergie : la créativité.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => handleOpenForm('PASS', 'STANDARD')} size="lg" className="w-full sm:w-auto h-12 md:h-14 px-6 text-sm font-bold rounded-full bg-primary text-white">
              PRENDRE MON PASS <ArrowRight className="ml-1.5 w-4 h-4" />
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-12 md:h-14 px-6 text-sm font-bold rounded-full border-white/20 text-white bg-black/20">
              <a href="#programme">PROGRAMME</a>
            </Button>
          </div>
        </div>
      </section>

      {/* L'EXPÉRIENCE / 4 UNIVERS */}
      <section id="univers" className="py-12 md:py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <h2 className="text-2xl md:text-5xl uppercase mb-2 font-black tracking-tight">
              4 UNIVERS. <span className="text-secondary">1 JOURNÉE.</span>
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-widest">Quatre univers. Une journée. Une communauté.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {universes.map((uni, idx) => (
              <Card key={idx} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="relative h-40 md:h-48 w-full">
                  <Image src={uni.image} alt={uni.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="p-1.5 bg-black/60 rounded-lg backdrop-blur-md">{uni.icon}</div>
                    <h3 className="text-lg md:text-xl font-black text-white">{uni.title}</h3>
                  </div>
                </div>
                <CardContent className="p-4 md:p-6">
                  <p className="text-muted-foreground text-xs font-medium mb-4">{uni.description}</p>
                  <div className="space-y-2">
                    {uni.activities.map((act, i) => (
                      <div key={i} className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white block">{act.name}</span>
                          <span className="text-[11px] text-muted-foreground">{act.desc}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
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
      <section id="programme" className="py-12 md:py-24 bg-muted/5">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight mb-10 text-center">LA VIBE <span className="text-primary">TIME-LINE</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProgram.map((prog, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl flex gap-4 items-center">
                {prog.imageUrl && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    <img src={prog.imageUrl} alt="" className="object-cover w-full h-full" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded inline-block mb-1">{prog.time}</span>
                  <h3 className="text-sm font-bold text-white uppercase truncate">{prog.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{prog.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LES TALENTS - Dynamique */}
      <section id="talents" className="py-12 md:py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-5xl font-black uppercase mb-10 text-center">LES ACTEURS DE LA <span className="text-secondary">VIBE</span></h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activeTalents ? activeTalents.map((t) => (
              <div key={t.id} className="relative rounded-xl overflow-hidden aspect-square group">
                <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-[9px] font-bold bg-secondary text-black px-2 py-0.5 rounded-full block w-fit mb-1">{t.category}</span>
                  <h3 className="text-base font-black text-white">{t.name}</h3>
                  <p className="text-xs text-white/60">{t.role}</p>
                </div>
              </div>
            )) : defaultTalents.map((t, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden aspect-square group">
                <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-[9px] font-bold bg-secondary text-black px-2 py-0.5 rounded-full block w-fit mb-1">{t.type}</span>
                  <h3 className="text-base font-black text-white">{t.name}</h3>
                  <p className="text-xs text-white/60">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PASS & COMMANDE QUICK CHECKOUT */}
      <section id="pass" className="py-12 md:py-24 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight mb-8 text-center">VOS PASS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-background text-foreground rounded-2xl p-6 border-none">
              <h3 className="text-sm font-black text-muted-foreground uppercase">PASS STANDARD</h3>
              <div className="text-3xl font-black my-2">10.000 <span className="text-xs font-bold text-muted-foreground">FC</span></div>
              <p className="text-xs text-muted-foreground mb-4">Accès complet à la journée pour les 4 univers.</p>
              <Button onClick={() => handleOpenForm('PASS', 'STANDARD')} className="w-full h-11 rounded-full font-bold bg-primary text-white text-xs uppercase">RÉSERVER</Button>
            </Card>

            <Card className="bg-black text-white rounded-2xl p-6 border border-white/10 relative">
              <div className="absolute top-4 right-4 bg-secondary text-black text-[9px] font-black px-2 py-0.5 rounded">PREMIUM</div>
              <h3 className="text-sm font-black text-white/60 uppercase">PASS VIP</h3>
              <div className="text-3xl font-black my-2 text-secondary">30.000 <span className="text-xs font-bold text-white/60">FC</span></div>
              <p className="text-xs text-white/60 mb-4">Coupe-file, accès Front-stage et espace networking.</p>
              <Button onClick={() => handleOpenForm('PASS', 'VIP')} className="w-full h-11 rounded-full font-bold bg-white text-black text-xs uppercase">DEVENIR VIP</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* VIBE MARKET */}
      <section id="market" className="py-12 md:py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-5xl font-black uppercase">VIBE <span className="text-primary">MARKET</span></h2>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">Espace marques, mode, food et innovations locales.</p>
            </div>
            <Button onClick={() => handleOpenForm('EXPOSITOR')} size="sm" variant="outline" className="w-full sm:w-auto h-11 rounded-full border-white/20 text-white font-bold text-xs">
              <ShoppingBag className="w-4 h-4 mr-1" /> REJOINDRE LE MARKET
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative rounded-xl overflow-hidden h-28 md:h-40">
              <Image src={getImg('market-fashion')} alt="Fashion pop-up" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2"><span className="text-xs md:text-sm font-black text-white text-center uppercase italic">STREETWEAR</span></div>
            </div>
            <div className="relative rounded-xl overflow-hidden h-28 md:h-40">
              <Image src={getImg('market-food')} alt="Food truck" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2"><span className="text-xs md:text-sm font-black text-white text-center uppercase italic">FOOD & LIFESTYLE</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-neutral-950 border-t border-white/10">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-xl font-black uppercase text-center mb-6">FAQ ESSENTIELLE</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-white/10 rounded-xl px-4 bg-white/5">
                <AccordionTrigger className="font-bold text-xs md:text-sm hover:no-underline py-3 text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-xs pb-3">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black py-10 border-t border-white/10 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="font-black text-primary text-base tracking-tighter">ONE VIBE FEST</div>
          <p className="text-[11px] max-w-md mx-auto">Une journée unique pour connecter la musique, la mode, le business et la culture digitale.</p>
          <div className="text-[10px] uppercase tracking-wider text-white/40 pt-4 border-t border-white/5">
            © 2024 ONE VIBE FEST. Powered by Digi Event.
          </div>
        </div>
      </footer>

      {/* CONVERSION QUICK MODAL WITH QR CREATION DISPLAY */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-neutral-950 border border-white/10 rounded-2xl p-5 max-w-sm w-full relative text-white max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
              
              {!generatedTicket ? (
                <>
                  <h3 className="text-xl font-black uppercase mb-1">
                    {formType === 'PASS' ? `TICKET ${formData.passCategory}` : "ESPACE EXPOSANT"}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {formType === 'PASS' ? "Accès instantané sécurisé en 2 étapes." : "Présentez votre marque au festival."}
                  </p>

                  <form onSubmit={handleSubmitRegistration} className="space-y-3">
                    {step === 1 ? (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vos informations</label>
                          <Input name="name" value={formData.name} onChange={handleInputChange} required placeholder="Nom complet" className="bg-black border-white/10 h-11 text-sm rounded-xl" />
                          <Input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="Adresse email" className="bg-black border-white/10 h-11 text-sm rounded-xl" />
                          <Input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="Numéro de téléphone" className="bg-black border-white/10 h-11 text-sm rounded-xl" />
                        </div>

                        {formType === 'EXPOSITOR' && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Votre projet</label>
                            <Input name="company" value={formData.company} onChange={handleInputChange} required placeholder="Nom de votre marque" className="bg-black border-white/10 h-11 text-sm rounded-xl" />
                            <Textarea name="message" value={formData.message} onChange={handleInputChange} placeholder="Décrivez vos produits..." className="bg-black border-white/10 text-sm rounded-xl min-h-[60px]" />
                          </div>
                        )}

                        {formType === 'PASS' ? (
                          <Button type="button" onClick={() => setStep(2)} className="w-full h-11 bg-primary text-white font-bold rounded-xl text-xs uppercase mt-2">
                            CHOISIR LE MODE DE PAIEMENT
                          </Button>
                        ) : (
                          <Button type="submit" className="w-full h-11 bg-primary text-white font-bold rounded-xl text-xs uppercase mt-2">
                            SOUMETTRE MA CANDIDATURE
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mode de facturation</label>
                          <Select value={formData.passCategory} onValueChange={handleSelectCategory}>
                            <SelectTrigger className="bg-black border-white/10 h-11 text-sm rounded-xl">
                              <SelectValue placeholder="Catégorie de billet" />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-900 border-white/10 text-white">
                              <SelectItem value="STANDARD">Standard - 10.000 FC</SelectItem>
                              <SelectItem value="VIP">VIP - 30.000 FC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mode de paiement local</label>
                          <Select value={formData.paymentMethod} onValueChange={handleSelectPayment}>
                            <SelectTrigger className="bg-black border-white/10 h-11 text-sm rounded-xl">
                              <SelectValue placeholder="Méthode" />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-900 border-white/10 text-white">
                              <SelectItem value="MOBILE_MONEY">Mobile Money (M-Pesa, Orange, Airtel)</SelectItem>
                              <SelectItem value="CARD">Carte Bancaire / Visa / Mastercard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[11px] text-muted-foreground">
                          Montant total dû : <span className="text-white font-bold">{formData.passCategory === 'VIP' ? '30.000 FC' : '10.000 FC'}</span>.
                        </div>

                        <div className="flex gap-2">
                          <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3 h-11 border-white/10 text-white text-xs">RETOUR</Button>
                          <Button type="submit" className="w-2/3 h-11 bg-secondary text-black font-black rounded-xl text-xs uppercase">CONFIRMER & PAYER</Button>
                        </div>
                      </div>
                    )}
                  </form>
                </>
              ) : (
                /* ÉCRAN DE FIERTÉ AVEC LE CODE QR DE L'AFFICHE EMBEDDED */
                <div className="text-center space-y-4 py-4 animate-in fade-in zoom-in-95">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto text-secondary">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black uppercase text-white">Votre Billet est prêt !</h3>
                  <p className="text-xs text-muted-foreground">Voici votre pass unique officiel généré pour l'entrée au festival :</p>
                  
                  {/* Visual Souvenir ticket card layout */}
                  <div className="bg-white text-black p-4 rounded-xl space-y-3 shadow-2xl relative text-left">
                    <div className="flex justify-between items-start border-b border-neutral-200 pb-2">
                      <div>
                        <div className="text-[10px] font-black tracking-widest text-primary uppercase">ONE VIBE FEST</div>
                        <div className="text-[14px] font-black uppercase">{formData.name}</div>
                      </div>
                      <span className="text-[9px] bg-black text-white px-2 py-0.5 rounded font-mono font-bold">
                        PASS {formData.passCategory}
                      </span>
                    </div>

                    <div className="flex gap-3 items-center pt-1">
                      <div className="p-2 border-2 border-black rounded bg-neutral-50 shrink-0">
                        <QrCode className="w-14 h-14 text-black" />
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="font-mono font-bold text-neutral-800">{generatedTicket}</div>
                        <div className="text-[10px] text-neutral-500 font-medium">Lieu : Palais des Congrès</div>
                        <div className="text-[10px] text-neutral-500 font-medium">Date : Samedi 15 Juillet 2024</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground">Une copie a été enregistrée dans la base de données. Vous pouvez également retrouver ce billet dans l'onglet <b>Billets & QR</b> du Dashboard Admin.</p>
                  
                  <Button onClick={() => setIsModalOpen(false)} className="w-full bg-primary text-white font-bold uppercase text-xs rounded-xl h-11">
                    Fermer et continuer
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