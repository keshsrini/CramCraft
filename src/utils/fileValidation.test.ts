import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  isValidFileType,
  isValidFileSize,
  isValidFileCount,
  validateFile,
  validateFiles,
  getFileType,
  formatFileSize,
} from './fileValidation';
import { FILE_LIMITS, ALL_SUPPORTED_EXTENSIONS } from '../types';

describe('File Validation', () => {
  describe('Property 2: File count limit enforcement', () => {
    it('should enforce maximum file count limit', () => {
      // **Feature: cramcraft, Property 2: File count limit enforcement**
      // **Validates: Requirements 1.2**
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 20 }),
          fc.integer({ min: 0, max: 20 }),
          (currentCount, newFilesCount) => {
            const isValid = isValidFileCount(currentCount, newFilesCount);
            const totalCount = currentCount + newFilesCount;

            if (totalCount <= FILE_LIMITS.MAX_FILES) {
              expect(isValid).toBe(true);
            } else {
              expect(isValid).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject attempts to upload more than 10 files total', () => {
      // **Feature: cramcraft, Property 2: File count limit enforcement**
      // **Validates: Requirements 1.2**
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          (fileCount) => {
            const files = Array(fileCount)
              .fill(null)
              .map((_, i) => new File(['content'], `test${i}.pdf`));
            
            const result = validateFiles(files, 0);

            if (fileCount <= FILE_LIMITS.MAX_FILES) {
              expect(result.isValid).toBe(true);
              expect(result.errors.filter(e => e.type === 'file-count')).toHaveLength(0);
            } else {
              expect(result.isValid).toBe(false);
              expect(result.errors.some(e => e.type === 'file-count')).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 1: File type validation', () => {
    it('should accept valid file types and reject invalid ones', () => {
      // **Feature: cramcraft, Property 1: File type validation**
      // **Validates: Requirements 1.1, 9.2**
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constantFrom(...ALL_SUPPORTED_EXTENSIONS),
            fc.string().filter((s) => !ALL_SUPPORTED_EXTENSIONS.includes(s as any))
          ),
          (extension) => {
            const fileName = `test${extension}`;
            const file = new File(['content'], fileName, { type: 'text/plain' });
            const isValid = isValidFileType(file);

            if (ALL_SUPPORTED_EXTENSIONS.includes(extension as any)) {
              expect(isValid).toBe(true);
            } else {
              expect(isValid).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle case-insensitive file extensions', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...ALL_SUPPORTED_EXTENSIONS),
          fc.constantFrom('lower', 'upper', 'mixed'),
          (extension, caseType) => {
            let fileName: string;
            if (caseType === 'upper') {
              fileName = `test${extension.toUpperCase()}`;
            } else if (caseType === 'mixed') {
              fileName = `test${extension.split('').map((c, i) => i % 2 === 0 ? c.toUpperCase() : c).join('')}`;
            } else {
              fileName = `test${extension}`;
            }

            const file = new File(['content'], fileName, { type: 'text/plain' });
            expect(isValidFileType(file)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('File size validation', () => {
    it('should accept files within size limit', () => {
      const validSize = FILE_LIMITS.MAX_FILE_SIZE - 1000;
      const file = new File(['x'], 'test.pdf');
      Object.defineProperty(file, 'size', { value: validSize });
      expect(isValidFileSize(file)).toBe(true);
    });

    it('should reject files exceeding size limit', () => {
      // Create a file that exceeds the limit
      const file = new File(['x'], 'test.pdf');
      Object.defineProperty(file, 'size', { value: FILE_LIMITS.MAX_FILE_SIZE + 1 });
      expect(isValidFileSize(file)).toBe(false);
    });

    it('should accept files at exactly the size limit', () => {
      const file = new File(['x'], 'test.pdf');
      Object.defineProperty(file, 'size', { value: FILE_LIMITS.MAX_FILE_SIZE });
      expect(isValidFileSize(file)).toBe(true);
    });
  });

  describe('File count validation', () => {
    it('should accept file counts within limit', () => {
      expect(isValidFileCount(0, 5)).toBe(true);
      expect(isValidFileCount(5, 5)).toBe(true);
      expect(isValidFileCount(9, 1)).toBe(true);
    });

    it('should reject file counts exceeding limit', () => {
      expect(isValidFileCount(10, 1)).toBe(false);
      expect(isValidFileCount(5, 6)).toBe(false);
      expect(isValidFileCount(11, 0)).toBe(false);
    });

    it('should accept exactly the maximum file count', () => {
      expect(isValidFileCount(0, 10)).toBe(true);
      expect(isValidFileCount(10, 0)).toBe(true);
    });
  });

  describe('validateFile', () => {
    it('should return valid for supported file types within size limit', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const result = validateFile(file);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for unsupported file type', () => {
      const file = new File(['content'], 'test.exe', { type: 'application/exe' });
      const result = validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('file-type');
      expect(result.errors[0].message).toContain('not supported');
    });

    it('should return error for file exceeding size limit', () => {
      const file = new File(['x'], 'test.pdf');
      Object.defineProperty(file, 'size', { value: FILE_LIMITS.MAX_FILE_SIZE + 1 });
      const result = validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('file-size');
      expect(result.errors[0].message).toContain('too large');
    });

    it('should return multiple errors for invalid type and size', () => {
      const file = new File(['x'], 'test.exe');
      Object.defineProperty(file, 'size', { value: FILE_LIMITS.MAX_FILE_SIZE + 1 });
      const result = validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('validateFiles', () => {
    it('should validate multiple files correctly', () => {
      const files = [
        new File(['content'], 'test1.pdf'),
        new File(['content'], 'test2.jpg'),
        new File(['content'], 'test3.txt'),
      ];
      const result = validateFiles(files);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error when file count exceeds limit', () => {
      const files = Array(11)
        .fill(null)
        .map((_, i) => new File(['content'], `test${i}.pdf`));
      const result = validateFiles(files);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('file-count');
    });

    it('should consider current file count', () => {
      const files = [new File(['content'], 'test.pdf')];
      const result = validateFiles(files, 10);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe('file-count');
    });

    it('should collect errors from all invalid files', () => {
      const files = [
        new File(['content'], 'test1.exe'),
        new File(['content'], 'test2.bat'),
      ];
      const result = validateFiles(files);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getFileType', () => {
    it('should return correct file type for PDFs', () => {
      const file = new File(['content'], 'test.pdf');
      expect(getFileType(file)).toBe('pdf');
    });

    it('should return correct file type for images', () => {
      expect(getFileType(new File([''], 'test.jpg'))).toBe('image');
      expect(getFileType(new File([''], 'test.jpeg'))).toBe('image');
      expect(getFileType(new File([''], 'test.png'))).toBe('image');
    });

    it('should return correct file type for text files', () => {
      expect(getFileType(new File([''], 'test.txt'))).toBe('text');
      expect(getFileType(new File([''], 'test.md'))).toBe('text');
    });

    it('should return null for unsupported file types', () => {
      const file = new File(['content'], 'test.exe');
      expect(getFileType(file)).toBeNull();
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format KB correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
    });

    it('should format MB correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
    });

    it('should format GB correctly', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });
});
