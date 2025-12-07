import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';
import { ProcessingStatus } from './ProcessingStatus';
import { TextPreview } from './TextPreview';
import type { ProcessingStep, ExtractionMethod } from '../types';

describe('Processing Feedback Property Tests', () => {
  it('Property 7: Processing feedback visibility', () => {
    // **Feature: cramcraft, Property 7: Processing feedback visibility**
    // **Validates: Requirements 2.4, 2.5**
    
    // For any file being processed, the UI should display a status indicator containing
    // the file name during extraction and a preview of extracted text after completion
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => `${s.trim()}.txt`),
        fc.constantFrom<ProcessingStep>('extracting', 'generating-summary', 'generating-quiz'),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 1, max: 10 }),
        (fileName, step, progress, completed, total) => {
          // Test ProcessingStatus component displays file name
          const { container, unmount } = render(
            <ProcessingStatus
              currentFile={fileName}
              currentStep={step}
              progress={progress}
              filesCompleted={completed}
              totalFiles={total}
            />
          );
          
          // Should display the file name (use regex to handle truncation)
          expect(container.textContent).toContain(fileName);
          
          // Should display progress indicator
          const progressBar = container.querySelector('[role="progressbar"]');
          expect(progressBar).toBeTruthy();
          expect(progressBar?.getAttribute('aria-valuenow')).toBe(progress.toString());
          
          // Clean up after each iteration
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 7 (part 2): Text preview displays extracted text', () => {
    // **Feature: cramcraft, Property 7: Processing feedback visibility**
    // **Validates: Requirements 2.4, 2.5**
    
    // After extraction, preview should show the extracted text
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => `${s.trim()}.txt`),
        fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
        fc.constantFrom<ExtractionMethod>('pdf-parser', 'direct'),
        (fileName, content, method) => {
          const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
          
          const extractedText = {
            fileId: 'test-id',
            fileName,
            content,
            wordCount,
            extractionMethod: method,
          };
          
          const { container, unmount } = render(<TextPreview extractedText={extractedText} />);
          
          // Should display file name
          expect(container.textContent).toContain(fileName);
          
          // Should display word count
          expect(container.textContent).toContain(wordCount.toLocaleString());
          
          // Should display the content
          expect(container.textContent).toContain(content);
          
          // Clean up after each iteration
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('ProcessingStatus Unit Tests', () => {
  it('should render current file name', () => {
    render(
      <ProcessingStatus
        currentFile="test.pdf"
        currentStep="extracting"
        progress={50}
        filesCompleted={2}
        totalFiles={5}
      />
    );
    
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  it('should render processing step', () => {
    render(
      <ProcessingStatus
        currentFile="test.pdf"
        currentStep="extracting"
        progress={50}
        filesCompleted={2}
        totalFiles={5}
      />
    );
    
    expect(screen.getByText('Extracting text')).toBeInTheDocument();
  });

  it('should render progress percentage', () => {
    render(
      <ProcessingStatus
        currentFile="test.pdf"
        currentStep="extracting"
        progress={75}
        filesCompleted={2}
        totalFiles={5}
      />
    );
    
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should render files completed count', () => {
    render(
      <ProcessingStatus
        currentFile="test.pdf"
        currentStep="extracting"
        progress={50}
        filesCompleted={3}
        totalFiles={5}
      />
    );
    
    expect(screen.getByText('3 of 5 files completed')).toBeInTheDocument();
  });

  it('should have accessible progress bar', () => {
    const { container } = render(
      <ProcessingStatus
        currentFile="test.pdf"
        currentStep="extracting"
        progress={60}
        filesCompleted={2}
        totalFiles={5}
      />
    );
    
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar?.getAttribute('aria-valuenow')).toBe('60');
    expect(progressBar?.getAttribute('aria-valuemin')).toBe('0');
    expect(progressBar?.getAttribute('aria-valuemax')).toBe('100');
  });
});

describe('TextPreview Unit Tests', () => {
  it('should render file name', () => {
    const extractedText = {
      fileId: 'test-id',
      fileName: 'document.pdf',
      content: 'Sample text content',
      wordCount: 3,
      extractionMethod: 'pdf-parser' as const,
    };
    
    render(<TextPreview extractedText={extractedText} />);
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
  });

  it('should render word count', () => {
    const extractedText = {
      fileId: 'test-id',
      fileName: 'document.pdf',
      content: 'One two three four five',
      wordCount: 5,
      extractionMethod: 'direct' as const,
    };
    
    render(<TextPreview extractedText={extractedText} />);
    expect(screen.getByText('5', { exact: false })).toBeInTheDocument();
  });

  it('should render extracted content', () => {
    const content = 'This is the extracted text from the document.';
    const extractedText = {
      fileId: 'test-id',
      fileName: 'document.pdf',
      content,
      wordCount: 8,
      extractionMethod: 'pdf-parser' as const,
    };
    
    render(<TextPreview extractedText={extractedText} />);
    expect(screen.getByText(content)).toBeInTheDocument();
  });

  it('should display extraction method', () => {
    const extractedText = {
      fileId: 'test-id',
      fileName: 'image.jpg',
      content: 'Extracted text from image',
      wordCount: 4,
      extractionMethod: 'ocr' as const,
      confidence: 95.5,
    };
    
    render(<TextPreview extractedText={extractedText} />);
    expect(screen.getByText('Method:', { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/OCR/)).toBeInTheDocument();
  });

  it('should display confidence score for OCR', () => {
    const extractedText = {
      fileId: 'test-id',
      fileName: 'image.jpg',
      content: 'OCR extracted text',
      wordCount: 3,
      extractionMethod: 'ocr' as const,
      confidence: 87.3,
    };
    
    render(<TextPreview extractedText={extractedText} />);
    expect(screen.getByText('87%', { exact: false })).toBeInTheDocument();
  });

  it('should show warning for empty content', () => {
    const extractedText = {
      fileId: 'test-id',
      fileName: 'empty.pdf',
      content: '',
      wordCount: 0,
      extractionMethod: 'pdf-parser' as const,
    };
    
    render(<TextPreview extractedText={extractedText} />);
    expect(screen.getByText(/No text could be extracted/i)).toBeInTheDocument();
  });

  it('should have accessible text region', () => {
    const extractedText = {
      fileId: 'test-id',
      fileName: 'document.pdf',
      content: 'Sample content',
      wordCount: 2,
      extractionMethod: 'direct' as const,
    };
    
    const { container } = render(<TextPreview extractedText={extractedText} />);
    const textRegion = container.querySelector('[role="region"]');
    expect(textRegion).toBeInTheDocument();
    expect(textRegion?.getAttribute('aria-label')).toContain('document.pdf');
  });
});
