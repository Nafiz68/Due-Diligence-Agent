import { ChromaClient } from 'chromadb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../..', '.env') });

const chromaClient = new ChromaClient({
  path: `http://${process.env.CHROMA_HOST || 'localhost'}:${process.env.CHROMA_PORT || 8000}`,
});

export const getOrCreateCollection = async (collectionName) => {
  try {
    const collection = await chromaClient.getOrCreateCollection({
      name: collectionName,
      metadata: { 'hnsw:space': 'cosine' },
    });
    return collection;
  } catch (error) {
    console.error('Error creating/getting ChromaDB collection:', error);
    throw error;
  }
};

export default chromaClient;
