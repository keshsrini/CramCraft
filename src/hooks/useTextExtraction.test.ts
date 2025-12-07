import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import fc from 'fast-check';
import { useTextExtraction } from './useTextExtraction';
import type { UploadedFile } from '../types';

describe('Text Extraction Storage Property Tests', () => {
  it('Property 8: Extracted text persistence', async () => {
    // **Feature: cramcraft, Property 8: Extracted text persistence**
    // **Validates: Requirements 2.6**
    
    // For any set of files processed, all extracted texts should be stored and retrievable from application state
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0).map(s => `${s.trim()}.txt`),
            content: fc.string({ minLength: 1, maxLength: 200 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (fileData) => {
          const { result } = renderHook(() => useTextExtraction());
          
          // Extract text from all files
          const extractedTexts = [];
          for (const data of fileData) {
            const file = new File([data.content], data.name, { type: 'text/plain' });
            const uploadedFile: UploadedFile = {
              id: data.id,
              file,
              name: data.name,
              size: file.size,
              type: 'text',
              status: 'pending',
            };
            
            const extracted = await act(async () => {
              return await result.current.extractTextFromFile(uploadedFile);
            });
            
            extractedTexts.push(extracted);
          }
          
          // All extracted texts should be stored
          expect(result.current.extractedTexts).toHaveLength(fileData.length);
          
          // Each file should be retrievable by ID
          for (const data of fileData) {
            const retrieved = result.current.getExtractedTextByFileId(data.id);
            expect(retrieved).toBeDefined();
            expect(retrieved?.fileId).toBe(data.id);
            expect(retrieved?.fileName).toBe(data.name);
            expect(retrieved?.content).toBe(data.content);
          }
          
          // getAllExtractedTexts should return all texts
          const allTexts = result.current.getAllExtractedTexts();
          expect(allTexts).toHaveLength(fileData.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('useTextExtraction Unit Tests', () => {
  it('should start with empty extracted texts', () => {
    const { result } = renderHook(() => useTextExtraction());
    expect(result.current.extractedTexts).toEqual([]);
  });

  it('should extract and store text from a file', async () => {
    const { result } = renderHook(() => useTextExtraction());
    
    const content = 'This is test content';
    const file = new File([content], 'test.txt', { type: 'text/plain' });
    const uploadedFile: UploadedFile = {
      id: 'test-123',
      file,
      name: 'test.txt',
      size: file.size,
      type: 'text',
      status: 'pending',
    };
    
    const extracted = await act(async () => {
      return await result.current.extractTextFromFile(uploadedFile);
    });
    
    expect(extracted.fileId).toBe('test-123');
    expect(extracted.fileName).toBe('test.txt');
    expect(extracted.content).toBe(content);
    expect(result.current.extractedTexts).toHaveLength(1);
  });

  it('should retrieve extracted text by file ID', async () => {
    const { result } = renderHook(() => useTextExtraction());
    
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const uploadedFile: UploadedFile = {
      id: 'file-1',
      file,
      name: 'test.txt',
      size: file.size,
      type: 'text',
      status: 'pending',
    };
    
    await act(async () => {
      await result.current.extractTextFromFile(uploadedFile);
    });
    
    const retrieved = result.current.getExtractedTextByFileId('file-1');
    expect(retrieved).toBeDefined();
    expect(retrieved?.fileId).toBe('file-1');
  });

  it('should return undefined for non-existent file ID', () => {
    const { result } = renderHook(() => useTextExtraction());
    const retrieved = result.current.getExtractedTextByFileId('non-existent');
    expect(retrieved).toBeUndefined();
  });

  it('should get all extracted texts', async () => {
    const { result } = renderHook(() => useTextExtraction());
    
    const files = [
      { id: 'file-1', name: 'test1.txt', content: 'content 1' },
      { id: 'file-2', name: 'test2.txt', content: 'content 2' },
    ];
    
    for (const fileData of files) {
      const file = new File([fileData.content], fileData.name, { type: 'text/plain' });
      const uploadedFile: UploadedFile = {
        id: fileData.id,
        file,
        name: fileData.name,
        size: file.size,
        type: 'text',
        status: 'pending',
      };
      
      await act(async () => {
        await result.current.extractTextFromFile(uploadedFile);
      });
    }
    
    const allTexts = result.current.getAllExtractedTexts();
    expect(allTexts).toHaveLength(2);
  });

  it('should clear all extracted texts', async () => {
    const { result } = renderHook(() => useTextExtraction());
    
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const uploadedFile: UploadedFile = {
      id: 'file-1',
      file,
      name: 'test.txt',
      size: file.size,
      type: 'text',
      status: 'pending',
    };
    
    await act(async () => {
      await result.current.extractTextFromFile(uploadedFile);
    });
    
    expect(result.current.extractedTexts).toHaveLength(1);
    
    act(() => {
      result.current.clearExtractedTexts();
    });
    
    expect(result.current.extractedTexts).toHaveLength(0);
  });

  it('should remove specific extracted text', async () => {
    const { result } = renderHook(() => useTextExtraction());
    
    const files = [
      { id: 'file-1', name: 'test1.txt', content: 'content 1' },
      { id: 'file-2', name: 'test2.txt', content: 'content 2' },
    ];
    
    for (const fileData of files) {
      const file = new File([fileData.content], fileData.name, { type: 'text/plain' });
      const uploadedFile: UploadedFile = {
        id: fileData.id,
        file,
        name: fileData.name,
        size: file.size,
        type: 'text',
        status: 'pending',
      };
      
      await act(async () => {
        await result.current.extractTextFromFile(uploadedFile);
      });
    }
    
    expect(result.current.extractedTexts).toHaveLength(2);
    
    act(() => {
      result.current.removeExtractedText('file-1');
    });
    
    expect(result.current.extractedTexts).toHaveLength(1);
    expect(result.current.getExtractedTextByFileId('file-1')).toBeUndefined();
    expect(result.current.getExtractedTextByFileId('file-2')).toBeDefined();
  });

  it('should replace extracted text if same file is processed again', async () => {
    const { result } = renderHook(() => useTextExtraction());
    
    const file1 = new File(['first content'], 'test.txt', { type: 'text/plain' });
    const uploadedFile1: UploadedFile = {
      id: 'file-1',
      file: file1,
      name: 'test.txt',
      size: file1.size,
      type: 'text',
      status: 'pending',
    };
    
    await act(async () => {
      await result.current.extractTextFromFile(uploadedFile1);
    });
    
    expect(result.current.extractedTexts).toHaveLength(1);
    expect(result.current.extractedTexts[0].content).toBe('first content');
    
    // Process same file ID again with different content
    const file2 = new File(['second content'], 'test.txt', { type: 'text/plain' });
    const uploadedFile2: UploadedFile = {
      id: 'file-1',
      file: file2,
      name: 'test.txt',
      size: file2.size,
      type: 'text',
      status: 'pending',
    };
    
    await act(async () => {
      await result.current.extractTextFromFile(uploadedFile2);
    });
    
    // Should still have only one entry, with updated content
    expect(result.current.extractedTexts).toHaveLength(1);
    expect(result.current.extractedTexts[0].content).toBe('second content');
  });
});
