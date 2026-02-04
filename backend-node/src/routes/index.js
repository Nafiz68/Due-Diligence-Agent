import express from 'express';
import documentRoutes from './documentRoutes.js';
import questionnaireRoutes from './questionnaireRoutes.js';
import answerRoutes from './answerRoutes.js';
import evaluationRoutes from './evaluationRoutes.js';
import exportRoutes from './exportRoutes.js';
import chatRoutes from './chatRoutes.js';

const router = express.Router();

router.use('/documents', documentRoutes);
router.use('/questionnaires', questionnaireRoutes);
router.use('/answers', answerRoutes);
router.use('/evaluations', evaluationRoutes);
router.use('/export', exportRoutes);
router.use('/chat', chatRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
