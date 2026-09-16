
"use client";

import React, { useState, useEffect } from 'react';
import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser, useAuth } from '@/firebase';
import { collection, doc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Image, Save, Plus, Trash, QrCode, Calendar, Users, Settings as SettingsIcon, FileText, Lock, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Firestore Refs
  const festivalSettingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(festivalSettingsRef);

  const programCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'program');
  }, [firestore]);
  const { data: programItems } = useCollection(programCollectionRef);

  const talentsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'talents');
  }, [firestore]);
  const { data: talentsItems } = useCollection(talentsCollectionRef);

  const registrationsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'registrations');
  }, [firestore]);
  const { data: registrations } = useCollection(registrationsCollectionRef);

  const [heroInput, setHeroInput] = useState('');
  const [newProgram, setNewProgram] = useState({ time: '', title: '', desc: '', imageUrl: '' });
  const [newTalent, setNewTalent] = useState({ name: '', role: '', category: 'MUSIC', imageUrl: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Accès autorisé", description: "Bienvenue dans le cockpit ONE VIBE." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Accès refusé", description: "Identifiants invalides." });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSaveSettings = () => {
    if (!festivalSettingsRef) return;
    setDoc(festivalSettingsRef, {
      heroImageUrl: heroInput || settings?.heroImageUrl || 'https://picsum.photos/seed/vibehero/1920/1080',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    toast({ title: "Configuration enregistrée" });
  };

  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programCollectionRef) return;
    addDoc(programCollectionRef, { ...newProgram, imageUrl: newProgram.imageUrl || 'https://picsum.photos/seed/prog'+Math.random()+'/600/400' });
    setNewProgram({ time: '', title: '', desc: '', imageUrl: '' });
  };

  const handleAddTalent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!talentsCollectionRef) return;
    addDoc(talentsCollectionRef, { ...newTalent, imageUrl: newTalent.imageUrl || 'https://picsum.photos/seed/talent'+Math.random()+'/600/600' });
    setNewTalent({ name: '', role: '', category: 'MUSIC', imageUrl: '' });
  };

  const handleDeleteDoc = (collectionName: string, id: string) => {
    if (!firestore) return;
    deleteDoc(doc(firestore, collectionName, id));
  };

  if (isUserLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Chargement...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white/5 border-white/10 text-white p-8">
          <div className="text-center mb-8">
            <div className="text-2xl font-black text-primary uppercase tracking-tighter">ONE VIBE <span className="text-white">ADMIN</span></div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-2">Zone de contrôle restreinte</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="Email admin" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="bg-black border-white/10 text-xs h-12"
              />
              <Input 
                type="password" 
                placeholder="Mot de passe" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="bg-black border-white/10 text-xs h-12"
              />
            </div>
            <Button disabled={isLoggingIn} type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 uppercase text-[10px] tracking-widest">
              {isLoggingIn ? "CONNEXION..." : "SE CONNECTER AU COCKPIT"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="text-xl font-black tracking-tighter text-white uppercase">ONE<span className="text-primary">VIBE</span> <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded ml-2">ADMIN</span></div>
            <div className="hidden md:block text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Connecté : {user.email}</div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="text-xs h-9 border-white/20"><a href="/">Voir le site</a></Button>
            <Button onClick={() => signOut(auth!)} variant="ghost" className="text-xs h-9 text-destructive hover:bg-destructive/10"><LogOut className="w-3.5 h-3.5 mr-2" /> Quitter</Button>
          </div>
        </div>

        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="grid grid-cols-4 bg-white/5 border border-white/10 p-1 rounded-xl mb-6">
            <TabsTrigger value="hero" className="text-[10px] uppercase font-bold"><SettingsIcon className="w-3 h-3 mr-2" /> Hero</TabsTrigger>
            <TabsTrigger value="program" className="text-[10px] uppercase font-bold"><Calendar className="w-3 h-3 mr-2" /> Programme</TabsTrigger>
            <TabsTrigger value="talents" className="text-[10px] uppercase font-bold"><Users className="w-3 h-3 mr-2" /> Talents</TabsTrigger>
            <TabsTrigger value="tickets" className="text-[10px] uppercase font-bold"><FileText className="w-3 h-3 mr-2" /> Inscriptions</TabsTrigger>
          </TabsList>

          <TabsContent value="hero">
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader><CardTitle className="text-base">Image Hero Principale</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input 
                  placeholder="URL de l'image (1920x1080)"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  className="bg-black border-white/10 text-xs"
                />
                <Button onClick={handleSaveSettings} className="bg-primary text-white font-bold text-xs uppercase"><Save className="w-4 h-4 mr-2" /> Mettre à jour</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="program">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader><CardTitle className="text-base">Nouvel Événement</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleAddProgram} className="space-y-3">
                    <Input required value={newProgram.time} onChange={e => setNewProgram({...newProgram, time: e.target.value})} placeholder="Heure (ex: 14:00)" className="bg-black border-white/10 text-xs" />
                    <Input required value={newProgram.title} onChange={e => setNewProgram({...newProgram, title: e.target.value})} placeholder="Titre" className="bg-black border-white/10 text-xs" />
                    <Input value={newProgram.desc} onChange={e => setNewProgram({...newProgram, desc: e.target.value})} placeholder="Description" className="bg-black border-white/10 text-xs" />
                    <Button type="submit" className="w-full bg-secondary text-black font-black text-xs uppercase"><Plus className="w-4 h-4 mr-2" /> Ajouter</Button>
                  </form>
                </CardContent>
              </Card>
              <Card className="lg:col-span-2 bg-white/5 border-white/10 text-white">
                <CardHeader><CardTitle className="text-base">Programme Actuel</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className="border-white/10">
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-white text-[10px]">Heure</TableHead>
                        <TableHead className="text-white text-[10px]">Activité</TableHead>
                        <TableHead className="text-white text-[10px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {programItems?.map((item) => (
                        <TableRow key={item.id} className="border-white/5 hover:bg-white/5">
                          <TableCell className="font-bold text-primary text-xs">{item.time}</TableCell>
                          <TableCell className="text-xs">{item.title}</TableCell>
                          <TableCell className="text-right">
                            <Button size="icon" variant="ghost" className="text-destructive h-7 w-7" onClick={() => handleDeleteDoc('program', item.id)}><Trash className="w-3.5 h-3.5" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="talents">
            {/* Structure similaire pour les talents */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader><CardTitle className="text-base">Gestion des Talents</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Utilisez cette section pour piloter les acteurs de la vibe.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader><CardTitle className="text-base">Inscriptions Reçues</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="border-white/10">
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-white text-[10px]">Utilisateur</TableHead>
                      <TableHead className="text-white text-[10px]">Pass</TableHead>
                      <TableHead className="text-white text-[10px]">Code QR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations?.map((reg) => (
                      <TableRow key={reg.id} className="border-white/5 hover:bg-white/5">
                        <TableCell>
                          <div className="font-bold text-xs">{reg.name}</div>
                          <div className="text-[9px] text-muted-foreground">{reg.email}</div>
                        </TableCell>
                        <TableCell><span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase">{reg.passCategory || reg.type}</span></TableCell>
                        <TableCell className="font-mono text-[9px] text-white/60">{reg.ticketCode}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
