import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, FileText, AlertCircle, Clock, ExternalLink, Download, FileSpreadsheet, FileType, Sparkles, BookOpen, Target, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  const questionnaires = questionnairesData || [];
  const answers = answersData || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated':
      case 'reviewed':
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-50 text-green-700 border-2 border-green-600';
    if (score >= 0.6) return 'bg-yellow-50 text-yellow-700 border-2 border-yellow-600';
    return 'bg-red-50 text-red-700 border-2 border-red-600';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex justify-between items-start"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-black rounded-2xl shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-black">
                  Review Answers
                </h1>
              </div>
              <p className="text-gray-600 ml-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gray-900" />
                Review AI-generated answers with citations and confidence scores
              </p>
            </div>
            
            {selectedQuestionnaireId && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleExport('csv')}
                  disabled={downloading}
                  className="flex items-center gap-2 px-5 py-3 bg-black text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  {downloading ? 'Downloading...' : 'CSV'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleExport('excel')}
                  disabled={downloading}
                  className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  {downloading ? 'Downloading...' : 'Excel'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleExport('pdf')}
                  disabled={downloading}
                  className="flex items-center gap-2 px-5 py-3 bg-gray-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileType className="w-5 h-5" />
                  {downloading ? 'Downloading...' : 'PDF'}
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          <div className="grid grid-cols-12 gap-6">
            {/* Questionnaire Selector */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="col-span-3"
            >
              <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-gray-900 sticky top-8">
                <div className="flex items-center gap-2 mb-6">
                  <Target className="w-6 h-6 text-black" />
                  <h2 className="text-xl font-bold text-gray-900">Questionnaires</h2>
                </div>
                <div className="space-y-3">
                  {questionnaires.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No questionnaires available</p>
                  ) : (
                    questionnaires.map((q: any, index: number) => (
                      <motion.button
                        key={q._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedQuestionnaireId(q._id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left p-4 rounded-2xl transition-all ${
                          selectedQuestionnaireId === q._id
                            ? 'bg-black text-white shadow-2xl'
                            : 'bg-white hover:shadow-md border-2 border-gray-900'
                        }`}
                      >
                        <div className={`font-semibold text-sm truncate mb-2 ${
                          selectedQuestionnaireId === q._id ? 'text-white' : 'text-gray-900'
                        }`}>
                          {q.name || q.originalName}
                        </div>
                        <div className={`text-xs flex items-center gap-2 ${
                          selectedQuestionnaireId === q._id ? 'text-white/90' : 'text-gray-500'
                        }`}>
                          <Zap className="w-3 h-3" />
                          {q.answeredCount || 0} / {q.questionCount || 0} answered
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>

            {/* Answers List */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="col-span-9"
            >
              {!selectedQuestionnaireId ? (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="bg-white rounded-3xl shadow-xl p-16 text-center border-2 border-gray-900"
                >
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gray-100 rounded-full opacity-50"></div>
                    <FileText className="w-16 h-16 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Select a Questionnaire
                  </h2>
                  <p className="text-gray-500">
                    Choose a questionnaire from the left to view generated answers
                  </p>
                </motion.div>
              ) : answersLoading ? (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="bg-white rounded-3xl shadow-xl p-16 text-center border-2 border-gray-900"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full mx-auto mb-6"
                  />
                  <p className="text-gray-500 text-lg">Loading answers...</p>
                </motion.div>
              ) : answers.length === 0 ? (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="bg-white rounded-3xl shadow-xl p-16 text-center border-2 border-gray-900"
                >
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gray-100 rounded-full opacity-50"></div>
                    <AlertCircle className="w-16 h-16 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    No Answers Yet
                  </h2>
                  <p className="text-gray-500">
                    Generate answers for this questionnaire from the Questionnaires page
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {answers.map((answer: any, index: number) => (
                    <motion.div
                      key={answer._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-900 hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="p-8">
                        {/* Question */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border-2 border-gray-900 rounded-lg">
                                {getStatusIcon(answer.status)}
                                <span className="text-sm font-medium text-gray-700 capitalize">
                                  {answer.status}
                                </span>
                              </div>
                              <motion.span
                                whileHover={{ scale: 1.05 }}
                                className={`text-sm font-bold px-4 py-1.5 rounded-xl shadow-lg ${getConfidenceColor(
                                  answer.confidenceScore
                                )}`}
                              >
                                {(answer.confidenceScore * 100).toFixed(0)}% confidence
                              </motion.span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {typeof answer.question === 'object'
                                ? answer.question.questionText
                                : 'Question'}
                            </h3>
                          </div>
                        </div>

                        {/* Answer */}
                        <div className="bg-gray-50 rounded-2xl p-6 mb-6 border-2 border-gray-900">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-black" />
                            <h4 className="text-sm font-bold text-gray-800">AI Answer</h4>
                          </div>
                          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {answer.finalAnswer || answer.generatedAnswer}
                          </p>
                        </div>

                        {/* Citations */}
                        {answer.citations && answer.citations.length > 0 && (
                          <div className="border-t-2 border-gray-900 pt-6">
                            <div className="flex items-center gap-2 mb-4">
                              <ExternalLink className="w-5 h-5 text-black" />
                              <h4 className="text-sm font-bold text-gray-800">
                                Sources ({answer.citations.length})
                              </h4>
                            </div>
                            <div className="grid gap-4">
                              {answer.citations.slice(0, 3).map((citation: any, idx: number) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="bg-white border-2 border-gray-900 rounded-2xl p-5 hover:shadow-2xl transition-all"
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="p-2 bg-black rounded-lg">
                                        <FileText className="w-4 h-4 text-white" />
                                      </div>
                                      <span className="text-sm font-bold text-gray-900">
                                        {citation.documentName}
                                      </span>
                                    </div>
                                    <span className="text-xs font-bold px-3 py-1 bg-black text-white rounded-lg shadow">
                                      {(citation.relevanceScore * 100).toFixed(0)}% match
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                                    {citation.chunkText}
                                  </p>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

