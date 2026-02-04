import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { FileSpreadsheet, Upload, Trash2, AlertCircle, CheckCircle, Clock, Play, Sparkles, FileText, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { questionnairesApi, answersApi } from '@/lib/api';

export function QuestionnairesPage() {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch questionnaires with auto-refresh
  const { data: questionnaires, isLoading } = useQuery({
    queryKey: ['questionnaires'],
    queryFn: async () => {
      const result = await questionnairesApi.getAll();
      return result.data;
    },
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: questionnairesApi.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
      setUploadError(null);
    },
    onError: (error: any) => {
      setUploadError(error.response?.data?.message || 'Upload failed');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: questionnairesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
    },
  });

  // Generate answers mutation
  const generateAnswersMutation = useMutation({
    mutationFn: answersApi.generateForQuestionnaire,
    onSuccess: (data) => {
      setGenerateSuccess('Answer generation started! Check the Review page to see progress.');
      setTimeout(() => setGenerateSuccess(null), 5000);
    },
    onError: (error: any) => {
      setUploadError(error.response?.data?.message || 'Failed to generate answers');
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        uploadMutation.mutate(acceptedFiles[0]);
      }
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-black rounded-2xl shadow-lg">
                <FileSpreadsheet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-black">
                  Questionnaires
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gray-900" />
                  Upload CSV or Excel questionnaire files for automated answering
                </p>
              </div>
            </div>
          </motion.div>

          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            {...getRootProps()}
            className={`relative overflow-hidden rounded-3xl shadow-xl p-16 mb-8 border-2 border-dashed transition-all duration-300 cursor-pointer ${
              isDragActive
                ? 'border-gray-900 bg-gray-100 scale-[1.02]'
                : 'border-gray-400 hover:border-gray-900 bg-white hover:shadow-2xl'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-center relative z-10">
              <motion.div
                animate={isDragActive ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="relative w-24 h-24 mx-auto mb-6"
              >
                <div className="absolute inset-0 bg-gray-200 rounded-full opacity-50"></div>
                <Upload className="w-16 h-16 text-black absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </motion.div>
              <p className="text-2xl font-bold text-gray-800 mb-2">
                {isDragActive ? 'Drop your file here' : 'Upload Questionnaire'}
              </p>
              <p className="text-gray-600 mb-4">
                Drag and drop or click to select a file
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 border-2 border-gray-900 rounded-xl shadow-sm">
                <FileText className="w-5 h-5 text-gray-900" />
                <span className="text-sm text-gray-900 font-medium">CSV • XLSX • XLS • PDF</span>
              </div>
            </div>
          </motion.div>

          {/* Status Messages */}
          <AnimatePresence>
            {uploadMutation.isPending && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border-2 border-gray-900 rounded-2xl p-6 mb-6 shadow-lg"
              >
                <div className="flex items-center">
                  <Clock className="w-6 h-6 text-black animate-spin mr-3" />
                  <span className="text-gray-900 font-medium">Uploading and processing questionnaire...</span>
                </div>
              </motion.div>
            )}

            {uploadError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border-2 border-red-600 rounded-2xl p-6 mb-6 shadow-lg"
              >
                <div className="flex items-center">
                  <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                  <span className="text-red-800 font-medium">{uploadError}</span>
                </div>
              </motion.div>
            )}

            {generateSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-50 border-2 border-green-600 rounded-2xl p-6 mb-6 shadow-lg"
              >
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  <span className="text-green-800 font-medium">{generateSuccess}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Questionnaires List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-900"
          >
            <div className="p-8 border-b-2 border-gray-900 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">
                Uploaded Questionnaires
              </h2>
              {questionnaires && questionnaires.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {questionnaires.length} questionnaire{questionnaires.length !== 1 ? 's' : ''} in your library
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"
                />
                <p className="text-gray-500 mt-4">Loading questionnaires...</p>
              </div>
            ) : questionnaires?.length === 0 ? (
              <div className="p-16 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="relative w-32 h-32 mx-auto mb-6"
                >
                  <div className="absolute inset-0 bg-gray-100 rounded-full opacity-50"></div>
                  <FileSpreadsheet className="w-16 h-16 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No questionnaires yet</h3>
                <p className="text-gray-500">Upload your first questionnaire to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {questionnaires?.map((questionnaire: any, index: number) => (
                  <motion.div
                    key={questionnaire._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-all duration-300 border-b-2 border-gray-200 last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-3 bg-black rounded-xl shadow-lg">
                          <FileSpreadsheet className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {questionnaire.fileName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {questionnaire.questionCount || 0} questions
                            </span>
                            <span className="text-gray-300">•</span>
                            <span>
                              {new Date(questionnaire.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                              questionnaire.status === 'completed' ? 'bg-green-100' :
                              questionnaire.status === 'processing' ? 'bg-blue-100' :
                              questionnaire.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                            }`}>
                              {getStatusIcon(questionnaire.status)}
                              <span className="text-sm font-medium capitalize">
                                {questionnaire.status}
                              </span>
                            </div>
                            {questionnaire.answeredCount > 0 && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg"
                              >
                                <Zap className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-700">
                                  {questionnaire.answeredCount} answers
                                </span>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {questionnaire.status === 'completed' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => generateAnswersMutation.mutate(questionnaire._id)}
                            disabled={generateAnswersMutation.isPending}
                            className="flex items-center gap-2 px-5 py-3 bg-black text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all"
                          >
                            <Play className="w-5 h-5" />
                            <span>
                              {generateAnswersMutation.isPending ? 'Starting...' : 'Generate Answers'}
                            </span>
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteMutation.mutate(questionnaire._id)}
                          className="p-3 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

