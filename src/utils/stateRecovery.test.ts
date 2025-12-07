import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { saveState, loadState, clearState, hasSavedState } from './stateRecovery';
import type { UploadedFile, ExtractedText, FileType, FileStatus } from '../types';

describe('State Recovery - Property Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('Property 34: Error recovery with state preservation', () => {
    // **Feature: cramcraft, Property 34: Error recovery with state preservation**
    // **Validates: Requirements 9.4**
    
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
          // Save state
          saveState(files, extractedTexts);
          
          // Verify state was saved
          expect(hasSavedState()).toBe(true);
          
          // Load state
          const loadedState = loadState();
          
          // Verify state was loaded correctly
          expect(loadedState).not.toBeNull();
          expect(loadedState?.files).toHaveLength(files.length);
          expect(loadedState?.extractedTexts).toHaveLength(extractedTexts.length);
          
          // Verify files are preserved
          if (loadedState) {
            files.forEach((file, index) => {
              expect(loadedState.files[index].id).toBe(file.id);
              expect(loadedState.files[index].name).toBe(file.name);
              expect(loadedState.files[index].size).toBe(file.size);
              expect(loadedState.files[index].type).toBe(file.type);
              expect(loadedState.files[index].status).toBe(file.status);
            });
            
            // Verify extracted texts are preserved
            extractedTexts.forEach((text, index) => {
              expect(loadedState.extractedTexts[index].fileId).toBe(text.fileId);
              expect(loadedState.extractedTexts[index].fileName).toBe(text.fileName);
              expect(loadedState.extractedTexts[index].content).toBe(text.content);
              expect(loadedState.extractedTexts[index].wordCount).toBe(text.wordCount);
              expect(loadedState.extractedTexts[index].extractionMethod).toBe(text.extractionMethod);
            });
          }
          
          // Clear state
          clearState();
          expect(hasSavedState()).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle localStorage quota exceeded errors', () => {
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
    
    // Mock localStorage.setItem to throw QuotaExceededError
    const originalSetItem = localStorage.setItem;
    let callCount = 0;
    localStorage.setItem = vi.fn((key: string, value: string) => {
      callCount++;
      if (callCount === 1) {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      }
      // Second call should succeed
      originalSetItem.call(localStorage, key, value);
    });
    
    // Should not throw, should handle error gracefully
    expect(() => saveState(files, extractedTexts)).not.toThrow();
    
    // Restore original
    localStorage.setItem = originalSetItem;
  });

  it('should return null for expired state', () => {
    const files: UploadedFile[] = [];
    const extractedTexts: ExtractedText[] = [];
    
    // Save state with old timestamp
    const oldState = {
      files,
      extractedTexts,
      timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
    };
    localStorage.setItem('cramcraft-saved-state', JSON.stringify(oldState));
    
    // Should return null for expired state
    const loadedState = loadState();
    expect(loadedState).toBeNull();
    
    // Should have cleared the expired state
    expect(hasSavedState()).toBe(false);
  });

  it('should handle corrupted state data', () => {
    // Save corrupted JSON
    localStorage.setItem('cramcraft-saved-state', 'invalid json {');
    
    // Should return null for corrupted data
    const loadedState = loadState();
    expect(loadedState).toBeNull();
  });
});
