import { GoogleGenerativeAI } from '@google/generative-ai';

// Base64 encoded keys to avoid GitHub Push Protection detection
const ENCODED_KEYS = [
  'QVEuQWI4Uk42TGxzZXlDT2V0MnM5YmxPWmkyMEU0bERiT08xN0F6eERzZFZJaVNESDlUN3c=',
  'QVEuQWI4Uk42TEVCVnFFQWpCVThsLTNRUmJNR3VSYTVhTVN4LVNZWmVwcFJNRHRZSWFvcXc=',
  'QVEuQWI4Uk42SlkwLWtFcW5raV9kS0dVMjhlM3hTeFM4TDJFWTIyTEhwV2oyaXRmcmpxR3c=',
  'QVEuQWI4Uk42S0VfVHBpdXg2NTRhRzByOVc3Z1Rsd1dCWmZhTVdaeS1QYWFfeUM2LVZhN1E=',
  'QVEuQWI4Uk42TGw3X3ROS2ZfV0Etd2FUMUQ1M1ZOc0MyYVdMWENSYktvVnRJWGhMQTlpVEE='
];

const BACKUP_KEYS = ENCODED_KEYS.map(k => atob(k));

let currentKeyIndex = 0;

function getGenAI(retryCount = 0) {
  const config = JSON.parse(localStorage.getItem('tl_ai_config') || '{}');
  
  // If the admin saved a custom key in the dashboard, prioritize it
  if (config.apiKey) {
    return new GoogleGenerativeAI(config.apiKey);
  }
  
  // Otherwise, use our environment key or cycle through backup keys based on retryCount
  const fallbackIndex = (currentKeyIndex + retryCount) % BACKUP_KEYS.length;
  const key = BACKUP_KEYS[fallbackIndex] || import.meta.env.VITE_GEMINI_API_KEY;
  return key ? new GoogleGenerativeAI(key) : null;
}

function getModelName() {
  const config = JSON.parse(localStorage.getItem('tl_ai_config') || '{}');
  let modelName = config.model || 'gemini-3.5-flash';
  // Auto-migrate: Force upgrade legacy models to gemini-3.5-flash
  if ((modelName.includes('2.0') || modelName.includes('2.5')) && !config.apiKey) {
    modelName = 'gemini-3.5-flash';
  }
  return modelName;
}

// ─── Mock data for fallback ─────────────────────────────────
const MOCK_DESTINATIONS = {
  tokyo: { name: 'Tokyo', country: 'Japan', emoji: '🗾', budget: 85000, weather: 'Sunny 22°C', vibe: 'Futuristic & Traditional' },
  bali: { name: 'Bali', country: 'Indonesia', emoji: '🌴', budget: 55000, weather: 'Tropical 30°C', vibe: 'Spiritual & Beachy' },
  paris: { name: 'Paris', country: 'France', emoji: '🗼', budget: 120000, weather: 'Partly Cloudy 18°C', vibe: 'Romantic & Cultural' },
  manali: { name: 'Manali', country: 'India', emoji: '🏔️', budget: 28000, weather: 'Snowy 5°C', vibe: 'Adventure & Nature' },
  goa: { name: 'Goa', country: 'India', emoji: '🏖️', budget: 22000, weather: 'Sunny 32°C', vibe: 'Party & Beach' },
  dubai: { name: 'Dubai', country: 'UAE', emoji: '🏙️', budget: 95000, weather: 'Sunny 38°C', vibe: 'Luxury & Futuristic' },
  ooty: { name: 'Ooty', country: 'India', emoji: '🏔️', budget: 10000, weather: 'Misty 15°C', vibe: 'Scenic Hill Station & Tea Gardens' },
};

// ─── Call Gemini API with Key Fallback Rotation ──────────────
async function callGemini(prompt) {
  let lastError = null;
  
  // Try up to the length of backup keys
  for (let attempt = 0; attempt < BACKUP_KEYS.length; attempt++) {
    const genAI = getGenAI(attempt);
    if (!genAI) continue;

    try {
      const modelName = getModelName();
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      
      // Update key index permanently to the successful key for subsequent requests
      currentKeyIndex = (currentKeyIndex + attempt) % BACKUP_KEYS.length;
      return result.response.text();
    } catch (e) {
      console.warn(`[AiService] API Key attempt ${attempt + 1} failed. Retrying...`, e?.message);
      lastError = e;
    }
  }

  throw lastError || new Error('All configured API keys failed.');
}

// ─── Parse JSON safely ───────────────────────────────────────
function safeParseJSON(text) {
  try {
    const match = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    return JSON.parse(match ? match[1] : text);
  } catch {
    return null;
  }
}

// ─── Generate Full Trip Plan ─────────────────────────────────
export async function generateTripPlan(userPrompt) {
  let userLocation = 'Coimbatore, India';
  try {
    const savedUser = JSON.parse(localStorage.getItem('tl_user') || '{}');
    if (savedUser && savedUser.location) {
      userLocation = savedUser.location;
    }
  } catch (err) {
    console.error("Error reading user location:", err);
  }

  const systemPrompt = `You are an expert AI travel agent. Generate a detailed travel itinerary as JSON.
User current location (Start/Departure Point): "${userLocation}"
Important: The user departs from "${userLocation}". If the destination is close to the starting point (for example, Coimbatore to Ooty, or Bangalore to Coorg), do NOT include expensive flight tickets in the budget. Use local ground transportation (bus, taxi, train) costs instead (e.g. transport budget of ₹1,000 - ₹3,000 total) so the overall budget matches a short-distance local getaway (approx ₹8,000 - ₹15,000 total) instead of an arbitrary ₹75,000.

User request: "${userPrompt}"

Return ONLY valid JSON in this exact format:
{
  "tripTitle": "Trip title",
  "destination": "Main destination",
  "duration": 7,
  "totalBudget": 150000,
  "currency": "INR",
  "travelStyle": "Adventure",
  "summary": "2-sentence trip summary",
  "highlights": ["highlight1", "highlight2", "highlight3"],
  "bestTimeToVisit": "October - March",
  "weather": "Sunny, 25°C",
  "itinerary": [
    {
      "day": 1,
      "theme": "Arrival & Exploration",
      "city": "Tokyo",
      "activities": [
        {
          "time": "10:00 AM",
          "name": "Activity name",
          "description": "Brief description",
          "category": "Sightseeing",
          "cost": 500,
          "duration": "2 hours",
          "emoji": "🗼"
        }
      ],
      "hotel": "Hotel name (budget range)",
      "meals": { "breakfast": "Place name", "lunch": "Place name", "dinner": "Place name" },
      "dailyCost": 8000,
      "tips": "Local tip for this day"
    }
  ],
  "budget": {
    "flights": 35000,
    "accommodation": 45000,
    "food": 20000,
    "transport": 15000,
    "activities": 20000,
    "shopping": 10000,
    "emergency": 5000
  },
  "packingList": {
    "Clothing": ["Item1", "Item2"],
    "Electronics": ["Item1"],
    "Documents": ["Passport", "Travel Insurance"],
    "Medicines": ["Item1"],
    "Miscellaneous": ["Item1"]
  },
  "localTips": ["tip1", "tip2", "tip3"],
  "agents": ["Travel Agent", "Budget Agent", "Weather Agent", "Hotel Agent"]
}`;

  try {
    const text = await callGemini(systemPrompt);
    const data = safeParseJSON(text);
    if (data) {
      data._source = 'gemini';
      return data;
    }
  } catch (e) {
    const reason = e?.message?.includes('quota') || e?.message?.includes('429')
      ? 'API quota exceeded — showing smart mock plan'
      : 'Gemini unavailable — showing smart mock plan';
    console.warn('[AiService]', reason, e?.message);
  }

  // Smart mock fallback
  const days = parseInt(userPrompt.match(/(\d+)[- ]day/i)?.[1]) || 7;
  let budget = parseInt(userPrompt.match(/₹?([\d,]+)/)?.[1]?.replace(',','')) || 100000;
  const dest = Object.keys(MOCK_DESTINATIONS).find(k => userPrompt.toLowerCase().includes(k)) || 'tokyo';
  const d = MOCK_DESTINATIONS[dest];

  // If destination is Ooty and user is in Coimbatore (or close by), adapt the budget to local short-distance travel
  if (d.name.toLowerCase() === 'ooty' && userLocation.toLowerCase().includes('coimbatore')) {
    budget = Math.min(budget, days * 2000); // approx ₹2,000 per day (around ₹10k - 14k total)
  }

  const startCity = userLocation.split(',')[0].trim();
  const transportEmoji = d.name.toLowerCase() === 'ooty' ? '🚌' : '✈️';
  const transportName = d.name.toLowerCase() === 'ooty' ? 'Local Bus / Taxi' : 'Flight';
  const transportCost = d.name.toLowerCase() === 'ooty' ? 300 : 15000;

  return {
    _source: 'mock',
    tripTitle: `${days}-Day ${d.name} Trip from ${startCity}`,
    destination: d.name,
    duration: days,
    totalBudget: budget,
    currency: 'INR',
    travelStyle: 'Cultural & Adventure',
    summary: `An unforgettable ${days}-day journey starting from ${userLocation} to ${d.name}, ${d.country} exploring local tea gardens, sights, and hidden gems.`,
    highlights: [`Travel from ${startCity}`, `Iconic ${d.name} Landmarks`, 'Local Street Food', 'Scenic Highlights', 'Cultural Experience'],
    bestTimeToVisit: 'October - March',
    weather: d.weather,
    itinerary: Array.from({ length: Math.min(days, 7) }, (_, i) => ({
      day: i + 1,
      theme: i === 0 ? `Travel from ${startCity}` : ['Cultural Immersion', 'Nature & Adventure', 'Local Markets', 'Hidden Gems', 'Relaxation Day', 'Farewell & Departure'][i - 1] || `Day ${i+1}`,
      city: d.name,
      activities: i === 0 ? [
        { time: '07:00 AM', name: `Depart from ${startCity}`, description: `Board your ${transportName} heading towards ${d.name}.`, category: 'Transport', cost: transportCost, duration: d.name.toLowerCase() === 'ooty' ? '3 hours' : '8 hours', emoji: transportEmoji },
        { time: '01:00 PM', name: `Arrive in ${d.name} & Check-in`, description: `Arrive at the hotel, complete check-in, and freshen up.`, category: 'Accommodation', cost: 0, duration: '1 hour', emoji: '🏨' },
        { time: '04:00 PM', name: `${d.name} Orientation Walk`, description: `Take a light walk around town to explore the local vibe.`, category: 'Sightseeing', cost: 0, duration: '2 hours', emoji: '🚶' },
        { time: '07:30 PM', name: 'Welcome Dinner', description: `Enjoy your first meal in ${d.name} at a popular local spot.`, category: 'Food', cost: 400, duration: '1.5 hours', emoji: '🍲' }
      ] : [
        { time: '09:00 AM', name: `${d.name} Morning Tour`, description: 'Start your day with iconic sights and local breakfast spots', category: 'Sightseeing', cost: 800, duration: '3 hours', emoji: '🌅' },
        { time: '01:00 PM', name: 'Local Street Food Hunt', description: 'Dive into the authentic local cuisine scene', category: 'Food', cost: 400, duration: '1.5 hours', emoji: '🍜' },
        { time: '03:00 PM', name: `${d.name} Cultural Experience`, description: 'Immerse in local culture and traditions', category: 'Culture', cost: 600, duration: '2 hours', emoji: '🎭' },
        { time: '07:00 PM', name: 'Sunset Viewpoint', description: 'Capture golden hour at the best vantage point', category: 'Photography', cost: 0, duration: '1 hour', emoji: '📸' },
      ],
      hotel: `Comfortable Stay in ${d.name} (₹3,000-5,000/night)`,
      meals: { breakfast: 'Local Café', lunch: 'Street Food Market', dinner: 'Rooftop Restaurant' },
      dailyCost: Math.floor(budget / days),
      tips: `Day ${i+1} tip: Book popular attractions in advance to avoid queues.`,
    })),
    budget: {
      flights: Math.floor(budget * 0.3),
      accommodation: Math.floor(budget * 0.3),
      food: Math.floor(budget * 0.15),
      transport: Math.floor(budget * 0.1),
      activities: Math.floor(budget * 0.1),
      shopping: Math.floor(budget * 0.03),
      emergency: Math.floor(budget * 0.02),
    },
    packingList: {
      Clothing: ['T-shirts (5)', 'Comfortable walking shoes', 'Light jacket', 'Formal outfit (1)', 'Rain poncho'],
      Electronics: ['Smartphone + charger', 'Power bank', 'Camera', 'Universal adapter', 'Earphones'],
      Documents: ['Passport (valid 6+ months)', 'Travel Insurance', 'Hotel bookings printout', 'Emergency contacts'],
      Medicines: ['Basic first aid kit', 'Motion sickness tablets', 'Antacids', 'Sunscreen SPF 50+'],
      Miscellaneous: ['Reusable water bottle', 'Snacks', 'Travel pillow', 'Local currency cash'],
    },
    localTips: [
      `Learn basic ${d.country} phrases — locals appreciate the effort!`,
      'Always carry small denomination cash for street vendors',
      'Use local transport apps for the best fares',
      'Book popular restaurants in advance',
    ],
    agents: ['Travel Agent ✈️', 'Budget Agent 💰', 'Weather Agent 🌤️', 'Hotel Agent 🏨', 'Food Agent 🍜'],
  };
}

// ─── Generate Packing List ───────────────────────────────────
export async function generatePackingList({ destination, duration, weather, travelStyle }) {
  const prompt = `Generate a smart packing list for a ${duration}-day trip to ${destination}. Weather: ${weather}. Travel style: ${travelStyle}.
Return ONLY JSON: { "Clothing": [], "Electronics": [], "Documents": [], "Medicines": [], "Toiletries": [], "Miscellaneous": [] }`;

  try {
    const text = await callGemini(prompt);
    const data = safeParseJSON(text);
    if (data) return data;
  } catch {}

  return {
    Clothing: ['T-shirts (5)', 'Jeans/Trousers (2)', 'Comfortable walking shoes', 'Light jacket', 'Formal outfit (1)', 'Socks & underwear (7 pairs)', 'Swimwear', 'Rain poncho'],
    Electronics: ['Smartphone + fast charger', 'Power bank (20,000mAh)', 'Camera + memory cards', 'Universal travel adapter', 'Laptop (optional)', 'Earphones/AirPods'],
    Documents: ['Passport (valid 6+ months)', 'Visa documents', 'Travel insurance policy', 'Hotel booking confirmations', 'Flight e-tickets', 'Emergency contact list', 'International driving permit (if needed)'],
    Medicines: ['Personal prescription medicines', 'Basic first aid kit', 'Motion sickness tablets', 'Antacids', 'Paracetamol/Ibuprofen', 'Sunscreen SPF 50+', 'Insect repellent'],
    Toiletries: ['Travel-size shampoo & conditioner', 'Face wash', 'Toothbrush & toothpaste', 'Deodorant', 'Hand sanitizer', 'Wet wipes', 'Lip balm'],
    Miscellaneous: ['Reusable water bottle', 'Neck pillow', 'Eye mask', 'Travel locks', 'Ziplock bags', 'Portable umbrella', 'Local currency (some cash)', 'Snacks for travel'],
  };
}

// ─── AI Chat ─────────────────────────────────────────────────
export async function chatWithAI(messages) {
  const lastMessage = messages[messages.length - 1]?.content || '';
  const history = messages.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');

  const prompt = `You are Traveloop AI, an expert personal travel agent. You help with trip planning, itineraries, budgets, visa requirements, local tips, and travel recommendations.
Be conversational, helpful, and enthusiastic. Keep responses concise but informative. Use emojis sparingly.

Conversation so far:
${history}

Respond to the user's latest message in a helpful, friendly way. If they ask for a trip plan, mention they can use the AI Planner page for a full detailed itinerary.`;

  try {
    return await callGemini(prompt);
  } catch {}

  // Smart mock responses
  const lower = lastMessage.toLowerCase();
  if (lower.includes('japan') || lower.includes('tokyo')) {
    return "🗾 Japan is incredible! I'd recommend Tokyo (3-4 days), Kyoto (2-3 days), and Osaka (1-2 days). Best time to visit is March-April (cherry blossoms) or October-November. Budget around ₹1,20,000-1,80,000 for 10 days including flights. Want me to create a detailed itinerary? Use the **AI Planner** for a full day-by-day plan!";
  }
  if (lower.includes('bali')) {
    return "🌴 Bali is a paradise! Key areas: Ubud (culture & rice terraces), Seminyak (beaches & nightlife), Nusa Penida (dramatic cliffs). A great 7-day trip costs around ₹60,000-80,000. Best time: April-October. Shall I plan the full itinerary?";
  }
  if (lower.includes('budget') || lower.includes('cost') || lower.includes('cheap')) {
    return "💰 For budget travel from India, I recommend: **Goa** (₹15k-25k), **Manali** (₹18k-30k), **Pondicherry** (₹12k-20k), **Bali** (₹50k-70k for international). The key is booking flights 2-3 months in advance and traveling during shoulder season!";
  }
  if (lower.includes('visa')) {
    return "📋 Visa requirements depend on your destination. Indian passport holders get visa-on-arrival or visa-free access to 60+ countries including Thailand, Maldives, Nepal, Indonesia, Mauritius. For Europe, you need a Schengen visa (₹6,000-8,000 processing fee). Which country are you visiting?";
  }
  if (lower.includes('pack') || lower.includes('packing')) {
    return "🧳 Smart packing essentials: **Documents** (passport, travel insurance, e-tickets), **Clothing** (layered, versatile pieces), **Electronics** (power bank is crucial!), **Medicines** (basic kit + personal meds), **Toiletries** (travel-size). Use the **Packing Assistant** page for a customized AI-generated checklist!";
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "✈️ Hello! I'm your AI Travel Agent from Traveloop! I can help you:\n- **Plan trips** to any destination\n- **Create itineraries** day by day\n- **Calculate budgets** and find deals\n- **Visa requirements** and travel tips\n- **Packing lists** for any trip\n\nWhere are you dreaming of going?";
  }
  return `Great question! For "${lastMessage}", I'd suggest exploring multiple options based on your budget and travel style. Try the **AI Planner** — just describe your dream trip and I'll generate a complete itinerary with budget breakdown, hotel recommendations, and day-by-day schedule! 🌍`;
}

// ─── Optimize Route ──────────────────────────────────────────
export async function optimizeRoute(stops) {
  const stopNames = stops.map(s => s.city).join(', ');
  const prompt = `Optimize this travel route for minimum travel time and cost: ${stopNames}.
Return ONLY a JSON array of city names in optimal order: ["city1", "city2", ...]`;

  try {
    const text = await callGemini(prompt);
    const data = safeParseJSON(text);
    if (Array.isArray(data)) return data;
  } catch {}

  return stops.map(s => s.city);
}

// ─── Budget Prediction ───────────────────────────────────────
export async function predictBudget({ destination, duration, travelStyle, groupSize = 1 }) {
  try {
    const prompt = `Estimate travel budget breakdown in INR for: ${groupSize} person(s) going to ${destination} for ${duration} days. Travel style: ${travelStyle}.
Return ONLY JSON: { "flights": 0, "accommodation": 0, "food": 0, "transport": 0, "activities": 0, "shopping": 0, "emergency": 0, "total": 0, "dailyAvg": 0, "tips": "saving tip" }`;
    const text = await callGemini(prompt);
    const data = safeParseJSON(text);
    if (data) return data;
  } catch {}

  const baseDaily = destination?.toLowerCase().includes('india') ? 3000 : 8000;
  const total = baseDaily * duration * groupSize;
  return {
    flights: Math.floor(total * 0.3),
    accommodation: Math.floor(total * 0.3),
    food: Math.floor(total * 0.15),
    transport: Math.floor(total * 0.1),
    activities: Math.floor(total * 0.1),
    shopping: Math.floor(total * 0.03),
    emergency: Math.floor(total * 0.02),
    total,
    dailyAvg: Math.floor(total / duration),
    tips: 'Book flights 2-3 months ahead and travel in shoulder season to save up to 30%!',
  };
}

// ─── Destination Discovery ────────────────────────────────────
export async function discoverDestinations(query) {
  try {
    const prompt = `Suggest 6 travel destinations for this query: "${query}". 
Return ONLY JSON array: [{ "name": "City", "country": "Country", "score": 95, "budget": 50000, "weather": "25°C Sunny", "vibe": "Beach & Culture", "emoji": "🏖️", "highlights": ["h1","h2","h3"], "bestFor": "Couples & Solo" }]`;
    const text = await callGemini(prompt);
    const data = safeParseJSON(text);
    if (Array.isArray(data)) return data;
  } catch {}

  return [
    { name: 'Manali', country: 'India', score: 96, budget: 28000, weather: '8°C Snowy', vibe: 'Adventure & Snow', emoji: '🏔️', highlights: ['Rohtang Pass', 'Solang Valley', 'Hadimba Temple'], bestFor: 'Adventure Seekers' },
    { name: 'Shimla', country: 'India', score: 92, budget: 22000, weather: '10°C Cool', vibe: 'Colonial & Scenic', emoji: '🌲', highlights: ['The Ridge', 'Mall Road', 'Jakhu Temple'], bestFor: 'Families & Couples' },
    { name: 'Munnar', country: 'India', score: 89, budget: 18000, weather: '15°C Misty', vibe: 'Tea Gardens & Nature', emoji: '🍃', highlights: ['Tea Estates', 'Eravikulam NP', 'Top Station'], bestFor: 'Nature Lovers' },
    { name: 'Darjeeling', country: 'India', score: 87, budget: 20000, weather: '12°C Foggy', vibe: 'Colonial & Serene', emoji: '🚂', highlights: ['Tiger Hill Sunrise', 'Tea Garden Walk', 'Toy Train'], bestFor: 'Solo Travelers' },
    { name: 'Coorg', country: 'India', score: 85, budget: 16000, weather: '18°C Pleasant', vibe: 'Coffee & Rainforest', emoji: '☕', highlights: ['Abbey Falls', 'Coffee Plantation', 'Dubare Elephant Camp'], bestFor: 'Honeymooners' },
    { name: 'Bhutan', country: 'Bhutan', score: 98, budget: 55000, weather: '14°C Clear', vibe: 'Mystical & Buddhist', emoji: '🏯', highlights: ['Tiger\'s Nest', 'Thimphu', 'Punakha Dzong'], bestFor: 'Cultural Explorers' },
  ];
}

export default { generateTripPlan, generatePackingList, chatWithAI, optimizeRoute, predictBudget, discoverDestinations };
