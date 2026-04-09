"use client"

import React, { useState, useEffect, useRef } from 'react';
import { 
  useUser, 
  useFirestore, 
  useAuth, 
  useDoc, 
  useCollection, 
  useMemoFirebase,
  setDocumentNonBlocking,
  updateDocumentNonBlocking,
  addDocumentNonBlocking
} from '@/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  collection, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { 
  FileText, 
  Plus, 
  History, 
  LogOut, 
  CreditCard, 
  Download, 
  Settings,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Eye,
  Sparkles,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency } from '@/lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { intelligentFormattingAssistant, type IntelligentFormattingAssistantOutput } from '@/ai/flows/intelligent-formatting-assistant-flow';

// --- Types ---

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  faculty: string;
  promotion: string;
  credits: number;
  role: 'user' | 'admin';
}

interface DocSettings {
  font: 'Times New Roman' | 'Arial' | 'Calibri';
  fontSize: 11 | 12;
  lineHeight: '1' | '1.5' | '2';
  margins: 'normal' | 'reduced';
}

interface DocumentData {
  id?: string;
  userId: string;
  title?: string;
  course: string;
  professor: string;
  content: string;
  settings: DocSettings;
  serviceType: 'simple' | 'nb' | 'color';
  hasCoverPage: boolean;
  hasBinding: boolean;
  pageCount: number;
  price: number;
  isPaid: boolean;
  createdAt: any;
}

// --- Components ---

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-50">
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Loader2 className="w-12 h-12 text-blue-600" />
    </motion.div>
    <p className="mt-4 text-slate-600 font-medium font-body">Chargement de CyberDoc...</p>
  </div>
);

const ErrorBoundary = ({ error, reset }: { error: string, reset: () => void }) => (
  <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex flex-col items-center text-center max-w-md mx-auto mt-20">
    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
    <h2 className="text-xl font-bold text-red-900 mb-2">Une erreur est survenue</h2>
    <p className="text-red-700 mb-6 text-sm font-code break-all">{error}</p>
    <button 
      onClick={reset}
      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Réessayer
    </button>
  </div>
);

export default function App() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  
  const [view, setView] = useState<'dashboard' | 'new' | 'history'>('dashboard');
  const [currency, setCurrency] = useState<'FC' | 'USD'>('FC');
  const [isRecharging, setIsRecharging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isRegistering, setIsRegistering] = useState(false);
  const [regData, setRegData] = useState({ firstName: '', lastName: '', university: '', faculty: '', promotion: '' });

  // Profile data
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);

  // Documents data
  const docsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'documents'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);
  const { data: documents = [], isLoading: isDocsLoading } = useCollection<DocumentData>(docsQuery);

  useEffect(() => {
    if (user && !isProfileLoading && !profile) {
      setIsRegistering(true);
    } else {
      setIsRegistering(false);
    }
  }, [user, profile, isProfileLoading]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError("Échec de la connexion Google");
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    const newProfile: UserProfile = {
      id: user.uid,
      firstName: regData.firstName,
      lastName: regData.lastName,
      email: user.email || '',
      university: regData.university,
      faculty: regData.faculty,
      promotion: regData.promotion,
      credits: 0,
      role: 'user'
    };
    setDocumentNonBlocking(doc(db, 'users', user.uid), newProfile, { merge: true });
    setIsRegistering(false);
  };

  if (isUserLoading || isProfileLoading) return <LoadingScreen />;
  if (error) return <ErrorBoundary error={error} reset={() => setError(null)} />;

  if (!user) return <LoginView onLogin={handleLogin} />;
  if (isRegistering) return <RegisterView data={regData} setData={setRegData} onSubmit={handleCompleteRegistration} />;

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <Navbar profile={profile} setView={setView} onLogout={() => signOut(auth)} currency={currency} setCurrency={setCurrency} onRecharge={() => setIsRecharging(true)} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <DashboardView 
              key="dashboard"
              profile={profile} 
              documents={documents} 
              onNew={() => setView('new')} 
              onHistory={() => setView('history')}
              currency={currency}
              onRecharge={() => setIsRecharging(true)}
            />
          )}
          {view === 'new' && (
            <NewDocView 
              key="new"
              profile={profile} 
              onBack={() => setView('dashboard')} 
              onSuccess={() => setView('history')}
              currency={currency}
            />
          )}
          {view === 'history' && (
            <HistoryView 
              key="history"
              documents={documents} 
              onBack={() => setView('dashboard')} 
              currency={currency}
            />
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isRecharging && (
          <RechargeModal 
            profile={profile} 
            onClose={() => setIsRecharging(false)} 
            currency={currency}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RechargeModal({ profile, onClose, currency }: { profile: UserProfile | null, onClose: () => void, currency: 'FC' | 'USD' }) {
  const db = useFirestore();
  const [amount, setAmount] = useState(5000);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecharge = async () => {
    if (!profile || !db) return;
    setIsProcessing(true);
    const newCredits = profile.credits + amount;
    updateDocumentNonBlocking(doc(db, 'users', profile.id), { credits: newCredits });
    setIsProcessing(false);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[40px] shadow-2xl max-w-md w-full p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
        
        <h2 className="text-2xl font-bold font-headline mb-2">Recharger votre compte</h2>
        <p className="text-muted-foreground text-sm mb-8">Ajoutez des crédits pour continuer à imprimer vos documents.</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {[2000, 5000, 10000, 25000].map((val) => (
            <button
              key={val}
              onClick={() => setAmount(val)}
              className={cn(
                "py-4 rounded-2xl border-2 font-bold transition-all",
                amount === val 
                  ? "border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10" 
                  : "border-slate-100 hover:border-slate-200 text-slate-500"
              )}
            >
              {formatCurrency(val, currency)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleRecharge}
            disabled={isProcessing}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Confirmer la recharge</>
            )}
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
          >
            Annuler
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Sub-Views ---

function LoginView({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden p-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[40px] shadow-2xl max-w-md w-full text-center relative z-10 border border-slate-100"
      >
        <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/20">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-3 font-headline tracking-tight">CyberDoc</h1>
        <p className="text-muted-foreground mb-10 leading-relaxed">La plateforme intelligente pour la mise en forme et l'impression de vos travaux académiques.</p>
        
        <button 
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-bold shadow-lg shadow-slate-200 group"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" alt="Google" />
          Se connecter avec Google
        </button>

        <div className="mt-10 pt-8 border-t border-slate-100">
          <div className="flex justify-center gap-8 text-slate-400">
            <div className="flex flex-col items-center gap-1">
              <div className="font-bold text-slate-900 text-sm">100%</div>
              <div className="text-[10px] uppercase tracking-widest">Conforme</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="font-bold text-slate-900 text-sm">PDF</div>
              <div className="text-[10px] uppercase tracking-widest">Inclus</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="font-bold text-slate-900 text-sm">24/7</div>
              <div className="text-[10px] uppercase tracking-widest">Disponible</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function RegisterView({ data, setData, onSubmit }: { data: any, setData: any, onSubmit: any }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[40px] shadow-2xl max-w-lg w-full border border-slate-100"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-headline">Complétez votre profil</h2>
            <p className="text-muted-foreground text-sm">Ces informations apparaîtront sur vos pages de garde.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
              <input 
                required
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                value={data.firstName}
                onChange={e => setData({...data, firstName: e.target.value})}
                placeholder="Ex: Jean"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nom</label>
              <input 
                required
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                value={data.lastName}
                onChange={e => setData({...data, lastName: e.target.value})}
                placeholder="Ex: Kalala"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Université</label>
            <input 
              required
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
              value={data.university}
              onChange={e => setData({...data, university: e.target.value})}
              placeholder="Ex: UNILU, UNIKIN, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Faculté</label>
              <input 
                required
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                value={data.faculty}
                onChange={e => setData({...data, faculty: e.target.value})}
                placeholder="Ex: Polytechnique"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Promotion</label>
              <input 
                required
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                value={data.promotion}
                onChange={e => setData({...data, promotion: e.target.value})}
                placeholder="Ex: BAC 3"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
          >
            Créer mon compte
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function Navbar({ profile, setView, onLogout, currency, setCurrency, onRecharge }: { profile: UserProfile | null, setView: any, onLogout: any, currency: 'FC' | 'USD', setCurrency: any, onRecharge: () => void }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => setView('dashboard')}
        >
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl font-headline tracking-tight">CyberDoc</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-1">
            <button 
              onClick={() => setCurrency('FC')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                currency === 'FC' ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
              )}
            >
              FC
            </button>
            <button 
              onClick={() => setCurrency('USD')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                currency === 'USD' ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
              )}
            >
              USD
            </button>
          </div>

          <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Solde</div>
              <div className="text-sm font-bold font-headline text-primary">
                {profile ? formatCurrency(profile.credits, currency) : formatCurrency(0, currency)}
              </div>
            </div>
            <button 
              onClick={onRecharge}
              className="hidden sm:flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all"
              title="Recharger"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function DashboardView({ profile, documents, onNew, onHistory, currency, onRecharge }: { profile: UserProfile | null, documents: DocumentData[], onNew: any, onHistory: any, currency: 'FC' | 'USD', onRecharge: () => void }) {
  const recentDocs = documents.slice(0, 3);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold font-headline mb-2">Bonjour, {profile?.firstName} 👋</h1>
          <p className="text-muted-foreground max-w-md">Prêt à transformer vos notes en documents académiques impeccables ?</p>
        </div>
        <button 
          onClick={onNew}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Nouveau Document
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-bold font-headline">{profile ? formatCurrency(profile.credits, currency) : formatCurrency(0, currency)}</div>
            <div className="flex items-center gap-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Solde Actuel</div>
              <button 
                onClick={onRecharge}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                Recharger
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-bold font-headline">{documents.filter(d => d.isPaid).length}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Documents Payés</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <History className="w-7 h-7" />
          </div>
          <div>
            <div className="text-lg font-bold font-headline truncate max-w-[150px]">
              {recentDocs[0]?.course || "Aucun document"}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dernière Activité</div>
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-headline">Documents Récents</h2>
          <button onClick={onHistory} className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            Voir tout <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentDocs.length > 0 ? (
            recentDocs.map(doc => (
              <DocCard key={doc.id} doc={doc} currency={currency} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-1">Aucun document pour le moment</h3>
              <p className="text-muted-foreground text-sm mb-6">Commencez par créer votre premier document académique.</p>
              <button 
                onClick={onNew}
                className="text-primary font-bold hover:underline"
              >
                Créer maintenant
              </button>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}

function DocCard({ doc, currency }: { doc: DocumentData, currency: 'FC' | 'USD' }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
          doc.isPaid ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
        )}>
          <FileText className="w-6 h-6" />
        </div>
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg",
          doc.isPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
        )}>
          {doc.isPaid ? 'Payé' : 'Brouillon'}
        </span>
      </div>
      <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">{doc.course}</h3>
      <p className="text-muted-foreground text-xs mb-4 line-clamp-1">{doc.professor}</p>
      
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold uppercase">
          {doc.pageCount || 0} PAGES
        </span>
        <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded text-primary font-bold uppercase">
          {doc.serviceType === 'simple' ? 'PDF' : doc.serviceType === 'nb' ? 'NB' : 'Couleur'}
        </span>
      </div>
      
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(doc.createdAt?.toDate()).toLocaleDateString()}</span>
        <span className="font-bold text-slate-900 font-headline">{formatCurrency(doc.price, currency)}</span>
      </div>
    </div>
  );
}

function NewDocView({ profile, onBack, onSuccess, currency }: { profile: UserProfile | null, onBack: any, onSuccess: any, currency: 'FC' | 'USD' }) {
  const db = useFirestore();
  const [step, setStep] = useState<'edit' | 'preview' | 'payment'>('edit');
  const [serviceType, setServiceType] = useState<'simple' | 'nb' | 'color'>('simple');
  const [hasCoverPage, setHasCoverPage] = useState(false);
  const [hasBinding, setHasBinding] = useState(false);
  const [formData, setFormData] = useState({
    course: '',
    professor: '',
    title: '',
    content: ''
  });
  const [settings, setSettings] = useState<DocSettings>({
    font: 'Times New Roman',
    fontSize: 12,
    lineHeight: '1.5',
    margins: 'normal'
  });
  
  const [aiSuggestions, setAiSuggestions] = useState<IntelligentFormattingAssistantOutput | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const calculatePageCount = () => {
    if (!formData.content) return 0;
    return Math.max(1, Math.ceil(formData.content.length / 2500));
  };

  const calculatePrice = () => {
    const pages = calculatePageCount();
    let total = pages * 100;
    if (serviceType === 'nb') total += pages * 200;
    else if (serviceType === 'color') total += pages * 500;
    if (hasCoverPage) total += 1500;
    if (hasBinding && serviceType !== 'simple') total += 1000;
    return total;
  };

  const parseLaTeXToMarkdown = (text: string) => {
    let converted = text;
    converted = converted.replace(/\\textbf\{(.*?)\}/g, '**$1**');
    converted = converted.replace(/\\textit\{(.*?)\}/g, '*$1*');
    converted = converted.replace(/\\underline\{(.*?)\}/g, '<u>$1</u>');
    converted = converted.replace(/^\\section\{(.*?)\}/gm, '# $1');
    converted = converted.replace(/^\\subsection\{(.*?)\}/gm, '## $1');
    converted = converted.replace(/\\begin\{itemize\}/g, '');
    converted = converted.replace(/\\end\{itemize\}/g, '');
    converted = converted.replace(/\\item\s+(.*)/g, '- $1');
    converted = converted.replace(/\\begin\{enumerate\}/g, '');
    converted = converted.replace(/\\end\{enumerate\}/g, '');
    return converted;
  };

  const handleAiAnalyze = async () => {
    if (!formData.content) return;
    setIsAiLoading(true);
    try {
      const result = await intelligentFormattingAssistant({ content: formData.content });
      setAiSuggestions(result);
    } catch (err) {
      console.error("AI Analysis failed", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSave = async (isPaid: boolean = false) => {
    if (!profile || !db) return;
    setIsProcessing(true);
    try {
      const price = calculatePrice();
      const pages = calculatePageCount();
      
      if (isPaid && profile.credits < price) {
        alert("Crédits insuffisants. Veuillez recharger.");
        setIsProcessing(false);
        return;
      }

      const docData: DocumentData = {
        userId: profile.id,
        course: formData.course,
        professor: formData.professor,
        title: formData.title,
        content: formData.content,
        settings,
        serviceType,
        hasCoverPage,
        hasBinding,
        pageCount: pages,
        price,
        isPaid,
        createdAt: serverTimestamp()
      };

      addDocumentNonBlocking(collection(db, 'users', profile.id, 'documents'), docData);

      if (isPaid) {
        updateDocumentNonBlocking(doc(db, 'users', profile.id), {
          credits: profile.credits - price
        });
        setTimeout(() => {
          downloadPDF();
        }, 500);
      }

      onSuccess();
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${formData.course || 'document'}.pdf`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-6xl mx-auto"
    >
      <div className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="text-muted-foreground hover:text-primary flex items-center gap-2 font-bold text-sm transition-colors group">
          <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> Retour
        </button>
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl">
          {[
            { id: 'edit', label: 'Édition', icon: FileText },
            { id: 'preview', label: 'Aperçu', icon: Eye },
            { id: 'payment', label: 'Paiement', icon: CreditCard }
          ].map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                step === s.id ? "bg-white text-primary shadow-sm" : "text-slate-400"
              )}>
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </div>
              {i < 2 && <ChevronRight className="w-3 h-3 mx-1 text-slate-300" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          {step === 'edit' && (
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg font-headline">Détails du Document</h3>
                </div>
                <button 
                  onClick={handleAiAnalyze}
                  disabled={isAiLoading || !formData.content}
                  className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent hover:bg-accent/20 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Assistant AI
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Titre (Optionnel)</label>
                  <input 
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                    placeholder="Ex: Rapport de stage"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cours</label>
                  <input 
                    required
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                    placeholder="Ex: Algorithmique"
                    value={formData.course}
                    onChange={e => setFormData({...formData, course: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Professeur</label>
                  <input 
                    required
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                    placeholder="Ex: Pr. Koffi"
                    value={formData.professor}
                    onChange={e => setFormData({...formData, professor: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-1.5 relative">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contenu du Travail</label>
                  <span className="text-[10px] text-slate-400 font-medium italic">Supporte Markdown & LaTeX</span>
                </div>
                <textarea 
                  required
                  rows={10}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all min-h-[250px] resize-none font-body"
                  placeholder="Collez votre texte ici..."
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                />
              </div>

              {aiSuggestions && (
                <div className="p-4 bg-accent/5 rounded-2xl border border-accent/20 space-y-4">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-widest">
                    <Zap className="w-3.5 h-3.5" /> Suggestions de l'Assistant
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Clarté & Style</p>
                      <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                        {aiSuggestions.claritySuggestions.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Grammaire</p>
                      <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                        {aiSuggestions.grammarCorrections.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                  <button 
                    onClick={() => setAiSuggestions(null)}
                    className="text-[10px] font-bold text-accent hover:underline"
                  >
                    Masquer les suggestions
                  </button>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" /> Mise en forme
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Police</label>
                    <select 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary outline-none"
                      value={settings.font}
                      onChange={e => setSettings({...settings, font: e.target.value as any})}
                    >
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Arial">Arial</option>
                      <option value="Calibri">Calibri</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Interligne</label>
                    <select 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary outline-none"
                      value={settings.lineHeight}
                      onChange={e => setSettings({...settings, lineHeight: e.target.value as any})}
                    >
                      <option value="1">Simple (1.0)</option>
                      <option value="1.5">Standard (1.5)</option>
                      <option value="2">Double (2.0)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-xl shadow-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Total Estimé</h4>
                    <div className="px-2 py-0.5 bg-primary rounded text-[10px] font-bold">{calculatePageCount()} PAGES</div>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">À Payer</div>
                      <div className="text-2xl font-bold font-headline">{formatCurrency(calculatePrice(), currency)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Equivalent</div>
                      <div className="text-sm font-medium text-slate-300">≈ {formatCurrency(calculatePrice(), 'USD')}</div>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setStep('preview')}
                disabled={!formData.course || !formData.professor || !formData.content}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
              >
                Générer l'aperçu
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {step === 'preview' && (
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
              <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Ceci est un aperçu. Le document final sera généré <span className="font-bold">sans filigrane</span> et prêt pour l'impression après paiement.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 font-medium">Prix total :</span>
                  <span className="text-xl font-bold font-headline text-slate-900">{formatCurrency(calculatePrice(), currency)}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <span className="text-sm text-slate-500 font-medium">Votre solde :</span>
                  <div className="text-right">
                    <span className={cn("text-lg font-bold font-headline", (profile?.credits || 0) < calculatePrice() ? "text-destructive" : "text-green-600")}>
                      {formatCurrency(profile?.credits || 0, currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep('edit')}
                  className="flex-1 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                >
                  Modifier
                </button>
                <button 
                  onClick={() => setStep('payment')}
                  disabled={(profile?.credits || 0) < calculatePrice()}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                >
                  Payer maintenant
                </button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm text-center space-y-8">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <CreditCard className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-headline">Confirmation Finale</h3>
                <p className="text-muted-foreground text-sm mt-2">Le montant total sera déduit de votre compte CyberDoc.</p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => handleSave(true)}
                  disabled={isProcessing || (profile?.credits || 0) < calculatePrice()}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Payer et Télécharger
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setStep('preview')}
                  className="text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aperçu du rendu</span>
              <span className="text-[10px] text-slate-400">Format A4 • {settings.font}</span>
            </div>
            
            <div className="bg-slate-200 p-8 rounded-xl shadow-inner overflow-auto max-h-[80vh]">
              <div 
                ref={previewRef}
                className={cn(
                  "bg-white shadow-2xl mx-auto relative overflow-hidden",
                  "w-[210mm] min-h-[297mm] p-[25mm]",
                  settings.margins === 'reduced' && "p-[15mm]"
                )}
                style={{ 
                  fontFamily: settings.font, 
                  fontSize: `${settings.fontSize}pt`,
                  lineHeight: settings.lineHeight
                }}
              >
                {step !== 'payment' && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center rotate-[-45deg] opacity-[0.03] select-none z-10">
                    <span className="text-[120px] font-black whitespace-nowrap">APERÇU CYBERDOC</span>
                  </div>
                )}

                <div className="text-justify markdown-body font-body">
                  {(() => {
                    if (!formData.content) return <p className="text-slate-300 italic">Votre contenu s'affichera ici...</p>;
                    const cleanContent = formData.content.replace(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g, '');
                    const markdownContent = parseLaTeXToMarkdown(cleanContent);
                    return (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-center font-headline" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-6 font-headline" {...props} />,
                          p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                        }}
                      >
                        {markdownContent}
                      </ReactMarkdown>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HistoryView({ documents, onBack, currency }: { documents: DocumentData[], onBack: any, currency: 'FC' | 'USD' }) {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const downloadPDF = async (docData: DocumentData) => {
    setIsDownloading(docData.id || null);
    try {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      document.body.appendChild(container);
      container.innerHTML = `<div style="width: 210mm; background: white; padding: 20mm; font-family: ${docData.settings.font}; line-height: ${docData.settings.lineHeight}; text-align: justify;">${docData.content.replace(/\n/g, '<br/>')}</div>`;
      const canvas = await html2canvas(container, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${docData.course || 'document'}.pdf`);
      document.body.removeChild(container);
    } catch (err) {
      console.error("PDF Export failed", err);
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <button onClick={onBack} className="text-slate-500 hover:text-primary flex items-center gap-2 font-bold text-sm transition-colors mb-2 group">
            <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> Retour au tableau de bord
          </button>
          <h1 className="text-3xl font-bold font-headline">Historique des Documents</h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Document</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Service</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Pages</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Statut</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.length > 0 ? (
                documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">{doc.course}</div>
                      <div className="text-xs text-slate-400">{doc.professor}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded uppercase">
                        {doc.serviceType === 'simple' ? 'PDF' : doc.serviceType === 'nb' ? 'NB' : 'Couleur'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                        {doc.pageCount || 0}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500">
                      {doc.createdAt?.toDate ? new Date(doc.createdAt.toDate()).toLocaleDateString() : 'En cours...'}
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
                        doc.isPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {doc.isPaid ? "Payé" : "Brouillon"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {doc.isPaid ? (
                        <button 
                          onClick={() => downloadPDF(doc)}
                          disabled={isDownloading === doc.id}
                          className="w-10 h-10 inline-flex items-center justify-center text-primary hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm hover:shadow-primary/20"
                        >
                          {isDownloading === doc.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        </button>
                      ) : (
                        <button className="w-10 h-10 inline-flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-xl">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <History className="w-8 h-8 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Aucun historique disponible.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
