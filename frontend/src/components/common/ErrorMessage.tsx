import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ title = 'Error', message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
        <div className="flex items-start">
          <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">{title}</h3>
            <p className="mt-2 text-sm text-red-700">{message}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 text-sm font-medium text-red-600 hover:text-red-500"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface InlineErrorProps {
  message: string;
}

export function InlineError({ message }: InlineErrorProps) {
  return (
    <div className="flex items-center text-red-600 text-sm mt-2">
      <AlertCircle className="w-4 h-4 mr-1" />
      <span>{message}</span>
    </div>
  );
}

