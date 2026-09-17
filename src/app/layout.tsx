import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import { VibeAssistant } from '@/components/VibeAssistant';

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
          <main className="min-h-screen">
            {children}
          </main>
          <VibeAssistant />
          <Footer />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
