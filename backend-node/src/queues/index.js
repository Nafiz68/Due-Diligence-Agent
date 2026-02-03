import Queue from 'bull';
import redisClient from '../config/redis.js';
import { processDocument } from '../services/documentService.js';
import { parseQuestionnaire } from '../services/questionnaireService.js';
import {
  generateAnswer,
  generateAnswersForQuestionnaire,
} from '../services/answerService.js';

// Create job queues
export const documentQueue = new Queue('document-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

export const questionnaireQueue = new Queue('questionnaire-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

export const answerQueue = new Queue('answer-generation', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

// Document processing job handler
documentQueue.process(async (job) => {
  const { documentId } = job.data;

  console.log(`Processing document: ${documentId}`);

  try {
    job.progress(10);
    const result = await processDocument(documentId);
    job.progress(100);

    return {
      success: true,
      documentId,
      chunks: result.chunks.length,
    };
  } catch (error) {
    console.error('Document processing job failed:', error);
    throw error;
  }
});

// Questionnaire parsing job handler
questionnaireQueue.process(async (job) => {
  const { questionnaireId } = job.data;

  console.log(`Processing questionnaire: ${questionnaireId}`);

  try {
    job.progress(10);
    const result = await parseQuestionnaire(questionnaireId);
    job.progress(100);

    return {
      success: true,
      questionnaireId,
      questionCount: result.questions.length,
    };
  } catch (error) {
    console.error('Questionnaire processing job failed:', error);
    throw error;
  }
});

// Answer generation job handler
answerQueue.process(async (job) => {
  const { questionnaireId, questionId } = job.data;

  console.log(
    `Generating answers for ${questionId ? 'question' : 'questionnaire'}: ${questionId || questionnaireId}`
  );

  try {
    job.progress(10);

    let result;
    if (questionId) {
      // Generate single answer
      result = await generateAnswer(questionId);
    } else if (questionnaireId) {
      // Generate all answers for questionnaire
      result = await generateAnswersForQuestionnaire(questionnaireId);
    }

    job.progress(100);

    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error('Answer generation job failed:', error);
    throw error;
  }
});

// Event listeners
documentQueue.on('completed', (job, result) => {
  console.log(`Document job ${job.id} completed:`, result);
});

documentQueue.on('failed', (job, err) => {
  console.error(`Document job ${job.id} failed:`, err.message);
});

questionnaireQueue.on('completed', (job, result) => {
  console.log(`Questionnaire job ${job.id} completed:`, result);
});

questionnaireQueue.on('failed', (job, err) => {
  console.error(`Questionnaire job ${job.id} failed:`, err.message);
});

answerQueue.on('completed', (job, result) => {
  console.log(`Answer generation job ${job.id} completed`);
});

answerQueue.on('failed', (job, err) => {
  console.error(`Answer generation job ${job.id} failed:`, err.message);
});

export default {
  documentQueue,
  questionnaireQueue,
  answerQueue,
};
