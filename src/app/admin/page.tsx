
"use client";

import React, { useState, useEffect } from 'react';
import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser, useAuth } from '@/firebase';
import { collection, doc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash, Calendar, Users, Settings as SettingsIcon, FileText, Lock, LogOut, Shield, ExternalLink, Youtube, Star } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, OperationType } from '@/firebase/errors';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user && user.email !== 'christianrwemera4@gmail.com') {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const [email, setEmail] = useState('christianrwemera4@gmail.com');
  const [password, setPassword] = useState('0994472599');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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

  const registrationsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'registrations');
  }, [firestore]);
  const { data: registrations } = useCollection(registrationsCollectionRef);

  const talentsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'talents');
  }, [firestore]);
  const { data: talents } = useCollection(talentsCollectionRef);

  const [heroInput, setHeroInput] = useState('');
  const [ticketingInput, setTicketingInput] = useState('');
  const [teaserInput, setTeaserInput] = useState('');
  const [newProgram, setNewProgram] = useState({ time: '', title: '', desc: '', imageUrl: '' });
  const [newTalent, setNewTalent] = useState({ name: '', role: '', category: 'MUSIC', imageUrl: '' });

  useEffect(() => {
    if (settings) {
      setHeroInput(settings.heroImageUrl || '');
      setTicketingInput(settings.ticketingUrl || '');
      setTeaserInput(settings.teaserUrl || '');
    }
  }, [settings]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Accès autorisé", description: "Cockpit ONE VIBE activé." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Accès refusé", description: "Identifiants administrateur invalides." });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSaveSettings = () => {
    if (!festivalSettingsRef) return;
    const data = {
      heroImageUrl: heroInput,
      ticketingUrl: ticketingInput,
      teaserUrl: teaserInput,
      updatedAt: new Date().toISOString()
    };
    setDoc(festivalSettingsRef, data, { merge: true }).then(() => {
      toast({ title: "Configuration enregistrée" });
    }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: festivalSettingsRef.path,
        operation: OperationType.UPDATE,
        requestResourceData: data
      }, err));
    });
  };

  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programCollectionRef) return;
    const data = { ...newProgram, imageUrl: newProgram.imageUrl || `https://picsum.photos/seed/prog${Math.random()}/600/400` };
    addDoc(programCollectionRef, data).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: programCollectionRef.path,
        operation: OperationType.CREATE,
        requestResourceData: data
      }, err));
    });
    setNewProgram({ time: '', title: '', desc: '', imageUrl: '' });
  };

  const handleAddTalent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!talentsCollectionRef) return;
    const data = { ...newTalent, imageUrl: newTalent.imageUrl || `https://picsum.photos/seed/talent${Math.random()}/600/600` };
    addDoc(talentsCollectionRef, data).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: talentsCollectionRef.path,
        operation: OperationType.CREATE,
        requestResourceData: data
      }, err));
    });
    setNewTalent({ name: '', role: '', category: 'MUSIC', imageUrl: '' });
  };

  const handleDeleteDoc = (collectionName: string, id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, collectionName, id);
    deleteDoc(docRef).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: OperationType.DELETE
      }, err));
    });
  };

  if (isUserLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black uppercase text-[10px] tracking-widest italic">Chargement du noyau...</div>;

  if (!user || user.email !== 'christianrwemera4@gmail.com') {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-black border-white/10 text-white p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="text-[25px] font-black text-white uppercase tracking-tighter">ACCÈS <span className="text-primary">ADMIN</span></div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] mt-2 italic">Authentification requise</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="Email admin" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="bg-white/5 border-white/10 text-xs h-14 rounded-2xl focus:ring-primary"
              />
              <Input 
                type="password" 
                placeholder="Mot de passe" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="bg-white/5 border-white/10 text-xs h-14 rounded-2xl focus:ring-primary"
              />
            </div>
            <Button disabled={isLoggingIn} type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-black h-14 uppercase text-[10px] tracking-[0.3em] rounded-2xl mt-4 shadow-lg">
              {isLoggingIn ? "OUVERTURE..." : "DÉVERROUILLER"}
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
          <div className="text-[20px] font-black tracking-tighter text-white uppercase">ONE<span className="text-primary">VIBE</span> <span className="text-[9px] bg-primary/20 text-primary px-3 py-1 rounded-full ml-2 font-black italic">CORE</span></div>
          <div className="flex gap-4 items-center">
            <span className="hidden md:inline text-[9px] text-muted-foreground font-mono">{user.email}</span>
            <Button asChild variant="outline" className="text-[9px] h-9 border-white/20 uppercase font-black rounded-xl"><a href="/">Quitter</a></Button>
            <Button onClick={() => signOut(auth!)} variant="ghost" className="text-[9px] h-9 text-destructive hover:bg-destructive/10 uppercase font-black rounded-xl"><LogOut className="w-3.5 h-3.5 mr-2" /> Déconnexion</Button>
          </div>
        </div>

        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 bg-white/5 border border-white/10 p-1 rounded-2xl mb-8">
            <TabsTrigger value="tickets" className="text-[10px] uppercase font-black"><FileText className="w-3 h-3 mr-2" /> Inscriptions</TabsTrigger>
            <TabsTrigger value="talents" className="text-[10px] uppercase font-black"><Star className="w-3 h-3 mr-2" /> Talents</TabsTrigger>
            <TabsTrigger value="program" className="text-[10px] uppercase font-black"><Calendar className="w-3 h-3 mr-2" /> Programme</TabsTrigger>
            <TabsTrigger value="hero" className="text-[10px] uppercase font-black"><SettingsIcon className="w-3 h-3 mr-2" /> Design</TabsTrigger>
            <TabsTrigger value="security" className="text-[10px] uppercase font-black"><Lock className="w-3 h-3 mr-2" /> Sécurité</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets">
            <Card className="bg-white/5 border-white/10 text-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-[14px] font-black uppercase tracking-widest flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Participants & Exposants</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-black/20">
                    <TableRow className="border-white/10">
                      <TableHead className="text-white text-[9px] uppercase font-black px-6">Participant</TableHead>
                      <TableHead className="text-white text-[9px] uppercase font-black px-6">Type</TableHead>
                      <TableHead className="text-white text-[9px] uppercase font-black px-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations?.map((reg) => (
                      <TableRow key={reg.id} className="border-white/5 hover:bg-white/[0.03]">
                        <TableCell className="px-6 py-4">
                          <div className="font-black text-xs uppercase italic">{reg.name}</div>
                          <div className="text-[9px] text-muted-foreground lowercase font-mono">{reg.email}</div>
                        </TableCell>
                        <TableCell className="px-6">
                          <span className={`text-[9px] border px-2 py-0.5 rounded-full font-black uppercase italic ${reg.type === 'EXPOSITOR' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                            {reg.type}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 text-right">
                          <Button size="icon" variant="ghost" className="text-destructive/50 hover:text-destructive h-8 w-8" onClick={() => handleDeleteDoc('registrations', reg.id)}><Trash className="w-3.5 h-3.5" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="talents">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/5 border-white/10 text-white rounded-3xl p-6">
                <h3 className="text-[12px] font-black uppercase tracking-widest mb-6 italic">Ajouter un Invité</h3>
                <form onSubmit={handleAddTalent} className="space-y-4">
                  <Input required value={newTalent.name} onChange={e => setNewTalent({...newTalent, name: e.target.value})} placeholder="Nom complet" className="bg-black border-white/10 text-xs h-12 rounded-xl" />
                  <Input required value={newTalent.role} onChange={e => setNewTalent({...newTalent, role: e.target.value})} placeholder="Rôle (ex: Rappeur, CEO...)" className="bg-black border-white/10 text-xs h-12 rounded-xl" />
                  <select 
                    className="w-full bg-black border border-white/10 text-xs h-12 rounded-xl px-3 text-white outline-none"
                    value={newTalent.category}
                    onChange={e => setNewTalent({...newTalent, category: e.target.value})}
                  >
                    <option value="MUSIC">MUSIQUE</option>
                    <option value="CREATIVE">CRÉATIF</option>
                    <option value="BUSINESS">BUSINESS</option>
                    <option value="DIGITAL">DIGITAL</option>
                  </select>
                  <Input value={newTalent.imageUrl} onChange={e => setNewTalent({...newTalent, imageUrl: e.target.value})} placeholder="URL Image (Optionnel)" className="bg-black border-white/10 text-xs h-12 rounded-xl" />
                  <Button type="submit" className="w-full bg-primary text-white font-black text-[10px] uppercase h-12 rounded-xl tracking-widest"><Plus className="w-4 h-4 mr-2" /> Ajouter Talent</Button>
                </form>
              </Card>
              <Card className="lg:col-span-2 bg-white/5 border-white/10 text-white rounded-3xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-black/20">
                    <TableRow className="border-white/10">
                      <TableHead className="text-white text-[9px] uppercase font-black px-6">Talent</TableHead>
                      <TableHead className="text-white text-[9px] uppercase font-black px-6">Catégorie</TableHead>
                      <TableHead className="text-white text-[9px] uppercase font-black px-6 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {talents?.map((talent) => (
                      <TableRow key={talent.id} className="border-white/5 hover:bg-white/5">
                        <TableCell className="px-6">
                          <div className="text-xs font-black uppercase italic">{talent.name}</div>
                          <div className="text-[9px] text-muted-foreground uppercase">{talent.role}</div>
                        </TableCell>
                        <TableCell className="px-6 text-[9px] font-black text-primary">{talent.category}</TableCell>
                        <TableCell className="px-6 text-right">
                          <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => handleDeleteDoc('talents', talent.id)}><Trash className="w-3.5 h-3.5" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="program">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/5 border-white/10 text-white rounded-3xl p-6">
                <h3 className="text-[12px] font-black uppercase tracking-widest mb-6 italic">Ajouter Activité</h3>
                <form onSubmit={handleAddProgram} className="space-y-4">
                  <Input required value={newProgram.time} onChange={e => setNewProgram({...newProgram, time: e.target.value})} placeholder="Heure (16:30)" className="bg-black border-white/10 text-xs h-12 rounded-xl" />
                  <Input required value={newProgram.title} onChange={e => setNewProgram({...newProgram, title: e.target.value})} placeholder="Titre" className="bg-black border-white/10 text-xs h-12 rounded-xl" />
                  <Input value={newProgram.desc} onChange={e => setNewProgram({...newProgram, desc: e.target.value})} placeholder="Description" className="bg-black border-white/10 text-xs h-12 rounded-xl" />
                  <Button type="submit" className="w-full bg-secondary text-black font-black text-[10px] uppercase h-12 rounded-xl tracking-widest"><Plus className="w-4 h-4 mr-2" /> Ajouter au programme</Button>
                </form>
              </Card>
              <Card className="lg:col-span-2 bg-white/5 border-white/10 text-white rounded-3xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-black/20">
                    <TableRow className="border-white/10">
                      <TableHead className="text-white text-[9px] uppercase font-black px-6">Timing</TableHead>
                      <TableHead className="text-white text-[9px] uppercase font-black px-6">Activité</TableHead>
                      <TableHead className="text-white text-[9px] uppercase font-black px-6 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programItems?.map((item) => (
                      <TableRow key={item.id} className="border-white/5 hover:bg-white/5">
                        <TableCell className="px-6 font-black text-primary text-xs italic">{item.time}</TableCell>
                        <TableCell className="px-6 text-xs font-bold uppercase">{item.title}</TableCell>
                        <TableCell className="px-6 text-right">
                          <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => handleDeleteDoc('program', item.id)}><Trash className="w-3.5 h-3.5" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hero">
            <Card className="bg-white/5 border-white/10 text-white rounded-3xl p-8 max-w-2xl">
              <h3 className="text-[12px] font-black uppercase tracking-widest mb-6 italic">Configuration Générale</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground block mb-2">IMAGE HERO (URL)</label>
                  <Input 
                    placeholder="URL de l'image de fond"
                    value={heroInput}
                    onChange={(e) => setHeroInput(e.target.value)}
                    className="bg-black border-white/10 text-xs h-14 rounded-2xl"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground block mb-2">LIEN BILLETTERIE (EXTERNE)</label>
                  <div className="relative">
                    <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input 
                      placeholder="https://omtevents.com"
                      value={ticketingInput}
                      onChange={(e) => setTicketingInput(e.target.value)}
                      className="bg-black border-white/10 text-xs h-14 pl-12 rounded-2xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground block mb-2">LIEN TEASER YOUTUBE</label>
                  <div className="relative">
                    <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input 
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={teaserInput}
                      onChange={(e) => setTeaserInput(e.target.value)}
                      className="bg-black border-white/10 text-xs h-14 pl-12 rounded-2xl"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveSettings} className="bg-primary text-white font-black text-[10px] uppercase h-14 px-8 rounded-2xl tracking-widest shadow-xl shadow-primary/20"><Save className="w-4 h-4 mr-2" /> Appliquer les changements</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-white/5 border-white/10 text-white rounded-3xl p-8 max-w-md">
              <h3 className="text-[12px] font-black uppercase tracking-widest mb-4 italic">Sécurité Admin</h3>
              <p className="text-[10px] text-muted-foreground mb-6 leading-relaxed italic">Le compte <span className="text-white font-bold">christianrwemera4@gmail.com</span> possède les privilèges root.</p>
              <Button onClick={() => signOut(auth!)} variant="destructive" className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest"><LogOut className="w-4 h-4 mr-2" /> Se déconnecter du noyau</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
