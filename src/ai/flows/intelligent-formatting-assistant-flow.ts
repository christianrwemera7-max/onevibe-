'use server';
/**
 * @fileOverview An AI assistant that analyzes document content and provides
 * contextual suggestions for improving structure, clarity, and grammatical correctness.
 *
 * - intelligentFormattingAssistant - A function that handles the document analysis process.
 * - IntelligentFormattingAssistantInput - The input type for the intelligentFormattingAssistant function.
 * - IntelligentFormattingAssistantOutput - The return type for the intelligentFormattingAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IntelligentFormattingAssistantInputSchema = z.object({
  content: z.string().describe('The raw document content.'),
});
export type IntelligentFormattingAssistantInput = z.infer<typeof IntelligentFormattingAssistantInputSchema>;

const IntelligentFormattingAssistantOutputSchema = z.object({
  structureSuggestions: z.array(z.string()).describe('Suggestions to improve the document\'s structure.'),
  claritySuggestions: z.array(z.string()).describe('Suggestions to improve the document\'s clarity.'),
  grammarCorrections: z.array(z.string()).describe('Specific grammatical corrections for the document.'),
});
export type IntelligentFormattingAssistantOutput = z.infer<typeof IntelligentFormattingAssistantOutputSchema>;

export async function intelligentFormattingAssistant(input: IntelligentFormattingAssistantInput): Promise<IntelligentFormattingAssistantOutput> {
  return intelligentFormattingAssistantFlow(input);
}

const intelligentFormattingAssistantPrompt = ai.definePrompt({
  name: 'intelligentFormattingAssistantPrompt',
  input: { schema: IntelligentFormattingAssistantInputSchema },
  output: { schema: IntelligentFormattingAssistantOutputSchema },
  prompt: `You are an expert academic editor and proofreader. Your task is to analyze the provided document content and offer precise, actionable suggestions for improving its structure, clarity, and grammatical correctness. Focus on academic best practices.

Provide your feedback in a structured JSON format, with three distinct arrays:
1.  'structureSuggestions': General advice on improving the overall organization and flow of the document (e.g., paragraphing, sectioning, logical progression of ideas).
2.  'claritySuggestions': Recommendations to make the language clearer, more concise, and easier to understand (e.g., removing jargon, simplifying complex sentences, improving word choice).
3.  'grammarCorrections': Specific and explicit grammatical fixes, punctuation adjustments, or spelling corrections (e.g., "Change 'it's' to 'its' in paragraph 3, sentence 2.").

Document Content:
"""
{{{content}}}
"""

Ensure your suggestions are constructive and directly applicable to an academic paper.`,
});

const intelligentFormattingAssistantFlow = ai.defineFlow(
  {
    name: 'intelligentFormattingAssistantFlow',
    inputSchema: IntelligentFormattingAssistantInputSchema,
    outputSchema: IntelligentFormattingAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await intelligentFormattingAssistantPrompt(input);
    return output!;
  }
);
