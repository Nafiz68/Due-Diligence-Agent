import apiClient from './client';

const API_BASE = '/chat';

export const chatApi = {
  // Create a new chat session
  createSession: async (data: { title?: string; questionnaireId?: string; context?: string; userId?: string }) => {
    const response = await apiClient.post(`${API_BASE}/sessions`, data);
    // Handle both response.data and response directly (due to axios interceptor)
    return {
      data: response.data || response,
    };
  },

  // Send a message in a chat session
  sendMessage: async (sessionId: string, message: string, questionnaireId?: string) => {
    const response = await apiClient.post(`${API_BASE}/sessions/${sessionId}/messages`, {
      message,
      questionnaireId,
    });
    return {
      data: response.data || response,
    };
  },

  // Get a specific chat session
  getSession: async (sessionId: string) => {
    const response = await apiClient.get(`${API_BASE}/sessions/${sessionId}`);
    return {
      data: response.data || response,
    };
  },

  // Get all sessions for a user
  getUserSessions: async (userId: string) => {
    const response = await apiClient.get(`${API_BASE}/user/${userId}/sessions`);
    return {
      data: response.data || response,
    };
  },

  // Update chat session status
  updateSessionStatus: async (sessionId: string, status: 'active' | 'archived' | 'closed') => {
    const response = await apiClient.patch(`${API_BASE}/sessions/${sessionId}/status`, { status });
    return {
      data: response.data || response,
    };
  },

  // Delete a chat session
  deleteSession: async (sessionId: string) => {
    const response = await apiClient.delete(`${API_BASE}/sessions/${sessionId}`);
    return {
      data: response.data || response,
    };
  },
};
