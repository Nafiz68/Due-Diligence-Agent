import { create } from 'zustand';
import type { Answer } from '@/lib/api';

interface AnswersStore {
  selectedAnswer: Answer | null;
  setSelectedAnswer: (a: Answer | null) => void;
  isEditingAnswer: boolean;
  setIsEditingAnswer: (editing: boolean) => void;
  editedText: string;
  setEditedText: (text: string) => void;
}

export const useAnswersStore = create<AnswersStore>((set) => ({
  selectedAnswer: null,
  setSelectedAnswer: (a) => set({ selectedAnswer: a }),
  isEditingAnswer: false,
  setIsEditingAnswer: (editing) => set({ isEditingAnswer: editing }),
  editedText: '',
  setEditedText: (text) => set({ editedText: text }),
}));

