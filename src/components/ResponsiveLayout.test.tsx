import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import fc from 'fast-check';
import { FileUploader } from './FileUploader';
import { RevisionPack } from './RevisionPack';
import { QuizInterface } from './QuizInterface';
import type { RevisionPack as RevisionPackType, Quiz, UploadedFile } from '../types';

describe('Responsive Layout Tests', () => {
  /**
   * **Feature: cramcraft, Property 43: Responsive layout adaptation**
   * **Validates: Requirements 11.4**
   * 
   * For any viewport width (desktop or tablet range), the layout should adapt appropriately without breaking.
   */
  it('Property 43: FileUploader adapts to different viewport widths', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 768, max: 1920 }), // Viewport width from tablet to desktop
        fc.array(
          fc.record({
            id: fc.string(),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            size: fc.integer({ min: 1, max: 50 * 1024 * 1024 }),
            type: fc.constantFrom('pdf', 'image', 'text'),
            status: fc.constantFrom('pending', 'processing', 'completed', 'error'),
          }),
          { maxLength: 10 }
        ) as fc.Arbitrary<UploadedFile[]>,
        (viewportWidth, files) => {
          // Set viewport width
          global.innerWidth = viewportWidth;

          const onFilesSelected = vi.fn();
          const onClearAll = vi.fn();

          const { container, unmount } = render(
            <FileUploader
              files={files}
              onFilesSelected={onFilesSelected}
              onClearAll={onClearAll}
              maxFiles={10}
              acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png', '.txt', '.md']}
            />
          );

          try {
            // Component should render without errors
            expect(container).toBeInTheDocument();

            // Upload zone should be present
            const uploadZone = container.querySelector('[role="button"]');
            expect(uploadZone).toBeInTheDocument();

            // If files exist, Clear All button should be present
            if (files.length > 0) {
              const clearButton = container.querySelector('button');
              expect(clearButton).toBeInTheDocument();
            }

            // Check that responsive classes are applied
            const hasResponsiveClasses =
              container.innerHTML.includes('md:') || container.innerHTML.includes('sm:');
            expect(hasResponsiveClasses).toBe(true);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 43: RevisionPack adapts to different viewport widths', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 768, max: 1920 }), // Viewport width
        fc.array(
          fc.record({
            id: fc.string(),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            keyConcepts: fc.array(fc.string({ minLength: 1, maxLength: 100 }), {
              minLength: 3,
              maxLength: 5,
            }),
            definitions: fc.array(
              fc.record({
                term: fc.string({ minLength: 1, maxLength: 50 }),
                definition: fc.string({ minLength: 1, maxLength: 200 }),
              }),
              { minLength: 1, maxLength: 5 }
            ),
            summary: fc.string({ minLength: 50, maxLength: 500 }),
            memoryAids: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { maxLength: 3 }),
            subject: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
          }),
          { minLength: 1, maxLength: 3 }
        ),
        fc.integer({ min: 1, max: 60 }),
        (viewportWidth, documents, totalReadingTime) => {
          global.innerWidth = viewportWidth;

          const revisionPack: RevisionPackType = {
            documents,
            totalReadingTime,
            generatedAt: new Date(),
          };

          const onStartQuiz = vi.fn();
          const onExport = vi.fn();

          const { container, unmount } = render(
            <RevisionPack
              revisionPack={revisionPack}
              onStartQuiz={onStartQuiz}
              onExport={onExport}
            />
          );

          try {
            // Component should render without errors
            expect(container).toBeInTheDocument();

            // Header should be present
            expect(container.textContent).toContain('Revision Pack');

            // Reading time should be displayed
            expect(container.textContent).toContain(`${totalReadingTime} minutes`);

            // Action buttons should be present
            const buttons = container.querySelectorAll('button');
            expect(buttons.length).toBeGreaterThanOrEqual(2); // At least Start Quiz and Export buttons

            // Check that responsive classes are applied
            const hasResponsiveClasses =
              container.innerHTML.includes('md:') || container.innerHTML.includes('sm:');
            expect(hasResponsiveClasses).toBe(true);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 43: QuizInterface adapts to different viewport widths', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 768, max: 1920 }), // Viewport width
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 100 }),
            question: fc.string({ minLength: 10, maxLength: 200 }),
            options: fc.constant(['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4']),
            correctAnswer: fc.constantFrom('A', 'B', 'C', 'D'),
            explanation: fc.string({ minLength: 10, maxLength: 200 }),
            difficulty: fc.constantFrom('easy', 'medium', 'hard'),
          }),
          { minLength: 10, maxLength: 15 }
        ),
        (viewportWidth, questions) => {
          global.innerWidth = viewportWidth;

          const quiz: Quiz = {
            id: 'test-quiz',
            questions,
            generatedAt: new Date(),
          };

          const onQuizComplete = vi.fn();

          const { container, unmount } = render(
            <QuizInterface quiz={quiz} onQuizComplete={onQuizComplete} />
          );

          try {
            // Component should render without errors
            expect(container).toBeInTheDocument();

            // Quiz header should be present
            expect(container.textContent).toContain('Quiz');

            // Timer should be present
            const timer = container.querySelector('[data-testid="quiz-timer"]');
            expect(timer).toBeInTheDocument();

            // Progress indicator should be present
            const progressText = container.querySelector('[data-testid="progress-text"]');
            expect(progressText).toBeInTheDocument();

            // Question should be displayed
            const questionText = container.querySelector('[data-testid="question-text"]');
            expect(questionText).toBeInTheDocument();

            // Answer options should be present (4 radio buttons)
            const radioButtons = container.querySelectorAll('input[type="radio"]');
            expect(radioButtons.length).toBe(4);

            // Check that responsive classes are applied
            const hasResponsiveClasses =
              container.innerHTML.includes('md:') || container.innerHTML.includes('sm:');
            expect(hasResponsiveClasses).toBe(true);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 43: Layout does not break at tablet viewport (768px)', () => {
    const viewportWidth = 768;
    global.innerWidth = viewportWidth;

    const files: UploadedFile[] = [
      {
        id: '1',
        file: new File(['content'], 'test.pdf', { type: 'application/pdf' }),
        name: 'test.pdf',
        size: 1024,
        type: 'pdf',
        status: 'completed',
      },
    ];

    const onFilesSelected = vi.fn();
    const onClearAll = vi.fn();

    const { container, unmount } = render(
      <FileUploader
        files={files}
        onFilesSelected={onFilesSelected}
        onClearAll={onClearAll}
        maxFiles={10}
        acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png', '.txt', '.md']}
      />
    );

    try {
      // Component should render without errors at tablet width
      expect(container).toBeInTheDocument();
      const uploadZone = container.querySelector('[role="button"]');
      expect(uploadZone).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('Property 43: Layout does not break at desktop viewport (1920px)', () => {
    const viewportWidth = 1920;
    global.innerWidth = viewportWidth;

    const files: UploadedFile[] = [
      {
        id: '1',
        file: new File(['content'], 'test.pdf', { type: 'application/pdf' }),
        name: 'test.pdf',
        size: 1024,
        type: 'pdf',
        status: 'completed',
      },
    ];

    const onFilesSelected = vi.fn();
    const onClearAll = vi.fn();

    const { container, unmount } = render(
      <FileUploader
        files={files}
        onFilesSelected={onFilesSelected}
        onClearAll={onClearAll}
        maxFiles={10}
        acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png', '.txt', '.md']}
      />
    );

    try {
      // Component should render without errors at desktop width
      expect(container).toBeInTheDocument();
      const uploadZone = container.querySelector('[role="button"]');
      expect(uploadZone).toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});
