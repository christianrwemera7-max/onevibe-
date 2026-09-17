
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Zap, QrCode, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, OperationType } from '@/firebase/errors';
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

  const registrationsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'registrations');
  }, [firestore]);

  const handleSubmitRegistration = async (e: React.FormEvent) => {
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

    try {
      await addDoc(registrationsRef, submissionData);
      setGeneratedTicket(uniqueTicketId);
      setModalStep('TICKET');
      toast({ title: "Demande envoyée !", description: "Votre dossier est en cours d'examen." });
    } catch (error) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: registrationsRef.path,
        operation: OperationType.CREATE,
        requestResourceData: submissionData,
      }, error));
    }
  };

  return (
    <div className="pt-32 pb-20 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div className="inline-block p-5 bg-secondary/10 rounded-2xl border border-secondary/20">
              <Store className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-[25px] font-black tracking-tighter uppercase italic leading-tight">
              VOTRE MARQUE <br />
              <span className="text-secondary">AU SOMMET</span>
            </h1>
            <p className="text-[13px] text-muted-foreground leading-relaxed italic opacity-80 max-w-lg">
              Devenez exposant à ONE VIBE FEST 2027 et connectez-vous avec plus de 5000 festivaliers passionnés de culture, d'innovation et de style. Profitez d'un emplacement stratégique au cœur de Kinshasa.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: "VISIBILITÉ", value: "5000+", desc: "Public qualifié" },
                { label: "ESPACE", value: "50+", desc: "Stands premium" }
              ].map((stat, i) => (
                <div key={i} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 shadow-xl">
                  <div className="text-[22px] font-black text-white mb-2 italic">{stat.value}</div>
                  <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">{stat.label}</div>
                  <div className="text-[8px] text-secondary uppercase font-bold mt-2">{stat.desc}</div>
                </div>
              ))}
            </div>

            <Button 
              onClick={() => setIsModalOpen(true)}
              size="lg" 
              className="h-16 px-12 text-[10px] font-black rounded-full bg-secondary text-black uppercase tracking-[0.2em] shadow-2xl shadow-secondary/20 hover:scale-105 transition-all"
            >
              RÉSERVER MON STAND
            </Button>
          </motion.div>

          <div className="relative aspect-[4/5] max-w-[550px] rounded-[3.5rem] overflow-hidden border border-white/10 shadow-2xl group mx-auto lg:mx-0">
            <Image 
              src="https://picsum.photos/seed/market1/800/1000" 
              alt="Exposant" 
              fill 
              className="object-cover transition-all duration-700 group-hover:scale-105" 
              data-ai-hint="exhibition stand festival" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 p-8 bg-black/60 backdrop-blur-2xl rounded-[2rem] border border-white/10">
              <div className="flex items-center gap-4 mb-3">
                <Zap className="w-5 h-5 text-secondary" />
                <h3 className="text-[18px] font-black text-white uppercase italic">Impact VIBE</h3>
              </div>
              <p className="text-[10px] text-white/90 font-black uppercase tracking-widest leading-relaxed italic">Boostez votre business dans l'écosystème le plus dynamique de Kinshasa.</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-neutral-900 border border-white/10 rounded-[3rem] p-12 max-w-lg w-full relative text-white shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-2 text-muted-foreground hover:text-white transition-colors"><X className="w-6 h-6" /></button>
              
              {modalStep === 'FORM' ? (
                <div className="space-y-10">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-secondary/20">
                      <Store className="w-7 h-7 text-secondary" />
                    </div>
                    <h3 className="text-[22px] font-black uppercase italic">DOSSIER STAND</h3>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-black mt-2 italic">Rejoignez l'élite 2027</p>
                  </div>

                  <form onSubmit={handleSubmitRegistration} className="space-y-5">
                    <div className="space-y-5">
                      <div>
                        <label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground mb-2 block ml-1">NOM DE MARQUE / ENTREPRISE</label>
                        <Input 
                          placeholder="Ex: KIN VIBE SHOP" 
                          required 
                          className="bg-black border-white/10 h-14 text-sm rounded-2xl focus:ring-secondary"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground mb-2 block ml-1">NUMÉRO WHATSAPP</label>
                        <Input 
                          placeholder="+243 ..." 
                          required 
                          type="tel"
                          className="bg-black border-white/10 h-14 text-sm rounded-2xl focus:ring-secondary"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-16 bg-secondary text-black font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-secondary/10 hover:scale-[1.02] transition-all mt-4">
                      ENVOYER LA CANDIDATURE
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="text-center space-y-10 py-6">
                  <div className="w-24 h-24 bg-secondary/10 rounded-[2rem] flex items-center justify-center mx-auto text-secondary animate-pulse border border-secondary/20">
                    <ShieldCheck className="w-12 h-12" />
                  </div>
                  <h3 className="text-[22px] font-black uppercase italic">DOSSIER REÇU</h3>
                  
                  <div className="bg-white text-black p-10 rounded-[2.5rem] space-y-8 text-left relative overflow-hidden shadow-2xl">
                    <div className="border-b border-dashed border-neutral-200 pb-8">
                      <div className="text-[9px] font-black text-secondary uppercase mb-2">STAND CONFIRMATION ID</div>
                      <div className="text-[22px] font-black uppercase tracking-tighter italic">{formData.name}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <QrCode className="w-20 h-20 text-black" />
                      <div className="space-y-2">
                        <div className="font-mono text-secondary text-sm font-black tracking-tighter">{generatedTicket}</div>
                        <div className="text-[9px] uppercase font-black text-muted-foreground leading-tight">UN AGENT VOUS CONTACTERA SOUS 48H</div>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => setIsModalOpen(false)} className="w-full h-16 bg-white/5 border border-white/10 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-white/10 transition-colors">FERMER LE DOSSIER</Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
