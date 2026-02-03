import React from 'react';
import { CheckCircle } from 'lucide-react';

export function ReviewPage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Review Answers</h1>
          <p className="mt-2 text-gray-600">
            Review and edit AI-generated answers before approval
          </p>
        </div>

        <div className="card p-12 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Answer Review Interface
          </h2>
          <p className="text-gray-500 mb-6">
            View AI-generated answers with citations and confidence scores.<br />
            Edit answers and add review notes before approval.
          </p>
          <p className="text-sm text-gray-400">
            This page would display questions with their generated answers,<br />
            citations, and editing capabilities
          </p>
        </div>
      </div>
    </div>
  );
}

