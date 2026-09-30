"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, useAuth, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { LogOut, Lock, ShoppingBag, Compass } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { doc } from 'firebase/firestore';

const DEFAULT_LOGO_URL = "https://res.cloudinary.com/dvz91qth6/image/upload/v1740261394/one-vibe-logo_t9v6v9.png";

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

  const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'festival') : null, [firestore]);
  const { data: settings } = useDoc(settingsRef);

  const logoUrl = settings?.logoUrl || DEFAULT_LOGO_URL;

  if (!mounted) return null;

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-[80] transition-all duration-500 font-display px-2 md:px-12",
      isScrolled ? "py-2 md:py-4" : "py-6 md:py-10"
    )}>
      <div className={cn(
        "max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between transition-all duration-500 rounded-full shadow-2xl",
        isScrolled ? "bg-background/95 backdrop-blur-3xl border border-white/10 h-14 md:h-16" : "bg-white/5 border border-white/5 backdrop-blur-md h-16 md:h-20"
      )}>
        {/* LEFT: LOGO */}
        <Link href="/" className="flex items-center group shrink-0">
          <motion.img 
            src={logoUrl} 
            alt="ONE VIBE" 
            className="h-8 md:h-12 w-auto object-contain transition-all duration-300 group-hover:scale-110 brightness-110"
            style={{ mixBlendMode: 'screen' }}
          />
        </Link>

        {/* CENTER: NAV LINKS */}
        <div className="hidden lg:flex items-center gap-10">
          <Link href="/merch" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-colors flex items-center gap-2 italic">
            <ShoppingBag className="w-3.5 h-3.5" /> SHOP
          </Link>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
            26 JUIN 2027 • KINSHASA
          </div>
          <Link href="/explore" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors flex items-center gap-2 italic">
            <Compass className="w-3.5 h-3.5" /> EXPLORER
          </Link>
        </div>
        
        {/* RIGHT: ACTIONS */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/explore" className="lg:hidden p-2 text-white/70 hover:text-white"><Compass className="w-5 h-5" /></Link>
          
          {user ? (
            <>
              {user.email === 'christianrwemera4@gmail.com' && (
                <Link href="/admin" className="text-white hover:scale-105 flex items-center gap-2 md:gap-3 border border-white/20 px-3 md:px-5 py-2 rounded-full bg-primary text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all shadow-xl italic">
                  <Lock className="w-3 h-3" /> <span className="hidden sm:inline">COCKPIT</span>
                </Link>
              )}
              <Button 
                onClick={() => signOut(auth!)} 
                variant="ghost" 
                className="h-8 md:h-9 px-3 md:px-4 rounded-full text-white/40 hover:text-destructive hover:bg-destructive/10 text-[8px] md:text-[9px] font-black uppercase tracking-widest italic"
              >
                <LogOut className="w-3 h-3 mr-1" /> EXIT
              </Button>
            </>
          ) : (
            pathname !== '/admin' && (
              <Link href="/admin" className="text-white/20 hover:text-white p-2">
                <Lock className="w-3.5 h-3.5" />
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}