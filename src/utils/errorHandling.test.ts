import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  getFileSizeErrorMessage,
  getFileTypeErrorMessage,
  getFileCountErrorMessage,
  getPDFParsingErrorMessage,
  getOCRErrorMessage,
  getEmptyContentErrorMessage,
  getRateLimitErrorMessage,
  getAuthErrorMessage,
  getTimeoutErrorMessage,
  getInvalidResponseErrorMessage,
  getNetworkErrorMessage,
  getExportErrorMessage,
  getStorageFullErrorMessage,
} from './errorHandling';

describe('Error Handling - Property Tests', () => {
  it('Property 33: Error message appropriateness', () => {
    // **Feature: cramcraft, Property 33: Error message appropriateness**
    // **Validates: Requirements 9.1, 9.2, 9.3**
    
    fc.assert(
      fc.property(
        fc.oneof(
          // File size error scenario
          fc.record({
            type: fc.constant('file-size' as const),
            fileName: fc.string({ minLength: 1 }),
            sizeMB: fc.float({ min: Math.fround(50.01), max: Math.fround(1000) }),
          }),
          // File type error scenario
          fc.record({
            type: fc.constant('file-type' as const),
            fileName: fc.string({ minLength: 1 }),
          }),
          // File count error scenario
          fc.record({
            type: fc.constant('file-count' as const),
            maxFiles: fc.integer({ min: 1, max: 100 }),
          }),
          // PDF parsing error scenario
          fc.record({
            type: fc.constant('pdf-parsing' as const),
            fileName: fc.string({ minLength: 1 }),
          }),
          // OCR error scenario
          fc.record({
            type: fc.constant('ocr-failure' as const),
            fileName: fc.string({ minLength: 1 }),
          }),
          // Empty content error scenario
          fc.record({
            type: fc.constant('empty-content' as const),
          })
        ),
        (errorScenario) => {
          let message: string;
          
          switch (errorScenario.type) {
            case 'file-size':
              message = getFileSizeErrorMessage(errorScenario.fileName, errorScenario.sizeMB);
              // Should contain file name
              expect(message).toContain(errorScenario.fileName);
              // Should mention size limit
              expect(message.toLowerCase()).toMatch(/50\s*mb|size|large/);
              break;
              
            case 'file-type':
              message = getFileTypeErrorMessage(errorScenario.fileName);
              // Should contain file name
              expect(message).toContain(errorScenario.fileName);
              // Should mention supported types
              expect(message.toLowerCase()).toMatch(/pdf|image|text|support/);
              break;
              
            case 'file-count':
              message = getFileCountErrorMessage(errorScenario.maxFiles);
              // Should mention the max file count
              expect(message).toContain(String(errorScenario.maxFiles));
              // Should mention limit or maximum
              expect(message.toLowerCase()).toMatch(/maximum|limit|files/);
              break;
              
            case 'pdf-parsing':
              message = getPDFParsingErrorMessage(errorScenario.fileName);
              // Should contain file name
              expect(message).toContain(errorScenario.fileName);
              // Should mention extraction or parsing issue
              expect(message.toLowerCase()).toMatch(/extract|corrupt|password|text/);
              break;
              
            case 'ocr-failure':
              message = getOCRErrorMessage(errorScenario.fileName);
              // Should contain file name
              expect(message).toContain(errorScenario.fileName);
              // Should mention reading or clarity
              expect(message.toLowerCase()).toMatch(/read|clear|text|image/);
              break;
              
            case 'empty-content':
              message = getEmptyContentErrorMessage();
              // Should mention no text or empty
              expect(message.toLowerCase()).toMatch(/no text|extract|readable|content/);
              break;
          }
          
          // All error messages should be non-empty strings
          expect(message).toBeTruthy();
          expect(typeof message).toBe('string');
          expect(message.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide appropriate error messages for API errors', () => {
    const rateLimitMsg = getRateLimitErrorMessage();
    expect(rateLimitMsg.toLowerCase()).toMatch(/busy|wait|try again/);
    
    const authMsg = getAuthErrorMessage();
    expect(authMsg.toLowerCase()).toMatch(/configuration|support/);
    
    const timeoutMsg = getTimeoutErrorMessage();
    expect(timeoutMsg.toLowerCase()).toMatch(/longer|expected|try again/);
    
    const invalidResponseMsg = getInvalidResponseErrorMessage();
    expect(invalidResponseMsg.toLowerCase()).toMatch(/invalid|retry/);
  });

  it('should provide appropriate error messages for network and export errors', () => {
    const networkMsg = getNetworkErrorMessage();
    expect(networkMsg.toLowerCase()).toMatch(/connection|lost|saved/);
    
    const exportMsg = getExportErrorMessage();
    expect(exportMsg.toLowerCase()).toMatch(/pdf|create|try again/);
    
    const storageMsg = getStorageFullErrorMessage();
    expect(storageMsg.toLowerCase()).toMatch(/storage|full/);
  });
});
