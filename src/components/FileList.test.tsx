import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';
import { FileList } from './FileList';
import type { UploadedFile, FileType, FileStatus } from '../types';

describe('FileList Component', () => {
  describe('Property 3: File information display', () => {
    it('should display file names and sizes for all uploaded files', { timeout: 30000 }, () => {
      // **Feature: cramcraft, Property 3: File information display**
      // **Validates: Requirements 1.3, 1.4**
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.integer({ min: 1, max: 100000 }).map(n => `file_${n}.pdf`),
              size: fc.integer({ min: 1, max: 50 * 1024 * 1024 }),
              type: fc.constantFrom<FileType>('pdf', 'image', 'text'),
              status: fc.constantFrom<FileStatus>('pending', 'processing', 'completed', 'error'),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (fileData) => {
            // Create mock File objects and UploadedFile objects with unique IDs
            const files: UploadedFile[] = fileData.map((data, index) => ({
              id: `file-${index}`,
              file: new File(['content'], data.name),
              name: data.name,
              size: data.size,
              type: data.type,
              status: data.status,
            }));

            const { container } = render(<FileList files={files} />);

            // Check that all file names are displayed
            files.forEach((file) => {
              const nameElements = screen.getAllByText(file.name);
              expect(nameElements.length).toBeGreaterThanOrEqual(1);
            });

            // Check that file sizes are displayed (formatted)
            // We just verify that some size text exists for each file
            const sizeElements = container.querySelectorAll('[class*="text-sm text-gray-500"]');
            expect(sizeElements.length).toBeGreaterThanOrEqual(files.length);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should display thumbnails for image files or icons for other types', { timeout: 30000 }, () => {
      // **Feature: cramcraft, Property 3: File information display**
      // **Validates: Requirements 1.3, 1.4**
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.integer({ min: 1, max: 100000 }).map(n => `file_${n}.pdf`),
              size: fc.integer({ min: 1, max: 1024 }),
              type: fc.constantFrom<FileType>('pdf', 'image', 'text'),
              status: fc.constantFrom<FileStatus>('completed'),
              thumbnail: fc.option(fc.constant('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='), { nil: undefined }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (fileData) => {
            const files: UploadedFile[] = fileData.map((data, index) => ({
              id: `file-${index}`,
              file: new File(['content'], data.name),
              name: data.name,
              size: data.size,
              type: data.type,
              status: data.status,
              thumbnail: data.thumbnail,
            }));

            const { container } = render(<FileList files={files} />);

            files.forEach((file) => {
              if (file.thumbnail) {
                // Should have an img element with the thumbnail
                const img = container.querySelector(`img[alt="Thumbnail for ${file.name}"]`);
                expect(img).toBeInTheDocument();
              } else {
                // Should have an icon (SVG) for the file type
                // We can check that SVG elements exist
                const svgs = container.querySelectorAll('svg');
                expect(svgs.length).toBeGreaterThan(0);
              }
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Basic rendering', () => {
    it('should render nothing when files array is empty', () => {
      const { container } = render(<FileList files={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render file list with correct count', () => {
      const files: UploadedFile[] = [
        {
          id: '1',
          file: new File(['content'], 'test1.pdf'),
          name: 'test1.pdf',
          size: 1024,
          type: 'pdf',
          status: 'completed',
        },
        {
          id: '2',
          file: new File(['content'], 'test2.jpg'),
          name: 'test2.jpg',
          size: 2048,
          type: 'image',
          status: 'completed',
        },
      ];

      render(<FileList files={files} />);
      
      expect(screen.getByText('Uploaded Files (2)')).toBeInTheDocument();
      expect(screen.getByText('test1.pdf')).toBeInTheDocument();
      expect(screen.getByText('test2.jpg')).toBeInTheDocument();
    });

    it('should display status badges correctly', () => {
      const files: UploadedFile[] = [
        {
          id: '1',
          file: new File(['content'], 'completed.pdf'),
          name: 'completed.pdf',
          size: 1024,
          type: 'pdf',
          status: 'completed',
        },
        {
          id: '2',
          file: new File(['content'], 'error.pdf'),
          name: 'error.pdf',
          size: 1024,
          type: 'pdf',
          status: 'error',
          error: 'Upload failed',
        },
        {
          id: '3',
          file: new File(['content'], 'processing.pdf'),
          name: 'processing.pdf',
          size: 1024,
          type: 'pdf',
          status: 'processing',
        },
      ];

      render(<FileList files={files} />);
      
      expect(screen.getByText('Complete')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    it('should show thumbnail when provided', () => {
      const files: UploadedFile[] = [
        {
          id: '1',
          file: new File(['content'], 'image.jpg'),
          name: 'image.jpg',
          size: 1024,
          type: 'image',
          status: 'completed',
          thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        },
      ];

      render(<FileList files={files} />);
      
      const img = screen.getByAltText('Thumbnail for image.jpg');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', files[0].thumbnail);
    });
  });
});
