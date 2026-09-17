
import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import { GlobalBackground } from '@/components/GlobalBackground';

export const metadata: Metadata = {
  title: 'ONE VIBE FEST 2027',
  description: 'Le plus grand festival multidisciplinaire de Kinshasa.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="font-sans antialiased bg-black selection:bg-primary selection:text-white">
        <FirebaseClientProvider>
          <Navbar />
          <GlobalBackground />
          <main className="min-h-screen relative z-10">
            {children}
          </main>
          <Footer />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
