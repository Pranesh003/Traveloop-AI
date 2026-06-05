import OpenAI from 'openai';
import { env } from '../../config/env';
import logger from '../../utils/logger';

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openaiClient) {
    if (!env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');
    openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return openaiClient;
}

export const openaiService = {
  async chat(messages: { role: 'user' | 'assistant' | 'system'; content: string }[]): Promise<string> {
    const response = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 4000,
    });
    return response.choices[0]?.message?.content ?? '';
  },

  async generateItinerary(prompt: string): Promise<string> {
    return this.chat([
      {
        role: 'system',
        content: 'You are an expert travel planner. Generate detailed, accurate itineraries in JSON format.',
      },
      { role: 'user', content: prompt },
    ]);
  },
};
