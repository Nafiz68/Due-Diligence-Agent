import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import { answerQueue } from '../queues/index.js';

/**
 * Generate answer for a question
 */
export const generateAnswer = async (req, res, next) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: { message: 'Question not found' },
      });
    }

    // Queue answer generation
    const job = await answerQueue.add({
      questionId,
    });

    res.json({
      success: true,
      message: 'Answer generation queued',
      jobId: job.id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate answers for all questions in a questionnaire
 */
export const generateAnswersForQuestionnaire = async (req, res, next) => {
  try {
    const { questionnaireId } = req.params;

    // Queue answer generation for questionnaire
    const job = await answerQueue.add({
      questionnaireId,
    });

    res.json({
      success: true,
      message: 'Answer generation queued for all questions',
      jobId: job.id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get answers for a questionnaire
 */
export const getAnswers = async (req, res, next) => {
  try {
    const { questionnaireId } = req.params;
    const { status, page = 1, limit = 50 } = req.query;

    const query = { questionnaire: questionnaireId };
    if (status) query.status = status;

    const answers = await Answer.find(query)
      .populate('question')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Answer.countDocuments(query);

    res.json({
      success: true,
      data: answers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single answer
 */
export const getAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.id)
      .populate('question')
      .populate('citations.documentId');

    if (!answer) {
      return res.status(404).json({
        success: false,
        error: { message: 'Answer not found' },
      });
    }

    res.json({
      success: true,
      data: answer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Review and update answer
 */
export const reviewAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { finalAnswer, reviewNotes, reviewedBy, status } = req.body;

    const { reviewAnswer: reviewAnswerService } = await import(
      '../services/answerService.js'
    );

    const answer = await reviewAnswerService(id, {
      finalAnswer,
      reviewNotes,
      reviewedBy,
      status,
    });

    res.json({
      success: true,
      data: answer,
      message: 'Answer reviewed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete answer
 */
export const deleteAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        error: { message: 'Answer not found' },
      });
    }

    await answer.deleteOne();

    res.json({
      success: true,
      message: 'Answer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
