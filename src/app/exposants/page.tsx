
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Zap, QrCode, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useUser, useMemoFirebase, useDoc } from '@/firebase';
import { collection, addDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function ExposantsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'FORM' | 'TICKET'>('FORM');
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [generatedTicket, setGeneratedTicket] = useState<string | null>(null);

  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(settingsRef);

  const registrationsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'registrations');
  }, [firestore]);

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationsRef || !user) return;

    const uniqueTicketId = `OVF-STAND-${Math.floor(100000 + Math.random() * 900000)}`;
    const submissionData = {
      userId: user.uid,
      name: formData.name,
      email: user.email,
      phone: formData.phone,
      type: 'EXPOSITOR',
      ticketCode: uniqueTicketId,
      createdAt: new Date().toISOString()
    };

    addDoc(registrationsRef, submissionData)
      .then(() => {
        setGeneratedTicket(uniqueTicketId);
        setModalStep('TICKET');
        toast({ title: "Demande envoyée !", description: "Votre dossier est en cours d'examen." });
      })
      .catch((error) => {
        toast({ variant: "destructive", title: "Erreur", description: "Impossible d'envoyer la demande." });
      });
  };

  const exposantsImg = settings?.exposantsImg;

  return (
    <div className="pt-28 pb-16 bg-transparent min-h-screen relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="inline-block p-4 bg-secondary/10 rounded-xl border border-secondary/20">
              <Store className="w-6 h-6 text-secondary" />
            </div>
            <h1 className="text-[22px] md:text-[28px] font-black tracking-tighter uppercase italic leading-tight text-white">
              VOTRE MARQUE <br />
              <span className="text-secondary">AU SOMMET</span>
            </h1>
            <p className="text-[12px] text-muted-foreground leading-relaxed italic opacity-80 max-w-lg">
              Devenez exposant à {settings?.eventName || 'ONE VIBE FEST'} et connectez-vous avec des milliers de passionnés. Profitez d'un emplacement stratégique.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "VISIBILITÉ", value: "5000+", desc: "Public qualifié" },
                { label: "ESPACE", value: "50+", desc: "Stands premium" }
              ].map((stat, i) => (
                <div key={i} className="p-6 bg-white/5 rounded-2xl md:rounded-[2rem] border border-white/5 shadow-xl">
                  <div className="text-[18px] md:text-[22px] font-black text-white mb-1 italic">{stat.value}</div>
                  <div className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>

            <Button 
              onClick={() => setIsModalOpen(true)}
              size="lg" 
              className="h-14 px-10 text-[9px] font-black rounded-full bg-secondary text-black uppercase tracking-[0.2em] shadow-xl shadow-secondary/20 hover:scale-105 transition-all w-full sm:w-auto"
            >
              RÉSERVER MON STAND
            </Button>
          </motion.div>

          <div className="relative aspect-[4/5] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl group bg-white/5">
            {exposantsImg ? (
              <Image 
                src={exposantsImg} 
                alt="Exposant" 
                fill 
                className="object-cover transition-all duration-700 group-hover:scale-105" 
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                <Store className="w-10 h-10 text-white/10" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-6 bg-black/60 backdrop-blur-2xl rounded-2xl md:rounded-[2rem] border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-4 h-4 text-secondary" />
                <h3 className="text-[16px] font-black text-white uppercase italic">Impact VIBE</h3>
              </div>
              <p className="text-[9px] text-white/80 font-black uppercase tracking-widest leading-relaxed italic">Boostez votre business dans l'écosystème le plus dynamique de la capitale.</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.98 }} 
              className="bg-neutral-900 border border-white/10 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 max-w-lg w-full relative text-white shadow-2xl"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              
              {modalStep === 'FORM' ? (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-secondary/20">
                      <Store className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="text-[20px] font-black uppercase italic">DOSSIER STAND</h3>
                    <p className="text-[8px] text-muted-foreground uppercase tracking-[0.3em] font-black mt-1 italic">Rejoignez l'élite</p>
                  </div>

                  <form onSubmit={handleSubmitRegistration} className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[8px] uppercase font-black tracking-widest text-muted-foreground mb-1.5 block ml-1">NOM DE MARQUE</label>
                        <Input 
                          placeholder="Ex: KIN VIBE SHOP" 
                          required 
                          className="bg-black border-white/10 h-12 text-sm rounded-xl"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase font-black tracking-widest text-muted-foreground mb-1.5 block ml-1">NUMÉRO WHATSAPP</label>
                        <Input 
                          placeholder="+243 ..." 
                          required 
                          type="tel"
                          className="bg-black border-white/10 h-12 text-sm rounded-xl"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-14 bg-secondary text-black font-black rounded-xl text-[9px] uppercase tracking-widest shadow-lg shadow-secondary/10 transition-all mt-4">
                      ENVOYER LA CANDIDATURE
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="text-center space-y-8">
                  <div className="w-20 h-20 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto text-secondary border border-secondary/20">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <h3 className="text-[20px] font-black uppercase italic">DOSSIER REÇU</h3>
                  
                  <div className="bg-white text-black p-8 rounded-[2rem] space-y-6 text-left relative overflow-hidden shadow-xl">
                    <div className="border-b border-dashed border-neutral-200 pb-6">
                      <div className="text-[8px] font-black text-secondary uppercase mb-1">STAND CONFIRMATION ID</div>
                      <div className="text-[18px] font-black uppercase tracking-tighter italic">{formData.name}</div>
                    </div>
                    <div className="flex items-center gap-5">
                      <QrCode className="w-16 h-16 text-black" />
                      <div className="space-y-1.5">
                        <div className="font-mono text-secondary text-[12px] font-black tracking-tighter">{generatedTicket}</div>
                        <div className="text-[8px] uppercase font-black text-muted-foreground leading-tight">CONTACT SOUS 48H</div>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => setIsModalOpen(false)} className="w-full h-14 bg-white/5 border border-white/10 text-white font-black rounded-xl uppercase text-[9px] tracking-widest hover:bg-white/10 transition-colors">FERMER LE DOSSIER</Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
