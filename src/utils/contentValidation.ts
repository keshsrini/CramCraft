// Content validation utilities for CramCraft
// Validates extracted content before AI generation

import type { ExtractedText } from '../types';
import { getEmptyContentErrorMessage } from './errorHandling';

/**
 * Check if extracted text is empty or contains only whitespace
 */
export function isEmptyContent(content: string): boolean {
  return content.trim().length === 0;
}

/**
 * Check if all extracted texts are empty
 */
export function areAllTextsEmpty(extractedTexts: ExtractedText[]): boolean {
  if (extractedTexts.length === 0) {
    return true;
  }
  
  return extractedTexts.every((text) => isEmptyContent(text.content));
}

/**
 * Validate extracted texts before quiz generation
 * Returns error message if validation fails, null otherwise
 */
export function validateContentForQuiz(extractedTexts: ExtractedText[]): string | null {
  if (areAllTextsEmpty(extractedTexts)) {
    return getEmptyContentErrorMessage();
  }
  
  return null;
}

/**
 * Get non-empty extracted texts
 */
export function getNonEmptyTexts(extractedTexts: ExtractedText[]): ExtractedText[] {
  return extractedTexts.filter((text) => !isEmptyContent(text.content));
}

/**
 * Get statistics about extracted content
 */
export function getContentStats(extractedTexts: ExtractedText[]): {
  total: number;
  empty: number;
  nonEmpty: number;
  totalWords: number;
} {
  const empty = extractedTexts.filter((text) => isEmptyContent(text.content)).length;
  const nonEmpty = extractedTexts.length - empty;
  const totalWords = extractedTexts.reduce((sum, text) => sum + text.wordCount, 0);
  
  return {
    total: extractedTexts.length,
    empty,
    nonEmpty,
    totalWords,
  };
}
