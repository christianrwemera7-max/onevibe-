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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash, Calendar, Users, Settings as SettingsIcon, LogOut, Star, LayoutGrid, Upload, Loader2, Download, Globe, Share2, Image as ImageIcon } from 'lucide-react';
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

  // General Settings
  const [eventName, setEventName] = useState('');
  const [eventTagline, setEventTagline] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  // Socials
  const [instagramUrl, setInstagramUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');

  // Media Settings
  const [heroInput, setHeroInput] = useState('');
  const [ticketingInput, setTicketingInput] = useState('');
  const [teaserInput, setTeaserInput] = useState('');
  const [isCarouselEnabled, setIsCarouselEnabled] = useState(false);
  
  // Universes
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
      setEventName(settings.eventName || 'ONE VIBE');
      setEventTagline(settings.eventTagline || 'UNE ÉNERGIE MULTIDIMENSIONNELLE');
      setEventDate(settings.eventDate || '2027-06-26T12:00:00');
      setEventLocation(settings.eventLocation || 'INEPSS • KINSHASA');
      setInstagramUrl(settings.instagramUrl || '');
      setTwitterUrl(settings.twitterUrl || '');
      setFacebookUrl(settings.facebookUrl || '');
      setTiktokUrl(settings.tiktokUrl || '');
      setHeroInput(settings.heroImageUrl || '');
      setTicketingInput(settings.ticketingUrl || '');
      setTeaserInput(settings.teaserUrl || '');
      setIsCarouselEnabled(settings.isCarouselEnabled || false);
      setMusicDesc(settings.musicDesc || "");
      setMusicImg(settings.musicImg || "");
      setCreativeDesc(settings.creativeDesc || "");
      setCreativeImg(settings.creativeImg || "");
      setDigitalDesc(settings.digitalDesc || "");
      setDigitalImg(settings.digitalImg || "");
    }
  }, [settings]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Accès autorisé", description: "Cockpit activé." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Accès refusé", description: "Identifiants invalides." });
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
      toast({ title: "Image importée", description: "Le fichier a été stabilisé sur Cloudinary." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur d'import", description: error.message });
    } finally {
      setIsUploading(null);
    }
  };

  const handleSaveSettings = () => {
    if (!settingsRef) return;
    const data = {
      eventName, eventTagline, eventDate, eventLocation,
      instagramUrl, twitterUrl, facebookUrl, tiktokUrl,
      heroImageUrl: heroInput, ticketingUrl: ticketingInput, teaserUrl: teaserInput,
      isCarouselEnabled, musicDesc, musicImg, creativeDesc, creativeImg, digitalDesc, digitalImg,
      updatedAt: new Date().toISOString()
    };
    setDoc(settingsRef, data, { merge: true }).then(() => {
      toast({ title: "Configuration enregistrée" });
    }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: settingsRef.path, operation: OperationType.UPDATE, requestResourceData: data
      }, err));
    });
  };

  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programCollectionRef) return;
    const data = { ...newProgram, imageUrl: newProgram.imageUrl || "https://picsum.photos/seed/prog/600/400" };
    addDoc(programCollectionRef, data).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: programCollectionRef.path, operation: OperationType.CREATE, requestResourceData: data
      }, err));
    });
    setNewProgram({ time: '', title: '', desc: '', imageUrl: '' });
  };

  const handleAddTalent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!talentsCollectionRef) return;
    const data = { ...newTalent, imageUrl: newTalent.imageUrl || "https://picsum.photos/seed/talent/600/600" };
    addDoc(talentsCollectionRef, data).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: talentsCollectionRef.path, operation: OperationType.CREATE, requestResourceData: data
      }, err));
    });
    setNewTalent({ name: '', role: '', category: 'MUSIC', imageUrl: '' });
  };

  const handleDeleteDoc = (collectionName: string, id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, collectionName, id);
    deleteDoc(docRef).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path, operation: OperationType.DELETE
      }, err));
    });
  };

  const handleExportCSV = () => {
    if (!registrations || registrations.length === 0) return;
    const headers = ["Nom", "Email", "Téléphone", "Type", "Code Billet", "Date"];
    const rows = registrations.map(reg => [
      `"${reg.name || ''}"`, `"${reg.email || ''}"`, `"${reg.phone || ''}"`, `"${reg.type || ''}"`, `"${reg.ticketCode || ''}"`, `"${reg.createdAt || ''}"`
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `participants-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isUserLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white uppercase text-[10px] tracking-widest font-black">Chargement...</div>;

  if (!user || user.email !== 'christianrwemera4@gmail.com') {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-black border-white/10 text-white p-10 rounded-[2.5rem] shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-center font-black uppercase text-lg mb-6">ADMIN COCKPIT</h2>
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-white/5 border-white/10 h-14 rounded-2xl" />
            <Input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required className="bg-white/5 border-white/10 h-14 rounded-2xl" />
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
          <div className="text-[18px] font-black tracking-tighter text-white uppercase">{eventName || 'SITE'} <span className="text-primary">COCKPIT</span></div>
          <Button onClick={() => signOut(auth!)} variant="ghost" className="text-[9px] h-9 text-destructive hover:bg-destructive/10 uppercase font-black rounded-xl"><LogOut className="w-3.5 h-3.5 mr-2" /> Déconnexion</Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 bg-white/5 border border-white/10 p-1 rounded-2xl mb-8">
            <TabsTrigger value="general" className="text-[10px] uppercase font-black"><Globe className="w-3 h-3 mr-2" /> Général</TabsTrigger>
            <TabsTrigger value="tickets" className="text-[10px] uppercase font-black"><Users className="w-3 h-3 mr-2" /> Inscrits</TabsTrigger>
            <TabsTrigger value="universes" className="text-[10px] uppercase font-black"><LayoutGrid className="w-3 h-3 mr-2" /> Univers</TabsTrigger>
            <TabsTrigger value="talents" className="text-[10px] uppercase font-black"><Star className="w-3 h-3 mr-2" /> Guests</TabsTrigger>
            <TabsTrigger value="program" className="text-[10px] uppercase font-black"><Calendar className="w-3 h-3 mr-2" /> Agenda</TabsTrigger>
            <TabsTrigger value="hero" className="text-[10px] uppercase font-black"><SettingsIcon className="w-3 h-3 mr-2" /> Médias</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="bg-white/5 border-white/10 text-white rounded-2xl p-8 max-w-2xl space-y-8">
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest italic border-b border-white/5 pb-2 text-primary">Identité du Festival</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black text-muted-foreground">NOM LOGO</label>
                    <Input value={eventName} onChange={(e) => setEventName(e.target.value)} className="bg-black border-white/10 h-14 rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black text-muted-foreground">TAGLINE</label>
                    <Input value={eventTagline} onChange={(e) => setEventTagline(e.target.value)} className="bg-black border-white/10 h-14 rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black text-muted-foreground">LIEU ET DATE AFFICHÉS</label>
                    <Input value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} className="bg-black border-white/10 h-14 rounded-2xl" />
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-[11px] font-black uppercase tracking-widest italic text-secondary flex items-center gap-2"><Share2 className="w-4 h-4" /> Réseaux Sociaux</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} placeholder="Instagram" className="bg-black border-white/10 h-12 rounded-xl" />
                  <Input value={tiktokUrl} onChange={e => setTiktokUrl(e.target.value)} placeholder="TikTok" className="bg-black border-white/10 h-12 rounded-xl" />
                  <Input value={twitterUrl} onChange={e => setTwitterUrl(e.target.value)} placeholder="Twitter/X" className="bg-black border-white/10 h-12 rounded-xl" />
                  <Input value={facebookUrl} onChange={e => setFacebookUrl(e.target.value)} placeholder="Facebook" className="bg-black border-white/10 h-12 rounded-xl" />
                </div>
              </div>
              <Button onClick={handleSaveSettings} className="bg-primary text-white font-black text-[10px] uppercase h-14 px-8 rounded-2xl w-full"><Save className="w-4 h-4 mr-2" /> ENREGISTRER</Button>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <Card className="bg-white/5 border-white/10 text-white rounded-[2rem] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5">
                <CardTitle className="text-xs uppercase font-black">Base de Données Inscrits</CardTitle>
                <Button onClick={handleExportCSV} variant="outline" className="bg-white/5 border-white/10 text-[9px] h-9 rounded-xl"><Download className="w-3 h-3 mr-2" /> EXPORT CSV</Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead className="px-6 text-[9px] uppercase">Participant</TableHead><TableHead className="px-6 text-[9px] uppercase">Type</TableHead><TableHead className="text-right px-6 text-[9px] uppercase">Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {registrations?.map((reg) => (
                      <TableRow key={reg.id} className="border-white/5">
                        <TableCell className="px-6 py-4">
                          <div className="font-black text-[11px] uppercase italic">{reg.name}</div>
                          <div className="text-[9px] text-muted-foreground">{reg.email} • {reg.phone}</div>
                        </TableCell>
                        <TableCell className="px-6"><span className="text-[8px] border border-white/10 px-2 py-0.5 rounded-full font-black">{reg.type}</span></TableCell>
                        <TableCell className="text-right px-6"><Button size="icon" variant="ghost" className="text-destructive/50" onClick={() => handleDeleteDoc('registrations', reg.id)}><Trash className="w-3.5 h-3.5" /></Button></TableCell>
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
                <h3 className="text-[11px] font-black uppercase tracking-widest italic text-primary">Médias et Liens Extérieurs</h3>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black text-muted-foreground">IMAGE HERO (TOUS FORMATS)</label>
                  <div className="flex gap-2">
                    <Input value={heroInput} onChange={e => setHeroInput(e.target.value)} className="bg-black border-white/10 h-14 rounded-2xl flex-1" />
                    <div className="relative">
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => handleFileUpload(e, setHeroInput, 'hero')} />
                      <Button size="icon" className="h-14 w-14 bg-white/10 rounded-2xl" disabled={isUploading === 'hero'}>
                        {isUploading === 'hero' ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Upload className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black text-muted-foreground">LIEN BILLETTERIE</label>
                    <Input value={ticketingInput} onChange={e => setTicketingInput(e.target.value)} className="bg-black border-white/10 h-14 rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black text-muted-foreground">Lien Teaser YouTube</label>
                    <Input value={teaserInput} onChange={e => setTeaserInput(e.target.value)} className="bg-black border-white/10 h-14 rounded-2xl" />
                  </div>
                </div>
              </div>
              <Button onClick={handleSaveSettings} className="bg-primary text-white font-black text-[10px] uppercase h-14 px-8 rounded-2xl w-full">SAUVEGARDER LES MÉDIAS</Button>
            </Card>
          </TabsContent>

          <TabsContent value="universes">
            <Card className="bg-white/5 border-white/10 text-white rounded-[2rem] p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { id: 'music', label: 'MUSIC', color: 'text-primary', val: musicImg, setter: setMusicImg, dVal: musicDesc, dSetter: setMusicDesc },
                  { id: 'creative', label: 'CREATIVE', color: 'text-accent', val: creativeImg, setter: setCreativeImg, dVal: creativeDesc, dSetter: setCreativeDesc },
                  { id: 'digital', label: 'DIGITAL', color: 'text-secondary', val: digitalImg, setter: setDigitalImg, dVal: digitalDesc, dSetter: setDigitalDesc }
                ].map((uni) => (
                  <div key={uni.id} className="p-5 bg-black/40 rounded-2xl border border-white/5 space-y-4">
                    <div className={`text-xs font-black ${uni.color}`}>VIBE {uni.label}</div>
                    <textarea value={uni.dVal} onChange={e => uni.dSetter(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-2 text-[10px] h-20 text-white" placeholder="Description..." />
                    <div className="flex gap-2">
                      <Input value={uni.val} onChange={e => uni.setter(e.target.value)} className="bg-black border-white/10 text-[9px] h-10 rounded-xl flex-1" />
                      <div className="relative">
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => handleFileUpload(e, uni.setter, uni.id)} />
                        <Button size="icon" className="h-10 w-10 bg-white/10 rounded-xl" disabled={isUploading === uni.id}>
                          {isUploading === uni.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={handleSaveSettings} className="bg-primary text-white font-black text-[10px] uppercase h-12 px-8 rounded-xl mt-8">SAUVEGARDER LES UNIVERS</Button>
            </Card>
          </TabsContent>

          <TabsContent value="talents">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/5 border-white/10 text-white rounded-2xl p-6 h-fit">
                <h3 className="text-[11px] font-black uppercase mb-6 italic text-primary">AJOUTER UN GUEST</h3>
                <form onSubmit={handleAddTalent} className="space-y-4">
                  <Input required value={newTalent.name} onChange={e => setNewTalent({...newTalent, name: e.target.value})} placeholder="Nom de l'artiste" className="bg-black border-white/10 text-xs h-12 rounded-xl" />
                  <Input required value={newTalent.role} onChange={e => setNewTalent({...newTalent, role: e.target.value})} placeholder="Spécialité (ex: DJ, Styliste)" className="bg-black border-white/10 text-xs h-12 rounded-xl" />
                  <select className="w-full bg-black border border-white/10 text-xs h-12 rounded-xl px-3 text-white" value={newTalent.category} onChange={e => setNewTalent({...newTalent, category: e.target.value})}>
                    <option value="MUSIC">MUSIQUE</option><option value="CREATIVE">CRÉATIF</option><option value="DIGITAL">DIGITAL</option>
                  </select>
                  <div className="flex gap-2">
                    <Input value={newTalent.imageUrl} onChange={e => setNewTalent({...newTalent, imageUrl: e.target.value})} placeholder="URL Image" className="bg-black border-white/10 text-[10px] h-12 rounded-xl flex-1" />
                    <div className="relative">
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => handleFileUpload(e, (url) => setNewTalent({...newTalent, imageUrl: url}), 'talents')} />
                      <Button type="button" size="icon" className="h-12 w-12 bg-white/10 rounded-xl" disabled={isUploading === 'talents'}>
                        {isUploading === 'talents' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary text-white font-black text-[10px] uppercase h-12 rounded-xl">AJOUTER</Button>
                </form>
              </Card>
              <Card className="lg:col-span-2 bg-white/5 border-white/10 text-white rounded-2xl overflow-hidden">
                <Table>
                  <TableHeader><TableRow><TableHead className="px-6 text-[9px] uppercase">Guest</TableHead><TableHead className="px-6 text-[9px] uppercase">Catégorie</TableHead><TableHead className="text-right px-6 text-[9px] uppercase">Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {talents?.map((t) => (
                      <TableRow key={t.id} className="border-white/5 hover:bg-white/5">
                        <TableCell className="px-6 py-4"><div className="text-[11px] font-black uppercase italic">{t.name}</div><div className="text-[9px] text-muted-foreground">{t.role}</div></TableCell>
                        <TableCell className="px-6"><span className="text-[8px] border border-white/10 px-2 py-0.5 rounded-full font-black">{t.category}</span></TableCell>
                        <TableCell className="text-right px-6"><Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => handleDeleteDoc('talents', t.id)}><Trash className="w-3.5 h-3.5" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="program">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/5 border-white/10 text-white rounded-2xl p-6 h-fit">
                <h3 className="text-[11px] font-black uppercase mb-6 italic text-secondary">AJOUTER À L'AGENDA</h3>
                <form onSubmit={handleAddProgram} className="space-y-4">
                  <Input required value={newProgram.time} onChange={e => setNewProgram({...newProgram, time: e.target.value})} placeholder="Heure (ex: 14:00)" className="bg-black border-white/10 text-xs h-12 rounded-xl" />
                  <Input required value={newProgram.title} onChange={e => setNewProgram({...newProgram, title: e.target.value})} placeholder="Titre de l'activité" className="bg-black border-white/10 text-xs h-12 rounded-xl" />
                  <Input value={newProgram.desc} onChange={e => setNewProgram({...newProgram, desc: e.target.value})} placeholder="Petite description" className="bg-black border-white/10 text-xs h-12 rounded-xl" />
                  <div className="flex gap-2">
                    <Input value={newProgram.imageUrl} onChange={e => setNewProgram({...newProgram, imageUrl: e.target.value})} placeholder="URL Image" className="bg-black border-white/10 text-[10px] h-12 rounded-xl flex-1" />
                    <div className="relative">
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => handleFileUpload(e, (url) => setNewProgram({...newProgram, imageUrl: url}), 'program')} />
                      <Button type="button" size="icon" className="h-12 w-12 bg-white/10 rounded-xl" disabled={isUploading === 'program'}>
                        {isUploading === 'program' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-secondary text-black font-black text-[10px] uppercase h-12 rounded-xl">AJOUTER</Button>
                </form>
              </Card>
              <Card className="lg:col-span-2 bg-white/5 border-white/10 text-white rounded-2xl overflow-hidden">
                <Table>
                  <TableHeader><TableRow><TableHead className="px-6 text-[9px] uppercase">Timing</TableHead><TableHead className="px-6 text-[9px] uppercase">Activité</TableHead><TableHead className="text-right px-6 text-[9px] uppercase">Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {programItems?.map((item) => (
                      <TableRow key={item.id} className="border-white/5">
                        <TableCell className="px-6 font-black text-primary text-[11px] italic">{item.time}</TableCell>
                        <TableCell className="px-6 text-[11px] font-bold uppercase">{item.title}</TableCell>
                        <TableCell className="text-right px-6"><Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => handleDeleteDoc('program', item.id)}><Trash className="w-3.5 h-3.5" /></Button></TableCell>
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
