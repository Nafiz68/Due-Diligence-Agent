import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectRedis } from './config/redis.js';
import connectDB from './config/database.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the backend-node directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import queues (this will set up the processors)
import './queues/index.js';

const startWorker = async () => {
  try {
    console.log('Starting worker...');

    // Connect to databases
    await connectDB();
    await connectRedis();

    console.log('Worker is running and processing jobs');
    console.log('Queues: document-processing, questionnaire-processing, answer-generation');
  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
};

startWorker();
