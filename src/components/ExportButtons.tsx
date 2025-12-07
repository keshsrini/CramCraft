import { useState } from 'react';
import type { RevisionPack, QuizResults } from '../types';
import { exportRevisionPackPDF, exportQuizResultsPDF } from '../utils/pdfExport';

interface ExportButtonsProps {
  revisionPack?: RevisionPack;
  quizResults?: QuizResults;
}

/**
 * ExportButtons Component
 * Provides buttons to export revision packs and quiz results as PDFs
 */
export function ExportButtons({ revisionPack, quizResults }: ExportButtonsProps) {
  const [isExportingRevision, setIsExportingRevision] = useState(false);
  const [isExportingQuiz, setIsExportingQuiz] = useState(false);

  const handleExportRevisionPack = async () => {
    if (!revisionPack) return;

    setIsExportingRevision(true);
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      exportRevisionPackPDF(revisionPack);
    } catch (error) {
      console.error('Error exporting revision pack:', error);
      alert('Failed to export revision pack. Please try again.');
    } finally {
      setIsExportingRevision(false);
    }
  };

  const handleExportQuizResults = async () => {
    if (!quizResults) return;

    setIsExportingQuiz(true);
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      exportQuizResultsPDF(quizResults);
    } catch (error) {
      console.error('Error exporting quiz results:', error);
      alert('Failed to export quiz results. Please try again.');
    } finally {
      setIsExportingQuiz(false);
    }
  };

  return (
    <div className="flex gap-4 mt-6">
      {revisionPack && (
        <button
          onClick={handleExportRevisionPack}
          disabled={isExportingRevision}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors font-medium"
          aria-label="Export revision pack as PDF"
        >
          {isExportingRevision ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Export Revision Pack</span>
            </>
          )}
        </button>
      )}

      {quizResults && (
        <button
          onClick={handleExportQuizResults}
          disabled={isExportingQuiz}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-medium"
          aria-label="Export quiz results as PDF"
        >
          {isExportingQuiz ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Export Quiz Results</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
