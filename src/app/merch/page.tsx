
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function MerchPage() {
  const firestore = useFirestore();
  const merchRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'merch');
  }, [firestore]);
  const { data: merchItems, isLoading } = useCollection(merchRef);

  return (
    <div className="pt-28 pb-16 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <Link href="/explore" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-primary font-black text-[8px] uppercase tracking-[0.3em] mb-4">
            <ShoppingBag className="w-3.5 h-3.5" /> SHOP OFFICIEL
          </div>
          <h1 className="text-[22px] md:text-[30px] font-black tracking-tighter uppercase italic leading-tight">
            ONE VIBE <span className="text-primary">MERCH</span>
          </h1>
          <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-2 opacity-60">ÉDITIONS LIMITÉES 2027</p>
          <div className="w-12 h-1 bg-primary/20 mx-auto mt-5 rounded-full" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : merchItems && merchItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {merchItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all flex flex-col h-full shadow-2xl">
                  <div className="relative aspect-square overflow-hidden bg-neutral-900">
                    {item.imageUrl ? (
                      <Image 
                        src={item.imageUrl} 
                        alt={item.name} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-white/5" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-primary text-white font-black text-[10px] px-4 py-1.5 rounded-full shadow-lg italic">
                      {item.price}
                    </div>
                  </div>
                  
                  <div className="p-8 space-y-4 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-[16px] md:text-[18px] font-black uppercase italic text-white tracking-tight mb-2">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed italic line-clamp-3">
                        {item.description}
                      </p>
                    </div>
                    
                    <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[9px] tracking-widest rounded-2xl shadow-xl shadow-primary/20">
                      <a href={item.link || "https://wa.me/243994472599"} target="_blank">
                        COMMANDER <ShoppingBag className="w-3.5 h-3.5 ml-2" />
                      </a>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/5 border-dashed">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.3em] italic">La boutique arrive très prochainement...</p>
          </div>
        )}

        <div className="mt-20 p-8 md:p-12 bg-primary/5 border border-primary/20 rounded-[3rem] text-center max-w-2xl mx-auto">
          <Star className="w-8 h-8 text-primary mx-auto mb-4" />
          <h2 className="text-[16px] font-black uppercase italic mb-2">BESOIN D'UNE COMMANDE SPÉCIALE ?</h2>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-relaxed mb-6">Pour les commandes de groupes ou demandes personnalisées, contactez-nous directement.</p>
          <Button asChild variant="outline" className="h-12 px-8 border-primary/30 text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-primary/10">
            <a href="https://wa.me/243994472599" target="_blank">NOUS CONTACTER</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
