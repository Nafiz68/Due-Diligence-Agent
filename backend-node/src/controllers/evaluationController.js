import GroundTruth from '../models/GroundTruth.js';
import {
  evaluateAnswer,
  evaluateQuestionnaire,
  setGroundTruth as setGroundTruthService,
} from '../services/evaluationService.js';

/**
 * Evaluate a single answer
 */
export const evaluateSingleAnswer = async (req, res, next) => {
  try {
    const { answerId } = req.params;

    const evaluation = await evaluateAnswer(answerId);

    res.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Evaluate all answers in a questionnaire
 */
export const evaluateQuestionnaireAnswers = async (req, res, next) => {
  try {
    const { questionnaireId } = req.params;

    const evaluation = await evaluateQuestionnaire(questionnaireId);

    res.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set ground truth for a question
 */
export const setGroundTruth = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { correctAnswer, source } = req.body;

    if (!correctAnswer) {
      return res.status(400).json({
        success: false,
        error: { message: 'correctAnswer is required' },
      });
    }

    const groundTruth = await setGroundTruthService(
      questionId,
      correctAnswer,
      source
    );

    res.json({
      success: true,
      data: groundTruth,
      message: 'Ground truth set successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get ground truth for a question
 */
export const getGroundTruth = async (req, res, next) => {
  try {
    const { questionId } = req.params;

    const groundTruth = await GroundTruth.findOne({
      question: questionId,
    }).populate('question');

    if (!groundTruth) {
      return res.status(404).json({
        success: false,
        error: { message: 'Ground truth not found for this question' },
      });
    }

    res.json({
      success: true,
      data: groundTruth,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all ground truths for a questionnaire
 */
export const getGroundTruths = async (req, res, next) => {
  try {
    const { questionnaireId } = req.params;

    const groundTruths = await GroundTruth.find()
      .populate({
        path: 'question',
        match: { questionnaire: questionnaireId },
      })
      .exec();

    // Filter out null questions (those that didn't match)
    const filtered = groundTruths.filter((gt) => gt.question !== null);

    res.json({
      success: true,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};
