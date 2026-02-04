import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <h1 className="text-2xl font-bold text-red-900">Something went wrong</h1>
            </div>
            
            <p className="text-gray-700 mb-4">
              An unexpected error occurred. Please try refreshing the page.
            </p>

            {this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-xs font-mono text-red-700 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
              >
                Go to Home
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              If this keeps happening, check the browser console (F12) for error details.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children || this.props.fallback;
  }
}
