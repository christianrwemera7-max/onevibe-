'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { askVibeAssistant } from '@/ai/flows/vibe-assistant-flow';

export function VibeAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; text: string; vibeScore?: number }[]>([
    { role: 'bot', text: "Salut ! Je suis l'assistant VIBE. Prêt pour l'expérience 2027 ? Pose-moi tes questions sur le festival !" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await askVibeAssistant(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: result.answer, vibeScore: result.vibeScore }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Désolé, ma connexion à la VIBE est perturbée. Réessaye plus tard !" }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[90] w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,0,128,0.5)] border border-white/20"
      >
        <Sparkles className="w-6 h-6 text-white" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-8 z-[90] w-[350px] max-w-[90vw] h-[500px] bg-neutral-900 border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl"
          >
            <div className="p-6 bg-primary/10 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-white tracking-widest italic">VIBE ASSISTANT</div>
                  <div className="text-[8px] text-primary font-bold uppercase tracking-widest animate-pulse">En ligne • 2027</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] leading-relaxed italic ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white font-bold rounded-tr-none' 
                      : 'bg-white/5 border border-white/5 text-white/90 rounded-tl-none'
                  }`}>
                    {msg.text}
                    {msg.vibeScore && (
                      <div className="mt-2 text-[8px] font-black uppercase text-primary tracking-widest border-t border-white/5 pt-2">
                        VIBE SCORE: {msg.vibeScore}/10 ⚡
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-black/40">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Pose ta question..."
                  className="bg-black/50 border-white/10 text-[10px] h-11 rounded-xl"
                />
                <Button onClick={handleSend} disabled={isLoading} size="icon" className="h-11 w-11 shrink-0 rounded-xl bg-primary text-white">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
