import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import {
  isNetworkError,
  isOnline,
  handleNetworkError,
  recoverFromNetworkError,
} from './networkErrorHandling';
import { clearState } from './stateRecovery';
import type { UploadedFile, ExtractedText, FileType, FileStatus } from '../types';

describe('Network Error Handling - Property Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('Property 36: State persistence on network failure', () => {
    // **Feature: cramcraft, Property 36: State persistence on network failure**
    // **Validates: Requirements 9.6**
    
    fc.assert(
      fc.property(
        // Generate random files
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            file: fc.constant(new File(['content'], 'test.pdf')),
            name: fc.string({ minLength: 1 }),
            size: fc.integer({ min: 1, max: 50 * 1024 * 1024 }),
            type: fc.constantFrom<FileType>('pdf', 'image', 'text'),
            status: fc.constantFrom<FileStatus>('pending', 'processing', 'completed', 'error'),
          }),
          { minLength: 0, maxLength: 10 }
        ),
        // Generate random extracted texts
        fc.array(
          fc.record({
            fileId: fc.string({ minLength: 1 }),
            fileName: fc.string({ minLength: 1 }),
            content: fc.string(),
            wordCount: fc.integer({ min: 0, max: 10000 }),
            extractionMethod: fc.constantFrom<'pdf-parser' | 'ocr' | 'direct'>('pdf-parser', 'ocr', 'direct'),
          }),
          { minLength: 0, maxLength: 10 }
        ),
        (files, extractedTexts) => {
          // Simulate network error by handling it
          const errorMessage = handleNetworkError(files, extractedTexts);
          
          // Verify error message is returned
          expect(errorMessage).toBeTruthy();
          expect(typeof errorMessage).toBe('string');
          expect(errorMessage.toLowerCase()).toMatch(/connection|lost|saved/);
          
          // Verify state was saved to localStorage
          expect(localStorage.getItem('cramcraft-saved-state')).not.toBeNull();
          
          // Attempt to recover from network error
          const recovered = recoverFromNetworkError();
          
          // Verify state was recovered
          expect(recovered).not.toBeNull();
          
          if (recovered) {
            // Verify files are preserved
            expect(recovered.files).toHaveLength(files.length);
            files.forEach((file, index) => {
              expect(recovered.files[index].id).toBe(file.id);
              expect(recovered.files[index].name).toBe(file.name);
              expect(recovered.files[index].size).toBe(file.size);
              expect(recovered.files[index].type).toBe(file.type);
              expect(recovered.files[index].status).toBe(file.status);
            });
            
            // Verify extracted texts are preserved
            expect(recovered.extractedTexts).toHaveLength(extractedTexts.length);
            extractedTexts.forEach((text, index) => {
              expect(recovered.extractedTexts[index].fileId).toBe(text.fileId);
              expect(recovered.extractedTexts[index].fileName).toBe(text.fileName);
              expect(recovered.extractedTexts[index].content).toBe(text.content);
              expect(recovered.extractedTexts[index].wordCount).toBe(text.wordCount);
              expect(recovered.extractedTexts[index].extractionMethod).toBe(text.extractionMethod);
            });
          }
          
          // Clean up
          clearState();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly identify network errors', () => {
    const networkError1 = new Error('Network request failed');
    expect(isNetworkError(networkError1)).toBe(true);
    
    const networkError2 = new Error('Failed to fetch');
    expect(isNetworkError(networkError2)).toBe(true);
    
    const networkError3 = new Error('network error occurred');
    expect(isNetworkError(networkError3)).toBe(true);
    
    const otherError = new Error('Something else went wrong');
    expect(isNetworkError(otherError)).toBe(false);
    
    expect(isNetworkError('not an error')).toBe(false);
    expect(isNetworkError(null)).toBe(false);
  });

  it('should check online status', () => {
    // This test depends on the actual browser state
    const online = isOnline();
    expect(typeof online).toBe('boolean');
  });

  it('should return null when no saved state exists', () => {
    const recovered = recoverFromNetworkError();
    expect(recovered).toBeNull();
  });

  it('should handle network error and save state', () => {
    const files: UploadedFile[] = [{
      id: '1',
      file: new File(['content'], 'test.pdf'),
      name: 'test.pdf',
      size: 1024,
      type: 'pdf',
      status: 'completed',
    }];
    
    const extractedTexts: ExtractedText[] = [{
      fileId: '1',
      fileName: 'test.pdf',
      content: 'test content',
      wordCount: 2,
      extractionMethod: 'pdf-parser',
    }];
    
    const errorMessage = handleNetworkError(files, extractedTexts);
    
    expect(errorMessage).toContain('Connection lost');
    expect(errorMessage).toContain('saved');
    
    const recovered = recoverFromNetworkError();
    expect(recovered).not.toBeNull();
    expect(recovered?.files).toHaveLength(1);
    expect(recovered?.extractedTexts).toHaveLength(1);
  });
});
