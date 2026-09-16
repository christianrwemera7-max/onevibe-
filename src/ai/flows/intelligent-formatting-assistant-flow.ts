'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * Flow AI générique pour le nouveau projet.
 */
export async function genericAction(input: string) {
  return "AI Ready for new project";
}
