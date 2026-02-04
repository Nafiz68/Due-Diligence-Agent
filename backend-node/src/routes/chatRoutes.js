import express from 'express';
import {
  createChatSession,
  sendMessage,
  getChatSession,
  getUserChatSessions,
  updateChatSessionStatus,
  deleteChatSession,
} from '../controllers/chatController.js';

const router = express.Router();

// Create a new chat session
router.post('/sessions', createChatSession);

// Get all sessions for a user
router.get('/user/:userId/sessions', getUserChatSessions);

// Get a specific chat session
router.get('/sessions/:sessionId', getChatSession);

// Send a message in a chat session
router.post('/sessions/:sessionId/messages', sendMessage);

// Update chat session status
router.patch('/sessions/:sessionId/status', updateChatSessionStatus);

// Delete chat session
router.delete('/sessions/:sessionId', deleteChatSession);

export default router;
