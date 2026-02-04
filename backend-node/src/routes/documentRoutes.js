import express from 'express';
import upload from '../config/multer.js';
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  searchDocuments,
  getDocumentStatus,
} from '../controllers/documentController.js';

const router = express.Router();

router.post('/', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/status/check', getDocumentStatus);
router.get('/search', searchDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);

export default router;
