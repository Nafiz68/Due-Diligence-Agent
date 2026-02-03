import fs from 'fs/promises';
import pdf from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import Document from '../models/Document.js';
import { generateEmbeddings } from '../config/huggingface.js';
import { getOrCreateCollection } from '../config/chroma.js';

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

/**
 * Split text into overlapping chunks
 */
const chunkText = (text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) => {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push({
      text: text.slice(start, end),
      chunkIndex: chunks.length,
    });
    start += chunkSize - overlap;
  }

  return chunks;
};

/**
 * Extract text from PDF file
 */
export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);

    return {
      text: data.text,
      metadata: {
        pageCount: data.numpages,
        info: data.info,
      },
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Process document: extract text, chunk, embed, and store in ChromaDB
 */
export const processDocument = async (documentId) => {
  try {
    const document = await Document.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Update status to processing
    document.status = 'processing';
    await document.save();

    // Extract text from PDF
    const { text, metadata } = await extractTextFromPDF(document.filePath);
    document.extractedText = text;
    document.metadata = {
      pageCount: metadata.pageCount,
      ...metadata.info,
    };

    // Chunk the text
    const chunks = chunkText(text);

    // Generate embeddings for all chunks
    const chunkTexts = chunks.map((c) => c.text);
    const embeddings = await generateEmbeddings(chunkTexts);

    // Store in ChromaDB
    const collection = await getOrCreateCollection('documents');

    const ids = chunks.map((c) => `${documentId}_chunk_${c.chunkIndex}`);
    const metadatas = chunks.map((c) => ({
      documentId: documentId.toString(),
      chunkIndex: c.chunkIndex.toString(),
      documentName: document.originalName,
    }));

    await collection.add({
      ids,
      embeddings,
      documents: chunkTexts,
      metadatas,
    });

    // Update document with chunk information
    document.chunks = chunks.map((c, idx) => ({
      text: c.text,
      chunkIndex: c.chunkIndex,
      vectorId: ids[idx],
    }));

    document.status = 'completed';
    await document.save();

    return document;
  } catch (error) {
    console.error('Error processing document:', error);

    // Update document status to failed
    const document = await Document.findById(documentId);
    if (document) {
      document.status = 'failed';
      document.error = error.message;
      await document.save();
    }

    throw error;
  }
};

/**
 * Search for relevant document chunks
 */
export const searchDocuments = async (query, topK = 5) => {
  try {
    const collection = await getOrCreateCollection('documents');

    // Generate embedding for query
    const queryEmbedding = await generateEmbeddings([query]);

    // Search in ChromaDB
    const results = await collection.query({
      queryEmbeddings: queryEmbedding,
      nResults: topK,
    });

    // Format results
    const formattedResults = [];
    if (results.ids && results.ids[0]) {
      for (let i = 0; i < results.ids[0].length; i++) {
        formattedResults.push({
          id: results.ids[0][i],
          text: results.documents[0][i],
          metadata: results.metadatas[0][i],
          distance: results.distances[0][i],
          relevanceScore: 1 - results.distances[0][i], // Convert distance to similarity
        });
      }
    }

    return formattedResults;
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
};

export default {
  extractTextFromPDF,
  processDocument,
  searchDocuments,
};
