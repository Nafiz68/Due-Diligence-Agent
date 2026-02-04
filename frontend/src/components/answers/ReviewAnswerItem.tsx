import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Edit3, Save, X, History, User, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { answersApi } from '@/lib/api';

interface Citation {
  documentId: string;
  documentName: string;
  chunkText: string;
  relevanceScore: number;
}

interface AuditEntry {
  timestamp: string;
  action: string;
  actor: string;
  changeDetails?: {
    previousValue: string;
    newValue: string;
  };
}

interface Answer {
  _id: string;
  generatedAnswer: string;
  finalAnswer?: string;
  manualAnswer?: string;
  confidenceScore: number;
  citations: Citation[];
  status: 'pending' | 'generated' | 'confirmed' | 'rejected' | 'manual_updated' | 'missing_data';
  isEdited: boolean;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  auditTrail?: AuditEntry[];
  question: {
    _id: string;
    questionText: string;
    category?: string;
  };
}

interface ReviewAnswerProps {
  answer: Answer;
  onReview: (answerId: string, action: string, finalAnswer?: string, reviewNotes?: string) => Promise<void>;
  isLoading?: boolean;
}

export function ReviewAnswer({ answer, onReview, isLoading }: ReviewAnswerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswer, setEditedAnswer] = useState(answer.finalAnswer || answer.generatedAnswer);
  const [reviewNotes, setReviewNotes] = useState(answer.reviewNotes || '');
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleAction = async (action: string) => {
    const finalAnswer = action === 'manual_updated' ? editedAnswer : undefined;
    await onReview(answer._id, action, finalAnswer, reviewNotes);
    setIsEditing(false);
    setSelectedAction(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'manual_updated':
        return <Edit3 className="w-5 h-5 text-blue-500" />;
      case 'missing_data':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'rejected':
        return 'Rejected';
      case 'manual_updated':
        return 'Manual Update';
      case 'missing_data':
        return 'Missing Data';
      case 'generated':
        return 'Generated';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'manual_updated':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'missing_data':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'generated':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-6 mb-4 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Question */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 mb-2">Question</h4>
        <p className="text-gray-700 text-sm">{answer.question.questionText}</p>
        {answer.question.category && (
          <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
            {answer.question.category}
          </span>
        )}
      </div>

      {/* Status and Confidence */}
      <div className="flex gap-2 items-center mb-4 flex-wrap">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(answer.status)}`}>
          {getStatusIcon(answer.status)}
          {getStatusLabel(answer.status)}
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(answer.confidenceScore)}`}>
          Confidence: {(answer.confidenceScore * 100).toFixed(0)}%
        </div>
        {answer.isEdited && (
          <div className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
            Edited
          </div>
        )}
      </div>

      {/* Generated Answer */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-semibold text-gray-900">AI Generated Answer</h4>
          {answer.manualAnswer && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Original AI</span>
          )}
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
          {answer.generatedAnswer}
        </div>
      </div>

      {/* Manual Answer (if exists) */}
      {answer.manualAnswer && answer.status === 'manual_updated' && (
        <div className="mb-4 border-l-4 border-blue-500 pl-4">
          <div className="flex items-center gap-2 mb-2">
            <Edit3 className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Manual Override</h4>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            {answer.manualAnswer}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Updated by {answer.reviewedBy} on {answer.reviewedAt ? new Date(answer.reviewedAt).toLocaleString() : 'N/A'}
          </div>
        </div>
      )}

      {/* Citations */}
      {answer.citations && answer.citations.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Citations</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {answer.citations.map((citation, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs">
                <p className="font-semibold text-gray-800 mb-1">{citation.documentName}</p>
                <p className="text-gray-600 line-clamp-2 mb-1">{citation.chunkText}</p>
                <div className="text-gray-500">
                  Relevance: {((citation.relevanceScore || 0) * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Notes */}
      {answer.reviewNotes && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm font-semibold text-yellow-900 mb-1">Review Notes</p>
          <p className="text-sm text-yellow-800">{answer.reviewNotes}</p>
        </div>
      )}

      {/* Audit Trail */}
      {answer.auditTrail && answer.auditTrail.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowAuditTrail(!showAuditTrail)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <History className="w-4 h-4" />
            View Audit Trail ({answer.auditTrail.length})
          </button>
          {showAuditTrail && (
            <div className="mt-2 space-y-2 text-xs">
              {answer.auditTrail.map((entry, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="font-semibold text-gray-700">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                      {entry.action}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-3 h-3" />
                    <span>{entry.actor}</span>
                  </div>
                  {entry.changeDetails && (
                    <div className="mt-1 text-gray-600">
                      <p className="text-xs">Previous: {entry.changeDetails.previousValue?.substring(0, 100)}...</p>
                      <p className="text-xs">New: {entry.changeDetails.newValue?.substring(0, 100)}...</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {answer.status === 'generated' || answer.status === 'pending' ? (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleAction('confirmed')}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            Confirm
          </button>
          <button
            onClick={() => handleAction('rejected')}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => handleAction('missing_data')}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <AlertCircle className="w-4 h-4" />
            Missing Data
          </button>
        </div>
      ) : null}

      {/* Edit Mode */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <h4 className="font-semibold text-gray-900 mb-2">Edit Answer</h4>
          <textarea
            value={editedAnswer}
            onChange={(e) => setEditedAnswer(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Review Notes</label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add any notes about this review..."
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAction('manual_updated')}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
