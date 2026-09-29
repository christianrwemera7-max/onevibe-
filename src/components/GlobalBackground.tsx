
'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function GlobalBackground() {
  const firestore = useFirestore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'festival');
  }, [firestore]);
  const { data: settings } = useDoc(settingsRef);

  // L'accueil possède son propre système de carousel prioritaire
  if (!mounted || pathname === '/') return null;

  const bgUrl = settings?.globalBgUrl;

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {bgUrl ? (
          <motion.div
            key={bgUrl}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
              src={bgUrl} 
              alt="Background" 
              className="w-full h-full object-cover grayscale brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-neutral-950" />
        )}
      </AnimatePresence>
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[150px]" />
    </div>
  );
}
