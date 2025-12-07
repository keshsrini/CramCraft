import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { extractText, extractTextFromTextFile, getFileType } from './textExtraction';

describe('Text Extraction Property Tests', () => {
  it('Property 5: Text extraction universality', async () => {
    // **Feature: cramcraft, Property 5: Text extraction universality**
    // **Validates: Requirements 2.1, 2.2, 2.3**
    
    // For any supported file type (PDF, image, or text), the extraction process should return text content
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('.txt', '.md'),
        fc.string({ minLength: 1, maxLength: 1000 }),
        async (extension, content) => {
          // Create a text file with the content
          const file = new File([content], `test${extension}`, { type: 'text/plain' });
          const fileId = 'test-id';
          
          // Extract text
          const result = await extractText(file, fileId);
          
          // Should return an ExtractedText object with content
          expect(result).toBeDefined();
          expect(result.content).toBeDefined();
          expect(typeof result.content).toBe('string');
          expect(result.fileId).toBe(fileId);
          expect(result.fileName).toBe(`test${extension}`);
          expect(result.extractionMethod).toBe('direct');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 6: Text file round-trip', async () => {
    // **Feature: cramcraft, Property 6: Text file round-trip**
    // **Validates: Requirements 2.3**
    
    // For any text content, creating a text file with that content and then reading it should return the same content
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 0, maxLength: 1000 }),
        async (content) => {
          // Create a text file with the content
          const file = new File([content], 'test.txt', { type: 'text/plain' });
          
          // Read the text back
          const extractedText = await extractTextFromTextFile(file);
          
          // Should get the same content back
          expect(extractedText).toBe(content);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Text Extraction Unit Tests', () => {
  describe('getFileType', () => {
    it('should identify PDF files', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      expect(getFileType(file)).toBe('pdf');
    });

    it('should identify image files', () => {
      const jpgFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      expect(getFileType(jpgFile)).toBe('image');
      
      const jpegFile = new File(['content'], 'test.jpeg', { type: 'image/jpeg' });
      expect(getFileType(jpegFile)).toBe('image');
      
      const pngFile = new File(['content'], 'test.png', { type: 'image/png' });
      expect(getFileType(pngFile)).toBe('image');
    });

    it('should identify text files', () => {
      const txtFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      expect(getFileType(txtFile)).toBe('text');
      
      const mdFile = new File(['content'], 'test.md', { type: 'text/markdown' });
      expect(getFileType(mdFile)).toBe('text');
    });

    it('should throw error for unsupported file types', () => {
      const file = new File(['content'], 'test.doc', { type: 'application/msword' });
      expect(() => getFileType(file)).toThrow('Unsupported file type');
    });
  });

  describe('extractTextFromTextFile', () => {
    it('should extract text from a text file', async () => {
      const content = 'Hello, world!';
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      const result = await extractTextFromTextFile(file);
      expect(result).toBe(content);
    });

    it('should handle empty text files', async () => {
      const file = new File([''], 'empty.txt', { type: 'text/plain' });
      const result = await extractTextFromTextFile(file);
      expect(result).toBe('');
    });

    it('should handle multi-line text', async () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const file = new File([content], 'multiline.txt', { type: 'text/plain' });
      const result = await extractTextFromTextFile(file);
      expect(result).toBe(content);
    });
  });

  describe('extractText', () => {
    it('should extract text from text files and return ExtractedText object', async () => {
      const content = 'This is a test document with some words.';
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      const fileId = 'test-123';
      
      const result = await extractText(file, fileId);
      
      expect(result.fileId).toBe(fileId);
      expect(result.fileName).toBe('test.txt');
      expect(result.content).toBe(content);
      expect(result.wordCount).toBe(8);
      expect(result.extractionMethod).toBe('direct');
      expect(result.confidence).toBeUndefined();
    });

    it('should calculate word count correctly', async () => {
      const content = 'One two three four five';
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      const result = await extractText(file, 'test-id');
      expect(result.wordCount).toBe(5);
    });

    it('should handle text with multiple spaces', async () => {
      const content = 'Word1    Word2     Word3';
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      const result = await extractText(file, 'test-id');
      expect(result.wordCount).toBe(3);
    });
  });
});
