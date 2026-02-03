import express from 'express';
import {
  evaluateSingleAnswer,
  evaluateQuestionnaireAnswers,
  setGroundTruth,
  getGroundTruth,
  getGroundTruths,
} from '../controllers/evaluationController.js';

const router = express.Router();

// Evaluate answers
router.get('/answer/:answerId', evaluateSingleAnswer);
router.get('/questionnaire/:questionnaireId', evaluateQuestionnaireAnswers);

// Ground truth management
router.post('/ground-truth/question/:questionId', setGroundTruth);
router.get('/ground-truth/question/:questionId', getGroundTruth);
router.get('/ground-truth/questionnaire/:questionnaireId', getGroundTruths);

export default router;
