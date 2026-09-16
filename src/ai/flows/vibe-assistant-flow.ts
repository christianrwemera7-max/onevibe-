
'use server';
/**
 * @fileOverview Assistant IA pour ONE VIBE FEST.
 *
 * - askVibeAssistant - Fonction pour interagir avec l'assistant.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VibeAssistantInputSchema = z.object({
  question: z.string().describe('La question du visiteur sur le festival ONE VIBE FEST.'),
});

const VibeAssistantOutputSchema = z.object({
  answer: z.string().describe('La réponse de l\'assistant.'),
  vibeScore: z.number().describe('Un score d\'énergie de 1 à 10.'),
});

export async function askVibeAssistant(question: string) {
  return vibeAssistantFlow({ question });
}

const prompt = ai.definePrompt({
  name: 'vibeAssistantPrompt',
  input: { schema: VibeAssistantInputSchema },
  output: { schema: VibeAssistantOutputSchema },
  prompt: `Tu es l'assistant officiel de ONE VIBE FEST. 
  Ton but est de répondre avec enthousiasme, créativité et précision.
  
  Contexte du festival :
  - Nom : ONE VIBE FEST.
  - Date : Samedi 15 Juillet 2024.
  - Lieu : Palais des Congrès.
  - Univers : Music (Concerts, Open Mic), Creative (Fashion, Art), Business (Pitch), Digital (Gaming).
  - Tarifs : Pass Standard 10.000 FC, Pass VIP 30.000 FC.
  
  Réponds à la question suivante : {{{question}}}`,
});

const vibeAssistantFlow = ai.defineFlow(
  {
    name: 'vibeAssistantFlow',
    inputSchema: VibeAssistantInputSchema,
    outputSchema: VibeAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
