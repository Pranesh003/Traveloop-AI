import { GoogleGenerativeAI } from '@google/generative-ai';

// Load API key from environment variable — never hardcode secrets!
// Usage: GEMINI_API_KEY=your_key node test-gemini-models.js
const apiKey = process.env.GEMINI_API_KEY || '';

async function listModels(key, name) {
  if (!key) {
    console.error('No API key provided. Set GEMINI_API_KEY environment variable.');
    return;
  }
  try {
    const genAI = new GoogleGenerativeAI(key);
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) {
      console.error(`Error with ${name}:`, data.error.message);
    } else {
      console.log(`Success with ${name}:`);
      data.models.forEach(m => console.log(' - ' + m.name));
    }
  } catch (err) {
    console.error(`Fetch Error with ${name}:`, err.message);
  }
}

async function run() {
  await listModels(apiKey, 'Gemini API');
}

run();
