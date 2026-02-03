import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Target, Award, FileText } from 'lucide-react';
import { questionnairesApi, evaluationsApi } from '@/lib/api';

export function EvaluationPage() {
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string | null>(null);

  // Fetch questionnaires
  const { data: questionnairesData } = useQuery({
    queryKey: ['questionnaires'],
    queryFn: async () => {
      const result = await questionnairesApi.getAll();
      return result.data;
    },
  });

  // Fetch evaluation for selected questionnaire
  const { data: evaluationData, isLoading: evaluationLoading } = useQuery({
    queryKey: ['evaluation', selectedQuestionnaireId],
    queryFn: async () => {
      if (!selectedQuestionnaireId) return null;
      const result = await evaluationsApi.getQuestionnaireEvaluation(selectedQuestionnaireId);
      return result.data;
    },
    enabled: !!selectedQuestionnaireId,
  });

  const questionnaires = questionnairesData || [];
  const evaluation = evaluationData;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Evaluation Dashboard</h1>
          <p className="mt-2 text-gray-600">
            View performance metrics and evaluation results
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Questionnaire Selector */}
          <div className="col-span-3">
            <div className="card p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Questionnaires</h2>
              <div className="space-y-2">
                {questionnaires.length === 0 ? (
                  <p className="text-sm text-gray-500">No questionnaires available</p>
                ) : (
                  questionnaires.map((q: any) => (
                    <button
                      key={q._id}
                      onClick={() => setSelectedQuestionnaireId(q._id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedQuestionnaireId === q._id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {q.name || q.originalName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {q.answeredCount || 0} answers
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Evaluation Results */}
          <div className="col-span-9">
            {!selectedQuestionnaireId ? (
              <div className="card p-12 text-center">
                <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Select a Questionnaire
                </h2>
                <p className="text-gray-500">
                  Choose a questionnaire from the left to view evaluation metrics
                </p>
              </div>
            ) : evaluationLoading ? (
              <div className="card p-12 text-center">
                <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4 animate-pulse" />
                <p className="text-gray-500">Loading evaluation...</p>
              </div>
            ) : !evaluation || !evaluation.metrics ? (
              <div className="card p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  No Evaluation Data
                </h2>
                <p className="text-gray-500">
                  Generate answers and add ground truth data to see evaluation metrics
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Metrics Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      <span className="text-2xl font-bold text-gray-900">
                        {evaluation.metrics.averageConfidence
                          ? `${(evaluation.metrics.averageConfidence * 100).toFixed(0)}%`
                          : 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Avg Confidence</p>
                  </div>

                  <div className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span className="text-2xl font-bold text-gray-900">
                        {evaluation.metrics.averageSimilarity
                          ? `${(evaluation.metrics.averageSimilarity * 100).toFixed(0)}%`
                          : 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Avg Similarity</p>
                  </div>

                  <div className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Award className="w-5 h-5 text-purple-500" />
                      <span className="text-2xl font-bold text-gray-900">
                        {evaluation.totalAnswers || 0}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Total Answers</p>
                  </div>

                  <div className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="w-5 h-5 text-orange-500" />
                      <span className="text-2xl font-bold text-gray-900">
                        {evaluation.evaluatedAnswers || 0}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Evaluated</p>
                  </div>
                </div>

                {/* Detailed Evaluations */}
                {evaluation.evaluations && evaluation.evaluations.length > 0 && (
                  <div className="card">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Detailed Evaluations
                      </h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {evaluation.evaluations.map((evalItem: any, idx: number) => (
                        <div key={idx} className="p-6">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                Generated Answer:
                              </h4>
                              <p className="text-sm text-gray-800">
                                {evalItem.generatedAnswer}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                Ground Truth:
                              </h4>
                              <p className="text-sm text-gray-800">
                                {evalItem.groundTruthAnswer}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center space-x-4">
                            <div className="text-sm">
                              <span className="text-gray-600">Similarity:</span>
                              <span className="ml-2 font-semibold text-green-600">
                                {(evalItem.metrics.similarityScore * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">Confidence:</span>
                              <span className="ml-2 font-semibold text-blue-600">
                                {(evalItem.metrics.confidenceScore * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

