
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
  Ticket,
  ArrowRight,
  Plus,
  CheckCircle2,
  Sparkles,
  Users,
  ShoppingBag,
  Info,
  ChevronRight,
  Send,
  X,
  MessageSquare,
  Bot,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
    icon: <Music className="w-8 h-8 text-pink-400" />,
    description: "L'univers qui donne l'énergie au festival. Vibrations et connexions sonores.",
    activities: [
      { name: "Concerts & Showcases", desc: "Artistes invités + talents émergents incontournables." },
      { name: "ONE VIBE Open Mic", desc: "Une scène libre pour permettre aux jeunes pépites de se révéler." },
      { name: "DJ Battle", desc: "Affrontements rythmés autour de concepts musicaux où le public vote." }
    ],
    image: getImg('music-vibe'),
    color: "from-pink-600 to-rose-700",
    badge: "GRAND SHOW"
  },
  {
    title: "VIBE CREATIVE",
    icon: <Palette className="w-8 h-8 text-purple-400" />,
    description: "Tout ce qui relève de la création artistique pure, visuelle et stylistique.",
    activities: [
      { name: "Fashion Show", desc: "Présentation exclusive de collections par de jeunes créateurs et stylistes." },
      { name: "Live Painting", desc: "Des artistes réalisent des fresques monumentales en direct." },
      { name: "Creative Market", desc: "Un espace réunissant designers, créateurs de mode et artistes visuels." }
    ],
    image: getImg('creative-vibe'),
    color: "from-purple-600 to-indigo-700",
    badge: "FASHION SHOW"
  },
  {
    title: "VIBE BUSINESS",
    icon: <Briefcase className="w-8 h-8 text-blue-400" />,
    description: "L'univers qui donne une impulsion entrepreneuriale et concrétise vos ambitions.",
    activities: [
      { name: "ONE VIBE Pitch", desc: "Des jeunes entrepreneurs pitchent leur projet face à des mentors." },
      { name: "Startup & Brand Village", desc: "Exposition de marques innovantes, services et initiatives d'avenir." },
      { name: "ONE VIBE Connect", desc: "Rencontres B2B stratégiques entre porteurs de projets, marques et investisseurs." }
    ],
    image: getImg('business-vibe'),
    color: "from-blue-600 to-cyan-700",
    badge: "ONE VIBE PITCH"
  },
  {
    title: "VIBE DIGITAL",
    icon: <Gamepad2 className="w-8 h-8 text-teal-400" />,
    description: "Consacré à la culture numérique, au gaming et aux nouvelles plateformes de contenu.",
    activities: [
      { name: "Gaming / E-sport", desc: "Tournois intenses en direct avec cashprize et défis communautaires." },
      { name: "Content Challenge", desc: "Créateurs de contenu qui s'affrontent pour capturer la meilleure vibe." },
      { name: "Digital Experience", desc: "Immersion interactive, démos technologiques et arts numériques." }
    ],
    image: getImg('digital-vibe'),
    color: "from-emerald-600 to-teal-700",
    badge: "GAMING CHALLENGE"
  }
];

const program = [
  { time: "10:00", title: "Ouverture des Portes", subtitle: "Accueil & Goodie Packs", desc: "Immersion immédiate dans l'ambiance avec DJ de bienvenue et ouverture des villages thématiques." },
  { time: "11:00", title: "VIBE CREATIVE Launch", subtitle: "Fashion Show & Live Art", desc: "Lancement des performances artistiques en direct et défilé sur la scène centrale des nouveaux stylistes." },
  { time: "12:00", title: "ONE VIBE PITCH Arena", subtitle: "L'innovation à l'honneur", desc: "Session intense où 8 projets audacieux s'affrontent pour remporter le prix ONE VIBE Business." },
  { time: "14:00", title: "VIBE DIGITAL Tournament", subtitle: "Gaming Challenge & Showmatch", desc: "Grande finale E-sport sur écran géant avec la participation des meilleurs streamers de la communauté." },
  { time: "16:00", title: "VIBE MUSIC Open Mic", subtitle: "Scène ouverte & DJ Battle", desc: "Le public prend le contrôle. Les nouveaux talents vocaux se mesurent suivis d'un battle de scratch légendaire." },
  { time: "18:00", title: "LE GRAND SHOW", subtitle: "Concerts Exclusifs", desc: "Performance majeure réunissant les têtes d'affiche invitées et les révélations de l'année." },
  { time: "20:00", title: "ONE VIBE CLOSING", subtitle: "Célébration & Moment Collectif", desc: "Remise des prix, set de clôture mémorable et annonce des prochaines étapes de la communauté." }
];

const talents = [
  { name: "Alex K.", role: "Musicien & Producteur", type: "ARTISTE", img: getImg('talent-artist') },
  { name: "Sonia M.", role: "Styliste Streetwear", type: "CRÉATEUR", img: getImg('talent-creator') },
  { name: "Idriss T.", role: "Fondateur de TechVibe", type: "ENTREPRENEUR", img: getImg('talent-entrepreneur') }
];

const faqs = [
  { q: "Où se déroule ONE VIBE FEST ?", a: "Le festival se déroule au Palais des Congrès, aménagé en plusieurs zones immersives." },
  { q: "À quelle date ?", a: "L'événement se tiendra le Samedi 15 Juillet 2024 de 10:00 à 21:00." },
  { q: "Quels sont les tarifs ?", a: "Le Pass Standard est à 10.000 FC et le Pass VIP à 30.000 FC." },
  { q: "Comment devenir exposant ?", a: "Utilisez le bouton 'Devenir Exposant' dans la section Market ou contactez-nous via le formulaire." }
];

export default function VibeFestLanding() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  // Registration Modals and forms state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState('STANDARD');
  const [formType, setFormType] = useState<'PASS' | 'EXPOSITOR'>('PASS');
  
  // AI Assistant state
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });

  const registrationsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'registrations');
  }, [firestore]);

  const handleOpenPassForm = (passType: string) => {
    setSelectedPass(passType);
    setFormType('PASS');
    setIsModalOpen(true);
  };

  const handleOpenExpositorForm = () => {
    setFormType('EXPOSITOR');
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      ...formData,
      type: formType,
      passCategory: formType === 'PASS' ? selectedPass : null,
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
      title: formType === 'PASS' ? "Réservation envoyée !" : "Candidature enregistrée !",
      description: "Notre équipe reviendra vers vous très rapidement par email ou téléphone.",
    });

    setFormData({ name: '', email: '', phone: '', company: '', message: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="bg-background text-foreground font-sans selection:bg-primary selection:text-white antialiased min-h-screen">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-primary">ONE VIBE</span>
            <div className="px-2 py-0.5 rounded bg-primary/20 border border-primary/30 text-[10px] font-bold text-primary tracking-widest uppercase">FEST</div>
          </div>
          <div className="hidden lg:flex items-center gap-8 font-bold text-xs uppercase tracking-widest">
            <a href="#univers" className="hover:text-primary transition-colors text-muted-foreground">Univers</a>
            <a href="#programme" className="hover:text-primary transition-colors text-muted-foreground">Programme</a>
            <a href="#talents" className="hover:text-primary transition-colors text-muted-foreground">Talents</a>
            <a href="#pass" className="hover:text-primary transition-colors text-muted-foreground">Pass</a>
            <a href="#market" className="hover:text-primary transition-colors text-muted-foreground">Market</a>
          </div>
          <Button onClick={() => handleOpenPassForm('STANDARD')} className="font-black rounded-full px-6 bg-primary hover:bg-primary/90 text-white">
            PRENDRE MON PASS
          </Button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <Image src={getImg('hero-bg')} alt="Hero" fill className="object-cover opacity-50 mix-blend-screen" priority data-ai-hint="festival crowd" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/80" />
        </div>
        <div className="max-w-7xl mx-auto px-4 w-full relative z-10 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 text-sm font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-primary"><Calendar className="w-4 h-4" /> 15 Juillet 2024</span>
            <span className="flex items-center gap-1.5 text-secondary"><MapPin className="w-4 h-4" /> Palais des Congrès</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-9xl font-black leading-[0.9] tracking-tighter mb-8 uppercase">
            ONE VIBE <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">FEST</span>
          </motion.h1>
          <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl font-medium mb-12">
            Une vibe. Des talents. Des créations. Des initiatives. <br />
            <span className="text-foreground font-black border-b-2 border-secondary/50 pb-1">Une seule énergie : la créativité.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => handleOpenPassForm('STANDARD')} size="lg" className="h-16 px-8 text-base font-black rounded-full bg-primary hover:bg-primary/90 text-white">
              PRENDRE MON PASS <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button asChild size="lg" variant="outline" className="h-16 px-8 text-base font-black rounded-full border-white/20 text-white">
              <a href="#programme">DÉCOUVRIR LE PROGRAMME</a>
            </Button>
          </div>
        </div>
      </section>

      {/* L'EXPÉRIENCE */}
      <section id="univers" className="py-32 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-4xl md:text-6xl uppercase mb-6 font-black tracking-tight">
              Quatre univers. <br />Une journée. <span className="text-secondary">Une communauté.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {universes.map((uni, idx) => (
              <Card key={idx} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden group">
                <div className="relative h-64 w-full">
                  <Image src={uni.image} alt={uni.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute bottom-6 left-6"><h3 className="text-3xl font-black text-white uppercase">{uni.title}</h3></div>
                </div>
                <CardContent className="p-8">
                  <p className="text-muted-foreground text-sm font-medium mb-6">{uni.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {uni.activities.map((act, i) => (
                      <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 transition-colors">
                        <h4 className="font-bold text-sm mb-1">{act.name}</h4>
                        <p className="text-xs text-muted-foreground">{act.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMME */}
      <section id="programme" className="py-32 bg-muted/5">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-24 text-center">LA VIBE <span className="text-primary">TIME-LINE</span></h2>
          <div className="relative border-l border-white/10 pl-8 space-y-12 ml-4">
            {program.map((prog, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="relative group">
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-black border-4 border-primary group-hover:scale-125 transition-transform" />
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex flex-wrap items-baseline gap-3 mb-2">
                    <span className="text-2xl font-black text-primary">{prog.time}</span>
                    <h3 className="text-xl font-bold uppercase">{prog.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">{prog.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TALENTS */}
      <section id="talents" className="py-32 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-black uppercase mb-20 text-center">LES ACTEURS DE LA <span className="text-secondary">VIBE</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {talents.map((t, i) => (
              <div key={i} className="group relative rounded-3xl overflow-hidden aspect-square">
                <Image src={t.img} alt={t.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                <div className="absolute bottom-8 left-8">
                  <div className="text-[10px] font-black bg-secondary text-black px-3 py-1 rounded-full w-fit mb-2">{t.type}</div>
                  <h3 className="text-2xl font-black text-white">{t.name}</h3>
                  <p className="text-sm text-white/60">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PASS */}
      <section id="pass" className="py-32 bg-primary text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-16 text-center">CHOISIR SON EXPÉRIENCE</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-background text-foreground rounded-[2.5rem] p-10 border-none">
              <h3 className="text-xl font-black text-muted-foreground mb-4">PASS STANDARD</h3>
              <div className="text-6xl font-black mb-8">10.000 <span className="text-lg font-bold">FC</span></div>
              <ul className="space-y-4 mb-12">
                <li className="flex gap-3 text-sm font-medium"><CheckCircle2 className="text-primary" /> Accès complet à la journée</li>
                <li className="flex gap-3 text-sm font-medium"><CheckCircle2 className="text-primary" /> Accès aux 4 univers</li>
              </ul>
              <Button onClick={() => handleOpenPassForm('STANDARD')} className="w-full h-16 rounded-full font-black bg-primary text-white uppercase tracking-widest">RÉSERVER MON PASS</Button>
            </Card>
            <Card className="bg-black text-white rounded-[2.5rem] p-10 border-2 border-white/10 relative">
              <div className="absolute top-6 right-8 bg-secondary text-black text-[10px] font-black px-3 py-1 rounded-full">PREMIUM</div>
              <h3 className="text-xl font-black text-white/60 mb-4">PASS VIP</h3>
              <div className="text-6xl font-black mb-8 text-secondary">30.000 <span className="text-lg font-bold text-white/60">FC</span></div>
              <ul className="space-y-4 mb-12">
                <li className="flex gap-3 text-sm font-medium"><CheckCircle2 className="text-secondary" /> Coupe-file & Accès Front-stage</li>
                <li className="flex gap-3 text-sm font-medium"><CheckCircle2 className="text-secondary" /> Salon Networking Talents</li>
              </ul>
              <Button onClick={() => handleOpenPassForm('VIP')} className="w-full h-16 rounded-full font-black bg-white text-black uppercase tracking-widest">DEVENIR VIP</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* VIBE MARKET */}
      <section id="market" className="py-32 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
            <div>
              <h2 className="text-4xl md:text-6xl font-black uppercase mb-4">VIBE <span className="text-primary">MARKET</span></h2>
              <p className="text-muted-foreground max-w-md">L'espace dédié aux créateurs, marques et saveurs locales. Mode, Food, Lifestyle et Innovation.</p>
            </div>
            <Button onClick={handleOpenExpositorForm} variant="outline" className="h-16 px-10 rounded-full border-white/20 text-white font-black uppercase tracking-widest hover:bg-white/5">
              <ShoppingBag className="mr-2" /> DEVENIR EXPOSANT
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative rounded-3xl overflow-hidden h-96 group">
              <Image src={getImg('market-fashion')} alt="Fashion" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><h3 className="text-3xl font-black text-white uppercase italic">STREETWEAR & ART</h3></div>
            </div>
            <div className="relative rounded-3xl overflow-hidden h-96 group">
              <Image src={getImg('market-food')} alt="Food" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><h3 className="text-3xl font-black text-white uppercase italic">FOOD & LIFESTYLE</h3></div>
            </div>
          </div>
        </div>
      </section>

      {/* PARTENAIRES */}
      <section className="py-20 border-y border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground mb-12 italic">Ils contribuent à faire vivre la VIBE</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            <span className="text-2xl font-black italic">DIGI EVENT</span>
            <span className="text-2xl font-black italic">CREATIVE HUB</span>
            <span className="text-2xl font-black italic">NEXT GEN</span>
            <span className="text-2xl font-black italic">VIBE AUDIO</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 bg-black">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-black uppercase text-center mb-20">Des questions ?</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-white/10 rounded-2xl px-6 bg-white/5">
                <AccordionTrigger className="font-bold hover:no-underline py-6">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between gap-16 mb-20">
            <div className="max-w-sm">
              <div className="text-4xl font-black text-primary mb-6">ONE VIBE <br />FEST</div>
              <p className="text-muted-foreground text-sm mb-8">Une seule énergie : la créativité. Rejoignez la communauté le 15 Juillet 2024 au Palais des Congrès.</p>
              <div className="flex gap-4">
                <Button variant="outline" size="icon" className="rounded-full border-white/10"><MessageSquare className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" className="rounded-full border-white/10"><Users className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h4 className="font-black text-xs uppercase text-white/40">Navigation</h4>
                <div className="flex flex-col gap-2 text-sm font-bold">
                  <a href="#" className="hover:text-primary transition-colors">Accueil</a>
                  <a href="#univers" className="hover:text-primary transition-colors">Univers</a>
                  <a href="#programme" className="hover:text-primary transition-colors">Programme</a>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-black text-xs uppercase text-white/40">Participation</h4>
                <div className="flex flex-col gap-2 text-sm font-bold">
                  <a href="#pass" className="hover:text-primary transition-colors">Pass</a>
                  <a href="#market" className="hover:text-primary transition-colors">Market</a>
                  <a href="#talents" className="hover:text-primary transition-colors">Talents</a>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-black text-xs uppercase text-white/40">Réseaux</h4>
                <div className="flex flex-col gap-2 text-sm font-bold">
                  <span>Instagram</span>
                  <span>TikTok</span>
                  <span>Facebook</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <p>© 2024 ONE VIBE FEST. Powered by Digital Entertainment Group.</p>
            <div className="flex gap-8">
              <span>Mentions Légales</span>
              <span>Confidentialité</span>
            </div>
          </div>
        </div>
      </footer>

      {/* AI ASSISTANT */}
      <div className="fixed bottom-8 right-8 z-[60]">
        {!isAiOpen ? (
          <Button onClick={() => setIsAiOpen(true)} className="w-16 h-16 rounded-full bg-secondary hover:bg-secondary/90 text-black shadow-2xl flex items-center justify-center animate-bounce">
            <Bot className="w-8 h-8" />
          </Button>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-80 sm:w-96 bg-neutral-900 border border-white/10 rounded-3xl p-6 shadow-2xl text-white">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-secondary" />
                <span className="text-xs font-black uppercase tracking-widest">VIBE Assistant</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsAiOpen(false)} className="text-white hover:bg-white/5"><X className="w-4 h-4" /></Button>
            </div>
            {aiResponse ? (
              <div className="mb-6 space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl text-sm leading-relaxed border border-white/10">{aiResponse}</div>
                <Button variant="outline" className="w-full text-xs font-black border-white/10" onClick={() => setAiResponse(null)}>AUTRE QUESTION ?</Button>
              </div>
            ) : (
              <form onSubmit={handleAiAsk} className="space-y-4">
                <Textarea value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} placeholder="Posez votre question sur le festival..." className="bg-black/50 border-white/10 min-h-[80px] rounded-xl text-sm" />
                <Button type="submit" disabled={isAiLoading} className="w-full bg-secondary text-black font-black uppercase text-[10px] tracking-widest h-10 rounded-xl">
                  {isAiLoading ? "RÉFLEXION..." : "DEMANDER"}
                </Button>
              </form>
            )}
          </motion.div>
        )}
      </div>

      {/* REGISTRATION MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-neutral-900 border border-white/10 rounded-[2rem] p-8 max-w-md w-full relative text-white">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-white hover:text-primary"><X className="w-6 h-6" /></button>
              <h3 className="text-3xl font-black uppercase mb-2 tracking-tight">
                {formType === 'PASS' ? `PASS ${selectedPass}` : "EXPOSANTS"}
              </h3>
              <p className="text-muted-foreground text-sm mb-8">
                {formType === 'PASS' ? "Réservez votre place pour l'expérience créative de l'année." : "Rejoignez le Vibe Market et présentez votre marque."}
              </p>
              <form onSubmit={handleSubmitRegistration} className="space-y-4">
                <Input name="name" value={formData.name} onChange={handleInputChange} required placeholder="Nom complet" className="bg-black/50 border-white/10 h-14 rounded-2xl" />
                <Input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="Email professionnel" className="bg-black/50 border-white/10 h-14 rounded-2xl" />
                <Input name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="Téléphone (WhatsApp de préf.)" className="bg-black/50 border-white/10 h-14 rounded-2xl" />
                {formType === 'EXPOSITOR' && <Input name="company" value={formData.company} onChange={handleInputChange} required placeholder="Nom de votre marque / startup" className="bg-black/50 border-white/10 h-14 rounded-2xl" />}
                <Textarea name="message" value={formData.message} onChange={handleInputChange} placeholder={formType === 'PASS' ? "Un message pour l'équipe ? (optionnel)" : "Décrivez brièvement votre activité"} className="bg-black/50 border-white/10 rounded-2xl min-h-[100px]" />
                <Button type="submit" className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest mt-6">CONFIRMER MA DEMANDE</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
