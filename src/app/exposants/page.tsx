
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
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="inline-block p-4 bg-secondary/10 rounded-2xl border border-secondary/20">
              <Store className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-[25px] font-black tracking-tighter uppercase italic leading-tight">
              VOTRE MARQUE <br />
              <span className="text-secondary">AU SOMMET</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              Devenez exposant à ONE VIBE FEST 2027 et connectez-vous avec plus de 5000 festivaliers passionnés de culture, d'innovation et de style.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: "VISIBILITÉ", value: "5000+", desc: "Festivaliers qualifiés" },
                { label: "ESPACE", value: "50+", desc: "Stands stratégiques" }
              ].map((stat, i) => (
                <div key={i} className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                  <div className="text-[22px] font-black text-white mb-1">{stat.value}</div>
                  <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">{stat.label}</div>
                  <div className="text-[8px] text-secondary uppercase font-bold mt-1">{stat.desc}</div>
                </div>
              ))}
            </div>

            <Button 
              onClick={() => setIsModalOpen(true)}
              size="lg" 
              className="h-16 px-10 text-[10px] font-black rounded-full bg-secondary text-black uppercase tracking-[0.2em] shadow-2xl shadow-secondary/20 hover:scale-105 transition-all"
            >
              RÉSERVER UN STAND
            </Button>
          </motion.div>

          <div className="relative aspect-[4/5] max-w-[500px] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
            <Image src="https://picsum.photos/seed/market1/800/1000" alt="Exposant" fill className="object-cover" data-ai-hint="exhibition market stall" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-6 bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-4 h-4 text-secondary" />
                <h3 className="text-[18px] font-black text-white uppercase italic">Impact VIBE</h3>
              </div>
              <p className="text-[9px] text-white/70 font-bold uppercase tracking-widest leading-relaxed">Boostez votre business dans l'écosystème le plus dynamique de Kinshasa.</p>
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
              className="bg-neutral-900 border border-white/10 rounded-[2.5rem] p-10 max-w-lg w-full relative text-white"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 text-muted-foreground hover:text-white transition-colors"><X className="w-6 h-6" /></button>
              
              {modalStep === 'FORM' ? (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-secondary/20">
                      <Store className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="text-[22px] font-black uppercase italic">DOSSIER STAND</h3>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-bold mt-1 italic">Rejoignez l'aventure 2027</p>
                  </div>

                  <form onSubmit={handleSubmitRegistration} className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground mb-1 block ml-1">NOM DE MARQUE</label>
                        <Input 
                          placeholder="Ex: VIBE STYLE" 
                          required 
                          className="bg-black border-white/10 h-14 text-sm rounded-xl focus:ring-secondary"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground mb-1 block ml-1">TÉLÉPHONE CONTACT</label>
                        <Input 
                          placeholder="+243 ..." 
                          required 
                          type="tel"
                          className="bg-black border-white/10 h-14 text-sm rounded-xl focus:ring-secondary"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-14 bg-secondary text-black font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl shadow-secondary/10 hover:scale-[1.02] transition-all">
                      ENVOYER MA DEMANDE
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="text-center space-y-8 py-4">
                  <div className="w-20 h-20 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto text-secondary animate-pulse border border-secondary/20">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <h3 className="text-[22px] font-black uppercase italic">EN ATTENTE</h3>
                  
                  <div className="bg-white text-black p-8 rounded-[2rem] space-y-6 text-left relative overflow-hidden">
                    <div className="border-b border-dashed border-neutral-200 pb-6">
                      <div className="text-[9px] font-black text-secondary uppercase mb-1">ONE VIBE FEST STAND</div>
                      <div className="text-[20px] font-black uppercase tracking-tighter italic">{formData.name}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <QrCode className="w-16 h-16 text-black" />
                      <div className="space-y-1">
                        <div className="font-mono text-secondary text-xs font-black">{generatedTicket}</div>
                        <div className="text-[8px] uppercase font-bold text-muted-foreground">ANALYSE DU DOSSIER</div>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => setIsModalOpen(false)} className="w-full h-14 bg-primary text-white font-black rounded-xl uppercase text-[10px] tracking-widest">RETOUR</Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
