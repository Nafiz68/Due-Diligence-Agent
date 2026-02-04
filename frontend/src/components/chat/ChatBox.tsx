import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Loader, AlertCircle } from 'lucide-react';
import { chatApi } from '@/lib/api/chat';
import { motion } from 'framer-motion';

interface Citation {
  documentId: string;
  documentName: string;
  chunkText: string;
  relevanceScore: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  confidenceScore?: number;
  timestamp: Date;
}

interface ChatBoxProps {
  sessionId?: string;
  questionnaireId?: string;
  userId?: string;
  onSessionCreated?: (sessionId: string) => void;
}

export function ChatBox({ sessionId: initialSessionId, questionnaireId, userId = 'user-' + Date.now(), onSessionCreated }: ChatBoxProps) {
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session and load messages
  useEffect(() => {
    if (!sessionId) {
      initializeSession();
    } else {
      // Load existing session messages
      loadSessionMessages(sessionId);
    }
  }, [initialSessionId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessionMessages = async (sid: string) => {
    try {
      setSessionError(null);
      const response = await chatApi.getSession(sid);
      const sessionData = response.data.data || response.data;
      
      if (sessionData.messages && Array.isArray(sessionData.messages)) {
        // Convert stored messages to UI format
        const formattedMessages = sessionData.messages.map((msg: any) => ({
          role: msg.sender,
          content: msg.message,
          citations: msg.citations || [],
          confidenceScore: msg.confidenceScore || 0.5,
          timestamp: new Date(msg.createdAt || Date.now()),
        }));
        
        setMessages(formattedMessages);
      }
    } catch (err: any) {
      console.error('Failed to load session messages:', err);
      // Don't show error for session load failures, it's not critical
    }
  };

  const initializeSession = async () => {
    try {
      setSessionError(null);
      const response = await chatApi.createSession({
        userId,
        questionnaireId,
        title: `Chat ${new Date().toLocaleTimeString()}`,
      });
      const newSessionId = response.data.sessionId || response.data.data?.sessionId;
      if (newSessionId) {
        setSessionId(newSessionId);
        onSessionCreated?.(newSessionId);
      } else {
        throw new Error('No session ID returned from server');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create chat session. Please check if backend is running.';
      setSessionError(errorMsg);
      setError(errorMsg);
      console.error('Session creation error:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !sessionId) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setError(null);
    setIsLoading(true);

    // Add user message to display
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      },
    ]);

    try {
      const response = await chatApi.sendMessage(sessionId, userMessage, questionnaireId);

      // Handle different response structures
      const responseData = response?.data?.data || response?.data;
      
      if (!responseData?.response) {
        throw new Error('Invalid response structure from server');
      }

      // Add assistant message with citations
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: responseData.response,
          citations: responseData.citations || [],
          confidenceScore: responseData.confidenceScore || 0.5,
          timestamp: new Date(),
        },
      ]);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to process message';
      // Provide helpful guidance if documents not available
      const helpfulMessage = errorMessage.includes('No documents')
        ? `${errorMessage} Go to the Documents page to upload company documents.`
        : errorMessage;
      setError(helpfulMessage);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4 rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Document Chat</h3>
          {sessionId && (
            <span className="text-xs text-gray-500 ml-auto">Session: {sessionId.substring(0, 8)}</span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">Ask questions about your documents</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-gray-500">Start by asking a question about your documents</p>
          </div>
        )}

        {messages.map((message, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{message.content}</p>

              {/* Citations */}
              {message.citations && message.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className={`text-xs font-semibold mb-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-600'}`}>
                    Sources:
                  </p>
                  <div className="space-y-1">
                    {Array.isArray(message.citations) && message.citations.map((citation, cidx) => {
                      if (!citation) return null;
                      return (
                        <div
                          key={cidx}
                          className={`text-xs p-2 rounded ${
                            message.role === 'user' ? 'bg-blue-500' : 'bg-gray-100'
                          }`}
                        >
                          <p className={message.role === 'user' ? 'text-blue-50 font-semibold' : 'text-gray-700 font-semibold'}>
                            {citation.documentName || 'Unknown Document'}
                          </p>
                          <p className={message.role === 'user' ? 'text-blue-100 line-clamp-2' : 'text-gray-600 line-clamp-2'}>
                            {citation.chunkText || 'No preview available'}
                          </p>
                          {citation.relevanceScore && (
                            <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                              Relevance: {(citation.relevanceScore * 100).toFixed(0)}%
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {message.confidenceScore && (
                    <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      Confidence: {(message.confidenceScore * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              )}

              <span className={`text-xs mt-2 block ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-gray-200 text-gray-800 rounded-lg rounded-bl-none px-4 py-2">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Processing your question...</span>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 max-w-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
        {sessionError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{sessionError}</span>
            </div>
            <button
              type="button"
              onClick={initializeSession}
              className="ml-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium"
            >
              Retry
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={sessionId ? "Ask about your documents..." : "Initializing chat..."}
            disabled={!sessionId || isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
          <button
            type="submit"
            disabled={!sessionId || isLoading || !inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
