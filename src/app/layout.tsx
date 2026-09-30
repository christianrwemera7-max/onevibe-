'use client';

import React, { useState, useEffect } from 'react';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import { GlobalBackground } from '@/components/GlobalBackground';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ArtisticSidebars } from '@/components/ArtisticSidebars';
import { AnimatePresence } from 'framer-motion';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="fr" className="scroll-smooth">
      <body className="font-sans antialiased bg-background selection:bg-primary selection:text-white">
        <FirebaseClientProvider>
          <AnimatePresence mode="wait">
            {isLoading && <LoadingScreen key="loader" />}
          </AnimatePresence>
          
          <ArtisticSidebars />
          
          <div className="relative min-h-screen flex flex-col px-4 md:px-12">
            <Navbar />
            <GlobalBackground />
            <main className="flex-1 relative z-10">
              {children}
            </main>
            <Footer />
          </div>
          
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}