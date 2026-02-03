import express from 'express';
import upload from '../config/multer.js';
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  searchDocuments,
} from '../controllers/documentController.js';

const router = express.Router();

router.post('/', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/search', searchDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);

export default router;
