"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, CheckCircle2, QrCode, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function ExposantsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [modalStep, setModalStep] = useState<'FORM' | 'SUCCESS'>('FORM');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registrationsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'registrations');
  }, [firestore]);

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationsRef) return;
    setIsSubmitting(true);

    const uniqueTicketId = `OVF-STAND-${Math.floor(100000 + Math.random() * 900000)}`;
    const submissionData = {
      userId: user?.uid || 'guest',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      type: 'EXPOSITOR',
      ticketCode: uniqueTicketId,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(registrationsRef, submissionData);
      setGeneratedId(uniqueTicketId);
      setModalStep('SUCCESS');
      toast({ title: "Candidature envoyée", description: "Notre équipe vous contactera bientôt." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible d'envoyer la demande." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 bg-black min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full px-6 relative z-10">
        <Link href="/explore" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors mb-8 italic">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 md:p-14 backdrop-blur-3xl shadow-2xl"
        >
          {modalStep === 'FORM' ? (
            <div className="space-y-10">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
                  <Store className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-[26px] font-black uppercase italic tracking-tighter text-white leading-tight">RÉSERVATION <br /><span className="text-primary">DE STAND</span></h1>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.3em] italic">Devenez partenaire officiel de l'édition 2027</p>
                <div className="w-10 h-1 bg-primary/30 mx-auto rounded-full" />
              </div>

              <form onSubmit={handleSubmitRegistration} className="space-y-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black tracking-[0.2em] text-white/40 ml-1">NOM DE LA MARQUE / SOCIÉTÉ</label>
                    <Input 
                      placeholder="Ex: KIN VIBE STUDIO" 
                      required 
                      className="bg-black/50 border-white/10 h-14 text-sm rounded-2xl focus:border-primary/50 transition-all italic font-medium"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black tracking-[0.2em] text-white/40 ml-1">E-MAIL DE CONTACT</label>
                    <Input 
                      placeholder="business@vibe.cd" 
                      required 
                      type="email"
                      className="bg-black/50 border-white/10 h-14 text-sm rounded-2xl focus:border-primary/50 transition-all italic font-medium"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black tracking-[0.2em] text-white/40 ml-1">NUMÉRO WHATSAPP</label>
                    <Input 
                      placeholder="+243 ..." 
                      required 
                      type="tel"
                      className="bg-black/50 border-white/10 h-14 text-sm rounded-2xl focus:border-primary/50 transition-all italic font-medium"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <Button 
                  disabled={isSubmitting}
                  type="submit" 
                  className="w-full h-14 bg-primary text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 border-none mt-6 hover:scale-[1.02] transition-all"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isSubmitting ? "TRANSMISSION..." : "SOUMETTRE MA DEMANDE"}
                </Button>
                <p className="text-center text-[8px] text-white/20 uppercase font-black tracking-widest italic">Notre équipe commerciale reviendra vers vous sous 48h.</p>
              </form>
            </div>
          ) : (
            <div className="text-center space-y-10 py-6">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 border border-green-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-[22px] font-black uppercase italic text-white tracking-tighter">DEMANDE ENREGISTRÉE</h2>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">RÉFÉRENCE DOSSIER : <span className="text-primary">{generatedId}</span></p>
              </div>

              <div className="bg-black/40 border border-white/5 p-8 rounded-[2rem] space-y-6 text-left relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
                <div className="flex items-center gap-6">
                  <QrCode className="w-14 h-14 text-white/10 shrink-0" />
                  <div className="space-y-2">
                    <div className="text-[16px] font-black uppercase tracking-tight text-white italic">{formData.name}</div>
                    <div className="font-mono text-primary text-[11px] font-black tracking-widest">{generatedId}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={() => setModalStep('FORM')} 
                  variant="ghost"
                  className="text-white/30 hover:text-white font-black rounded-2xl uppercase text-[10px] tracking-widest italic h-12"
                >
                  NOUVELLE DEMANDE
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}