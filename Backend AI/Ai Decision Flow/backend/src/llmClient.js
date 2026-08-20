import OpenAI from 'openai';

// Same setup pattern as the Week 7 assignment: point the OpenAI SDK at
// OpenRouter instead of OpenAI directly, with a real timeout.
export const llmClient = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,
  apiKey: process.env.LLM_API_KEY,
  timeout: 30000,
});
