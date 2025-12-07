import React from 'react';
import type { ExtractedText } from '../types';

export interface TextPreviewProps {
  extractedText: ExtractedText;
}

export function TextPreview({ extractedText }: TextPreviewProps) {
  const { fileName, content, wordCount, extractionMethod, confidence } = extractedText;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="space-y-4">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-xl font-semibold text-gray-800">{fileName}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span>
              <span className="font-medium">Words:</span> {wordCount.toLocaleString()}
            </span>
            <span>
              <span className="font-medium">Method:</span>{' '}
              {extractionMethod === 'pdf-parser' && 'PDF Parser'}
              {extractionMethod === 'ocr' && 'OCR'}
              {extractionMethod === 'direct' && 'Direct Read'}
            </span>
            {confidence !== undefined && (
              <span>
                <span className="font-medium">Confidence:</span> {Math.round(confidence)}%
              </span>
            )}
          </div>
        </div>

        {/* Text content */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Extracted Text Preview:</h4>
          <div
            className="max-h-96 overflow-y-auto p-4 bg-gray-50 rounded border border-gray-200 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap"
            role="region"
            aria-label={`Extracted text from ${fileName}`}
          >
            {content || <span className="text-gray-400 italic">No text extracted</span>}
          </div>
        </div>

        {/* Empty content warning */}
        {content.trim().length === 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            <strong>Warning:</strong> No text could be extracted from this file.
          </div>
        )}
      </div>
    </div>
  );
}
