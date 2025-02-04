import dotenv from 'dotenv';
dotenv.config();

process.noDeprecation = true;

import { OpenAI } from 'openai';

/**
 * Creates and returns an instance of the OpenAI client.
 */
function initializeOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Fetches chat completion from OpenAI using the provided client and message.
 * @param {OpenAI} client - The OpenAI client instance.
 * @param {string} messageContent - The user message to send.
 * @returns {Promise<string>} - The content of the AI's reply.
 */
async function fetchChatCompletion(client, messageContent) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: messageContent }],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching chat completion:", error);
    throw error;
  }
}

/**
 * Main execution function which ties all functionalities together.
 */
async function main() {
  try {
    const client = initializeOpenAI();
    const userMessage = "Hello, world!";
    const aiResponse = await fetchChatCompletion(client, userMessage);
    console.log(aiResponse);
  } catch (error) {
    console.error("Error in main execution:", error);
  }
}

// Execute the main function as the entry point.
main();
