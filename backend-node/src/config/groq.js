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

// Helper function to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateCompletion = async (messages, options = {}) => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      const completion = await groqClient.chat.completions.create({
        model: options.model || 'llama-3.1-8b-instant', // Faster model, better rate limits
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1024, // Allow fuller answers
        top_p: options.topP || 1,
        stream: false,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      // Handle rate limit errors with retry
      if (error.status === 429 && retryCount < maxRetries) {
        const retryAfter = parseInt(error.headers?.['retry-after']) || 10;
        const waitTime = Math.min(retryAfter, 15); // Wait max 15 seconds per retry
        
        console.log(`⏳ Rate limit hit. Waiting ${waitTime}s before retry ${retryCount + 1}/${maxRetries}...`);
        await sleep(waitTime * 1000);
        retryCount++;
        continue;
      }
      
      console.error('Error generating completion with Groq:', error);
      throw error;
    }
  }
  
  throw new Error('Max retries reached for Groq API');
};

export default groqClient;
