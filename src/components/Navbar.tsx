
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { LogOut, Lock } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { doc } from 'firebase/firestore';

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(settingsRef);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!user) return null;

  return (
    <nav className={cn(
      "fixed top-0 w-full z-[80] transition-all duration-500",
      isScrolled ? "py-4 bg-black/80 backdrop-blur-2xl border-b border-white/5" : "py-8 bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex flex-col leading-none group">
          <div className="text-[20px] font-black tracking-tighter text-white uppercase group-hover:text-primary transition-all duration-300">
            {settings?.eventName || 'ONE VIBE'}
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          {user.email === 'christianrwemera4@gmail.com' && (
            <Link href="/admin" className="text-secondary hover:text-white flex items-center gap-2 border border-secondary/20 px-4 py-1.5 rounded-full bg-secondary/5 text-[9px] font-black uppercase tracking-widest transition-all">
              <Lock className="w-3 h-3" /> COCKPIT
            </Link>
          )}

          <Button 
            onClick={() => signOut(auth!)} 
            variant="ghost" 
            className="h-10 px-4 rounded-full text-white/40 hover:text-destructive hover:bg-destructive/5 text-[9px] font-black uppercase tracking-widest"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" /> EXIT
          </Button>
        </div>
      </div>
    </nav>
  );
}
