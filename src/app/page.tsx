"use client"

import React from 'react';

/**
 * Page d'accueil par défaut pour le nouveau projet.
 * Tout le code précédent a été supprimé.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="text-center space-y-6 max-w-lg">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
          Nouveau Départ
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Le projet a été entièrement nettoyé. Vous disposez maintenant d'une base vierge avec Next.js 15, Tailwind CSS v4 et Firebase pour construire votre nouvelle application.
        </p>
        <div className="pt-4">
          <div className="inline-block px-4 py-2 bg-slate-100 text-slate-500 rounded-md text-sm font-mono">
            Modifiez src/app/page.tsx pour commencer
          </div>
        </div>
      </div>
    </div>
  );
}