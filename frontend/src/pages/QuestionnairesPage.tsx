import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { FileSpreadsheet, Upload, Trash2, AlertCircle, CheckCircle, Clock, Play } from 'lucide-react';
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
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Questionnaires</h1>
          <p className="mt-2 text-gray-600">
            Upload CSV or Excel questionnaire files for automated answering
          </p>
        </div>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`card p-12 mb-8 border-2 border-dashed transition-colors cursor-pointer ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragActive ? 'Drop your file here' : 'Upload Questionnaire'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop or click to select a file
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: .csv, .xlsx, .xls, .pdf
            </p>
          </div>
        </div>

        {/* Upload Status */}
        {uploadMutation.isPending && (
          <div className="card p-4 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-blue-500 animate-spin mr-3" />
              <span className="text-blue-700">Uploading and processing questionnaire...</span>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="card p-4 mb-6 bg-red-50 border-red-200">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700">{uploadError}</span>
            </div>
          </div>
        )}

        {generateSuccess && (
          <div className="card p-4 mb-6 bg-green-50 border-green-200">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-green-700">{generateSuccess}</span>
            </div>
          </div>
        )}

        {/* Questionnaires List */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Uploaded Questionnaires
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : questionnaires?.length === 0 ? (
            <div className="p-12 text-center">
              <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No questionnaires uploaded yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {questionnaires?.map((questionnaire: any) => (
                <div
                  key={questionnaire._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <FileSpreadsheet className="w-8 h-8 text-blue-500 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {questionnaire.fileName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{questionnaire.questionCount || 0} questions</span>
                          <span>•</span>
                          <span>
                            {new Date(questionnaire.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center mt-2">
                          {getStatusIcon(questionnaire.status)}
                          <span className="ml-2 text-sm text-gray-600 capitalize">
                            {questionnaire.status}
                          </span>
                          {questionnaire.answeredCount > 0 && (
                            <span className="ml-4 text-sm text-green-600">
                              {questionnaire.answeredCount} answers generated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {questionnaire.status === 'completed' && (
                        <button
                          onClick={() => generateAnswersMutation.mutate(questionnaire._id)}
                          disabled={generateAnswersMutation.isPending}
                          className="btn btn-primary flex items-center space-x-2"
                        >
                          <Play className="w-4 h-4" />
                          <span>
                            {generateAnswersMutation.isPending ? 'Starting...' : 'Generate Answers'}
                          </span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(questionnaire._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

