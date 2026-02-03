import { generateCompletion } from '../config/groq.js';
import { searchDocuments } from './documentService.js';
import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import Document from '../models/Document.js';

/**
 * Generate answer for a question using AI
 */
export const generateAnswer = async (questionId, options = {}) => {
  try {
    const question = await Question.findById(questionId).populate(
      'questionnaire'
    );

    if (!question) {
      throw new Error('Question not found');
    }

    // Search for relevant documents
    const topK = options.topK || 5;
    const relevantChunks = await searchDocuments(question.questionText, topK);

    if (relevantChunks.length === 0) {
      throw new Error(
        'No relevant documents found. Please upload company documents first.'
      );
    }

    // Prepare context from relevant chunks
    const context = relevantChunks
      .map(
        (chunk, idx) =>
          `[Document ${idx + 1}: ${chunk.metadata.documentName}]\n${chunk.text}`
      )
      .join('\n\n');

    // Prepare prompt for AI
    const prompt = `You are an AI assistant helping with due diligence questionnaires. Based on the provided company documents, answer the following question accurately and concisely.

Question: ${question.questionText}

Category: ${question.category || 'General'}
${question.subcategory ? `Subcategory: ${question.subcategory}` : ''}

Relevant Document Excerpts:
${context}

Instructions:
1. Provide a clear and accurate answer based on the document excerpts
2. If the answer is not found in the documents, state that explicitly
3. Keep the answer concise but complete
4. Format the answer professionally

Answer:`;

    // Generate completion using Groq
    const generatedText = await generateCompletion(
      [
        {
          role: 'system',
          content:
            'You are an expert due diligence analyst. Provide accurate, well-structured answers based on the provided documents.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        temperature: 0.3, // Lower temperature for more factual responses
        maxTokens: 1024,
      }
    );

    // Calculate confidence score based on relevance scores
    const avgRelevance =
      relevantChunks.reduce((sum, chunk) => sum + chunk.relevanceScore, 0) /
      relevantChunks.length;

    // Prepare citations
    const citations = await Promise.all(
      relevantChunks.map(async (chunk) => {
        const doc = await Document.findById(chunk.metadata.documentId);
        return {
          documentId: chunk.metadata.documentId,
          documentName: chunk.metadata.documentName,
          chunkText: chunk.text.substring(0, 200) + '...', // Truncate for storage
          relevanceScore: chunk.relevanceScore,
        };
      })
    );

    // Create or update answer
    let answer = await Answer.findOne({ question: questionId });

    if (answer) {
      answer.generatedAnswer = generatedText;
      answer.confidenceScore = avgRelevance;
      answer.citations = citations;
      answer.status = 'generated';
    } else {
      answer = new Answer({
        question: questionId,
        questionnaire: question.questionnaire._id,
        generatedAnswer: generatedText,
        confidenceScore: avgRelevance,
        citations,
        status: 'generated',
      });
    }

    await answer.save();

    return answer;
  } catch (error) {
    console.error('Error generating answer:', error);
    throw error;
  }
};

/**
 * Generate answers for all questions in a questionnaire
 */
export const generateAnswersForQuestionnaire = async (
  questionnaireId,
  options = {}
) => {
  try {
    const questions = await Question.find({
      questionnaire: questionnaireId,
    });

    if (questions.length === 0) {
      throw new Error('No questions found for this questionnaire');
    }

    const results = {
      total: questions.length,
      generated: 0,
      failed: 0,
      answers: [],
      errors: [],
    };

    // Generate answers sequentially to avoid rate limits
    for (const question of questions) {
      try {
        const answer = await generateAnswer(question._id, options);
        results.generated++;
        results.answers.push(answer);
      } catch (error) {
        results.failed++;
        results.errors.push({
          questionId: question._id,
          questionText: question.questionText,
          error: error.message,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error generating answers for questionnaire:', error);
    throw error;
  }
};

/**
 * Review and update answer
 */
export const reviewAnswer = async (answerId, reviewData) => {
  try {
    const answer = await Answer.findById(answerId);

    if (!answer) {
      throw new Error('Answer not found');
    }

    if (reviewData.finalAnswer) {
      answer.finalAnswer = reviewData.finalAnswer;
      answer.isEdited =
        reviewData.finalAnswer !== answer.generatedAnswer;
    }

    if (reviewData.reviewNotes) {
      answer.reviewNotes = reviewData.reviewNotes;
    }

    if (reviewData.reviewedBy) {
      answer.reviewedBy = reviewData.reviewedBy;
    }

    answer.status = reviewData.status || 'reviewed';
    answer.reviewedAt = new Date();

    await answer.save();

    return answer;
  } catch (error) {
    console.error('Error reviewing answer:', error);
    throw error;
  }
};

export default {
  generateAnswer,
  generateAnswersForQuestionnaire,
  reviewAnswer,
};
