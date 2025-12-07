import React from 'react';
import type { ProcessingStep } from '../types';

export interface ProcessingStatusProps {
  currentFile: string;
  currentStep: ProcessingStep;
  progress: number;
  filesCompleted: number;
  totalFiles: number;
}

const stepLabels: Record<ProcessingStep, string> = {
  extracting: 'Extracting text',
  'generating-summary': 'Generating summary',
  'generating-quiz': 'Generating quiz',
};

export function ProcessingStatus({
  currentFile,
  currentStep,
  progress,
  filesCompleted,
  totalFiles,
}: ProcessingStatusProps) {
  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md" role="status" aria-live="polite">
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Processing Files</h2>
          <p className="text-sm text-gray-600 mt-1" aria-live="polite" aria-atomic="true">
            {filesCompleted} of {totalFiles} files completed
          </p>
        </div>

        {/* Current file and step */}
        <div className="space-y-2" aria-live="polite" aria-atomic="true">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Current file:</span>
            <span className="text-sm text-gray-900 font-semibold truncate max-w-xs" title={currentFile}>
              {currentFile}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Step:</span>
            <span className="text-sm text-blue-600 font-medium">
              {stepLabels[currentStep]}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="text-gray-900 font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Processing progress: ${Math.round(progress)}%`}
            />
          </div>
        </div>

        {/* Loading animation */}
        <div className="flex justify-center pt-2">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
