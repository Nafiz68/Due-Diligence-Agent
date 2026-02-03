import React from 'react';
import { BarChart3 } from 'lucide-react';

export function EvaluationPage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Evaluation</h1>
          <p className="mt-2 text-gray-600">
            Compare AI-generated answers against ground truth data
          </p>
        </div>

        <div className="card p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Evaluation Dashboard
          </h2>
          <p className="text-gray-500 mb-6">
            View similarity scores, accuracy metrics, and detailed evaluations.<br />
            Set ground truth answers and track performance over time.
          </p>
          <p className="text-sm text-gray-400">
            This page would display evaluation metrics, charts, and<br />
            detailed comparison results
          </p>
        </div>
      </div>
    </div>
  );
}

