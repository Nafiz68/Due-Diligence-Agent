import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { File, Trash2, RefreshCw, FileText, Calendar, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { documentsApi, type Document } from '@/lib/api';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Loading } from '@/components/common/Loading';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { formatFileSize, formatDate } from '@/utils/helpers';

export function DocumentList() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsApi.getAll({ limit: 50 }),
  });

  const deleteMutation = useMutation({
    mutationFn: documentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  if (isLoading) return <Loading message="Loading documents..." />;
  if (error) return <ErrorMessage message={error.message} onRetry={() => refetch()} />;

  const documents = data?.data || [];

  if (documents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 px-4"
      >
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 bg-gray-100 rounded-full opacity-50"></div>
          <FileText className="w-16 h-16 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No documents yet</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Upload your first PDF document to start building your knowledge base
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Your Documents
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {documents.length} document{documents.length !== 1 ? 's' : ''} in your library
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => refetch()}
          className="p-3 bg-white border-2 border-gray-900 rounded-xl hover:shadow-md transition-all"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5 text-gray-900" />
        </motion.button>
      </div>

      <div className="max-w-2xl grid gap-4">
        {documents.map((doc: Document, index: number) => (
          <motion.div
            key={doc._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-white border-2 border-gray-900 rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start flex-1 min-w-0 gap-4">
                <div className="p-3 bg-black rounded-xl shadow-lg">
                  <File className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate mb-3">
                    {doc.originalName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Layers className="w-4 h-4" />
                      <span>{formatFileSize(doc.fileSize)}</span>
                    </div>
                    {doc.metadata?.pageCount && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>{doc.metadata.pageCount} pages</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(doc.createdAt)}</span>
                    </div>
                  </div>
                  <div>
                    <StatusBadge status={doc.status} size="sm" />
                  </div>
                  {doc.error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <p className="text-sm text-red-700">{doc.error}</p>
                    </motion.div>
                  )}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (confirm('Are you sure you want to delete this document?')) {
                    deleteMutation.mutate(doc._id);
                  }
                }}
                className="ml-4 p-3 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

