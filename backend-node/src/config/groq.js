import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../..', '.env') });

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const generateCompletion = async (messages, options = {}) => {
  try {
    const completion = await groqClient.chat.completions.create({
      model: options.model || 'llama-3.3-70b-versatile',
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2048,
      top_p: options.topP || 1,
      stream: false,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating completion with Groq:', error);
    throw error;
  }
};

export default groqClient;
