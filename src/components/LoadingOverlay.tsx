import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message,
}) => {
  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-message"
    >
      <div className="bg-white rounded-lg p-8 shadow-xl">
        <LoadingSpinner size="large" message={message} />
      </div>
    </div>
  );
};
