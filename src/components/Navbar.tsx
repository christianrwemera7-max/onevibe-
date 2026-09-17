
"use client";

import React from 'react';
import Link from 'next/link';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Music, Calendar, Store, LogOut, Lock, User, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navLinks = [
    { href: '/', label: 'Accueil', icon: Sparkles },
    { href: '/univers', label: 'Univers', icon: Music },
    { href: '/programme', label: 'Programme', icon: Calendar },
    { href: '/exposants', label: 'Exposants', icon: Store },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        <Link href="/" className="flex flex-col leading-none group">
          <div className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase group-hover:text-primary transition-colors">
            ONE<span className="text-primary group-hover:text-white">VIBE</span>
          </div>
          <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">FEST | 2027</div>
        </Link>
        
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-3 py-2 rounded-xl",
                pathname === link.href 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <link.icon className="w-3.5 h-3.5" />
              {link.label}
            </Link>
          ))}
          
          <div className="h-6 w-px bg-white/10 mx-2" />

          {user.email === 'christianrwemera4@gmail.com' && (
            <Link href="/admin" className="text-secondary hover:text-secondary/80 flex items-center gap-2 border border-secondary/20 px-3 py-1 rounded-full bg-secondary/5 text-[9px] font-black uppercase tracking-widest transition-all">
              <Lock className="w-3 h-3" /> ADMIN
            </Link>
          )}

          <div className="flex items-center gap-3 bg-white/5 p-1 rounded-2xl pl-4">
            <span className="text-[9px] text-muted-foreground font-mono lowercase truncate max-w-[120px]">{user.email}</span>
            <Button 
              onClick={() => signOut(auth!)} 
              variant="ghost" 
              size="icon" 
              className="w-8 h-8 rounded-xl hover:bg-destructive/20 hover:text-destructive text-muted-foreground"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Mobile Ticket CTA */}
        <Button 
          size="sm" 
          asChild
          className="font-black rounded-full bg-primary hover:bg-primary/90 text-white text-[10px] px-6 lg:hidden uppercase tracking-widest"
        >
          <a href="https://omtevents.com" target="_blank">BILLETS</a>
        </Button>
      </div>
    </nav>
  );
}
