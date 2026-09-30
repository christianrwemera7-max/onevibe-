"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap,
  Star,
  ArrowRight,
  Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

import { useDoc, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { doc, collection, increment, setDoc } from 'firebase/firestore';
import { Countdown } from '@/components/Countdown';

const DEFAULT_LOGO_URL = "https://res.cloudinary.com/dvz91qth6/image/upload/v1740261394/one-vibe-logo_t9v6v9.png";

export default function LandingPage() {
  const firestore = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (firestore) {
      const statsRef = doc(firestore, 'analytics', 'global');
      setDoc(statsRef, { visitorCount: increment(1) }, { merge: true });
    }
  }, [firestore]);

  const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'festival') : null, [firestore]);
  const { data: settings } = useDoc(settingsRef);

  const talentsRef = useMemoFirebase(() => firestore ? collection(firestore, 'talents') : null, [firestore]);
  const { data: talents } = useCollection(talentsRef);

  const sponsorsRef = useMemoFirebase(() => firestore ? collection(firestore, 'sponsors') : null, [firestore]);
  const { data: sponsors } = useCollection(sponsorsRef);

  const galleryRef = useMemoFirebase(() => firestore ? collection(firestore, 'gallery') : null, [firestore]);
  const { data: galleryItems } = useCollection(galleryRef);
  
  const ticketingUrl = settings?.ticketingUrl || 'https://omtevents.com';
  const logoUrl = settings?.logoUrl || DEFAULT_LOGO_URL;
  
  const isVideo = (url?: string) => url?.match(/\.(mp4|webm|ogg|mov)$/i) || url?.includes('/video/upload/');

  const heroMediaUrl = settings?.spotVideoUrl || settings?.heroGifUrl || "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmJueHl3N2ZreXV6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lTfuxV6ZoopSve/giphy.gif";

  const getYoutubeId = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen flex flex-col bg-background overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative h-screen flex flex-col items-center justify-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="absolute inset-0 w-full h-full">
            {isVideo(heroMediaUrl) ? (
              <video 
                src={heroMediaUrl} 
                autoPlay 
                muted 
                loop 
                playsInline 
                className="w-full h-full object-cover opacity-60 brightness-110 contrast-125"
              />
            ) : (
              <Image 
                src={heroMediaUrl} 
                alt="Festival Vibe" 
                fill
                className="object-cover opacity-60 brightness-110 contrast-125"
                priority
                unoptimized={true}
              />
            )}
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
        <div className="max-w-5xl mx-auto w-full relative z-10 text-center px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6 md:space-y-10">
            <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-3xl text-[7px] md:text-[9px] font-black uppercase tracking-[0.4em] text-white italic shadow-2xl">
              <Zap className="w-2.5 md:w-3 h-2.5 md:h-3 text-white fill-white" /> 26 JUIN 2027 • KINSHASA
            </div>
            <div className="space-y-4 md:space-y-6">
              <div className="relative h-32 md:h-56 w-full max-w-2xl mx-auto">
                <Image 
                  src={logoUrl} 
                  alt="ONE VIBE FEST" 
                  fill
                  className="object-contain drop-shadow-[0_15px_35px_rgba(255,255,255,0.4)]" 
                  style={{ mixBlendMode: 'screen' }}
                  unoptimized={true}
                />
              </div>
            </div>
            <div className="pt-2"><Countdown targetDate={settings?.eventDate} /></div>
            <div className="mt-8 md:mt-10">
              <Button asChild size="lg" className="h-14 md:h-18 px-10 md:px-14 text-[12px] md:text-[16px] font-black rounded-2xl bg-secondary text-black uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(0,255,255,0.6)] hover:scale-105 transition-all border-none italic group">
                <a href={ticketingUrl} target="_blank">RÉSERVER MON BILLET <Ticket className="ml-2 md:ml-4 w-6 md:w-8 h-6 md:h-8 group-hover:rotate-12 transition-transform" /></a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* VISION SECTION */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-10 relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="space-y-4">
            <div className="text-secondary font-black text-[12px] uppercase tracking-[0.6em] italic">NOTRE VISION</div>
            <h2 className="text-[36px] md:text-[72px] font-black uppercase italic tracking-tighter leading-[0.85] text-white">L'ÉCLOSION DES <span className="text-secondary">POSSIBLES</span></h2>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-[16px] md:text-[24px] text-white/90 leading-relaxed font-bold italic">
            One Vibe Fest est un écosystème où la musique, la créativité et le digital fusionnent pour propulser la jeunesse congolaise. Nous créons un pont entre le talent brut et l'excellence mondiale.
          </motion.p>
        </div>
      </section>

      {/* TÊTES D'AFFICHE */}
      {talents && talents.length > 0 && (
        <section className="py-24 bg-background relative border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-[0.5em] italic opacity-60"><Star className="w-4 h-4 fill-white" /> L'ÉLITE DU FESTIVAL</div>
              <h2 className="text-[32px] md:text-[56px] font-black uppercase italic text-white tracking-tighter">TÊTES <span className="opacity-40">D'AFFICHE</span></h2>
            </div>
            <Button asChild variant="outline" className="h-12 px-8 border-white/20 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-white hover:text-black transition-all italic">
              <Link href="/guests">VOIR TOUT LE CASTING <ArrowRight className="w-4 h-4 ml-3" /></Link>
            </Button>
          </div>
          <div className="relative w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory px-6 pb-12">
            <div className="flex gap-6 md:gap-12 min-w-max">
              {talents.slice(0, 10).map((talent) => (
                <motion.div key={talent.id} className="snap-center w-[85vw] sm:w-[60vw] md:w-[450px]">
                  <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden border-[8px] border-white/10 bg-white/5 shadow-2xl group transition-all duration-700 hover:border-white/30">
                    {talent.imageUrl && <Image src={talent.imageUrl} alt={talent.name} fill className="object-cover transition-all duration-1000 group-hover:scale-110 brightness-[0.8] group-hover:brightness-100" unoptimized={true} />}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
                    <div className="absolute bottom-12 left-12 right-12">
                      <div className="text-[24px] md:text-[32px] font-black text-white uppercase italic truncate mb-2">{talent.name}</div>
                      <div className="inline-flex px-5 py-2 bg-secondary text-black rounded-xl text-[11px] font-black uppercase tracking-widest italic">{talent.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VIBE MOMENTS (GALLERY) */}
      <section className="py-24 bg-background relative overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-3">
            <div className="text-white/40 font-black text-[10px] uppercase tracking-[0.6em] italic">VIBE MOMENTS</div>
            <h2 className="text-[32px] md:text-[56px] font-black uppercase italic text-white tracking-tighter">L'IMMERSION <span className="text-secondary">VISUELLE</span></h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10">
            {galleryItems && galleryItems.length > 0 ? (
              galleryItems.map((item, i) => (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  whileInView={{ opacity: 1, scale: 1 }} 
                  className={`relative aspect-square rounded-[3rem] overflow-hidden border-[6px] border-white/10 group ${i % 5 === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
                >
                  <Image 
                    src={item.imageUrl} 
                    alt="Gallery item" 
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110 brightness-[0.9] group-hover:brightness-100" 
                    unoptimized={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-8 left-8 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                    <div className="text-[11px] font-black text-white uppercase tracking-widest italic">{item.description || 'VIBE 2027'}</div>
                  </div>
                </motion.div>
              ))
            ) : null}
          </div>
        </div>
      </section>

      {/* TEASER YOUTUBE */}
      <section className="py-24 bg-background relative border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <div className="text-white/40 font-black text-[10px] uppercase tracking-[0.5em] italic">LE SPOT OFFICIEL</div>
            <h2 className="text-[30px] md:text-[45px] font-black uppercase italic text-white tracking-tighter">TEASER <span className="opacity-40">2027</span></h2>
          </div>
          <div className="relative aspect-video rounded-[3rem] overflow-hidden border-[10px] border-white/10 shadow-2xl group bg-white/5">
            {getYoutubeId(settings?.teaserUrl) ? (
              <iframe 
                className="absolute inset-0 w-full h-full" 
                src={`https://www.youtube.com/embed/${getYoutubeId(settings?.teaserUrl)}?autoplay=1&mute=1&loop=1&playlist=${getYoutubeId(settings?.teaserUrl)}&controls=1&rel=0&modestbranding=1`} 
                title="Teaser" 
                frameBorder="0" 
                allow="autoplay; encrypted-media" 
                allowFullScreen 
              />
            ) : null}
          </div>
        </div>
      </section>

      {/* SPONSORS CRYSTAL-WHITE */}
      {sponsors && sponsors.length > 0 && (
        <section className="relative py-24 bg-background overflow-hidden border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center gap-12">
              <div className="text-[11px] md:text-[13px] font-black uppercase tracking-[0.6em] text-white/50 italic">PARTENAIRES OFFICIELS</div>
              <div className="w-full bg-white p-10 md:p-20 rounded-[5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] flex flex-wrap justify-center items-center gap-10 md:gap-20">
                {sponsors.map((sponsor) => (
                  <motion.div key={sponsor.id} whileHover={{ scale: 1.1 }} className="h-12 md:h-16 relative w-32 md:w-48 transition-all">
                    <Image 
                      src={sponsor.logoUrl} 
                      alt={sponsor.name} 
                      fill 
                      className="object-contain" 
                      unoptimized={true} 
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="h-20 bg-background" />
    </div>
  );
}