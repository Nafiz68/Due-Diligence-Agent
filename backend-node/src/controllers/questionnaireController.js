import Questionnaire from '../models/Questionnaire.js';
import Question from '../models/Question.js';
import { questionnaireQueue } from '../queues/index.js';

/**
 * Upload questionnaire
 */
export const uploadQuestionnaire = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded' },
      });
    }

    const { name, description } = req.body;

    const questionnaire = new Questionnaire({
      name: name || req.file.originalname,
      description,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.originalname.split('.').pop().toLowerCase(),
      status: 'pending',
    });

    await questionnaire.save();

    // Queue questionnaire for processing
    await questionnaireQueue.add({
      questionnaireId: questionnaire._id.toString(),
    });

    res.status(201).json({
      success: true,
      data: questionnaire,
      message: 'Questionnaire uploaded and queued for processing',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all questionnaires
 */
export const getQuestionnaires = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const questionnaires = await Questionnaire.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Questionnaire.countDocuments(query);

    res.json({
      success: true,
      data: questionnaires,
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
 * Get single questionnaire
 */
export const getQuestionnaire = async (req, res, next) => {
  try {
    const questionnaire = await Questionnaire.findById(req.params.id);

    if (!questionnaire) {
      return res.status(404).json({
        success: false,
        error: { message: 'Questionnaire not found' },
      });
    }

    res.json({
      success: true,
      data: questionnaire,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get questions for a questionnaire
 */
export const getQuestions = async (req, res, next) => {
  try {
    const { category, subcategory, page = 1, limit = 50 } = req.query;

    const query = { questionnaire: req.params.id };
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;

    const questions = await Question.find(query)
      .sort({ questionNumber: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Question.countDocuments(query);

    res.json({
      success: true,
      data: questions,
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
 * Delete questionnaire
 */
export const deleteQuestionnaire = async (req, res, next) => {
  try {
    const questionnaire = await Questionnaire.findById(req.params.id);

    if (!questionnaire) {
      return res.status(404).json({
        success: false,
        error: { message: 'Questionnaire not found' },
      });
    }

    // Delete associated questions
    await Question.deleteMany({ questionnaire: req.params.id });

    await questionnaire.deleteOne();

    res.json({
      success: true,
      message: 'Questionnaire and associated questions deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
