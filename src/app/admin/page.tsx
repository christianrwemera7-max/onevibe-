"use client";

import React, { useState } from 'react';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Image, Save, Plus, Trash, QrCode, Calendar, Users, Settings as SettingsIcon, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const firestore = useFirestore();
  const { toast } = useToast();

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

  const handleSaveSettings = () => {
    if (!festivalSettingsRef) return;
    setDoc(festivalSettingsRef, {
      heroImageUrl: heroInput || settings?.heroImageUrl || 'https://picsum.photos/seed/vibehero/1920/1080',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    toast({ title: "Configuration enregistrée", description: "L'image Hero a été mise à jour." });
  };

  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programCollectionRef) return;
    if (!newProgram.time || !newProgram.title) return;

    addDoc(programCollectionRef, {
      ...newProgram,
      imageUrl: newProgram.imageUrl || 'https://picsum.photos/seed/prog' + Math.random() + '/600/400'
    });
    setNewProgram({ time: '', title: '', desc: '', imageUrl: '' });
    toast({ title: "Événement ajouté", description: "L'activité a été insérée dans le programme." });
  };

  const handleAddTalent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!talentsCollectionRef) return;
    if (!newTalent.name || !newTalent.role) return;

    addDoc(talentsCollectionRef, {
      ...newTalent,
      imageUrl: newTalent.imageUrl || 'https://picsum.photos/seed/talent' + Math.random() + '/600/600'
    });
    setNewTalent({ name: '', role: '', category: 'MUSIC', imageUrl: '' });
    toast({ title: "Acteur ajouté", description: "Le nouveau talent a été ajouté avec succès." });
  };

  const handleDeleteDoc = (collectionName: string, id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, collectionName, id);
    deleteDoc(docRef);
    toast({ title: "Élément supprimé" });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col leading-none border-r border-white/20 pr-4">
              <div className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase">
                ONE<span className="text-primary">VIBE</span>
              </div>
              <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1">
                <span>FEST</span>
                <span className="text-primary font-light">|</span>
                <span className="text-white">2027</span>
              </div>
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-widest text-primary">Panneau d'Administration</h1>
              <p className="text-xs text-muted-foreground">Pilotez le contenu dynamique de l'événement.</p>
            </div>
          </div>
          <Button asChild variant="outline" className="border-white/20 text-white text-xs h-9">
            <a href="/">Retour au site public</a>
          </Button>
        </div>

        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="grid grid-cols-4 bg-white/5 border border-white/10 p-1 rounded-xl mb-6">
            <TabsTrigger value="hero" className="text-xs uppercase font-bold flex items-center gap-2"><SettingsIcon className="w-3.5 h-3.5" /> Hero</TabsTrigger>
            <TabsTrigger value="program" className="text-xs uppercase font-bold flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Programme</TabsTrigger>
            <TabsTrigger value="talents" className="text-xs uppercase font-bold flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Acteurs Vibe</TabsTrigger>
            <TabsTrigger value="tickets" className="text-xs uppercase font-bold flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Billets & QR</TabsTrigger>
          </TabsList>

          {/* TAB 1: HERO CONFIG */}
          <TabsContent value="hero">
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="text-base">Image de fond principale (Hero)</CardTitle>
                <CardDescription className="text-xs">Modifiez l'URL de l'image d'illustration principale pour l'édition 2027.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input 
                    placeholder={settings?.heroImageUrl || "https://images.unsplash.com/..."}
                    value={heroInput}
                    onChange={(e) => setHeroInput(e.target.value)}
                    className="bg-black border-white/10 h-10 text-xs text-white"
                  />
                </div>
                {settings?.heroImageUrl && (
                  <div className="relative aspect-[16/5] rounded-lg overflow-hidden border border-white/10 bg-neutral-900">
                    <img src={settings.heroImageUrl} alt="Current hero snapshot" className="object-cover w-full h-full opacity-60" />
                  </div>
                )}
                <Button onClick={handleSaveSettings} className="bg-primary text-white font-bold uppercase text-xs flex items-center gap-2 h-10">
                  <Save className="w-4 h-4" /> Enregistrer la couverture Hero
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: TIMELINE PROGRAM */}
          <TabsContent value="program">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <Card className="bg-white/5 border-white/10 text-white lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base">Nouvel Horaire</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddProgram} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Heure (Ex: 14:00)</label>
                      <Input required value={newProgram.time} onChange={e => setNewProgram({...newProgram, time: e.target.value})} placeholder="14:00" className="bg-black border-white/10 text-xs text-white h-9" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Titre de l'activité</label>
                      <Input required value={newProgram.title} onChange={e => setNewProgram({...newProgram, title: e.target.value})} placeholder="VIBE DIGITAL Tournament" className="bg-black border-white/10 text-xs text-white h-9" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Description courte</label>
                      <Input value={newProgram.desc} onChange={e => setNewProgram({...newProgram, desc: e.target.value})} placeholder="Grande finale e-sport" className="bg-black border-white/10 text-xs text-white h-9" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">URL d'image descriptive</label>
                      <Input value={newProgram.imageUrl} onChange={e => setNewProgram({...newProgram, imageUrl: e.target.value})} placeholder="https://picsum.photos/..." className="bg-black border-white/10 text-xs text-white h-9" />
                    </div>
                    <Button type="submit" className="w-full bg-secondary text-black font-black uppercase text-xs h-10 mt-1">
                      <Plus className="w-4 h-4 mr-1" /> Ajouter au programme
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 text-white lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Activités planifiées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="border-white/10">
                        <TableRow className="border-white/10 hover:bg-transparent">
                          <TableHead className="text-white text-xs">Heure</TableHead>
                          <TableHead className="text-white text-xs">Activité</TableHead>
                          <TableHead className="text-white text-xs">Aperçu</TableHead>
                          <TableHead className="text-white text-xs text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {programItems && programItems.map((item) => (
                          <TableRow key={item.id} className="border-white/5 hover:bg-white/5">
                            <TableCell className="font-bold text-primary text-xs">{item.time}</TableCell>
                            <TableCell>
                              <div className="font-bold text-xs text-white">{item.title}</div>
                              <div className="text-[10px] text-muted-foreground line-clamp-1">{item.desc}</div>
                            </TableCell>
                            <TableCell>
                              <img src={item.imageUrl} alt="" className="w-8 h-6 object-cover rounded bg-neutral-800" />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10 h-7 w-7" onClick={() => handleDeleteDoc('program', item.id)}>
                                <Trash className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!programItems || programItems.length === 0) && (
                          <TableRow><TableCell colSpan={4} className="text-center text-[11px] text-muted-foreground py-4">Aucune activité enregistrée. Utilisation du programme par défaut.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* TAB 3: TALENTS */}
          <TabsContent value="talents">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <Card className="bg-white/5 border-white/10 text-white lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base">Nouvel Acteur de la Vibe</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddTalent} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Nom complet</label>
                      <Input required value={newTalent.name} onChange={e => setNewTalent({...newTalent, name: e.target.value})} placeholder="Sonia M." className="bg-black border-white/10 text-xs text-white h-9" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Rôle / Spécialité</label>
                      <Input required value={newTalent.role} onChange={e => setNewTalent({...newTalent, role: e.target.value})} placeholder="Styliste Streetwear" className="bg-black border-white/10 text-xs text-white h-9" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Catégorie</label>
                      <select 
                        value={newTalent.category} 
                        onChange={e => setNewTalent({...newTalent, category: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-md p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="MUSIC">ARTISTE (Musique)</option>
                        <option value="CREATIVE">CRÉATEUR (Art / Mode)</option>
                        <option value="BUSINESS">ENTREPRENEUR (Startup)</option>
                        <option value="DIGITAL">DIGITAL (Performer/Gamer)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">URL Image Profil</label>
                      <Input value={newTalent.imageUrl} onChange={e => setNewTalent({...newTalent, imageUrl: e.target.value})} placeholder="https://picsum.photos/..." className="bg-black border-white/10 text-xs text-white h-9" />
                    </div>
                    <Button type="submit" className="w-full bg-primary text-white font-bold uppercase text-xs h-10 mt-1">
                      <Plus className="w-4 h-4 mr-1" /> Enregistrer le talent
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 text-white lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Membres et Talents enregistrés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="border-white/10">
                        <TableRow className="border-white/10 hover:bg-transparent">
                          <TableHead className="text-white text-xs">Nom</TableHead>
                          <TableHead className="text-white text-xs">Rôle</TableHead>
                          <TableHead className="text-white text-xs">Catégorie</TableHead>
                          <TableHead className="text-white text-xs text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {talentsItems && talentsItems.map((talent) => (
                          <TableRow key={talent.id} className="border-white/5 hover:bg-white/5">
                            <TableCell className="font-bold flex items-center gap-2 text-xs text-white">
                              <img src={talent.imageUrl} alt="" className="w-6 h-6 rounded-full object-cover bg-neutral-800" />
                              {talent.name}
                            </TableCell>
                            <TableCell className="text-xs text-white/70">{talent.role}</TableCell>
                            <TableCell><span className="text-[9px] bg-white/10 px-1.5 py-0.2 rounded font-mono font-bold text-white">{talent.category}</span></TableCell>
                            <TableCell className="text-right">
                              <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10 h-7 w-7" onClick={() => handleDeleteDoc('talents', talent.id)}>
                                <Trash className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!talentsItems || talentsItems.length === 0) && (
                          <TableRow><TableCell colSpan={4} className="text-center text-[11px] text-muted-foreground py-4">Aucun talent personnalisé. Affichage par défaut actif.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* TAB 4: TICKETS */}
          <TabsContent value="tickets">
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="text-base">Inscriptions de l'édition 2027</CardTitle>
                <CardDescription className="text-xs">Chaque pass génère un code QR cryptographique sécurisé unique.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="border-white/10">
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-white text-xs">Bénéficiaire</TableHead>
                        <TableHead className="text-white text-xs">Type / Catégorie</TableHead>
                        <TableHead className="text-white text-xs">Contact</TableHead>
                        <TableHead className="text-white text-xs">Badge Billet unique</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations && registrations.map((reg) => {
                        const randomCode = reg.ticketCode || `OVF-2027-${reg.id?.substring(0,6).toUpperCase() || 'X89F21'}`;
                        return (
                          <TableRow key={reg.id} className="border-white/5 bg-black/20 hover:bg-white/5">
                            <TableCell>
                              <div className="font-bold text-xs text-white">{reg.name}</div>
                              {reg.company && <div className="text-[10px] text-secondary italic">Marque : {reg.company}</div>}
                            </TableCell>
                            <TableCell>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${reg.type === 'PASS' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                                {reg.type === 'PASS' ? `PASS ${reg.passCategory || 'STANDARD'}` : 'EXPOSANT'}
                              </span>
                            </TableCell>
                            <TableCell className="text-[11px] text-white/70">
                              <div>{reg.email}</div>
                              <div>{reg.phone}</div>
                            </TableCell>
                            <TableCell>
                              <div className="relative w-40 bg-neutral-900 border border-white/10 rounded p-1.5 flex items-center gap-2 overflow-hidden">
                                <div className="p-0.5 bg-white rounded shrink-0">
                                  <QrCode className="w-6 h-6 text-black" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[8px] font-black text-primary tracking-tighter truncate">ONE VIBE FEST</div>
                                  <div className="text-[8px] font-mono text-white/70 truncate">{randomCode}</div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {(!registrations || registrations.length === 0) && (
                        <TableRow><TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-8">Aucune inscription ou réservation enregistrée pour le moment.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}
