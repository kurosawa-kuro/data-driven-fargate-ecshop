import dotenv from 'dotenv';
import { OpenAI } from 'openai';

/**
 * Load and apply the environment configuration from .env file.
 */
function loadConfiguration() {
  dotenv.config();
}

/**
 * Constant definition for the OpenAI model name.
 */
const GPT_MODEL_NAME = "gpt-4o-mini";

/**
 * Creates and returns an instance of the OpenAI client.
 * Ensures that the API key is retrieved via environment variables.
 */
function getOpenAiClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Builds the message payload for the OpenAI chat completion.
 * @param {string} messageContent - The user message to be sent.
 * @returns {Array<Object>} - The message payload array.
 */
function buildUserMessage(messageContent) {
  return [{ role: "user", content: messageContent }];
}

/**
 * Fetches chat completion from OpenAI using the provided client and message.
 * This function encapsulates the API call logic and error handling.
 * @param {OpenAI} client - The initialized OpenAI client instance.
 * @param {string} messageContent - The text content of the user message.
 * @returns {Promise<string>} - The AI's reply content.
 */
async function fetchChatCompletion(client, messageContent) {
  try {
    const messages = buildUserMessage(messageContent);
    const response = await client.chat.completions.create({
      model: GPT_MODEL_NAME,
      messages: messages,
    });
    // Return the first message content from the response, if available.
    return response?.choices[0]?.message?.content || "No response content.";
  } catch (error) {
    console.error("Error fetching chat completion:", error);
    throw error;
  }
}

/**
 * The main execution function, which ties all functionalities together.
 * It handles configuration loading, client initialization, and processing the chat flow.
 */
async function main() {
  try {
    // Load configuration settings from environment.
    loadConfiguration();

    // Initialize the OpenAI client.
    const client = getOpenAiClient();

    // Define the user message to be sent.
    const userMessage = "Hello, world!";

    // Fetch the AI response based on the user message.
    const aiResponse = await fetchChatCompletion(client, userMessage);
    console.log(aiResponse);
  } catch (error) {
    console.error("Error in main execution:", error);
  }
}

// Execute main as the entry point of the application.
main();
