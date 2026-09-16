
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
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

// Import references safely from the generated placeholders config file
import imagesData from './lib/placeholder-images.json';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, OperationType } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

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

const partners = [
  "Digital Entertainment Group", "Digi Event", "Vibe Audio Pro", "Creative Hub", "NextGen Startup"
];

const faqs = [
  { q: "Où se déroule ONE VIBE FEST ?", a: "Le festival se déroule en plein cœur de la ville, au prestigieux Palais des Congrès, aménagé spécialement pour l'occasion en plusieurs zones immersives." },
  { q: "À quelle date et quels horaires ?", a: "L'événement se tiendra le Samedi 15 Juillet 2024 de 10:00 à 21:00 en continu." },
  { q: "Quel est le prix du pass et comment l'acheter ?", a: "Le Pass Standard est à 10.000 FC et le Pass VIP à 30.000 FC. Vous pouvez le réserver directement en ligne sur ce site via le parcours sécurisé opéré en partenariat avec Digi Event." },
  { q: "Comment devenir exposant ou partenaire ?", a: "Il vous suffit de remplir le formulaire dédié dans la section 'Vibe Market' ou 'Contact' directement plus bas sur cette page. Notre équipe vous recontactera sous 48h." },
  { q: "Qu'inclut l'accès VIP ?", a: "Le Pass VIP comprend un accès coupe-file prioritaire, une place réservée au premier rang 'Front-stage', l'accès au salon de networking des talents et un pack exclusif de bienvenue (boisson & snacks inclus)." }
];

export default function VibeFestLanding() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  // Registration Modals and forms state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState('STANDARD');
  const [formType, setFormType] = useState<'PASS' | 'EXPOSITOR'>('PASS');
  
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

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationsRef) return;

    const submissionData = {
      ...formData,
      type: formType,
      passCategory: formType === 'PASS' ? selectedPass : null,
      createdAt: new Date().toISOString()
    };

    // Non-blocking firestore mutation call as requested by guidelines
    addDoc(registrationsRef, submissionData)
      .catch((error) => {
        const permissionError = new FirestorePermissionError({
          path: registrationsRef.path,
          operation: OperationType.CREATE,
          requestResourceData: submissionData,
        }, error);
        errorEmitter.emit('permission-error', permissionError);
      });

    // Optimistic user feedback
    toast({
      title: "Demande enregistrée avec succès !",
      description: formType === 'PASS' 
        ? `Votre pass ${selectedPass} a été pré-réservé. Vous recevrez les instructions par email.` 
        : "Votre candidature en tant qu'exposant a bien été transmise à l'équipe ONE VIBE.",
    });

    // Reset fields and close modal
    setFormData({ name: '', email: '', phone: '', company: '', message: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="bg-background text-foreground font-sans selection:bg-primary selection:text-white antialiased min-h-screen">
      
      {/* 1. NAVIGATION FIXED BAR */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-primary bg-clip-text">ONE VIBE</span>
            <div className="px-2 py-0.5 rounded bg-primary/20 border border-primary/30 text-[10px] font-bold text-primary tracking-widest uppercase">FEST</div>
          </div>
          <div className="hidden lg:flex items-center gap-8 font-bold text-xs uppercase tracking-widest">
            <a href="#univers" className="hover:text-primary transition-colors text-muted-foreground hover:text-foreground">Univers</a>
            <a href="#programme" className="hover:text-primary transition-colors text-muted-foreground hover:text-foreground">Programme</a>
            <a href="#talents" className="hover:text-primary transition-colors text-muted-foreground hover:text-foreground">Talents</a>
            <a href="#pass" className="hover:text-primary transition-colors text-muted-foreground hover:text-foreground">Pass</a>
            <a href="#market" className="hover:text-primary transition-colors text-muted-foreground hover:text-foreground">Market</a>
          </div>
          <Button 
            onClick={() => handleOpenPassForm('STANDARD')}
            className="font-black rounded-full px-6 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105"
          >
            PRENDRE MON PASS
          </Button>
        </div>
      </nav>

      {/* 1. HERO SECTION (ACCUEIL) */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <Image 
            src={getImg('hero-bg')}
            alt="ONE VIBE FEST Atmosphere"
            fill
            className="object-cover opacity-50 mix-blend-screen"
            priority
            data-ai-hint="festival crowd"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/80" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="max-w-7xl mx-auto px-4 w-full relative z-10 py-12">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex flex-wrap items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 text-sm font-bold uppercase tracking-wider"
            >
              <span className="flex items-center gap-1.5 text-primary">
                <Calendar className="w-4 h-4" /> Samedi 15 Juillet 2024
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20 hidden sm:inline" />
              <span className="flex items-center gap-1.5 text-secondary">
                <MapPin className="w-4 h-4" /> Palais des Congrès
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tighter mb-8 uppercase"
            >
              ONE VIBE <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">FEST</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-lg md:text-2xl text-muted-foreground max-w-2xl font-medium mb-12 leading-relaxed"
            >
              Une vibe. Des talents. Des créations. Des initiatives. <br />
              <span className="text-foreground font-black border-b-2 border-secondary/50 pb-1">Une seule énergie : la créativité.</span>
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button 
                onClick={() => handleOpenPassForm('STANDARD')}
                size="lg" 
                className="h-16 px-8 text-base font-black rounded-full bg-primary hover:bg-primary/90 text-white transition-all hover:translate-x-1"
              >
                PRENDRE MON PASS <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline" 
                className="h-16 px-8 text-base font-black rounded-full border-white/20 hover:bg-white/5 transition-all text-white"
              >
                <a href="#programme">DÉCOUVRIR LE PROGRAMME</a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. L'EXPÉRIENCE (4 UNIVERS × 3 ACTIVITÉS = 12 EXPÉRIENCES) */}
      <section id="univers" className="py-32 bg-gradient-to-b from-black to-muted/20 relative">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-4xl md:text-6xl uppercase mb-6 font-black tracking-tight">
              Quatre univers. <br />Une journée. <span className="text-secondary">Une communauté.</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              Explorez les 12 piliers d'expérience de ONE VIBE FEST. Chaque univers propose une locomotive majeure complétée par des activités hautement interactives.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {universes.map((uni, idx) => (
              <Card key={idx} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md group hover:border-white/20 transition-all duration-300">
                <div className="relative h-64 w-full">
                  <Image 
                    src={uni.image} 
                    alt={uni.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  
                  <div className="absolute top-6 left-6 p-3 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
                    {uni.icon}
                  </div>

                  <div className="absolute top-6 right-6 px-4 py-1.5 bg-primary rounded-full text-xs font-black uppercase tracking-widest text-white shadow-lg">
                    ✨ {uni.badge}
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight">{uni.title}</h3>
                  </div>
                </div>

                <CardContent className="p-8 space-y-6">
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                    {uni.description}
                  </p>
                  
                  <div className="border-t border-white/10 pt-6 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" /> 3 Activités Clés :
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {uni.activities.map((act, actIdx) => (
                        <div key={actIdx} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <h4 className="font-bold text-sm text-foreground mb-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {act.name}
                          </h4>
                          <p className="text-xs text-muted-foreground font-medium leading-normal">{act.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </section>

      {/* 3. PROGRAMME INTERACTIF CHRONOLOGIQUE */}
      <section id="programme" className="py-32 bg-black relative">
        <div className="max-w-5xl mx-auto px-4">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-6">
            <div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
                L'EXPÉRIENCE <br /><span className="text-primary">TIME-LINE</span>
              </h2>
              <p className="text-muted-foreground font-medium max-w-xl">
                Suivez le rythme de la journée. Du réveil créatif au Grand Show final, ne manquez aucun temps fort.
              </p>
            </div>
            <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shrink-0">
              <div className="text-3xl font-black text-secondary">12</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Expériences uniques condensées</div>
            </div>
          </div>

          <div className="relative border-l border-white/10 pl-6 md:pl-12 space-y-12 ml-4">
            {program.map((prog, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative group"
              >
                {/* Timeline Dot Indicator */}
                <div className="absolute -left-[31px] md:-left-[55px] top-1 w-5 h-5 rounded-full bg-black border-4 border-primary group-hover:border-secondary transition-colors duration-300" />

                <div className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 group-hover:bg-white/10 transition-all duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-black tracking-tight text-primary">{prog.time}</span>
                      <h3 className="text-xl font-bold uppercase tracking-wide text-foreground">{prog.title}</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-wider text-secondary uppercase">
                      {prog.subtitle}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-3xl">
                    {prog.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. LES TALENTS */}
      <section id="talents" className="py-32 bg-muted/10 relative">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-2xl mx-auto mb-24">
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-6 tracking-tight">LES ACTEURS DE LA VIBE</h2>
            <p className="text-lg text-muted-foreground font-medium">
              Musiciens, stylistes ou entrepreneurs, ils ne sont pas de simples intervenants : ils font vibrer le festival.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {talents.map((tal, idx) => (
              <div key={idx} className="group relative rounded-3xl overflow-hidden aspect-square bg-neutral-900 border border-white/10">
                <Image 
                  src={tal.img} 
                  alt={tal.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[10px] font-black tracking-widest text-secondary">
                  {tal.type}
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1">{tal.name}</h3>
                  <p className="text-sm text-white/70 font-medium tracking-wide">{tal.role}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. ONE VIBE PASS (TARIFS & ACCÈS) */}
      <section id="pass" className="py-32 bg-primary relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">REJOINS LA VIBE</h2>
            <p className="text-xl opacity-90 font-medium">
              Choisissez l'expérience adaptée pour cette journée unique. Places limitées par catégorie.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Standard Pass */}
            <Card className="bg-background border-none rounded-[2.5rem] overflow-hidden shadow-2xl relative">
              <CardContent className="p-8 md:p-12 text-foreground">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black uppercase tracking-wider text-muted-foreground">PASS STANDARD</h3>
                  <Ticket className="w-6 h-6 text-primary" />
                </div>
                <div className="text-6xl font-black text-foreground mb-8 tracking-tighter">
                  10.000 <span className="text-lg font-bold text-muted-foreground uppercase tracking-wider">FC</span>
                </div>
                
                <div className="space-y-4 mb-12">
                  <div className="flex items-center gap-3 font-medium text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Accès complet à la journée du festival
                  </div>
                  <div className="flex items-center gap-3 font-medium text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Accès libre aux 4 grands univers
                  </div>
                  <div className="flex items-center gap-3 font-medium text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Participation libre à l'Open Mic & DJ Battle
                  </div>
                  <div className="flex items-center gap-3 font-medium text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Entrée au Creative & Brand Market
                  </div>
                </div>

                <Button 
                  onClick={() => handleOpenPassForm('STANDARD')}
                  className="w-full h-16 rounded-full font-black text-sm uppercase bg-primary hover:bg-primary/90 text-white tracking-widest shadow-lg shadow-primary/20"
                >
                  ACHETER MON PASS
                </Button>
              </CardContent>
            </Card>

            {/* VIP Pass */}
            <Card className="bg-black border-2 border-white/20 rounded-[2.5rem] overflow-hidden shadow-2xl text-white relative">
              <div className="absolute top-6 right-6 px-4 py-1.5 bg-secondary text-[10px] font-black rounded-full uppercase tracking-widest text-black">
                EXPÉRIENCE PREMIUM
              </div>
              
              <CardContent className="p-8 md:p-12">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black uppercase tracking-wider text-white/60">PASS VIP</h3>
                  <Sparkles className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-6xl font-black text-white mb-8 tracking-tighter">
                  30.000 <span className="text-lg font-bold text-white/60 uppercase tracking-wider">FC</span>
                </div>
                
                <div className="space-y-4 mb-12">
                  <div className="flex items-center gap-3 font-medium text-sm text-white/90">
                    <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" /> Tous les avantages du Pass Standard
                  </div>
                  <div className="flex items-center gap-3 font-medium text-sm text-white/90">
                    <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" /> Accès exclusif Zone VIP Front-stage
                  </div>
                  <div className="flex items-center gap-3 font-medium text-sm text-white/90">
                    <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" /> Fast-pass coupe-file à l'entrée et aux stands
                  </div>
                  <div className="flex items-center gap-3 font-medium text-sm text-white/90">
                    <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" /> Pack boissons & snacks premium offert
                  </div>
                  <div className="flex items-center gap-3 font-medium text-sm text-white/90">
                    <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" /> Accès au salon privé des artistes & entrepreneurs
                  </div>
                </div>

                <Button 
                  onClick={() => handleOpenPassForm('VIP')}
                  className="w-full h-16 rounded-full font-black text-sm uppercase bg-white text-black hover:bg-neutral-100 tracking-widest shadow-xl"
                >
                  DEVENIR VIP
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center text-xs font-bold tracking-widest uppercase opacity-80">
            🔒 Billetterie officielle opérée par Digital Entertainment Group / Digi Event
          </div>
        </div>
      </section>

      {/* 6. VIBE MARKET */}
      <section id="market" className="py-32 bg-gradient-to-b from-black via-muted/5 to-black relative">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-20">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-6xl font-black uppercase mb-4 tracking-tight">VIBE MARKET</h2>
              <p className="text-muted-foreground font-medium">
                Le pôle d'exposition et de commerce du festival. Découvrez ou exposez les marques qui réinventent les codes.
              </p>
              
              <div className="flex flex-wrap gap-3 mt-8">
                {["Mode", "Food", "Lifestyle", "Créateurs", "Startups", "Marques", "Entrepreneurs"].map((cat, id) => (
                  <span key={id} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-foreground">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md max-w-sm text-center shrink-0">
              <ShoppingBag className="w-10 h-10 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold uppercase mb-2">Rejoignez l'aventure</h3>
              <p className="text-xs text-muted-foreground font-medium mb-6">
                Vous êtes un jeune créateur ou portez un projet innovant ? Boostez votre visibilité.
              </p>
              <Button 
                onClick={handleOpenExpositorForm}
                className="w-full font-black rounded-full bg-secondary hover:bg-secondary/90 text-black uppercase tracking-wider text-xs"
              >
                DEVENIR EXPOSANT
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative h-80 rounded-3xl overflow-hidden border border-white/10 group">
              <Image 
                src={getImg('market-fashion')}
                alt="Exposants Mode Streetwear"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h4 className="text-xl font-bold uppercase text-white">Pop-ups Mode & Art</h4>
                <p className="text-xs text-white/80 font-medium">Créations originales en séries limitées.</p>
              </div>
            </div>

            <div className="relative h-80 rounded-3xl overflow-hidden border border-white/10 group">
              <Image 
                src={getImg('market-food')}
                alt="Exposants Food truck"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h4 className="text-xl font-bold uppercase text-white">Corner Food & Lifestyle</h4>
                <p className="text-xs text-white/80 font-medium">Une gastronomie urbaine et créative.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. PARTENAIRES */}
      <section className="py-24 bg-black border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-8">
            Ils contribuent à faire vivre la VIBE.
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            {partners.map((partner, idx) => (
              <span key={idx} className="text-lg md:text-2xl font-black text-white/80 uppercase tracking-tighter hover:text-primary transition-colors duration-300 select-none">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 8. GALERIE / VIBE MOMENTS */}
      <section className="py-32 bg-muted/5 relative">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-xl mx-auto mb-24">
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-4 tracking-tight">VIBE MOMENTS</h2>
            <p className="text-muted-foreground font-medium text-sm">
              Revivez en images les prémices et l'effervescence de la préparation de cette journée mémorable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative h-96 rounded-3xl overflow-hidden border border-white/10">
              <Image 
                src={getImg('moment-1')}
                alt="Concert Performance Moment"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            
            <div className="relative h-96 rounded-3xl overflow-hidden border border-white/10">
              <Image 
                src={getImg('moment-2')}
                alt="Live painting wall preview"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </div>

        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section className="py-32 bg-black relative">
        <div className="max-w-4xl mx-auto px-4">
          
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">Des questions ?</h2>
            <p className="text-muted-foreground font-medium text-sm">Toutes les informations essentielles pour bien préparer votre venue.</p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-white/10 rounded-2xl px-6 bg-white/5 overflow-hidden">
                <AccordionTrigger className="text-base font-bold text-foreground py-5 hover:no-underline hover:text-primary transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm font-medium leading-relaxed pb-5 pt-1">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

        </div>
      </section>

      {/* 10. CONTACT & NEWSLETTER */}
      <section className="py-24 bg-gradient-to-t from-black to-muted/20 border-t border-white/10 relative">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black uppercase mb-4 tracking-tight">RESTEZ DANS LA BOUCLE</h2>
          <p className="text-muted-foreground font-medium text-sm mb-12 max-w-lg mx-auto">
            Une question spécifique ? Une envie d'implication de dernière minute ? Laissez-nous un message et rejoignez la dynamique.
          </p>

          <form onSubmit={handleSubmitRegistration} className="space-y-4 text-left p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Nom complet</label>
                <Input 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required 
                  placeholder="Votre nom" 
                  className="bg-black/40 border-white/10 rounded-xl text-white h-12"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Email</label>
                <Input 
                  type="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                  placeholder="nom@exemple.com" 
                  className="bg-black/40 border-white/10 rounded-xl text-white h-12"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Message ou Projet</label>
              <Textarea 
                name="message" 
                value={formData.message}
                onChange={handleInputChange}
                required 
                placeholder="Dites-nous tout..." 
                className="bg-black/40 border-white/10 rounded-xl text-white min-h-[100px]"
              />
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-wider text-xs">
              ENVOYER MON MESSAGE <Send className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-black py-20 border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2 space-y-4">
              <div className="text-3xl font-black text-primary tracking-tighter">ONE VIBE FEST</div>
              <p className="text-muted-foreground font-medium text-sm max-w-sm leading-relaxed">
                Une vibe. Des talents. Des créations. Des initiatives. <br />
                Une seule énergie : la créativité.
              </p>
            </div>
            <div>
              <h5 className="font-black text-xs uppercase tracking-widest text-secondary mb-6">Navigation</h5>
              <ul className="space-y-3 text-muted-foreground font-bold text-xs uppercase tracking-wider">
                <li><a href="#univers" className="hover:text-primary transition-colors">Univers</a></li>
                <li><a href="#programme" className="hover:text-primary transition-colors">Programme</a></li>
                <li><a href="#talents" className="hover:text-primary transition-colors">Talents</a></li>
                <li><a href="#pass" className="hover:text-primary transition-colors">Pass Pass</a></li>
                <li><a href="#market" className="hover:text-primary transition-colors">Exposants</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-black text-xs uppercase tracking-widest text-secondary mb-6">Social</h5>
              <ul className="space-y-3 text-muted-foreground font-bold text-xs uppercase tracking-wider">
                <li><a href="#" className="hover:text-primary transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">TikTok</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">YouTube</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <p>© 2024 ONE VIBE FEST. Tous droits réservés.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
              <a href="#" className="hover:text-white transition-colors">Digi Event Solutions</a>
            </div>
          </div>
        </div>
      </footer>

      {/* DYNAMIC REGISTRATION/CTA POPUP MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full relative text-white"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-2xl font-black uppercase mb-2 flex items-center gap-2 tracking-tight">
                {formType === 'PASS' ? "RÉSERVATION PASS" : "CANDIDATURE EXPOSITOR"}
              </h3>
              <p className="text-xs text-muted-foreground font-medium mb-6">
                {formType === 'PASS' 
                  ? `Finalisez votre demande d'acquisition pour le Pass ${selectedPass}.` 
                  : "Complétez vos coordonnées professionnelles pour exposer au Vibe Market."}
              </p>

              <form onSubmit={handleSubmitRegistration} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Nom complet</label>
                  <Input 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Votre nom"
                    className="bg-black/50 border-white/10 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Email</label>
                  <Input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="nom@exemple.com"
                    className="bg-black/50 border-white/10 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Téléphone</label>
                  <Input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+243..."
                    className="bg-black/50 border-white/10 text-white rounded-xl"
                  />
                </div>

                {formType === 'EXPOSITOR' && (
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Nom de la Marque ou Startup</label>
                    <Input 
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      placeholder="Ex: Vibe Wear"
                      className="bg-black/50 border-white/10 text-white rounded-xl"
                    />
                  </div>
                )}

                <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest mt-4">
                  {formType === 'PASS' ? "CONFIRMER MA RÉSERVATION" : "SOUMETTRE MON DOSSIER"}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
