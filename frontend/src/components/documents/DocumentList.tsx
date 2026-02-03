import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { File, Trash2, RefreshCw } from 'lucide-react';
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
      <div className="text-center py-12">
        <File className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No documents uploaded yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Upload PDF documents to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Documents ({documents.length})
        </h2>
        <button onClick={() => refetch()} className="btn btn-secondary" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid gap-4">
        {documents.map((doc: Document) => (
          <div key={doc._id} className="card p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start flex-1 min-w-0">
                <File className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="ml-3 flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {doc.originalName}
                  </h3>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    {doc.metadata?.pageCount && <span>{doc.metadata.pageCount} pages</span>}
                    <span>{formatDate(doc.createdAt)}</span>
                  </div>
                  <div className="mt-2">
                    <StatusBadge status={doc.status} size="sm" />
                  </div>
                  {doc.error && (
                    <p className="mt-2 text-sm text-red-600">{doc.error}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this document?')) {
                    deleteMutation.mutate(doc._id);
                  }
                }}
                className="ml-4 p-2 text-gray-400 hover:text-red-600 rounded"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

