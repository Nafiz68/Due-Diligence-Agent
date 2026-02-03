import apiClient from './client';

export interface Questionnaire {
  _id: string;
  name: string;
  description?: string;
  filename: string;
  originalName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  questionCount: number;
  answeredCount: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  questionnaire: string;
  questionText: string;
  questionNumber?: string;
  category?: string;
  subcategory?: string;
  expectedAnswerType: 'text' | 'yes_no' | 'multiple_choice' | 'numeric' | 'date';
  isRequired: boolean;
  metadata?: Record<string, string>;
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

export const questionnairesApi = {
  upload: async (
    file: File,
    data?: { name?: string; description?: string }
  ): Promise<{ success: boolean; data: Questionnaire }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (data?.name) formData.append('name', data.name);
    if (data?.description) formData.append('description', data.description);

    return apiClient.post('/questionnaires', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getAll: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Questionnaire>> => {
    return apiClient.get('/questionnaires', { params });
  },

  getById: async (id: string): Promise<{ success: boolean; data: Questionnaire }> => {
    return apiClient.get(`/questionnaires/${id}`);
  },

  getQuestions: async (
    id: string,
    params?: { category?: string; subcategory?: string; page?: number; limit?: number }
  ): Promise<PaginatedResponse<Question>> => {
    return apiClient.get(`/questionnaires/${id}/questions`, { params });
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/questionnaires/${id}`);
  },
};

