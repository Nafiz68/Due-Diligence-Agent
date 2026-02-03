import express from 'express';
import {
  generateAnswer,
  generateAnswersForQuestionnaire,
  getAnswers,
  getAnswer,
  reviewAnswer,
  deleteAnswer,
} from '../controllers/answerController.js';

const router = express.Router();

// Generate answers
router.post('/generate/question/:questionId', generateAnswer);
router.post(
  '/generate/questionnaire/:questionnaireId',
  generateAnswersForQuestionnaire
);

// Get answers
router.get('/questionnaire/:questionnaireId', getAnswers);
router.get('/:id', getAnswer);

// Review answer
router.patch('/:id/review', reviewAnswer);

// Delete answer
router.delete('/:id', deleteAnswer);

export default router;
