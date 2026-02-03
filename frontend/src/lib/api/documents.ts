import apiClient from './client';

export interface Document {
  _id: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  metadata?: {
    pageCount?: number;
    author?: string;
    subject?: string;
  };
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

export const documentsApi = {
  upload: async (file: File): Promise<{ success: boolean; data: Document }> => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getAll: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Document>> => {
    return apiClient.get('/documents', { params });
  },

  getById: async (id: string): Promise<{ success: boolean; data: Document }> => {
    return apiClient.get(`/documents/${id}`);
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/documents/${id}`);
  },

  search: async (query: string, topK?: number) => {
    return apiClient.get('/documents/search', {
      params: { query, topK },
    });
  },
};

