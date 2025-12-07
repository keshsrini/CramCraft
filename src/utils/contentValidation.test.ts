import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  isEmptyContent,
  areAllTextsEmpty,
  validateContentForQuiz,
  getNonEmptyTexts,
  getContentStats,
} from './contentValidation';
import type { ExtractedText } from '../types';

describe('Content Validation - Property Tests', () => {
  it('Property 35: Empty content validation', () => {
    // **Feature: cramcraft, Property 35: Empty content validation**
    // **Validates: Requirements 9.5**
    
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            fileId: fc.string({ minLength: 1 }),
            fileName: fc.string({ minLength: 1 }),
            content: fc.oneof(
              fc.constant(''), // Empty string
              fc.constant('   '), // Whitespace only
              fc.constant('\n\n\t  '), // Mixed whitespace
              fc.string({ minLength: 1 }).filter(s => s.trim().length > 0) // Non-empty
            ),
            wordCount: fc.integer({ min: 0, max: 1000 }),
            extractionMethod: fc.constantFrom<'pdf-parser' | 'ocr' | 'direct'>('pdf-parser', 'ocr', 'direct'),
          }),
          { minLength: 0, maxLength: 10 }
        ),
        (extractedTexts) => {
          // Check if all texts are empty
          const allEmpty = extractedTexts.every((text) => text.content.trim().length === 0);
          
          // Validate for quiz generation
          const validationError = validateContentForQuiz(extractedTexts);
          
          if (allEmpty || extractedTexts.length === 0) {
            // Should return an error message
            expect(validationError).not.toBeNull();
            expect(typeof validationError).toBe('string');
            expect(validationError!.length).toBeGreaterThan(0);
            
            // Error message should mention empty or no text
            expect(validationError!.toLowerCase()).toMatch(/no text|extract|readable|content/);
          } else {
            // Should return null (no error)
            expect(validationError).toBeNull();
          }
          
          // Verify areAllTextsEmpty function
          expect(areAllTextsEmpty(extractedTexts)).toBe(allEmpty || extractedTexts.length === 0);
          
          // Verify getNonEmptyTexts function
          const nonEmptyTexts = getNonEmptyTexts(extractedTexts);
          nonEmptyTexts.forEach((text) => {
            expect(text.content.trim().length).toBeGreaterThan(0);
          });
          
          // Verify content stats
          const stats = getContentStats(extractedTexts);
          expect(stats.total).toBe(extractedTexts.length);
          expect(stats.empty + stats.nonEmpty).toBe(stats.total);
          expect(stats.nonEmpty).toBe(nonEmptyTexts.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly identify empty content', () => {
    expect(isEmptyContent('')).toBe(true);
    expect(isEmptyContent('   ')).toBe(true);
    expect(isEmptyContent('\n\n\t  ')).toBe(true);
    expect(isEmptyContent('hello')).toBe(false);
    expect(isEmptyContent('  hello  ')).toBe(false);
  });

  it('should correctly identify when all texts are empty', () => {
    const emptyTexts: ExtractedText[] = [
      {
        fileId: '1',
        fileName: 'test1.pdf',
        content: '',
        wordCount: 0,
        extractionMethod: 'pdf-parser',
      },
      {
        fileId: '2',
        fileName: 'test2.pdf',
        content: '   ',
        wordCount: 0,
        extractionMethod: 'pdf-parser',
      },
    ];
    
    expect(areAllTextsEmpty(emptyTexts)).toBe(true);
    
    const mixedTexts: ExtractedText[] = [
      ...emptyTexts,
      {
        fileId: '3',
        fileName: 'test3.pdf',
        content: 'Some content',
        wordCount: 2,
        extractionMethod: 'pdf-parser',
      },
    ];
    
    expect(areAllTextsEmpty(mixedTexts)).toBe(false);
  });

  it('should return error for empty array', () => {
    const error = validateContentForQuiz([]);
    expect(error).not.toBeNull();
  });

  it('should calculate correct content stats', () => {
    const texts: ExtractedText[] = [
      {
        fileId: '1',
        fileName: 'test1.pdf',
        content: '',
        wordCount: 0,
        extractionMethod: 'pdf-parser',
      },
      {
        fileId: '2',
        fileName: 'test2.pdf',
        content: 'Hello world',
        wordCount: 2,
        extractionMethod: 'pdf-parser',
      },
      {
        fileId: '3',
        fileName: 'test3.pdf',
        content: 'Test content here',
        wordCount: 3,
        extractionMethod: 'pdf-parser',
      },
    ];
    
    const stats = getContentStats(texts);
    expect(stats.total).toBe(3);
    expect(stats.empty).toBe(1);
    expect(stats.nonEmpty).toBe(2);
    expect(stats.totalWords).toBe(5);
  });
});
