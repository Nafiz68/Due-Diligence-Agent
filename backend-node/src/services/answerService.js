import { generateCompletion } from '../config/groq.js';
import { searchDocuments } from './documentService.js';
import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import Document from '../models/Document.js';
import Questionnaire from '../models/Questionnaire.js';
import cliProgress from 'cli-progress';

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

    console.log(`Found ${relevantChunks.length} relevant chunks for question: ${question.questionText.substring(0, 100)}...`);

    if (relevantChunks.length === 0) {
      // Check if any documents exist in MongoDB
      const docCount = await Document.countDocuments();
      const message = docCount === 0 
        ? 'No documents found in database. Please upload company documents from the Documents page.'
        : 'No relevant documents found for this question. The ChromaDB may need to be reloaded with documents.';
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
    const prompt = `You are an AI assistant helping with due diligence questionnaires. Based on the provided company documents, answer the following question accurately and completely.

Question: ${question.questionText}

Category: ${question.category || 'General'}
${question.subcategory ? `Subcategory: ${question.subcategory}` : ''}

Relevant Document Excerpts:
${context}

Instructions:
1. Read the ENTIRE question carefully and address ALL parts of it
2. Provide a clear, accurate, and COMPLETE answer based on the document excerpts
3. If the answer is not found in the documents, state: "Information not found in provided documents"
4. Include specific details, numbers, dates, and references when available
5. Structure multi-part answers with bullet points or paragraphs as appropriate
6. Be thorough - do not truncate or summarize critical information

Answer:`;

    // Generate completion using Groq
    const generatedText = await generateCompletion(
      [
        {
          role: 'system',
          content:
            'You are an expert due diligence analyst. Provide accurate, complete, and well-structured answers based on the provided documents. Address every part of the question thoroughly.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        temperature: 0.2, // Lower temperature for more factual, focused responses
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

    // Check which questions already have answers (for resume functionality)
    const existingAnswers = await Answer.find({ 
      questionnaire: questionnaireId 
    }).select('question');
    
    const answeredQuestionIds = new Set(
      existingAnswers.map(a => a.question.toString())
    );

    // Filter out questions that already have answers
    const questionsToProcess = questions.filter(
      q => !answeredQuestionIds.has(q._id.toString())
    );

    const alreadyAnswered = questions.length - questionsToProcess.length;

    const results = {
      total: questions.length,
      alreadyAnswered,
      generated: 0,
      failed: 0,
      answers: [],
      errors: [],
    };

    if (questionsToProcess.length === 0) {
      console.log(`\n✅ All ${questions.length} questions already have answers!\n`);
      return results;
    }

    // Create progress bar
    const progressBar = new cliProgress.SingleBar({
      format: 'Generating Answers |{bar}| {percentage}% | {value}/{total} Questions | ETA: {eta}s',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    console.log(`\n📝 Resuming answer generation...`);
    console.log(`   Already answered: ${alreadyAnswered}/${questions.length}`);
    console.log(`   Remaining: ${questionsToProcess.length}\n`);
    
    progressBar.start(questionsToProcess.length, 0);

    // Generate answers sequentially to avoid rate limits
    for (let i = 0; i < questionsToProcess.length; i++) {
      const question = questionsToProcess[i];
      try {
        const answer = await generateAnswer(question._id, options);
        results.generated++;
        results.answers.push(answer);
        
        // Update questionnaire answeredCount
        await Questionnaire.findByIdAndUpdate(questionnaireId, {
          answeredCount: alreadyAnswered + results.generated
        });

        // Add delay between requests to respect rate limits (0.5 seconds)
        if (i < questionsToProcess.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          questionId: question._id,
          questionText: question.questionText,
          error: error.message,
        });
      }
      progressBar.update(results.generated + results.failed);
    }

    progressBar.stop();
    console.log(`\n✅ Completed: ${results.generated} generated, ${results.failed} failed`);
    console.log(`   Total progress: ${alreadyAnswered + results.generated}/${questions.length} answered\n`);


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
