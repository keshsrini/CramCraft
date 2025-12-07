import React from 'react';
import type { AppError } from '../utils/errorHandling';

interface ErrorDisplayProps {
  errors: (AppError | string)[];
  onRetry?: () => void;
  onDismiss?: (index: number) => void;
}

export function ErrorDisplay({ errors, onRetry, onDismiss }: ErrorDisplayProps) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2" role="alert" aria-live="polite">
      {errors.map((error, index) => {
        const isAppError = typeof error !== 'string';
        const message = typeof error === 'string' ? error : error.message;
        const retryable = isAppError && error.retryable;

        return (
          <div
            key={index}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between"
          >
            <div className="flex items-start flex-1">
              <svg
                className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">{message}</p>
                {retryable && onRetry && (
                  <button
                    onClick={onRetry}
                    className="mt-2 text-sm text-red-700 underline hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                    aria-label="Retry action"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
            {onDismiss && (
              <button
                onClick={() => onDismiss(index)}
                className="ml-3 text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                aria-label="Dismiss error"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
