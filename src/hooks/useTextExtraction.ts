import { useState, useCallback } from 'react';
import type { ExtractedText, UploadedFile } from '../types';
import { extractText } from '../utils';

export interface UseTextExtractionReturn {
  extractedTexts: ExtractedText[];
  extractTextFromFile: (file: UploadedFile) => Promise<ExtractedText>;
  getExtractedTextByFileId: (fileId: string) => ExtractedText | undefined;
  getAllExtractedTexts: () => ExtractedText[];
  clearExtractedTexts: () => void;
  removeExtractedText: (fileId: string) => void;
}

/**
 * Hook for managing extracted text storage in application state
 * Provides functions to store, retrieve, and manage extracted texts
 */
export function useTextExtraction(): UseTextExtractionReturn {
  const [extractedTexts, setExtractedTexts] = useState<ExtractedText[]>([]);

  /**
   * Extract text from a file and store it in state
   */
  const extractTextFromFile = useCallback(async (uploadedFile: UploadedFile): Promise<ExtractedText> => {
    const extracted = await extractText(uploadedFile.file, uploadedFile.id);
    
    // Store in state, replacing any existing entry for this file
    setExtractedTexts(prev => {
      const filtered = prev.filter(et => et.fileId !== uploadedFile.id);
      return [...filtered, extracted];
    });
    
    return extracted;
  }, []);

  /**
   * Get extracted text for a specific file by ID
   */
  const getExtractedTextByFileId = useCallback((fileId: string): ExtractedText | undefined => {
    return extractedTexts.find(et => et.fileId === fileId);
  }, [extractedTexts]);

  /**
   * Get all extracted texts
   */
  const getAllExtractedTexts = useCallback((): ExtractedText[] => {
    return extractedTexts;
  }, [extractedTexts]);

  /**
   * Clear all extracted texts
   */
  const clearExtractedTexts = useCallback(() => {
    setExtractedTexts([]);
  }, []);

  /**
   * Remove extracted text for a specific file
   */
  const removeExtractedText = useCallback((fileId: string) => {
    setExtractedTexts(prev => prev.filter(et => et.fileId !== fileId));
  }, []);

  return {
    extractedTexts,
    extractTextFromFile,
    getExtractedTextByFileId,
    getAllExtractedTexts,
    clearExtractedTexts,
    removeExtractedText,
  };
}
