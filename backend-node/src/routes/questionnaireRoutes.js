import express from 'express';
import upload from '../config/multer.js';
import {
  uploadQuestionnaire,
  getQuestionnaires,
  getQuestionnaire,
  getQuestions,
  deleteQuestionnaire,
} from '../controllers/questionnaireController.js';

const router = express.Router();

router.post('/', upload.single('file'), uploadQuestionnaire);
router.get('/', getQuestionnaires);
router.get('/:id', getQuestionnaire);
router.get('/:id/questions', getQuestions);
router.delete('/:id', deleteQuestionnaire);

export default router;
