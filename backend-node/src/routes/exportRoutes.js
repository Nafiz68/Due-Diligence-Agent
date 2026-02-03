import express from 'express';
import {
  exportCSV,
  exportExcel,
  exportPDF,
} from '../controllers/exportController.js';

const router = express.Router();

// Export routes
router.get('/questionnaire/:questionnaireId/csv', exportCSV);
router.get('/questionnaire/:questionnaireId/excel', exportExcel);
router.get('/questionnaire/:questionnaireId/pdf', exportPDF);

export default router;
