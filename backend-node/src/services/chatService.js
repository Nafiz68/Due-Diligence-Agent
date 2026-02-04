import { generateCompletion } from '../config/groq.js';
import { searchDocuments } from './documentService.js';
import Chat from '../models/Chat.js';
import Document from '../models/Document.js';

/**
 * Process a chat message and generate response with citations
 */
export const processMessage = async (sessionId, userMessage, questionnaire = null) => {
  try {
    // Search for relevant documents
    const topK = 5;
    console.log(`Processing message: "${userMessage.substring(0, 50)}..."`);
    const relevantChunks = await searchDocuments(userMessage, topK);

    console.log(`Found ${relevantChunks.length} relevant chunks for query`);

    if (relevantChunks.length === 0) {
      const docCount = await Document.countDocuments();
      console.log(`MongoDB document count: ${docCount}`);
      const message = docCount === 0 
        ? 'No documents available. Please upload company documents from the Documents page.'
        : 'No relevant documents found for this query. Try rephrasing your question.';
      throw new Error(message);
    }

    // Prepare context from relevant chunks
    const context = relevantChunks
      .map(
        (chunk, idx) =>
          `[Document ${idx + 1}: ${chunk.metadata.documentName}]\n${chunk.text}`
      )
      .join('\n\n');

    // Prepare prompt for AI
    const prompt = `You are a helpful AI assistant with access to company documents. Answer the user's question based on the provided document excerpts. Be clear, accurate, and cite specific details when available.

${questionnaire ? `This conversation is related to questionnaire: ${questionnaire}` : ''}

User Question: ${userMessage}

Relevant Document Excerpts:
${context}

Instructions:
1. Read the question carefully
2. Provide a clear, accurate answer based on the documents
3. If the answer is not found in documents, clearly state that
4. Include specific details, numbers, dates, and references when available
5. Be concise but complete`;

    const startTime = Date.now();

    // Generate response - Groq expects array of message objects
    console.log(`Generating completion with Groq for ${relevantChunks.length} chunks...`);
    const messages = [
      {
        role: 'user',
        content: prompt,
      },
    ];
    const response = await generateCompletion(messages);
    
    if (!response) {
      throw new Error('Groq API returned empty response');
    }

    const processingTimeMs = Date.now() - startTime;
    console.log(`Completion generated in ${processingTimeMs}ms`);

    // Prepare citations
    const citations = relevantChunks.map((chunk) => ({
      documentId: chunk.metadata.documentId,
      documentName: chunk.metadata.documentName,
      chunkText: chunk.text,
      relevanceScore: chunk.score || 0,
    }));

    return {
      response,
      citations,
      confidenceScore: relevantChunks[0]?.score || 0.5,
      metadata: {
        tokensUsed: null, // Could be populated from Groq response
        processingTimeMs,
      },
    };
  } catch (error) {
    console.error('Chat processing error:', error);
    throw new Error(`Chat processing failed: ${error.message}`);
  }
};

/**
 * Create a new chat session
 */
export const createSession = async (sessionData) => {
  try {
    const chat = new Chat({
      sessionId: sessionData.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: sessionData.title || 'Chat Session',
      questionnaire: sessionData.questionnaireId,
      context: sessionData.context,
      userId: sessionData.userId,
      messages: [],
    });

    return await chat.save();
  } catch (error) {
    throw new Error(`Failed to create chat session: ${error.message}`);
  }
};

/**
 * Add message to session
 */
export const addMessage = async (sessionId, userMessage, questionnaire = null) => {
  try {
    const session = await Chat.findOne({ sessionId });
    if (!session) {
      throw new Error('Chat session not found');
    }

    // Process the message and get response
    const { response, citations, confidenceScore, metadata } = await processMessage(
      sessionId,
      userMessage,
      questionnaire
    );

    // Add user message
    session.messages.push({
      message: userMessage,
      sender: 'user',
    });

    // Add assistant response
    session.messages.push({
      message: response,
      sender: 'assistant',
      citations,
      confidenceScore,
      metadata,
    });

    const updatedSession = await session.save();
    return {
      session: updatedSession,
      response,
      citations,
      confidenceScore,
    };
  } catch (error) {
    throw new Error(`Failed to add message: ${error.message}`);
  }
};

/**
 * Get chat session
 */
export const getSession = async (sessionId) => {
  try {
    const session = await Chat.findOne({ sessionId })
      .populate('questionnaire')
      .populate('messages.citations.documentId');

    if (!session) {
      throw new Error('Chat session not found');
    }

    return session;
  } catch (error) {
    throw new Error(`Failed to get session: ${error.message}`);
  }
};

/**
 * Get all sessions for a user
 */
export const getUserSessions = async (userId) => {
  try {
    const sessions = await Chat.find({ userId, status: 'active' })
      .sort({ createdAt: -1 })
      .select('sessionId title questionnaire createdAt updatedAt');

    return sessions;
  } catch (error) {
    throw new Error(`Failed to get user sessions: ${error.message}`);
  }
};

/**
 * Update session status
 */
export const updateSessionStatus = async (sessionId, status) => {
  try {
    if (!['active', 'archived', 'closed'].includes(status)) {
      throw new Error('Invalid status');
    }

    const session = await Chat.findOneAndUpdate(
      { sessionId },
      { status },
      { new: true }
    );

    if (!session) {
      throw new Error('Chat session not found');
    }

    return session;
  } catch (error) {
    throw new Error(`Failed to update session: ${error.message}`);
  }
};

/**
 * Delete chat session
 */
export const deleteSession = async (sessionId) => {
  try {
    const result = await Chat.deleteOne({ sessionId });

    if (result.deletedCount === 0) {
      throw new Error('Chat session not found');
    }

    return { message: 'Chat session deleted successfully' };
  } catch (error) {
    throw new Error(`Failed to delete session: ${error.message}`);
  }
};
