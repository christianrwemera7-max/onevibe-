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
  CheckCircle2,
  ShoppingBag,
  X,
  Bot,
  MessageSquare,
  Users,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

import imagesData from './lib/placeholder-images.json';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, OperationType } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
import { askVibeAssistant } from '@/ai/flows/vibe-assistant-flow';

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

const program = [
  { time: "10:00", title: "Ouverture des Portes", desc: "Immersion et ouverture des villages thématiques." },
  { time: "11:00", title: "VIBE CREATIVE Launch", desc: "Performances en direct et défilé sur la scène centrale." },
  { time: "12:00", title: "ONE VIBE PITCH Arena", desc: "8 projets s'affrontent pour le prix business." },
  { time: "14:00", title: "VIBE DIGITAL Tournament", desc: "Grande finale E-sport retransmise sur écran géant." },
  { time: "16:00", title: "VIBE MUSIC Open Mic", desc: "Scène ouverte suivie d'un battle de scratch légendaire." },
  { time: "18:00", title: "LE GRAND SHOW", desc: "Performances exclusives des têtes d'affiches." },
  { time: "20:00", title: "ONE VIBE CLOSING", desc: "Remise des prix, set de clôture mémorable." }
];

const talents = [
  { name: "Alex K.", role: "Musicien & Producteur", type: "ARTISTE", img: getImg('talent-artist') },
  { name: "Sonia M.", role: "Styliste Streetwear", type: "CRÉATEUR", img: getImg('talent-creator') },
  { name: "Idriss T.", role: "Fondateur TechVibe", type: "ENTREPRENEUR", img: getImg('talent-entrepreneur') }
];

const faqs = [
  { q: "Où et quand se déroule le festival ?", a: "Le Samedi 15 Juillet 2024 de 10:00 à 21:00 au Palais des Congrès." },
  { q: "Quels sont les tarifs des pass ?", a: "Le Pass Standard est à 10.000 FC et le Pass VIP est à 30.000 FC." },
  { q: "Comment payer ou devenir exposant ?", a: "Tout se fait en ligne via les formulaires simplifiés acceptant Mobile Money et Cartes." }
];

export default function VibeFestLanding() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  // Modals status
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<'PASS' | 'EXPOSITOR'>('PASS');
  const [step, setStep] = useState<1 | 2>(1);
  
  // AI Assistant state
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    passCategory: 'STANDARD',
    paymentMethod: 'MOBILE_MONEY',
    company: '',
    message: ''
  });

  const registrationsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'registrations');
  }, [firestore]);

  const handleOpenForm = (type: 'PASS' | 'EXPOSITOR', category?: string) => {
    setFormType(type);
    if (category) {
      setFormData(prev => ({ ...prev, passCategory: category }));
    }
    setStep(1);
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

  const handleAiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setIsAiLoading(true);
    try {
      const result = await askVibeAssistant(aiQuestion);
      setAiResponse(result.answer);
    } catch (err) {
      toast({ variant: "destructive", title: "Erreur IA", description: "Impossible de joindre l'assistant." });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationsRef) return;

    const submissionData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      type: formType,
      passCategory: formType === 'PASS' ? formData.passCategory : null,
      paymentMethod: formType === 'PASS' ? formData.paymentMethod : null,
      company: formType === 'EXPOSITOR' ? formData.company : null,
      message: formData.message,
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

    toast({
      title: formType === 'PASS' ? "Commande validée !" : "Candidature reçue !",
      description: formType === 'PASS' ? "Votre billet est en cours de validation." : "Notre équipe examine votre marque.",
    });

    setIsModalOpen(false);
  };

  return (
    <div className="bg-background text-foreground font-sans antialiased min-h-screen selection:bg-primary selection:text-white">
      
      {/* NAVIGATION - Hauteur réduite sur mobile pour économiser l'espace */}
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
            <a href="#market" className="hover:text-primary transition-colors text-muted-foreground">Market</a>
          </div>

          <Button size="sm" onClick={() => handleOpenForm('PASS', 'STANDARD')} className="font-bold rounded-full bg-primary hover:bg-primary/90 text-white text-xs md:text-sm px-4 md:px-6">
            MON PASS
          </Button>
        </div>
      </nav>

      {/* HERO - Compacté sur mobile */}
      <section className="relative min-h-[85vh] md:min-h-screen flex items-center pt-14 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <Image src={getImg('hero-bg')} alt="Festival crowd" fill className="object-cover opacity-40 mix-blend-screen" priority data-ai-hint="festival crowd" />
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

      {/* L'EXPÉRIENCE / 4 UNIVERS - Plus dense pour économiser le scroll */}
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

      {/* PROGRAMME CHRONOLOGIQUE - Compacté */}
      <section id="programme" className="py-12 md:py-24 bg-muted/5">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight mb-10 text-center">LA VIBE <span className="text-primary">TIME-LINE</span></h2>
          
          <div className="relative border-l-2 border-primary/30 pl-4 md:pl-6 space-y-4 ml-2">
            {program.map((prog, i) => (
              <div key={i} className="relative bg-white/5 border border-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors flex items-start gap-3">
                <div className="absolute -left-[23px] top-4 w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm font-black text-primary bg-primary/10 px-2 py-0.5 rounded">{prog.time}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs md:text-sm font-bold text-white uppercase truncate">{prog.title}</h3>
                  <p className="text-[11px] md:text-xs text-muted-foreground line-clamp-2 mt-0.5">{prog.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LES TALENTS - Une ligne sur mobile / grille compacte */}
      <section id="talents" className="py-12 md:py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-5xl font-black uppercase mb-10 text-center">LES ACTEURS DE LA <span className="text-secondary">VIBE</span></h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {talents.map((t, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden aspect-[4/3] sm:aspect-square group">
                <Image src={t.img} alt={t.name} fill className="object-cover" />
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

      {/* FAQ & SÉCURITÉ */}
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

      {/* FOOTER - Très compact */}
      <footer className="bg-black py-10 border-t border-white/10 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="font-black text-primary text-base tracking-tighter">ONE VIBE FEST</div>
          <p className="text-[11px] max-w-md mx-auto">Une journée unique pour connecter la musique, la mode, le business et la culture digitale.</p>
          <div className="text-[10px] uppercase tracking-wider text-white/40 pt-4 border-t border-white/5">
            © 2024 ONE VIBE FEST. Powered by Digi Event.
          </div>
        </div>
      </footer>

      {/* CONVERSION QUICK MODAL (2 ETAPES / PAYMENTS SIMPLIFIÉS) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-neutral-950 border border-white/10 rounded-2xl p-5 max-w-sm w-full relative text-white max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
              
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
                        CHOISIR LE LE PAIEMENT
                      </Button>
                    ) : (
                      <Button type="submit" className="w-full h-11 bg-primary text-white font-bold rounded-xl text-xs uppercase mt-2">
                        SOUMETTRE MA CANDIDATURE
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="space-y-4 animate-fadeIn">
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
                      Montant total dû : <span className="text-white font-bold">{formData.passCategory === 'VIP' ? '30.000 FC' : '10.000 FC'}</span>. Le paiement sera initié après confirmation.
                    </div>

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3 h-11 border-white/10 text-white text-xs">RETOUR</Button>
                      <Button type="submit" className="w-2/3 h-11 bg-secondary text-black font-black rounded-xl text-xs uppercase">CONFIRMER & PAYER</Button>
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COIN IA / ASSISTANT SMART - Version compacte */}
      <div className="fixed bottom-4 right-4 z-50">
        {!isAiOpen ? (
          <Button onClick={() => setIsAiOpen(true)} className="w-12 h-12 rounded-full bg-secondary hover:bg-secondary/90 text-black shadow-xl flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </Button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-72 bg-neutral-900 border border-white/10 rounded-2xl p-4 shadow-xl text-white">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-secondary" />
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">VIBE Assistant</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsAiOpen(false)} className="h-6 w-6 text-white"><X className="w-3.5 h-3.5" /></Button>
            </div>

            {aiResponse ? (
              <div className="space-y-2">
                <div className="p-2.5 bg-black/50 rounded-xl text-xs leading-relaxed border border-white/5 max-h-48 overflow-y-auto">{aiResponse}</div>
                <Button size="sm" variant="outline" className="w-full text-[10px] font-bold h-8 border-white/10" onClick={() => setAiResponse(null)}>AUTRE QUESTION ?</Button>
              </div>
            ) : (
              <form onSubmit={handleAiAsk} className="space-y-2">
                <Textarea value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} placeholder="Tarifs, accès, programme..." className="bg-black border-white/10 min-h-[60px] text-xs rounded-lg" />
                <Button type="submit" disabled={isAiLoading} className="w-full bg-secondary text-black font-bold uppercase text-[9px] tracking-wider h-8 rounded-lg">
                  {isAiLoading ? "RECHERCHE..." : "DEMANDER"}
                </Button>
              </form>
            )}
          </motion.div>
        )}
      </div>

    </div>
  );
}
