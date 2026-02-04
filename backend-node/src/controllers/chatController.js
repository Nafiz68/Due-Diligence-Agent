import {
  processMessage,
  createSession,
  addMessage,
  getSession,
  getUserSessions,
  updateSessionStatus,
  deleteSession,
} from '../services/chatService.js';

/**
 * Create a new chat session
 */
export const createChatSession = async (req, res, next) => {
  try {
    const { title, questionnaireId, context, userId } = req.body;

    const session = await createSession({
      title: title || 'New Chat',
      questionnaireId,
      context,
      userId: userId || 'anonymous',
    });

    res.status(201).json({
      success: true,
      message: 'Chat session created successfully',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a message in chat session
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { message, questionnaireId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Message cannot be empty' },
      });
    }

    const result = await addMessage(sessionId, message, questionnaireId);

    res.json({
      success: true,
      message: 'Message processed successfully',
      data: {
        response: result.response,
        citations: result.citations,
        confidenceScore: result.confidenceScore,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get chat session with all messages
 */
export const getChatSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await getSession(sessionId);

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all chat sessions for a user
 */
export const getUserChatSessions = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const sessions = await getUserSessions(userId);

    res.json({
      success: true,
      data: sessions,
      count: sessions.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update chat session status
 */
export const updateChatSessionStatus = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: { message: 'Status is required' },
      });
    }

    const session = await updateSessionStatus(sessionId, status);

    res.json({
      success: true,
      message: 'Chat session status updated successfully',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete chat session
 */
export const deleteChatSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const result = await deleteSession(sessionId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
