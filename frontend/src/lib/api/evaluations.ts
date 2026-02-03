import apiClient from './client';

export interface GroundTruth {
  _id: string;
  question: string;
  correctAnswer: string;
  source?: string;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationMetrics {
  similarityScore: number;
  jaccardSimilarity: number;
  levenshteinSimilarity: number;
  exactMatch: boolean;
  containsKeyInfo: boolean;
  confidenceScore: number;
}

export interface EvaluationResult {
  answerId: string;
  questionId: string;
  questionText: string;
  generatedAnswer: string;
  correctAnswer: string;
  metrics: EvaluationMetrics;
  passed: boolean;
}

export interface QuestionnaireEvaluation {
  total: number;
  evaluated: number;
  passed: number;
  failed: number;
  skipped: number;
  evaluations: EvaluationResult[];
  summary: {
    averageSimilarity: number;
    averageConfidence: number;
    exactMatches: number;
    containsKeyInfo: number;
    passRate: number;
  };
}

export const evaluationsApi = {
  evaluateAnswer: async (
    answerId: string
  ): Promise<{ success: boolean; data: EvaluationResult }> => {
    return apiClient.get(`/evaluations/answer/${answerId}`);
  },

  evaluateQuestionnaire: async (
    questionnaireId: string
  ): Promise<{ success: boolean; data: QuestionnaireEvaluation }> => {
    return apiClient.get(`/evaluations/questionnaire/${questionnaireId}`);
  },

  setGroundTruth: async (
    questionId: string,
    data: { correctAnswer: string; source?: string }
  ): Promise<{ success: boolean; data: GroundTruth; message: string }> => {
    return apiClient.post(`/evaluations/ground-truth/question/${questionId}`, data);
  },

  getGroundTruth: async (
    questionId: string
  ): Promise<{ success: boolean; data: GroundTruth }> => {
    return apiClient.get(`/evaluations/ground-truth/question/${questionId}`);
  },

  getGroundTruths: async (
    questionnaireId: string
  ): Promise<{ success: boolean; data: GroundTruth[] }> => {
    return apiClient.get(`/evaluations/ground-truth/questionnaire/${questionnaireId}`);
  },
};

