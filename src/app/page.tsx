
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Music, 
  Palette, 
  Briefcase, 
  Gamepad2, 
  Calendar, 
  MapPin, 
  Ticket,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const universes = [
  {
    title: "VIBE MUSIC",
    icon: <Music className="w-8 h-8" />,
    description: "Musique, showcases, Open Mic, DJ Battle.",
    items: ["Concerts / showcases", "Open Mic", "DJ Battle"],
    image: PlaceHolderImages.find(img => img.id === 'music-vibe')?.imageUrl,
    color: "from-pink-500 to-rose-600"
  },
  {
    title: "VIBE CREATIVE",
    icon: <Palette className="w-8 h-8" />,
    description: "Mode, art, création et Creative Market.",
    items: ["Fashion Show", "Live Painting", "Creative Market"],
    image: PlaceHolderImages.find(img => img.id === 'creative-vibe')?.imageUrl,
    color: "from-purple-500 to-indigo-600"
  },
  {
    title: "VIBE BUSINESS",
    icon: <Briefcase className="w-8 h-8" />,
    description: "Entrepreneuriat, Pitch et rencontres.",
    items: ["Pitch Challenge", "Startup Village", "Networking"],
    image: PlaceHolderImages.find(img => img.id === 'business-vibe')?.imageUrl,
    color: "from-blue-500 to-cyan-600"
  },
  {
    title: "VIBE DIGITAL",
    icon: <Gamepad2 className="w-8 h-8" />,
    description: "Gaming, création de contenu et expériences digitales.",
    items: ["Gaming / E-sport", "Content Challenge", "Digital Exp."],
    image: PlaceHolderImages.find(img => img.id === 'digital-vibe')?.imageUrl,
    color: "from-emerald-500 to-teal-600"
  }
];

const program = [
  { time: "10:00", event: "Ouverture", desc: "Accueil du public" },
  { time: "11:00", event: "VIBE CREATIVE", desc: "Fashion Show / Live Painting" },
  { time: "12:00", event: "VIBE BUSINESS", desc: "ONE VIBE Pitch" },
  { time: "14:00", event: "VIBE DIGITAL", desc: "Gaming Challenge" },
  { time: "16:00", event: "VIBE MUSIC", desc: "Open Mic / DJ Battle" },
  { time: "18:00", event: "GRAND SHOW", desc: "Concerts & performances" },
  { time: "20:00", event: "ONE VIBE CLOSING", desc: "Finale et moment collectif" }
];

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground selection:bg-primary selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tighter text-primary">ONE VIBE</div>
          <div className="hidden md:flex items-center gap-8 font-bold text-sm uppercase tracking-widest">
            <a href="#univers" className="hover:text-primary transition-colors">Univers</a>
            <a href="#programme" className="hover:text-primary transition-colors">Programme</a>
            <a href="#talents" className="hover:text-primary transition-colors">Talents</a>
            <a href="#pass" className="hover:text-primary transition-colors">Pass</a>
          </div>
          <Button className="font-black rounded-full px-6 bg-primary hover:bg-primary/90">
            PRENDRE MON PASS
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={PlaceHolderImages.find(img => img.id === 'hero-bg')?.imageUrl || ''}
            alt="Festival Background"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold uppercase tracking-widest">Samedi 15 Juillet 2024</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <MapPin className="w-4 h-4 text-secondary" />
              <span className="text-sm font-bold uppercase tracking-widest">Palais des Congrès</span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black leading-[0.9] mb-8">
              ONE VIBE <span className="text-primary">FEST</span>
            </h1>
            
            <p className="text-xl md:text-3xl font-medium text-muted-foreground mb-12 leading-tight">
              Une vibe. Des talents. Des créations. Des initiatives.<br />
              <span className="text-foreground font-black">Une seule énergie : la créativité.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-16 px-8 text-lg font-black rounded-full bg-primary hover:bg-primary/90">
                PRENDRE MON PASS <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-8 text-lg font-black rounded-full border-2">
                DÉCOUVRIR LE PROGRAMME
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Univers Section */}
      <section id="univers" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center mb-16">
          <h2 className="text-4xl md:text-6xl mb-4">Quatre univers. Une journée.</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explorez les différentes facettes de la créativité à travers nos 4 espaces thématiques.
          </p>
        </div>

        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {universes.map((u, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="relative group h-[500px] rounded-3xl overflow-hidden cursor-pointer"
            >
              <Image 
                src={u.image || ''} 
                alt={u.title} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-b ${u.color} opacity-60 mix-blend-multiply`} />
              <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                <div className="mb-4 text-white">{u.icon}</div>
                <h3 className="text-2xl text-white mb-2">{u.title}</h3>
                <p className="text-white/80 text-sm mb-6">{u.description}</p>
                <div className="flex flex-wrap gap-2">
                  {u.items.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-white border border-white/20">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Programme Section */}
      <section id="programme" className="py-24">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-16">
          <div className="md:w-1/3">
            <h2 className="text-5xl mb-6 leading-tight">L'EXPÉRIENCE <br /><span className="text-primary">TIME-LINE</span></h2>
            <p className="text-lg text-muted-foreground mb-8">
              Suivez le rythme de la journée. Du réveil créatif au Grand Show final, ne manquez aucun moment fort.
            </p>
            <div className="p-8 rounded-3xl bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-black">12</div>
                <div className="text-sm font-bold uppercase tracking-widest">Activités Majeures</div>
              </div>
              <p className="text-sm">Une programmation dense conçue pour maximiser votre inspiration.</p>
            </div>
          </div>
          
          <div className="md:w-2/3 space-y-4">
            {program.map((p, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors group"
              >
                <div className="w-24 text-2xl font-black text-primary group-hover:scale-110 transition-transform">{p.time}</div>
                <div className="flex-1">
                  <h4 className="text-xl mb-1">{p.event}</h4>
                  <p className="text-muted-foreground">{p.desc}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pass" className="py-24 bg-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16 text-white">
            <h2 className="text-5xl md:text-7xl mb-4">REJOINS LA VIBE</h2>
            <p className="text-xl opacity-80">Choisis ton expérience pour cette journée inoubliable.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Standard Pass */}
            <Card className="bg-background border-none rounded-[2rem] overflow-hidden">
              <CardContent className="p-12">
                <h3 className="text-3xl mb-2">PASS STANDARD</h3>
                <div className="text-5xl font-black mb-8">25 <span className="text-lg">FC</span></div>
                <ul className="space-y-4 mb-12">
                  <li className="flex items-center gap-3 font-medium"><Plus className="w-4 h-4 text-primary" /> Accès complet au festival</li>
                  <li className="flex items-center gap-3 font-medium"><Plus className="w-4 h-4 text-primary" /> Accès aux 4 univers</li>
                  <li className="flex items-center gap-3 font-medium"><Plus className="w-4 h-4 text-primary" /> Participation aux Open Mic</li>
                </ul>
                <Button className="w-full h-16 rounded-full font-black text-lg bg-primary hover:bg-primary/90">
                  ACHETER MAINTENANT
                </Button>
              </CardContent>
            </Card>

            {/* VIP Pass */}
            <Card className="bg-black border-2 border-white/20 rounded-[2rem] overflow-hidden text-white relative">
              <div className="absolute top-6 right-6 px-4 py-1 bg-primary text-[10px] font-black rounded-full uppercase tracking-widest">Premium</div>
              <CardContent className="p-12">
                <h3 className="text-3xl mb-2">PASS VIP</h3>
                <div className="text-5xl font-black mb-8">75 <span className="text-lg">FC</span></div>
                <ul className="space-y-4 mb-12">
                  <li className="flex items-center gap-3 font-medium"><Plus className="w-4 h-4 text-secondary" /> Tous les avantages Standard</li>
                  <li className="flex items-center gap-3 font-medium"><Plus className="w-4 h-4 text-secondary" /> Accès Zone VIP Front-stage</li>
                  <li className="flex items-center gap-3 font-medium"><Plus className="w-4 h-4 text-secondary" /> Fast-pass (Pas d'attente)</li>
                  <li className="flex items-center gap-3 font-medium"><Plus className="w-4 h-4 text-secondary" /> Drink & Snack pack</li>
                </ul>
                <Button className="w-full h-16 rounded-full font-black text-lg bg-white text-black hover:bg-white/90">
                  DEVENIR VIP
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-4xl mb-12 text-center underline decoration-primary underline-offset-8">Des questions ?</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-white/10">
              <AccordionTrigger className="text-lg font-bold">Où se déroule ONE VIBE FEST ?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                L'événement se tiendra au Palais des Congrès, un lieu central et accessible au cœur de la ville.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-white/10">
              <AccordionTrigger className="text-lg font-bold">Peut-on devenir exposant ?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Oui ! Nous accueillons les créateurs, startups et marques. Contactez notre équipe via la section Market pour plus de détails.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-white/10">
              <AccordionTrigger className="text-lg font-bold">À partir de quel âge ?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Le festival est ouvert à tous. Les mineurs doivent être accompagnés d'un adulte.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-20 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="text-4xl font-black text-primary mb-6">ONE VIBE FEST</div>
              <p className="text-xl text-muted-foreground max-w-md">
                Une vibe. Des talents. Des créations. Des initiatives. Une seule énergie : la créativité.
              </p>
            </div>
            <div>
              <h5 className="font-black text-xs uppercase tracking-widest mb-6">Navigation</h5>
              <ul className="space-y-4 text-muted-foreground font-bold">
                <li><a href="#" className="hover:text-primary transition-colors">Programme</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Talents</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pass</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Exposants</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-black text-xs uppercase tracking-widest mb-6">Social</h5>
              <ul className="space-y-4 text-muted-foreground font-bold">
                <li><a href="#" className="hover:text-primary transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">TikTok</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">YouTube</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:row justify-between items-center gap-4 text-sm text-muted-foreground font-bold">
            <p>© 2024 ONE VIBE FEST. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
