import Document from '../models/Document.js';
import { documentQueue } from '../queues/index.js';

/**
 * Upload document
 */
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded' },
      });
    }

    const document = new Document({
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileType: 'pdf',
      fileSize: req.file.size,
      status: 'pending',
    });

    await document.save();

    // Queue document for processing
    await documentQueue.add({
      documentId: document._id.toString(),
    });

    res.status(201).json({
      success: true,
      data: document,
      message: 'Document uploaded and queued for processing',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all documents
 */
export const getDocuments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-extractedText -chunks');

    const count = await Document.countDocuments(query);

    res.json({
      success: true,
      data: documents,
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
 * Get single document
 */
export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: { message: 'Document not found' },
      });
    }

    res.json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete document
 */
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: { message: 'Document not found' },
      });
    }

    await document.deleteOne();

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search documents
 */
export const searchDocuments = async (req, res, next) => {
  try {
    const { query, topK = 5 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: { message: 'Query parameter is required' },
      });
    }

    const { searchDocuments } = await import('../services/documentService.js');
    const results = await searchDocuments(query, parseInt(topK));

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
/**
 * Get document processing status
 */
export const getDocumentStatus = async (req, res, next) => {
  try {
    const mongoDocCount = await Document.countDocuments();
    const pendingCount = await Document.countDocuments({ status: 'pending' });
    const processingCount = await Document.countDocuments({ status: 'processing' });
    const completedCount = await Document.countDocuments({ status: 'completed' });
    const failedCount = await Document.countDocuments({ status: 'failed' });

    // Check ChromaDB
    let chromaCount = 0;
    let chromaError = null;
    try {
      const { getOrCreateCollection } = await import('../config/chroma.js');
      const collection = await getOrCreateCollection('documents');
      chromaCount = await collection.count();
    } catch (err) {
      chromaError = err.message;
    }

    res.json({
      success: true,
      data: {
        mongodb: {
          total: mongoDocCount,
          pending: pendingCount,
          processing: processingCount,
          completed: completedCount,
          failed: failedCount,
        },
        chromadb: {
          indexedChunks: chromaCount,
          status: chromaError ? 'error' : 'connected',
          error: chromaError,
        },
        readyForChat: chromaCount > 0,
      },
    });
  } catch (error) {
    next(error);
  }
};