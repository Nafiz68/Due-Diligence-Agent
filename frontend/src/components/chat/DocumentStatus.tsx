import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '@/lib/api/client';

interface DocumentStatusData {
  mongodb: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  chromadb: {
    indexedChunks: number;
    status: 'connected' | 'error';
    error?: string;
  };
  readyForChat: boolean;
}

export function DocumentStatus() {
  const [status, setStatus] = useState<DocumentStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/documents/status/check');
        // Handle both response.data directly and response.data.data structure
        const statusData = response.data?.data || response.data;
        if (statusData && typeof statusData === 'object') {
          setStatus(statusData);
        }
        setError(null);
      } catch (err: any) {
        // Don't set error for the first check, backend might not be ready
        const errorMsg = err.response?.data?.error?.message || err.message || 'Failed to check document status';
        setError(errorMsg);
        console.error('Status check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !status) {
    return (
      <div className="p-4 bg-gray-100 border-2 border-gray-900 rounded-lg">
        <p className="text-sm text-gray-700">Checking document status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white border-2 border-gray-900 rounded-lg flex gap-2">
        <AlertCircle className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-gray-900 text-sm">Status Check Failed</p>
          <p className="text-gray-700 text-xs mt-1">{error}</p>
          <p className="text-gray-600 text-xs mt-2">Make sure the backend server is running.</p>
        </div>
      </div>
    );
  }

  if (!status) return null;

  const { mongodb, chromadb, readyForChat } = status;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white border-2 border-gray-900 rounded-lg"
    >
      {/* Main Status */}
      <div className="flex items-center gap-3 mb-4">
        {readyForChat ? (
          <>
            <CheckCircle className="w-6 h-6 text-gray-900" />
            <div>
              <p className="font-semibold text-gray-900">Ready for Chat</p>
              <p className="text-xs text-gray-700">{chromadb.indexedChunks} document chunks indexed</p>
            </div>
          </>
        ) : mongodb.total === 0 ? (
          <>
            <AlertTriangle className="w-6 h-6 text-gray-700" />
            <div>
              <p className="font-semibold text-gray-900">No Documents Uploaded</p>
              <p className="text-xs text-gray-600">Upload documents from the Documents page to enable chat</p>
            </div>
          </>
        ) : (
          <>
            <Clock className="w-6 h-6 text-gray-900 animate-spin" />
            <div>
              <p className="font-semibold text-gray-900">Processing Documents</p>
              <p className="text-xs text-gray-700">
                {mongodb.pending + mongodb.processing} documents pending, please wait...
              </p>
            </div>
          </>
        )}
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-gray-100 p-2 rounded border border-gray-300">
          <p className="text-gray-900 font-medium">MongoDB</p>
          <p className="text-gray-700 mt-1">
            ✓ {mongodb.completed} processed
          </p>
          {mongodb.pending > 0 && <p className="text-gray-600">⏳ {mongodb.pending} pending</p>}
          {mongodb.processing > 0 && <p className="text-gray-700">⚙ {mongodb.processing} processing</p>}
          {mongodb.failed > 0 && <p className="text-gray-900">✗ {mongodb.failed} failed</p>}
        </div>
        <div className="bg-gray-100 p-2 rounded border border-gray-300">
          <p className="text-gray-900 font-medium">ChromaDB</p>
          {chromadb.status === 'error' ? (
            <p className="text-gray-900 mt-1">Error: {chromadb.error}</p>
          ) : (
            <p className="text-gray-700 mt-1">✓ {chromadb.indexedChunks} chunks indexed</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
