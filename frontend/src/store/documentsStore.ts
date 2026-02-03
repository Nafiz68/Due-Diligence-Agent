import { create } from 'zustand';
import type { Document } from '@/lib/api';

interface DocumentsStore {
  selectedDocument: Document | null;
  setSelectedDocument: (doc: Document | null) => void;
  uploadProgress: number;
  setUploadProgress: (progress: number) => void;
}

export const useDocumentsStore = create<DocumentsStore>((set) => ({
  selectedDocument: null,
  setSelectedDocument: (doc) => set({ selectedDocument: doc }),
  uploadProgress: 0,
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
}));

