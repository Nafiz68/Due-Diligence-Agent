import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, FileText, AlertCircle, Clock, ExternalLink, Download, FileSpreadsheet, FileType } from 'lucide-react';
import { questionnairesApi, answersApi } from '@/lib/api';

export function ReviewPage() {
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!selectedQuestionnaireId || downloading) return;
    
    try {
      setDownloading(true);
      const url = `${API_BASE_URL}/export/questionnaire/${selectedQuestionnaireId}/${format}`;
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `questionnaire_${format}.${format === 'excel' ? 'xlsx' : format}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export. Please make sure the server is running and answers are generated.');
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  // Fetch questionnaires with auto-refresh
  const { data: questionnairesData } = useQuery({
    queryKey: ['questionnaires'],
    queryFn: async () => {
      const result = await questionnairesApi.getAll();
      return result.data;
    },
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  // Fetch answers for selected questionnaire
  const { data: answersData, isLoading: answersLoading } = useQuery({
    queryKey: ['answers', selectedQuestionnaireId],
    queryFn: async () => {
      if (!selectedQuestionnaireId) return null;
      const result = await answersApi.getByQuestionnaire(selectedQuestionnaireId);
      return result.data;
    },
    enabled: !!selectedQuestionnaireId,
  });

  const questionnaires = questionnairesData || [];
  const answers = answersData || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated':
      case 'reviewed':
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Review Answers</h1>
            <p className="mt-2 text-gray-600">
              Review AI-generated answers with citations and confidence scores
            </p>
          </div>
          
          {selectedQuestionnaireId && (
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('csv')}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {downloading ? 'Downloading...' : 'Export CSV'}
              </button>
              <button
                onClick={() => handleExport('excel')}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {downloading ? 'Downloading...' : 'Export Excel'}
              </button>
              <button
                onClick={() => handleExport('pdf')}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileType className="w-4 h-4" />
                {downloading ? 'Downloading...' : 'Export PDF'}
              </button>
            </div>
          )}
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
                        {q.answeredCount || 0} / {q.questionCount || 0} answered
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Answers List */}
          <div className="col-span-9">
            {!selectedQuestionnaireId ? (
              <div className="card p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Select a Questionnaire
                </h2>
                <p className="text-gray-500">
                  Choose a questionnaire from the left to view generated answers
                </p>
              </div>
            ) : answersLoading ? (
              <div className="card p-12 text-center">
                <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4 animate-spin" />
                <p className="text-gray-500">Loading answers...</p>
              </div>
            ) : answers.length === 0 ? (
              <div className="card p-12 text-center">
                <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  No Answers Yet
                </h2>
                <p className="text-gray-500">
                  Generate answers for this questionnaire from the Questionnaires page
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {answers.map((answer: any) => (
                  <div key={answer._id} className="card">
                    <div className="p-6">
                      {/* Question */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(answer.status)}
                            <span className="text-sm font-medium text-gray-500 capitalize">
                              {answer.status}
                            </span>
                            <span
                              className={`ml-auto text-xs font-semibold px-2 py-1 rounded ${getConfidenceColor(
                                answer.confidenceScore
                              )}`}
                            >
                              {(answer.confidenceScore * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {typeof answer.question === 'object'
                              ? answer.question.questionText
                              : 'Question'}
                          </h3>
                        </div>
                      </div>

                      {/* Answer */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Answer:</h4>
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {answer.finalAnswer || answer.generatedAnswer}
                        </p>
                      </div>

                      {/* Citations */}
                      {answer.citations && answer.citations.length > 0 && (
                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            Sources ({answer.citations.length}):
                          </h4>
                          <div className="space-y-2">
                            {answer.citations.slice(0, 3).map((citation: any, idx: number) => (
                              <div
                                key={idx}
                                className="bg-blue-50 border border-blue-100 rounded-lg p-3"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <ExternalLink className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-medium text-gray-900">
                                      {citation.documentName}
                                    </span>
                                  </div>
                                  <span className="text-xs text-blue-600 font-semibold">
                                    {(citation.relevanceScore * 100).toFixed(0)}% relevant
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {citation.chunkText}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

