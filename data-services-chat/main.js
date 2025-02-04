import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env

// Suppress all deprecation warnings (use with caution)
process.noDeprecation = true;

// console.log(process.env.OPENAI_API_KEY);

import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Hello, world!" }],
});

console.log(completion.choices[0].message.content);
