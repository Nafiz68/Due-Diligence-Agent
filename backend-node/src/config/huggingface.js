import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../..', '.env') });

// Simple embedding generator using TF-IDF-like approach
// This creates consistent 384-dimensional vectors for text similarity
const EMBEDDING_DIM = 384;

function simpleHash(str, seed) {
  let hash = seed;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

function generateSimpleEmbedding(text) {
  // Normalize text
  const normalized = text.toLowerCase().trim();
  
  // Create embedding vector
  const embedding = new Array(EMBEDDING_DIM).fill(0);
  
  // Split into words and generate features
  const words = normalized.split(/\s+/).filter(w => w.length > 2);
  
  // Use multiple hash functions to distribute features
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Generate multiple features per word using different seeds
    for (let seed = 0; seed < 3; seed++) {
      const hash = Math.abs(simpleHash(word, seed));
      const index = hash % EMBEDDING_DIM;
      
      // TF-IDF-like weighting
      const tf = 1 / Math.sqrt(words.length);
      embedding[index] += tf;
    }
  }
  
  // Normalize the vector (L2 normalization)
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      embedding[i] /= magnitude;
    }
  }
  
  return embedding;
}

export const generateEmbedding = async (text) => {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }
    
    const embedding = generateSimpleEmbedding(text);
    console.log(`Generated embedding for text (${text.substring(0, 50)}...)`);
    
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    throw error;
  }
};

export const generateEmbeddings = async (texts) => {
  try {
    const embeddings = texts.map((text) => generateSimpleEmbedding(text));
    console.log(`Generated ${embeddings.length} embeddings`);
    return embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
};
