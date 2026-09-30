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
import { 
  Save, 
  Trash, 
  Calendar, 
  Users, 
  LogOut, 
  Star, 
  Upload, 
  Loader2, 
  Download, 
  Globe, 
  Image as ImageIcon, 
  ShoppingBag, 
  Zap, 
  Palette,
  TrendingUp,
  Eye,
  Handshake,
  Images,
  LayoutGrid
} from 'lucide-react';
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

  // Stats logic
  const analyticsRef = useMemoFirebase(() => firestore ? doc(firestore, 'analytics', 'global') : null, [firestore]);
  const { data: stats } = useDoc(analyticsRef);

  const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'festival') : null, [firestore]);
  const { data: settings } = useDoc(settingsRef);

  const programRef = useMemoFirebase(() => firestore ? collection(firestore, 'program') : null, [firestore]);
  const { data: programItems } = useCollection(programRef);

  const registrationsRef = useMemoFirebase(() => firestore ? collection(firestore, 'registrations') : null, [firestore]);
  const { data: registrations } = useCollection(registrationsRef);

  const talentsRef = useMemoFirebase(() => firestore ? collection(firestore, 'talents') : null, [firestore]);
  const { data: talents } = useCollection(talentsRef);

  const merchRef = useMemoFirebase(() => firestore ? collection(firestore, 'merch') : null, [firestore]);
  const { data: merchItems } = useCollection(merchRef);

  const sponsorsRef = useMemoFirebase(() => firestore ? collection(firestore, 'sponsors') : null, [firestore]);
  const { data: sponsors } = useCollection(sponsorsRef);

  const galleryRef = useMemoFirebase(() => firestore ? collection(firestore, 'gallery') : null, [firestore]);
  const { data: galleryItems } = useCollection(galleryRef);

  const universesRef = useMemoFirebase(() => firestore ? collection(firestore, 'universes') : null, [firestore]);
  const { data: universes } = useCollection(universesRef);

  // Form states
  const [logoUrl, setLogoUrl] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [spotVideoUrl, setSpotVideoUrl] = useState('');
  const [globalBgUrl, setGlobalBgUrl] = useState('');
  const [exposantsImg, setExposantsImg] = useState('');
  const [ticketingInput, setTicketingInput] = useState('');
  const [teaserInput, setTeaserInput] = useState('');
  
  const [newProgram, setNewProgram] = useState({ time: '', title: '', desc: '', imageUrl: '' });
  const [newTalent, setNewTalent] = useState({ name: '', role: '', category: 'MUSIC', imageUrl: '' });
  const [newSponsor, setNewSponsor] = useState({ name: '', logoUrl: '', tier: 'PARTNER' });
  const [newMerch, setNewMerch] = useState({ name: '', price: '', description: '', imageUrl: '', link: '' });
  const [newGalleryItem, setNewGalleryItem] = useState({ imageUrl: '', description: '' });

  useEffect(() => {
    if (settings) {
      setLogoUrl(settings.logoUrl || '');
      setEventDate(settings.eventDate || '2027-06-26T12:00:00');
      setEventLocation(settings.eventLocation || 'INEPSS • KINSHASA');
      setInstagramUrl(settings.instagramUrl || '');
      setTiktokUrl(settings.tiktokUrl || '');
      setTwitterUrl(settings.twitterUrl || '');
      setFacebookUrl(settings.facebookUrl || '');
      setSpotVideoUrl(settings.spotVideoUrl || '');
      setGlobalBgUrl(settings.globalBgUrl || '');
      setExposantsImg(settings.exposantsImg || '');
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
      toast({ title: "Accès autorisé" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Accès refusé" });
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
      toast({ title: "Média stabilisé" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur d'import" });
    } finally {
      setIsUploading(null);
    }
  };

  const handleSaveSettings = () => {
    if (!settingsRef) return;
    const data = {
      logoUrl, eventDate, eventLocation,
      instagramUrl, tiktokUrl, twitterUrl, facebookUrl,
      spotVideoUrl, globalBgUrl, exposantsImg,
      ticketingUrl: ticketingInput, teaserUrl: teaserInput,
      updatedAt: new Date().toISOString()
    };
    setDoc(settingsRef, data, { merge: true }).then(() => {
      toast({ title: "Configuration enregistrée" });
    });
  };

  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programRef) return;
    addDoc(programRef, newProgram).then(() => {
      setNewProgram({ time: '', title: '', desc: '', imageUrl: '' });
      toast({ title: "Agenda mis à jour" });
    });
  };

  const handleAddTalent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!talentsRef) return;
    addDoc(talentsRef, newTalent).then(() => {
      setNewTalent({ name: '', role: '', category: 'MUSIC', imageUrl: '' });
      toast({ title: "Guest ajouté" });
    });
  };

  const handleAddSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorsRef) return;
    addDoc(sponsorsRef, newSponsor).then(() => {
      setNewSponsor({ name: '', logoUrl: '', tier: 'PARTNER' });
      toast({ title: "Sponsor ajouté" });
    });
  };

  const handleAddMerch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchRef) return;
    addDoc(merchRef, newMerch).then(() => {
      setNewMerch({ name: '', price: '', description: '', imageUrl: '', link: '' });
      toast({ title: "Article ajouté" });
    });
  };

  const handleAddGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryRef) return;
    addDoc(galleryRef, { ...newGalleryItem, createdAt: new Date().toISOString() }).then(() => {
      setNewGalleryItem({ imageUrl: '', description: '' });
      toast({ title: "Image ajoutée" });
    });
  };

  const handleDeleteDoc = (collectionName: string, id: string) => {
    if (!firestore) return;
    deleteDoc(doc(firestore, collectionName, id)).then(() => {
      toast({ title: "Supprimé" });
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
    link.download = `onevibe-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isUserLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-white italic font-black">Chargement...</div>;

  if (!user || user.email !== 'christianrwemera4@gmail.com') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-black/40 border-white/10 text-white p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-center font-black uppercase text-lg mb-6 tracking-tighter italic">COCKPIT ACCESS</h2>
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-white/5 border-white/10 h-14 rounded-2xl italic" />
            <Input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required className="bg-white/5 border-white/10 h-14 rounded-2xl italic" />
            <Button disabled={isLoggingIn} type="submit" className="w-full bg-white text-primary font-black h-14 uppercase text-[10px] tracking-widest rounded-2xl border-none italic">ENTRER</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-8 pt-32 font-display">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/5 border-white/10 p-8 rounded-3xl backdrop-blur-xl">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center"><Eye className="w-8 h-8 text-white" /></div>
              <div><div className="text-[10px] font-black uppercase text-white/40 italic mb-1">Visiteurs</div><div className="text-2xl font-black italic">{stats?.visitorCount || 0}</div></div>
            </div>
          </Card>
          <Card className="bg-white/5 border-white/10 p-8 rounded-3xl backdrop-blur-xl">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center"><Users className="w-8 h-8 text-white" /></div>
              <div><div className="text-[10px] font-black uppercase text-white/40 italic mb-1">Inscrits</div><div className="text-2xl font-black italic">{registrations?.length || 0}</div></div>
            </div>
          </Card>
          <Card className="bg-white/5 border-white/10 p-8 rounded-3xl backdrop-blur-xl">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center"><TrendingUp className="w-8 h-8 text-white" /></div>
              <div><div className="text-[10px] font-black uppercase text-white/40 italic mb-1">Univers</div><div className="text-2xl font-black italic">{universes?.length || 0}</div></div>
            </div>
          </Card>
          <Card className="bg-white/5 border-white/10 p-8 rounded-3xl backdrop-blur-xl">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center"><Star className="w-8 h-8 text-white" /></div>
              <div><div className="text-[10px] font-black uppercase text-white/40 italic mb-1">Guests</div><div className="text-2xl font-black italic">{talents?.length || 0}</div></div>
            </div>
          </Card>
        </div>

        <div className="flex justify-between items-center border-b border-white/10 pb-8">
          <div className="text-[22px] font-black tracking-tighter text-white uppercase italic">IDENTITY <span className="text-primary">COCKPIT</span></div>
          <Button onClick={() => signOut(auth!)} variant="ghost" className="text-[10px] h-10 text-white/40 uppercase font-black rounded-xl hover:bg-white/5 italic"><LogOut className="w-4 h-4 mr-2" /> EXIT</Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-8 bg-white/5 border border-white/10 p-1 rounded-2xl mb-8">
            <TabsTrigger value="general" className="text-[10px] font-black italic">GÉNÉRAL</TabsTrigger>
            <TabsTrigger value="tickets" className="text-[10px] font-black italic">INSCRITS</TabsTrigger>
            <TabsTrigger value="merch" className="text-[10px] font-black italic">MERCH</TabsTrigger>
            <TabsTrigger value="sponsors" className="text-[10px] font-black italic">SPONSORS</TabsTrigger>
            <TabsTrigger value="gallery" className="text-[10px] font-black italic">GALERIE</TabsTrigger>
            <TabsTrigger value="universes" className="text-[10px] font-black italic">UNIVERS</TabsTrigger>
            <TabsTrigger value="talents" className="text-[10px] font-black italic">LINE-UP</TabsTrigger>
            <TabsTrigger value="hero" className="text-[10px] font-black italic">MÉDIAS</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="bg-white/5 border-white/10 text-white rounded-3xl p-10 max-w-2xl space-y-10 shadow-2xl backdrop-blur-xl">
              <div className="space-y-6">
                <h3 className="text-[12px] font-black uppercase tracking-widest italic text-white/80 border-b border-white/5 pb-3">Identité de l'événement</h3>
                <div className="flex gap-4">
                  <Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="URL Logo PNG" className="bg-black/40 border-white/10 h-14 rounded-2xl italic text-xs flex-1" />
                  <div className="relative">
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => handleFileUpload(e, setLogoUrl, 'logo')} />
                    <Button size="icon" className="h-14 w-14 bg-white/10 rounded-2xl" disabled={isUploading === 'logo'}><Upload className="w-4 h-4 text-white" /></Button>
                  </div>
                </div>
                <Input value={eventLocation} onChange={e => setEventLocation(e.target.value)} placeholder="Lieu et Date affichés" className="bg-black/40 border-white/10 h-14 rounded-2xl italic text-sm font-black" />
                <div className="grid grid-cols-2 gap-4">
                   <Input value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} placeholder="Instagram" className="bg-black/40 border-white/10 h-12 rounded-xl italic text-xs" />
                   <Input value={tiktokUrl} onChange={e => setTiktokUrl(e.target.value)} placeholder="TikTok" className="bg-black/40 border-white/10 h-12 rounded-xl italic text-xs" />
                </div>
              </div>
              <Button onClick={handleSaveSettings} className="w-full bg-white text-primary font-black text-[11px] h-14 rounded-2xl italic border-none shadow-2xl">SAUVEGARDER</Button>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <Card className="bg-white/5 border-white/10 text-white rounded-3xl overflow-hidden backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 p-8">
                <CardTitle className="text-sm uppercase font-black italic">Database Participants</CardTitle>
                <Button onClick={handleExportCSV} variant="outline" className="bg-white/5 border-white/10 text-[10px] h-10 rounded-xl font-black italic"><Download className="w-4 h-4 mr-2" /> EXPORT CSV</Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow className="border-white/5"><TableHead className="px-8">Participant</TableHead><TableHead className="px-8">Type</TableHead><TableHead className="text-right px-8">Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {registrations?.map(reg => (
                      <TableRow key={reg.id} className="border-white/5 hover:bg-white/[0.02]">
                        <TableCell className="px-8 py-5"><div className="font-black text-[14px] uppercase italic">{reg.name}</div><div className="text-[10px] text-white/40">{reg.email}</div></TableCell>
                        <TableCell className="px-8"><span className="text-[9px] border border-white/10 px-2 py-0.5 rounded-full">{reg.type}</span></TableCell>
                        <TableCell className="text-right px-8"><Button size="icon" variant="ghost" onClick={() => handleDeleteDoc('registrations', reg.id)}><Trash className="w-3.5 h-3.5 text-destructive" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sponsors">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/5 border-white/10 p-8 rounded-3xl h-fit backdrop-blur-xl">
                <h3 className="text-[11px] font-black uppercase mb-8 italic flex items-center gap-3"><Handshake className="w-5 h-5 text-primary" /> Sponsor</h3>
                <form onSubmit={handleAddSponsor} className="space-y-4">
                  <Input required value={newSponsor.name} onChange={e => setNewSponsor({...newSponsor, name: e.target.value})} placeholder="Nom du partenaire" className="bg-black/40 border-white/10 h-12 rounded-xl text-xs italic" />
                  <div className="flex gap-2">
                    <Input value={newSponsor.logoUrl} onChange={e => setNewSponsor({...newSponsor, logoUrl: e.target.value})} placeholder="URL Logo" className="bg-black/40 border-white/10 h-12 rounded-xl text-xs flex-1" />
                    <div className="relative">
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => handleFileUpload(e, url => setNewSponsor({...newSponsor, logoUrl: url}), 'sponsors')} />
                      <Button type="button" size="icon" className="h-12 w-12 bg-white/10 rounded-xl" disabled={isUploading === 'sponsors'}><Upload className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-white text-primary font-black h-12 rounded-xl text-[10px] italic">AJOUTER</Button>
                </form>
              </Card>
              <Card className="lg:col-span-2 bg-white/5 border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                <Table>
                  <TableHeader><TableRow><TableHead className="px-8">Partenaire</TableHead><TableHead className="text-right px-8">Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {sponsors?.map(item => (
                      <TableRow key={item.id} className="border-white/5">
                        <TableCell className="px-8 py-4"><div className="flex items-center gap-4"><div className="w-12 h-8 relative bg-white/5 rounded p-1">{item.logoUrl && <img src={item.logoUrl} className="w-full h-full object-contain" />}</div><span className="font-black uppercase italic text-xs">{item.name}</span></div></TableCell>
                        <TableCell className="text-right px-8"><Button size="icon" variant="ghost" onClick={() => handleDeleteDoc('sponsors', item.id)}><Trash className="w-3.5 h-3.5 text-destructive" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/5 border-white/10 p-8 rounded-3xl h-fit backdrop-blur-xl">
                <h3 className="text-[11px] font-black uppercase mb-8 italic flex items-center gap-3"><Images className="w-5 h-5 text-primary" /> Galerie</h3>
                <form onSubmit={handleAddGalleryItem} className="space-y-4">
                  <div className="flex gap-2">
                    <Input value={newGalleryItem.imageUrl} onChange={e => setNewGalleryItem({...newGalleryItem, imageUrl: e.target.value})} placeholder="URL Image" className="bg-black/40 border-white/10 h-12 rounded-xl text-xs flex-1" />
                    <div className="relative">
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => handleFileUpload(e, url => setNewGalleryItem({...newGalleryItem, imageUrl: url}), 'gallery')} />
                      <Button type="button" size="icon" className="h-12 w-12 bg-white/10 rounded-xl" disabled={isUploading === 'gallery'}><Upload className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <Input value={newGalleryItem.description} onChange={e => setNewGalleryItem({...newGalleryItem, description: e.target.value})} placeholder="Légende" className="bg-black/40 border-white/10 h-12 rounded-xl text-xs italic" />
                  <Button type="submit" className="w-full bg-primary text-white font-black h-12 rounded-xl text-[10px] italic">PUBLIER</Button>
                </form>
              </Card>
              <Card className="lg:col-span-2 bg-white/5 border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                <Table>
                  <TableHeader><TableRow><TableHead className="px-8">Image</TableHead><TableHead className="text-right px-8">Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {galleryItems?.sort((a,b)=> b.createdAt.localeCompare(a.createdAt)).map(item => (
                      <TableRow key={item.id} className="border-white/5">
                        <TableCell className="px-8 py-4">{item.imageUrl && <div className="w-20 h-12 relative overflow-hidden rounded-lg border border-white/10"><img src={item.imageUrl} className="w-full h-full object-cover" /></div>}</TableCell>
                        <TableCell className="text-right px-8"><Button size="icon" variant="ghost" onClick={() => handleDeleteDoc('gallery', item.id)}><Trash className="w-3.5 h-3.5 text-destructive" /></Button></TableCell>
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