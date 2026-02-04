import apiClient from './client';
import type { Question } from './questionnaires';

export interface Citation {
  documentId: string;
  documentName: string;
  chunkText: string;
  relevanceScore: number;
}

export interface Answer {
  _id: string;
  question: Question | string;
  questionnaire: string;
  generatedAnswer: string;
  finalAnswer?: string;
  manualAnswer?: string;
  confidenceScore: number;
  citations: Citation[];
  status: 'pending' | 'generated' | 'confirmed' | 'rejected' | 'manual_updated' | 'missing_data';
  isEdited: boolean;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  auditTrail?: Array<{
    timestamp: string;
    action: string;
    actor: string;
    changeDetails?: {
      previousValue: string;
      newValue: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const answersApi = {
  generateForQuestion: async (
    questionId: string
  ): Promise<{ success: boolean; message: string; jobId: string }> => {
    return apiClient.post(`/answers/generate/question/${questionId}`);
  },

  generateForQuestionnaire: async (
    questionnaireId: string
  ): Promise<{ success: boolean; message: string; jobId: string }> => {
    return apiClient.post(`/answers/generate/questionnaire/${questionnaireId}`);
  },

  getByQuestionnaire: async (
    questionnaireId: string,
    params?: { status?: string; page?: number; limit?: number }
  ): Promise<PaginatedResponse<Answer>> => {
    return apiClient.get(`/answers/questionnaire/${questionnaireId}`, { params });
  },

  getById: async (id: string): Promise<{ success: boolean; data: Answer }> => {
    return apiClient.get(`/answers/${id}`);
  },

  review: async (
    id: string,
    data: {
      finalAnswer?: string;
      reviewNotes?: string;
      reviewedBy?: string;
      status?: string;
    }
  ): Promise<{ success: boolean; data: Answer; message: string }> => {
    return apiClient.patch(`/answers/${id}/review`, data);
  },

  reviewAnswer: async (
    id: string,
    data: {
      action: 'confirmed' | 'rejected' | 'manual_updated' | 'missing_data';
      finalAnswer?: string;
      reviewNotes?: string;
      reviewedBy?: string;
    }
  ): Promise<{ success: boolean; data: Answer; message: string }> => {
    return apiClient.patch(`/answers/${id}/review`, data);
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/answers/${id}`);
  },
};

