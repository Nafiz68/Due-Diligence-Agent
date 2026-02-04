import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { documentsApi } from '@/lib/api';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DocumentList } from '@/components/documents/DocumentList';
import { Alert } from '@/components/common/Alert';

export function DocumentsPage() {
  const queryClient = useQueryClient();
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => documentsApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setUploadStatus({
        type: 'success',
        message: 'Document uploaded successfully and queued for processing',
      });
      setTimeout(() => setUploadStatus(null), 5000);
    },
    onError: (error: Error) => {
      setUploadStatus({
        type: 'error',
        message: error.message || 'Failed to upload document',
      });
    },
  });

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      await uploadMutation.mutateAsync(file);
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
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-black">
                  Company Documents
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gray-900" />
                  Upload PDF documents for AI-powered questionnaire answering
                </p>
              </div>
            </div>
          </motion.div>

          {uploadStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert
                type={uploadStatus.type}
                message={uploadStatus.message}
                onClose={() => setUploadStatus(null)}
              />
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-900">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gray-100 rounded-xl border-2 border-gray-900">
                    <Upload className="w-6 h-6 text-black" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Upload Documents</h2>
                </div>
                <DocumentUpload onUpload={handleUpload} />
              </div>
            </motion.div>

            {/* Documents List Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <DocumentList />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

