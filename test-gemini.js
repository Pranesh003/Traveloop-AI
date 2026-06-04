import { GoogleGenerativeAI } from '@google/generative-ai';

// Load API key from environment variable — never hardcode secrets!
// Set VITE_GEMINI_API_KEY in your .env file
const apiKey = process.env.GEMINI_API_KEY || '';

async function test(key, name) {
  if (!key) {
    console.error('No API key provided. Set GEMINI_API_KEY environment variable.');
    return;
  }
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent("Say hello");
    console.log(`Success with ${name}: ${result.response.text()}`);
  } catch (err) {
    console.error(`Error with ${name}:`, err.message);
  }
}

async function run() {
  await test(apiKey, 'Gemini API');
}

run();
