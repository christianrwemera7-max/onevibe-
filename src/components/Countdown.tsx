
'use client';

import React, { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate?: string;
}

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const target = targetDate ? new Date(targetDate) : new Date('2027-06-26T12:00:00');

    const timer = setInterval(() => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const Item = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="text-[20px] md:text-[25px] font-black text-white italic tracking-tighter tabular-nums leading-none">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-[7px] md:text-[8px] font-black uppercase text-primary tracking-[0.3em] mt-1 opacity-80">
        {label}
      </div>
    </div>
  );

  return (
    <div className="flex gap-6 md:gap-10 items-center justify-center p-6 bg-black/40 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-2xl">
      <Item value={timeLeft.days} label="Jours" />
      <div className="w-px h-8 bg-white/10" />
      <Item value={timeLeft.hours} label="Heures" />
      <div className="w-px h-8 bg-white/10" />
      <Item value={timeLeft.minutes} label="Min" />
      <div className="w-px h-8 bg-white/10" />
      <Item value={timeLeft.seconds} label="Sec" />
    </div>
  );
}
