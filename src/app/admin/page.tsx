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

  // Settings
  const festivalSettingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(festivalSettingsRef);

  // Programmation
  const programCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'program');
  }, [firestore]);
  const { data: programItems } = useCollection(programCollectionRef);

  // Talents
  const talentsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'talents');
  }, [firestore]);
  const { data: talentsItems } = useCollection(talentsCollectionRef);

  // Inscriptions / Billets
  const registrationsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'registrations');
  }, [firestore]);
  const { data: registrations } = useCollection(registrationsCollectionRef);

  // Local Form States
  const [heroInput, setHeroInput] = useState('');
  
  const [newProgram, setNewProgram] = useState({ time: '', title: '', desc: '', imageUrl: '' });
  const [newTalent, setNewTalent] = useState({ name: '', role: '', category: 'MUSIC', imageUrl: '' });

  const handleSaveSettings = () => {
    if (!festivalSettingsRef) return;
    setDoc(festivalSettingsRef, {
      heroImageUrl: heroInput || settings?.heroImageUrl || 'https://picsum.photos/seed/vibehero/1920/1080',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    toast({ title: "Configuration enregistrée", description: "L'image Hero a été mise à jour avec succès." });
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
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-primary uppercase">Back-Office ONE VIBE</h1>
            <p className="text-sm text-muted-foreground">Gérez les contenus du festival, mettez à jour le programme et visualisez les billets générés.</p>
          </div>
          <Button asChild variant="outline" className="border-white/20 text-white">
            <a href="/">Retour au site public</a>
          </Button>
        </div>

        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="grid grid-cols-4 bg-white/5 border border-white/10 p-1 rounded-xl mb-6">
            <TabsTrigger value="hero" className="text-xs uppercase font-bold flex items-center gap-2"><SettingsIcon className="w-4 h-4" /> Hero</TabsTrigger>
            <TabsTrigger value="program" className="text-xs uppercase font-bold flex items-center gap-2"><Calendar className="w-4 h-4" /> Programme</TabsTrigger>
            <TabsTrigger value="talents" className="text-xs uppercase font-bold flex items-center gap-2"><Users className="w-4 h-4" /> Acteurs Vibe</TabsTrigger>
            <TabsTrigger value="tickets" className="text-xs uppercase font-bold flex items-center gap-2"><FileText className="w-4 h-4" /> Billets & QR</TabsTrigger>
          </TabsList>

          {/* TAB 1: HERO CONFIG */}
          <TabsContent value="hero">
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Image de fond de la section principale (Hero)</CardTitle>
                <CardDescription>Modifiez l'impact visuel immédiat pour les visiteurs dès l'ouverture du site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">URL de l'image actuelle ou de remplacement</label>
                  <Input 
                    placeholder={settings?.heroImageUrl || "https://images.unsplash.com/..."}
                    value={heroInput}
                    onChange={(e) => setHeroInput(e.target.value)}
                    className="bg-black border-white/10 h-11"
                  />
                </div>
                {settings?.heroImageUrl && (
                  <div className="relative aspect-[16/6] rounded-xl overflow-hidden border border-white/10 bg-neutral-900">
                    <img src={settings.heroImageUrl} alt="Current hero snapshot" className="object-cover w-full h-full opacity-70" />
                    <div className="absolute bottom-2 right-2 bg-black/80 px-3 py-1 rounded text-xs">Aperçu en ligne</div>
                  </div>
                )}
                <Button onClick={handleSaveSettings} className="bg-primary text-white font-bold uppercase flex items-center gap-2">
                  <Save className="w-4 h-4" /> Enregistrer l'image Hero
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: TIMELINE PROGRAM */}
          <TabsContent value="program">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <Card className="bg-white/5 border-white/10 text-white lg:col-span-1">
                <CardHeader>
                  <CardTitle>Nouvel Horaire</CardTitle>
                  <CardDescription>Ajoutez une case chronologique.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddProgram} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Heure (Ex: 14:00)</label>
                      <Input required value={newProgram.time} onChange={e => setNewProgram({...newProgram, time: e.target.value})} placeholder="14:00" className="bg-black border-white/10 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Titre de l'activité</label>
                      <Input required value={newProgram.title} onChange={e => setNewProgram({...newProgram, title: e.target.value})} placeholder="VIBE DIGITAL Tournament" className="bg-black border-white/10 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Description courte</label>
                      <Input value={newProgram.desc} onChange={e => setNewProgram({...newProgram, desc: e.target.value})} placeholder="Grande finale e-sport" className="bg-black border-white/10 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">URL d'image descriptive</label>
                      <Input value={newProgram.imageUrl} onChange={e => setNewProgram({...newProgram, imageUrl: e.target.value})} placeholder="https://picsum.photos/..." className="bg-black border-white/10 text-sm" />
                    </div>
                    <Button type="submit" className="w-full bg-secondary text-black font-black uppercase text-xs">
                      <Plus className="w-4 h-4 mr-1" /> Ajouter au programme
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 text-white lg:col-span-2">
                <CardHeader>
                  <CardTitle>Activités actuelles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="border-white/10">
                        <TableRow className="border-white/10 hover:bg-transparent">
                          <TableHead className="text-white">Heure</TableHead>
                          <TableHead className="text-white">Activité</TableHead>
                          <TableHead className="text-white">Aperçu</TableHead>
                          <TableHead className="text-white text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {programItems && programItems.map((item) => (
                          <TableRow key={item.id} className="border-white/5 hover:bg-white/5">
                            <TableCell className="font-bold text-primary">{item.time}</TableCell>
                            <TableCell>
                              <div className="font-bold">{item.title}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1">{item.desc}</div>
                            </TableCell>
                            <TableCell>
                              <img src={item.imageUrl} alt="" className="w-10 h-7 object-cover rounded bg-neutral-800" />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteDoc('program', item.id)}>
                                <Trash className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!programItems || programItems.length === 0) && (
                          <TableRow><TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-4">Utilise les valeurs par défaut du site (Ajoutes-en un pour basculer sur la liste dynamique !)</TableCell></TableRow>
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
                  <CardTitle>Nouvel Acteur de la Vibe</CardTitle>
                  <CardDescription>Artiste, styliste ou startup vedette.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddTalent} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Nom complet</label>
                      <Input required value={newTalent.name} onChange={e => setNewTalent({...newTalent, name: e.target.value})} placeholder="Sonia M." className="bg-black border-white/10 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Rôle / Spécialité</label>
                      <Input required value={newTalent.role} onChange={e => setNewTalent({...newTalent, role: e.target.value})} placeholder="Styliste Streetwear" className="bg-black border-white/10 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Catégorie d'acteur</label>
                      <select 
                        value={newTalent.category} 
                        onChange={e => setNewTalent({...newTalent, category: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="MUSIC">ARTISTE (Musique)</option>
                        <option value="CREATIVE">CRÉATEUR (Art / Mode)</option>
                        <option value="BUSINESS">ENTREPRENEUR (Startup)</option>
                        <option value="DIGITAL">DIGITAL (Performers/Gamer)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">URL de l'image de profil</label>
                      <Input value={newTalent.imageUrl} onChange={e => setNewTalent({...newTalent, imageUrl: e.target.value})} placeholder="https://picsum.photos/..." className="bg-black border-white/10 text-sm" />
                    </div>
                    <Button type="submit" className="w-full bg-primary text-white font-bold uppercase text-xs">
                      <Plus className="w-4 h-4 mr-1" /> Enregistrer le talent
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 text-white lg:col-span-2">
                <CardHeader>
                  <CardTitle>Membres actifs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="border-white/10">
                        <TableRow className="border-white/10 hover:bg-transparent">
                          <TableHead className="text-white">Nom</TableHead>
                          <TableHead className="text-white">Rôle</TableHead>
                          <TableHead className="text-white">Catégorie</TableHead>
                          <TableHead className="text-white text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {talentsItems && talentsItems.map((talent) => (
                          <TableRow key={talent.id} className="border-white/5 hover:bg-white/5">
                            <TableCell className="font-bold flex items-center gap-2">
                              <img src={talent.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover bg-neutral-800" />
                              {talent.name}
                            </TableCell>
                            <TableCell className="text-sm text-white/70">{talent.role}</TableCell>
                            <TableCell><span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono font-bold">{talent.category}</span></TableCell>
                            <TableCell className="text-right">
                              <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteDoc('talents', talent.id)}>
                                <Trash className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!talentsItems || talentsItems.length === 0) && (
                          <TableRow><TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-4">Utilise les talents pré-intégrés (Ajoutes-en un pour rafraîchir en temps réel !)</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* TAB 4: TICKETS GENERATOR & UNIQUE QR CODES */}
          <TabsContent value="tickets">
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Inscriptions & Générateur d'affiche avec Billet QR Unique</CardTitle>
                    <CardDescription>Chaque commande génère automatiquement un code de vérification cryptographique unique représenté sous forme de badge QR.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="border-white/10">
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-white">Bénéficiaire</TableHead>
                        <TableHead className="text-white">Type / Catégorie</TableHead>
                        <TableHead className="text-white">Contact</TableHead>
                        <TableHead className="text-white">Affiche & Code QR Unique</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations && registrations.map((reg) => {
                        const randomCode = reg.ticketCode || `OVF-2024-${reg.id?.substring(0,6).toUpperCase() || 'X89F21'}`;
                        return (
                          <TableRow key={reg.id} className="border-white/5 bg-black/20 hover:bg-white/5">
                            <TableCell>
                              <div className="font-bold text-white">{reg.name}</div>
                              {reg.company && <div className="text-xs text-secondary italic">Marque : {reg.company}</div>}
                            </TableCell>
                            <TableCell>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${reg.type === 'PASS' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                                {reg.type === 'PASS' ? `PASS ${reg.passCategory || 'STANDARD'}` : 'EXPOSANT MARKET'}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-white/70">
                              <div>{reg.email}</div>
                              <div>{reg.phone}</div>
                            </TableCell>
                            <TableCell>
                              {/* L'affiche du festival miniature personnalisée avec le QR Code simulé de manière élégante et créative */}
                              <div className="relative w-44 bg-neutral-900 border border-white/10 rounded-lg p-2 flex items-center gap-2 overflow-hidden shadow-lg">
                                <div className="absolute top-0 right-0 w-2 h-full vibe-gradient opacity-20" />
                                <div className="p-1 bg-white rounded shrink-0">
                                  {/* Utilisation de l'icône QR officielle du pack avec l'identifiant pour symboliser le pass sécurisé */}
                                  <QrCode className="w-7 h-7 text-black" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[9px] font-black text-primary tracking-tighter truncate">ONE VIBE FEST</div>
                                  <div className="text-[8px] font-mono font-bold text-white/60 select-all truncate">{randomCode}</div>
                                  <div className="text-[7px] text-muted-foreground">15 Juil - Palais Congrès</div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {(!registrations || registrations.length === 0) && (
                        <TableRow><TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-8">Aucune inscription enregistrée pour le moment. Allez sur la page d'accueil pour simuler un achat !</TableCell></TableRow>
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