import { create } from 'zustand';
import type { Questionnaire, Question } from '@/lib/api';

interface QuestionnairesStore {
  selectedQuestionnaire: Questionnaire | null;
  setSelectedQuestionnaire: (q: Questionnaire | null) => void;
  selectedQuestion: Question | null;
  setSelectedQuestion: (q: Question | null) => void;
  filters: {
    category?: string;
    subcategory?: string;
  };
  setFilters: (filters: { category?: string; subcategory?: string }) => void;
}

export const useQuestionnairesStore = create<QuestionnairesStore>((set) => ({
  selectedQuestionnaire: null,
  setSelectedQuestionnaire: (q) => set({ selectedQuestionnaire: q }),
  selectedQuestion: null,
  setSelectedQuestion: (q) => set({ selectedQuestion: q }),
  filters: {},
  setFilters: (filters) => set({ filters }),
}));

