
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(settingsRef);

  if (!mounted) return null;

  return (
    <nav className={cn(
      "fixed top-0 w-full z-[80] transition-all duration-500",
      isScrolled ? "py-3 bg-black/85 backdrop-blur-2xl border-b border-white/5 shadow-2xl" : "py-6 md:py-8 bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex flex-col leading-none group">
          <div className="text-[16px] md:text-[19px] font-black tracking-tighter text-white uppercase group-hover:text-primary transition-all duration-300">
            {settings?.eventName || 'ONE VIBE'}
          </div>
        </Link>
        
        <div className="flex items-center gap-3">
          {user && user.email === 'christianrwemera4@gmail.com' && (
            <>
              <Link href="/admin" className="text-secondary hover:text-white flex items-center gap-2 border border-secondary/20 px-3 py-1.5 rounded-full bg-secondary/5 text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all">
                <Lock className="w-3 h-3" /> COCKPIT
              </Link>
              <Button 
                onClick={() => signOut(auth!)} 
                variant="ghost" 
                className="h-9 px-3 rounded-full text-white/40 hover:text-destructive hover:bg-destructive/5 text-[8px] md:text-[9px] font-black uppercase tracking-widest"
              >
                <LogOut className="w-3 h-3 mr-1.5" /> EXIT
              </Button>
            </>
          )}

          {!user && pathname !== '/admin' && (
            <Link href="/admin" className="text-white/20 hover:text-white text-[8px] uppercase font-black transition-colors">
              <Lock className="w-2.5 h-2.5" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
