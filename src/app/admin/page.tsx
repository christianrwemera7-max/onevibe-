
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser, useAuth } from '@/firebase';
import { collection, doc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash, Calendar, Users, Settings as SettingsIcon, FileText, Lock, LogOut, Star, LayoutGrid, Upload, Loader2, Download, Info } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, OperationType } from '@/firebase/errors';
import { useRouter } from 'next/navigation';
import { uploadToCloudinary } from '@/app/actions/cloudinary-upload';

export default function AdminDashboard() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const [isUploading, setIsUploading] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && user && user.email !== 'christianrwemera4@gmail.com') {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const [email, setEmail] = useState('christianrwemera4@gmail.com');
  const [password, setPassword] = useState('0994472599');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(settingsRef);

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
  const [isCarouselEnabled, setIsCarouselEnabled] = useState(false);
  
  const [musicDesc, setMusicDesc] = useState('');
  const [musicImg, setMusicImg] = useState('');
  const [creativeDesc, setCreativeDesc] = useState('');
  const [creativeImg, setCreativeImg] = useState('');
  const [digitalDesc, setDigitalDesc] = useState('');
  const [digitalImg, setDigitalImg] = useState('');

  const [newProgram, setNewProgram] = useState({ time: '', title: '', desc: '', imageUrl: '' });
  const [newTalent, setNewTalent] = useState({ name: '', role: '', category: 'MUSIC', imageUrl: '' });

  useEffect(() => {
    if (settings) {
      setHeroInput(settings.heroImageUrl || '');
      setTicketingInput(settings.ticketingUrl || '');
      setTeaserInput(settings.teaserUrl || '');
      setIsCarouselEnabled(settings.isCarouselEnabled || false);
      
      setMusicDesc(settings.musicDesc || "Le cœur battant du festival. Des concerts explosifs, des DJ sets hypnotiques.");
      setMusicImg(settings.musicImg || "https://picsum.photos/seed/music1/800/1000");
      setCreativeDesc(settings.creativeDesc || "L'art sous toutes ses formes. Mode underground, design futuriste, street-art.");
      setCreativeImg(settings.creativeImg || "https://picsum.photos/seed/art1/800/1000");
      setDigitalDesc(settings.digitalDesc || "Technologie avancée et divertissement numérique. Tournois e-sport majeurs.");
      setDigitalImg(settings.digitalImg || "https://picsum.photos/seed/digi1/800/1000");
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void, fieldKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(fieldKey);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', fieldKey);

    try {
      const result = await uploadToCloudinary(formData);
      setter(result.url);
      toast({ title: "Image téléversée", description: "Le lien Cloudinary a été généré automatiquement." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur d'upload", description: error.message });
    } finally {
      setIsUploading(null);
    }
  };

  const handleSaveSettings = () => {
    if (!settingsRef) return;
    const data = {
      heroImageUrl: heroInput,
      ticketingUrl: ticketingInput,
      teaserUrl: teaserInput,
      isCarouselEnabled: isCarouselEnabled,
      musicDesc,
      musicImg,
      creativeDesc,
      creativeImg,
      digitalDesc,
      digitalImg,
      updatedAt: new Date().toISOString()
    };
    setDoc(settingsRef, data, { merge: true }).then(() => {
      toast({ title: "Configuration enregistrée" });
    }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: settingsRef.path,
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

  const handleExportCSV = () => {
    if (!registrations || registrations.length === 0) {
      toast({ variant: "destructive", title: "Export impossible", description: "Aucune donnée d'inscription à exporter." });
      return;
    }

    const headers = ["Nom", "Email", "Téléphone", "Type", "Code Billet/Accès", "Date Inscription"];
    const sortedRegistrations = [...registrations].sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    const rows = sortedRegistrations.map(reg => [
      `"${reg.name || 'Inconnu'}"`,
      `"${reg.email || ''}"`,
      `"${reg.phone || ''}"`,
      `"${reg.type || 'VISITEUR'}"`,
      `"${reg.ticketCode || ''}"`,
      `"${reg.createdAt || ''}"`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `one-vibe-data-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Export réussi", description: `${registrations.length} contacts exportés.` });
  };

  if (isUserLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black uppercase text-[10px] tracking-widest italic">Chargement du cockpit...</div>;

  if (!user || user.email !== 'christianrwemera4@gmail.com') {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-black border-white/10 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="text-center mb-10">
            <Lock className="w-6 h-6 text-primary mx-auto mb-4" />
            <div className="text-[18px] font-black uppercase tracking-tighter">COCKPIT <span className="text-primary">ADMIN</span></div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-white/5 border-white/10 text-xs h-14 rounded-2xl" />
            <Input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required className="bg-white/5 border-white/10 text-xs h-14 rounded-2xl" />
            <Button disabled={isLoggingIn} type="submit" className="w-full bg-primary text-white font-black h-14 uppercase text-[10px] tracking-widest rounded-2xl">ENTRER</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8 pt-32">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center border-b border-white/10 pb-6">
          <div className="text-[18px] font-black tracking-tighter text-white uppercase">ONE<span className="text-primary">VIBE</span> <span className="text-[9px] bg-primary/20 text-primary px-3 py-1 rounded-full ml-2 font-black italic">COCKPIT</span></div>
          <Button onClick={() => signOut(auth!)} variant="ghost" className="text-[9px] h-9 text-destructive hover:bg-destructive/10 uppercase font-black rounded-xl"><LogOut className="w-3.5 h-3.5 mr-2" /> Quitter</Button>
        </div>

        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 bg-white/5 border border-white/10 p-1 rounded-2xl mb-8">
            <TabsTrigger value="tickets" className="text-[10px] uppercase font-black"><FileText className="w-3 h-3 mr-2" /> Inscriptions</TabsTrigger>
            <TabsTrigger value="universes" className="text-[10px] uppercase font-black"><LayoutGrid className="w-3 h-3 mr-2" /> Univers</TabsTrigger>
            <TabsTrigger value="talents" className="text-[10px] uppercase font-black"><Star className="w-3 h-3 mr-2" /> Guests</TabsTrigger>
            <TabsTrigger value="program" className="text-[10px] uppercase font-black"><Calendar className="w-3 h-3 mr-2" /> Agenda</TabsTrigger>
            <TabsTrigger value="hero" className="text-[10px] uppercase font-black"><SettingsIcon className="w-3 h-3 mr-2" /> Medias</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets">
            <Card className="bg-white/5 border-white/10 text-white rounded-[2rem] overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-white/[0.02] flex flex-row items-center justify-between">
                <CardTitle className="text-[12px] font-black uppercase tracking-widest flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Base de Données</CardTitle>
                <Button onClick={handleExportCSV} variant="outline" className="bg-white/5 border-white/10 text-[9px] font-black uppercase tracking-widest h-9 rounded-xl hover:bg-white/10">
                  <Download className="w-3 h-3 mr-2" /> Exporter (CSV)
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-black/20">
                    <TableRow className="border-white/10">
                      <TableHead className="text-white text-[9px] uppercase font-black px-6">Participant</TableHead>
                      <TableHead className="text-white text-[9px] uppercase font-black px-6">Type</TableHead>
                      <TableHead className="text-white text-[9px] uppercase font-black px-6 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations?.map((reg) => (
                      <TableRow key={reg.id} className="border-white/5 hover:bg-white/[0.03]">
                        <TableCell className="px-6 py-4">
                          <div className="font-black text-[11px] uppercase italic">{reg.name}</div>
                          <div className="text-[9px] text-muted-foreground font-mono">{reg.email}</div>
                          <div className="text-[9px] text-primary font-black italic">{reg.phone}</div>
                        </TableCell>
                        <TableCell className="px-6">
                          <span className={`text-[8px] border px-2 py-0.5 rounded-full font-black uppercase italic ${reg.type === 'EXPOSITOR' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
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

          <TabsContent value="hero">
            <Card className="bg-white/5 border-white/10 text-white rounded-2xl p-8 max-w-2xl space-y-8">
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest italic border-b border-white/5 pb-2">Configuration de l'Accueil</h3>
                
                <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/10">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white">DÉFILEMENT AUTO DES IMAGES</div>
                    <p className="text-[8px] text-muted-foreground uppercase">Alterner entre l'image Hero et les Guests</p>
                  </div>
                  <Switch 
                    checked={isCarouselEnabled} 
                    onCheckedChange={setIsCarouselEnabled}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground block">IMAGE DE FOND HERO (FIXE OU DÉBUT DIAPORAMA)</label>
                  <div className="flex gap-2">
                    <Input value={heroInput} onChange={(e) => setHeroInput(e.target.value)} className="bg-black border-white/10 text-xs h-14 rounded-2xl flex-1" />
                    <div className="relative">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, setHeroInput, 'hero')} />
                      <Button size="icon" className="h-14 w-14 bg-white/10 rounded-2xl" disabled={isUploading === 'hero'}>
                        {isUploading === 'hero' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground block">LIEN BILLETTERIE</label>
                  <Input value={ticketingInput} onChange={(e) => setTicketingInput(e.target.value)} className="bg-black border-white/10 text-xs h-14 rounded-2xl" />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground block">LIEN TEASER YOUTUBE</label>
                  <Input value={teaserInput} onChange={(e) => setTeaserInput(e.target.value)} className="bg-black border-white/10 text-xs h-14 rounded-2xl" />
                </div>
              </div>
              
              <Button onClick={handleSaveSettings} className="bg-primary text-white font-black text-[10px] uppercase h-14 px-8 rounded-2xl tracking-widest w-full"><Save className="w-4 h-4 mr-2" /> ENREGISTRER LA CONFIGURATION</Button>
            </Card>
          </TabsContent>

          <TabsContent value="universes">
            <Card className="bg-white/5 border-white/10 text-white rounded-[2rem] p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'music', label: 'VIBE MUSIC', color: 'text-primary', setter: setMusicImg, val: musicImg, descSetter: setMusicDesc, descVal: musicDesc },
                  { id: 'creative', label: 'VIBE CREATIVE', color: 'text-accent', setter: setCreativeImg, val: creativeImg, descSetter: setCreativeDesc, descVal: creativeDesc },
                  { id: 'digital', label: 'VIBE DIGITAL', color: 'text-secondary', setter: setDigitalImg, val: digitalImg, descSetter: setDigitalDesc, descVal: digitalDesc }
                ].map((uni) => (
                  <div key={uni.id} className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                    <div className={`text-xs font-black ${uni.color} uppercase`}>{uni.label}</div>
                    <textarea value={uni.descVal} onChange={e => uni.descSetter(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-2 text-xs h-20 text-white" placeholder="Description..." />
                    <div className="flex gap-2">
                      <Input value={uni.val} onChange={e => uni.setter(e.target.value)} className="bg-black border-white/10 text-[9px] h-10 rounded-xl flex-1" placeholder="Image URL..." />
                      <div className="relative">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, uni.setter, uni.id)} />
                        <Button size="icon" className="h-10 w-10 bg-white/10 rounded-xl" disabled={isUploading === uni.id}>
                          {isUploading === uni.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={handleSaveSettings} className="bg-primary text-white font-black text-[10px] uppercase h-12 px-6 rounded-xl tracking-widest"><Save className="w-4 h-4 mr-2" /> SAUVEGARDER LES UNIVERS</Button>
            </Card>
          </TabsContent>

          <TabsContent value="talents">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/5 border-white/10 text-white rounded-2xl p-6">
                <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 italic">Ajouter un Guest</h3>
                <form onSubmit={handleAddTalent} className="space-y-4">
                  <Input required value={newTalent.name} onChange={e => setNewTalent({...newTalent, name: e.target.value})} placeholder="Nom" className="bg-black border-white/10 text-xs h-12 rounded-xl" />
                  <Input required value={newTalent.role} onChange={e => setNewTalent({...newTalent, role: e.target.value})} placeholder="Spécialité" className="bg-black border-white/10 text-xs h-12 rounded-xl" />
                  <select className="w-full bg-black border border-white/10 text-xs h-12 rounded-xl px-3 text-white" value={newTalent.category} onChange={e => setNewTalent({...newTalent, category: e.target.value})}>
                    <option value="MUSIC">MUSIQUE</option>
                    <option value="CREATIVE">CRÉATIF</option>
                    <option value="DIGITAL">DIGITAL</option>
                  </select>
                  <div className="flex gap-2">
                    <Input value={newTalent.imageUrl} onChange={e => setNewTalent({...newTalent, imageUrl: e.target.value})} placeholder="Image" className="bg-black border-white/10 text-xs h-12 rounded-xl flex-1" />
                    <div className="relative">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, (url) => setNewTalent({...newTalent, imageUrl: url}), 'talents')} />
                      <Button type="button" size="icon" className="h-12 w-12 bg-white/10 rounded-xl" disabled={isUploading === 'talents'}>
                        {isUploading === 'talents' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary text-white font-black text-[10px] uppercase h-12 rounded-xl tracking-widest">Ajouter</Button>
                </form>
              </Card>
              <Card className="lg:col-span-2 bg-white/5 border-white/10 text-white rounded-2xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-black/20">
                    <TableRow className="border-white/10">
                      <TableHead className="text-white text-[9px] uppercase font-black px-6">Talent</TableHead>
                      <TableHead className="text-white text-[9px] uppercase font-black px-6 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {talents?.map((talent) => (
                      <TableRow key={talent.id} className="border-white/5 hover:bg-white/5">
                        <TableCell className="px-6 py-4">
                          <div className="text-[11px] font-black uppercase italic">{talent.name}</div>
                          <div className="text-[9px] text-muted-foreground">{talent.role}</div>
                        </TableCell>
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
              <Card className="bg-white/5 border-white/10 text-white rounded-2xl p-6">
                <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 italic">Ajouter une Activité</h3>
                <form onSubmit={handleAddProgram} className="space-y-4">
                  <Input required value={newProgram.time} onChange={e => setNewProgram({...newProgram, time: e.target.value})} placeholder="Heure" className="bg-black border-white/10 text-xs h-12 rounded-xl" />
                  <Input required value={newProgram.title} onChange={e => setNewProgram({...newProgram, title: e.target.value})} placeholder="Titre" className="bg-black border-white/10 text-xs h-12 rounded-xl" />
                  <Input value={newProgram.desc} onChange={e => setNewProgram({...newProgram, desc: e.target.value})} placeholder="Description" className="bg-black border-white/10 text-xs h-12 rounded-xl" />
                  <div className="flex gap-2">
                    <Input value={newProgram.imageUrl} onChange={e => setNewProgram({...newProgram, imageUrl: e.target.value})} placeholder="Image URL" className="bg-black border-white/10 text-xs h-12 rounded-xl flex-1" />
                    <div className="relative">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, (url) => setNewProgram({...newProgram, imageUrl: url}), 'program')} />
                      <Button type="button" size="icon" className="h-12 w-12 bg-white/10 rounded-xl" disabled={isUploading === 'program'}>
                        {isUploading === 'program' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-secondary text-black font-black text-[10px] uppercase h-12 rounded-xl tracking-widest">Ajouter</Button>
                </form>
              </Card>
              <Card className="lg:col-span-2 bg-white/5 border-white/10 text-white rounded-2xl overflow-hidden">
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
                        <TableCell className="px-6 font-black text-primary text-[11px] italic">{item.time}</TableCell>
                        <TableCell className="px-6 text-[11px] font-bold uppercase">{item.title}</TableCell>
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
        </Tabs>
      </div>
    </div>
  );
}
