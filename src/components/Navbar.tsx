"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Music, Calendar, Store, LogOut, Lock, Star, Sparkles, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!user) return null;

  const navLinks = [
    { href: '/', label: 'HOME', icon: Sparkles },
    { href: '/univers', label: '3 UNIVERS', icon: Music },
    { href: '/guests', label: 'TALENTS', icon: Star },
    { href: '/programme', label: 'AGENDA', icon: Calendar },
    { href: '/exposants', label: 'STANDS', icon: Store },
  ];

  return (
    <>
      <nav className={cn(
        "fixed top-0 w-full z-[80] transition-all duration-500",
        isScrolled ? "py-4 bg-black/80 backdrop-blur-2xl border-b border-white/5" : "py-8 bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex flex-col leading-none group">
            <div className="text-[20px] font-black tracking-tighter text-white uppercase group-hover:text-primary transition-all duration-300">
              ONE<span className="text-primary group-hover:text-white">VIBE</span>
            </div>
            <div className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase mt-1">EST. 2027</div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "px-5 py-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all rounded-full border border-transparent",
                  pathname.startsWith(link.href) && (link.href !== '/' || pathname === '/')
                    ? "bg-white/5 text-white border-white/10" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="w-px h-4 bg-white/10 mx-4" />

            {user.email === 'christianrwemera4@gmail.com' && (
              <Link href="/admin" className="text-secondary hover:text-white flex items-center gap-2 border border-secondary/20 px-4 py-1.5 rounded-full bg-secondary/5 text-[9px] font-black uppercase tracking-widest transition-all mr-4">
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

          <button 
            className="lg:hidden p-2 text-white/60 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[70] bg-black pt-32 px-6 flex flex-col gap-6 lg:hidden"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "text-[22px] font-black uppercase italic tracking-tighter border-b border-white/5 pb-4",
                  pathname === link.href ? "text-primary" : "text-white/40"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Button 
              onClick={() => signOut(auth!)} 
              variant="ghost" 
              className="mt-10 text-destructive text-left p-0 text-[14px] font-black uppercase italic tracking-widest"
            >
              DÉCONNEXION
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
