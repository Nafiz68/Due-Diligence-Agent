import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
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
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Company Documents</h1>
          <p className="mt-2 text-gray-600">
            Upload PDF documents for AI-powered questionnaire answering
          </p>
        </div>

        {uploadStatus && (
          <Alert
            type={uploadStatus.type}
            message={uploadStatus.message}
            onClose={() => setUploadStatus(null)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          <div>
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <Upload className="w-6 h-6 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold">Upload Documents</h2>
              </div>
              <DocumentUpload onUpload={handleUpload} />
            </div>
          </div>

          <div>
            <DocumentList />
          </div>
        </div>
      </div>
    </div>
  );
}

