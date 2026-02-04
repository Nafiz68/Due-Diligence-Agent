import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Plus, Trash2, ArchiveX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBox } from '@/components/chat/ChatBox';
import { DocumentStatus } from '@/components/chat/DocumentStatus';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { chatApi } from '@/lib/api/chat';
import { questionnairesApi } from '@/lib/api';

export function ChatPage() {
  const [userId, setUserId] = useState<string>(() => {
    const stored = localStorage.getItem('userId');
    if (stored) return stored;
    const newId = `user-${Date.now()}`;
    localStorage.setItem('userId', newId);
    return newId;
  });

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string | null>(null);

  // Fetch user sessions
  const { data: sessionsData, refetch: refetchSessions } = useQuery({
    queryKey: ['chat-sessions', userId],
    queryFn: async () => {
      const result = await chatApi.getUserSessions(userId);
      return result.data.data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch questionnaires
  const { data: questionnairesData } = useQuery({
    queryKey: ['questionnaires'],
    queryFn: async () => {
      const result = await questionnairesApi.getAll();
      return result.data;
    },
  });

  const sessions = sessionsData || [];
  const questionnaires = questionnairesData || [];

  const handleCreateSession = () => {
    setSelectedSessionId(null); // Reset to trigger new session creation
    setSelectedQuestionnaireId(null);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this chat session?')) {
      try {
        await chatApi.deleteSession(sessionId);
        if (selectedSessionId === sessionId) {
          setSelectedSessionId(null);
        }
        await refetchSessions();
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  const handleArchiveSession = async (sessionId: string) => {
    try {
      await chatApi.updateSessionStatus(sessionId, 'archived');
      await refetchSessions();
    } catch (error) {
      console.error('Failed to archive session:', error);
    }
  };

  const handleSessionCreated = (newSessionId: string) => {
    setSelectedSessionId(newSessionId);
    refetchSessions();
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-black rounded-2xl shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-black">Document Chat</h1>
            </div>
            <p className="text-gray-600 ml-1">Ask questions about your uploaded documents and get instant answers with citations</p>
          </motion.div>

          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar - Sessions & Questionnaires */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="col-span-3 space-y-6"
            >
              {/* New Chat Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateSession}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-gray-900 text-white font-semibold rounded-xl shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                New Chat
              </motion.button>

              {/* Chat Sessions */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-900">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-black" />
                  Sessions
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {sessions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No chat sessions yet</p>
                  ) : (
                    sessions.map((session: any, idx: number) => (
                      <motion.div
                        key={session._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-3 rounded-lg cursor-pointer transition-all group ${
                          selectedSessionId === session.sessionId
                            ? 'bg-gray-900 border border-gray-900'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                        onClick={() => setSelectedSessionId(session.sessionId)}
                      >
                        <p className={`text-sm font-semibold truncate ${
                          selectedSessionId === session.sessionId ? 'text-white' : 'text-gray-800'
                        }`}>
                          {session.title}
                        </p>
                        <p className={`text-xs mt-1 ${
                          selectedSessionId === session.sessionId ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchiveSession(session.sessionId);
                            }}
                            className="flex-1 text-xs px-2 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                          >
                            <ArchiveX className="w-3 h-3 inline" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(session.sessionId);
                            }}
                            className="flex-1 text-xs px-2 py-1 bg-gray-800 text-white rounded hover:bg-black transition-colors"
                          >
                            <Trash2 className="w-3 h-3 inline" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Questionnaires Reference */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-900">
                <h2 className="font-bold text-gray-900 mb-4">Context</h2>
                <select
                  value={selectedQuestionnaireId || ''}
                  onChange={(e) => setSelectedQuestionnaireId(e.target.value || null)}
                  className="w-full p-2 border-2 border-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">No specific context</option>
                  {questionnaires.map((q: any) => (
                    <option key={q._id} value={q._id}>
                      {q.name || q.originalName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-3">
                  Optional: Select a questionnaire to contextualize your chat
                </p>
              </div>

              {/* Document Status */}
              <DocumentStatus />
            </motion.div>

            {/* Main Chat Area */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="col-span-9"
            >
              <ChatBox
                key={selectedSessionId || 'new'}
                sessionId={selectedSessionId || undefined}
                questionnaireId={selectedQuestionnaireId || undefined}
                userId={userId}
                onSessionCreated={handleSessionCreated}
              />
            </motion.div>
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 grid grid-cols-3 gap-4"
          >
            <div className="bg-white border-2 border-gray-900 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">💡 Tip</h3>
              <p className="text-sm text-gray-700">Ask specific questions about your documents and get answers with citations.</p>
            </div>
            <div className="bg-white border-2 border-gray-900 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">📚 Citations</h3>
              <p className="text-sm text-gray-700">Every answer includes references to the source documents.</p>
            </div>
            <div className="bg-white border-2 border-gray-900 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">🔍 Confidence</h3>
              <p className="text-sm text-gray-700">Each response shows a confidence score based on source relevance.</p>
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </ErrorBoundary>
  );
}
