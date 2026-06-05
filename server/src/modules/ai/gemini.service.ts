import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { env } from '../../config/env';
import logger from '../../utils/logger';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    if (!env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return genAI;
}

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export const geminiService = {
  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const model = getGenAI().getGenerativeModel({
      model: 'gemini-1.5-flash',
      safetySettings,
      systemInstruction: systemInstruction || 'You are a helpful AI travel assistant for Traveloop AI. Provide detailed, accurate, and practical travel advice.',
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
  },

  async chat(messages: { role: 'user' | 'model'; parts: { text: string }[] }[], systemInstruction?: string): Promise<string> {
    const model = getGenAI().getGenerativeModel({
      model: 'gemini-1.5-flash',
      safetySettings,
      systemInstruction: systemInstruction || 'You are Traveloop AI, an expert travel planning assistant. Be helpful, detailed, and practical.',
    });

    const chat = model.startChat({ history: messages.slice(0, -1) });
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    return result.response.text();
  },

  async generateItinerary(params: {
    destination: string;
    days: number;
    budget: number;
    currency: string;
    travelStyle: string;
    groupSize: number;
    interests: string[];
  }): Promise<string> {
    const prompt = `Generate a detailed ${params.days}-day travel itinerary for ${params.destination}.

Travel Details:
- Duration: ${params.days} days
- Budget: ${params.budget} ${params.currency} total
- Travel Style: ${params.travelStyle}
- Group Size: ${params.groupSize} people
- Interests: ${params.interests.join(', ')}

Provide a day-by-day itinerary with:
1. Morning, afternoon, and evening activities
2. Estimated costs for each activity
3. Restaurant recommendations for each meal
4. Transportation between locations
5. Practical tips and local insights
6. Accommodation suggestions by budget tier

Format as structured JSON with this shape:
{
  "destination": string,
  "totalDays": number,
  "estimatedCost": number,
  "currency": string,
  "days": [
    {
      "day": number,
      "date": null,
      "theme": string,
      "morning": { "activity": string, "duration": string, "cost": number, "tips": string },
      "afternoon": { "activity": string, "duration": string, "cost": number, "tips": string },
      "evening": { "activity": string, "duration": string, "cost": number, "tips": string },
      "meals": { "breakfast": string, "lunch": string, "dinner": string },
      "transport": string,
      "accommodation": string,
      "dailyCost": number
    }
  ],
  "packingTips": string[],
  "generalTips": string[],
  "bestTimeToVisit": string,
  "emergencyContacts": string[]
}`;

    return this.generateText(prompt);
  },

  async estimateBudget(params: {
    destinations: string[];
    days: number;
    travelers: number;
    style: 'budget' | 'mid-range' | 'luxury';
  }): Promise<string> {
    const prompt = `Estimate the complete travel budget for:
- Destinations: ${params.destinations.join(' → ')}
- Duration: ${params.days} days
- Travelers: ${params.travelers} people
- Travel Style: ${params.style}

Provide a detailed budget breakdown in JSON format:
{
  "totalEstimate": { "min": number, "max": number },
  "currency": "USD",
  "perPerson": { "min": number, "max": number },
  "breakdown": {
    "flights": { "min": number, "max": number, "notes": string },
    "accommodation": { "min": number, "max": number, "notes": string },
    "food": { "min": number, "max": number, "notes": string },
    "activities": { "min": number, "max": number, "notes": string },
    "transport": { "min": number, "max": number, "notes": string },
    "shopping": { "min": number, "max": number, "notes": string },
    "miscellaneous": { "min": number, "max": number, "notes": string }
  },
  "moneySavingTips": string[],
  "bestDeals": string[]
}`;

    return this.generateText(prompt);
  },

  async generatePackingList(params: {
    destination: string;
    days: number;
    weather: string;
    activities: string[];
    travelType: string;
  }): Promise<string> {
    const prompt = `Generate a comprehensive packing list for:
- Destination: ${params.destination}
- Duration: ${params.days} days
- Weather: ${params.weather}
- Activities: ${params.activities.join(', ')}
- Travel Type: ${params.travelType}

Return JSON format:
{
  "essentials": string[],
  "clothing": string[],
  "toiletries": string[],
  "electronics": string[],
  "documents": string[],
  "health": string[],
  "activities": string[],
  "tips": string[]
}`;

    return this.generateText(prompt);
  },

  async analyzeRisk(destination: string, travelDate: string): Promise<string> {
    const prompt = `Provide a travel risk analysis for ${destination} for travel around ${travelDate}.

Return JSON:
{
  "overallRisk": "low" | "medium" | "high",
  "safetyScore": number (1-10),
  "risks": [
    { "category": string, "level": "low"|"medium"|"high", "description": string }
  ],
  "healthAdvisories": string[],
  "vaccinations": string[],
  "localLaws": string[],
  "emergencyNumbers": { "police": string, "ambulance": string, "tourist": string },
  "safetyTips": string[],
  "recommendedInsurance": string
}`;

    return this.generateText(prompt);
  },

  async suggestDestinations(params: {
    interests: string[];
    budget: number;
    duration: number;
    currentLocation?: string;
    season: string;
  }): Promise<string> {
    const prompt = `Suggest top travel destinations based on:
- Interests: ${params.interests.join(', ')}
- Budget: $${params.budget} USD
- Duration: ${params.duration} days
- Season: ${params.season}
${params.currentLocation ? `- Departing from: ${params.currentLocation}` : ''}

Return JSON array:
[
  {
    "destination": string,
    "country": string,
    "whyRecommended": string,
    "estimatedCost": number,
    "highlights": string[],
    "bestFor": string[],
    "visaRequired": boolean,
    "safetyRating": number,
    "difficulty": "easy"|"moderate"|"challenging"
  }
]`;

    return this.generateText(prompt);
  },
};
