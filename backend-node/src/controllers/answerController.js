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
 * Review and update answer with full audit trail
 */
export const reviewAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { finalAnswer, reviewNotes, reviewedBy, status, action } = req.body;

    if (!action || !['confirmed', 'rejected', 'manual_updated', 'missing_data'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid action. Must be: confirmed, rejected, manual_updated, or missing_data' },
      });
    }

    const answer = await Answer.findById(id);
    if (!answer) {
      return res.status(404).json({
        success: false,
        error: { message: 'Answer not found' },
      });
    }

    // Store previous value for audit trail
    const previousValue = answer.finalAnswer || answer.generatedAnswer;

    // Update answer based on action
    switch (action) {
      case 'confirmed':
        answer.status = 'confirmed';
        answer.finalAnswer = answer.finalAnswer || answer.generatedAnswer;
        break;
      case 'rejected':
        answer.status = 'rejected';
        answer.reviewNotes = reviewNotes || answer.reviewNotes;
        break;
      case 'manual_updated':
        if (!finalAnswer) {
          return res.status(400).json({
            success: false,
            error: { message: 'Manual updated action requires finalAnswer' },
          });
        }
        answer.status = 'manual_updated';
        answer.manualAnswer = finalAnswer;
        answer.finalAnswer = finalAnswer;
        answer.manualAnswerCreatedAt = new Date();
        answer.manualAnswerCreatedBy = reviewedBy;
        answer.isEdited = true;
        break;
      case 'missing_data':
        answer.status = 'missing_data';
        answer.reviewNotes = reviewNotes || 'Information not available in documents';
        break;
    }

    // Update review metadata
    answer.reviewedBy = reviewedBy;
    answer.reviewedAt = new Date();
    if (reviewNotes) answer.reviewNotes = reviewNotes;

    // Add to audit trail
    answer.auditTrail.push({
      timestamp: new Date(),
      action,
      actor: reviewedBy,
      changeDetails: {
        previousValue,
        newValue: answer.finalAnswer,
      },
    });

    const updatedAnswer = await answer.save();

    res.json({
      success: true,
      data: updatedAnswer,
      message: `Answer ${action} successfully`,
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
