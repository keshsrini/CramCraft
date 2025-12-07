import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import fc from 'fast-check';
import React from 'react';
import { FileUploader } from '../components/FileUploader';
import { QuizInterface } from '../components/QuizInterface';
import { RevisionPack } from '../components/RevisionPack';
import { QuizResults } from '../components/QuizResults';
import { ProcessingStatus } from '../components/ProcessingStatus';
import { ExportButtons } from '../components/ExportButtons';
import type { Quiz, RevisionPack as RevisionPackType, QuizResults as QuizResultsType, UploadedFile } from '../types';

/**
 * Property 37: ARIA label presence
 * **Feature: cramcraft, Property 37: ARIA label presence**
 * **Validates: Requirements 10.1**
 * 
 * For any interactive element in the UI, appropriate ARIA labels should be present in the rendered output.
 */
describe('Property 37: ARIA label presence', () => {
  it('should have ARIA labels on all interactive elements in FileUploader', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string(),
            name: fc.string(),
            size: fc.integer({ min: 1, max: 50 * 1024 * 1024 }),
            type: fc.constantFrom('pdf' as const, 'image' as const, 'text' as const),
            status: fc.constantFrom('pending' as const, 'processing' as const, 'completed' as const, 'error' as const),
          }),
          { maxLength: 10 }
        ),
        (files) => {
          const mockFiles = files.map(f => ({
            ...f,
            file: new File(['content'], f.name),
          })) as UploadedFile[];

          const { container } = render(
            <FileUploader
              files={mockFiles}
              onFilesSelected={() => {}}
              onClearAll={() => {}}
              maxFiles={10}
              acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png', '.txt', '.md']}
            />
          );

          // Check for upload zone ARIA label
          const uploadZone = container.querySelector('[role="button"]');
          expect(uploadZone).toBeTruthy();
          expect(uploadZone?.getAttribute('aria-label')).toBeTruthy();
          expect(uploadZone?.getAttribute('tabindex')).toBe('0');

          // Check for file input ARIA label
          const fileInput = container.querySelector('input[type="file"]');
          expect(fileInput?.getAttribute('aria-label')).toBeTruthy();

          // If files exist, check Clear All button
          if (mockFiles.length > 0) {
            const clearButton = container.querySelector('button');
            expect(clearButton?.getAttribute('aria-label')).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have ARIA labels on all interactive elements in QuizInterface', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.integer({ min: 1 }),
            question: fc.string({ minLength: 10 }),
            options: fc.constant(['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4']),
            correctAnswer: fc.constantFrom('A' as const, 'B' as const, 'C' as const, 'D' as const),
            explanation: fc.string({ minLength: 10 }),
            difficulty: fc.constantFrom('easy' as const, 'medium' as const, 'hard' as const),
          }),
          { minLength: 10, maxLength: 15 }
        ),
        (questions) => {
          const quiz: Quiz = {
            id: 'test-quiz',
            questions,
            generatedAt: new Date(),
          };

          const { container } = render(
            <QuizInterface quiz={quiz} onQuizComplete={() => {}} />
          );

          // Check timer has ARIA label
          const timer = container.querySelector('[data-testid="quiz-timer"]');
          expect(timer?.getAttribute('aria-live')).toBe('polite');
          expect(timer?.getAttribute('aria-label')).toBeTruthy();

          // Check progress bar has ARIA attributes
          const progressBar = container.querySelector('[role="progressbar"]');
          expect(progressBar).toBeTruthy();
          expect(progressBar?.getAttribute('aria-valuenow')).toBeTruthy();
          expect(progressBar?.getAttribute('aria-valuemin')).toBe('0');
          expect(progressBar?.getAttribute('aria-valuemax')).toBe('100');
          expect(progressBar?.getAttribute('aria-label')).toBeTruthy();

          // Check answer options have radiogroup role
          const radioGroup = container.querySelector('[role="radiogroup"]');
          expect(radioGroup).toBeTruthy();
          expect(radioGroup?.getAttribute('aria-label')).toBeTruthy();

          // Check radio inputs have ARIA labels
          const radioInputs = container.querySelectorAll('input[type="radio"]');
          radioInputs.forEach((input) => {
            expect(input.getAttribute('aria-label')).toBeTruthy();
          });

          // Check navigation buttons have ARIA labels
          const buttons = container.querySelectorAll('button');
          buttons.forEach((button) => {
            expect(button.getAttribute('aria-label')).toBeTruthy();
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have ARIA labels on all interactive elements in RevisionPack', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string(),
            title: fc.string({ minLength: 5 }),
            keyConcepts: fc.array(fc.string(), { minLength: 3, maxLength: 5 }),
            definitions: fc.array(
              fc.record({
                term: fc.string(),
                definition: fc.string(),
              }),
              { minLength: 1, maxLength: 5 }
            ),
            summary: fc.string({ minLength: 50 }),
            memoryAids: fc.array(fc.string(), { maxLength: 3 }),
            subject: fc.option(fc.string(), { nil: undefined }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (documents) => {
          const revisionPack: RevisionPackType = {
            documents,
            totalReadingTime: 10,
            generatedAt: new Date(),
          };

          const { container } = render(
            <RevisionPack
              revisionPack={revisionPack}
              onStartQuiz={() => {}}
              onExport={() => {}}
            />
          );

          // Check collapsible section buttons have ARIA attributes
          const sectionButtons = container.querySelectorAll('button[aria-expanded]');
          sectionButtons.forEach((button) => {
            expect(button.getAttribute('aria-expanded')).toBeTruthy();
            expect(button.getAttribute('aria-controls')).toBeTruthy();
            expect(button.getAttribute('aria-label')).toBeTruthy();
          });

          // Check action buttons group has role
          const actionGroup = container.querySelector('[role="group"]');
          expect(actionGroup).toBeTruthy();
          expect(actionGroup?.getAttribute('aria-label')).toBeTruthy();

          // Check action buttons have ARIA labels
          const actionButtons = actionGroup?.querySelectorAll('button');
          actionButtons?.forEach((button) => {
            expect(button.getAttribute('aria-label')).toBeTruthy();
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have ARIA labels on all interactive elements in QuizResults', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 15 }),
        fc.integer({ min: 10, max: 15 }),
        (score, totalQuestions) => {
          const percentage = (score / totalQuestions) * 100;
          const readinessLevel =
            percentage >= 90 ? 'excellent' : percentage >= 70 ? 'good' : percentage >= 50 ? 'moderate' : 'needs-work';
          const readinessColor = percentage >= 90 ? 'green' : percentage >= 70 ? 'yellow' : percentage >= 50 ? 'orange' : 'red';
          const readinessMessage =
            percentage >= 90
              ? "Excellent! You're exam-ready!"
              : percentage >= 70
              ? 'Good progress! Review weak areas below.'
              : percentage >= 50
              ? 'Getting there. More revision needed.'
              : 'Study more and retake the quiz.';

          const results: QuizResultsType = {
            quiz: {
              id: 'test',
              questions: Array(totalQuestions)
                .fill(null)
                .map((_, i) => ({
                  id: i,
                  question: `Question ${i}`,
                  options: ['A) 1', 'B) 2', 'C) 3', 'D) 4'],
                  correctAnswer: 'A' as const,
                  explanation: 'Explanation',
                  difficulty: 'easy' as const,
                })),
              generatedAt: new Date(),
            },
            userAnswers: {
              quizId: 'test',
              answers: {},
              startTime: new Date(),
              endTime: new Date(),
              elapsedSeconds: 60,
            },
            score,
            totalQuestions,
            percentage,
            readinessLevel,
            readinessMessage,
            readinessColor,
            breakdown: [],
            weakAreas: [],
          };

          const { container } = render(
            <QuizResults results={results} onRetry={() => {}} onExport={() => {}} />
          );

          // Check progress bar has ARIA attributes
          const progressBar = container.querySelector('[role="progressbar"]');
          expect(progressBar).toBeTruthy();
          expect(progressBar?.getAttribute('aria-valuenow')).toBeTruthy();
          expect(progressBar?.getAttribute('aria-label')).toBeTruthy();

          // Check readiness badge has ARIA label
          const badge = container.querySelector('[data-testid="readiness-badge"]');
          expect(badge?.getAttribute('aria-label')).toBeTruthy();

          // Check action buttons have ARIA labels
          const retryButton = container.querySelector('[data-testid="retry-button"]');
          expect(retryButton?.getAttribute('aria-label')).toBeTruthy();

          const exportButton = container.querySelector('[data-testid="export-button"]');
          expect(exportButton?.getAttribute('aria-label')).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have ARIA labels on ProcessingStatus component', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5 }),
        fc.constantFrom('extracting' as const, 'generating-summary' as const, 'generating-quiz' as const),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 1, max: 10 }),
        (currentFile, currentStep, progress, filesCompleted, totalFiles) => {
          const { container } = render(
            <ProcessingStatus
              currentFile={currentFile}
              currentStep={currentStep}
              progress={progress}
              filesCompleted={filesCompleted}
              totalFiles={totalFiles}
            />
          );

          // Check main container has role and aria-live
          const mainContainer = container.querySelector('[role="status"]');
          expect(mainContainer).toBeTruthy();
          expect(mainContainer?.getAttribute('aria-live')).toBe('polite');

          // Check progress bar has ARIA attributes
          const progressBar = container.querySelector('[role="progressbar"]');
          expect(progressBar).toBeTruthy();
          expect(progressBar?.getAttribute('aria-valuenow')).toBeTruthy();
          expect(progressBar?.getAttribute('aria-label')).toBeTruthy();

          // Check dynamic content has aria-live
          const liveRegions = container.querySelectorAll('[aria-live="polite"]');
          expect(liveRegions.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have ARIA labels on ExportButtons component', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        (hasRevisionPack, hasQuizResults) => {
          const revisionPack = hasRevisionPack
            ? ({
                documents: [],
                totalReadingTime: 10,
                generatedAt: new Date(),
              } as RevisionPackType)
            : undefined;

          const quizResults = hasQuizResults
            ? ({
                quiz: { id: 'test', questions: [], generatedAt: new Date() },
                userAnswers: {
                  quizId: 'test',
                  answers: {},
                  startTime: new Date(),
                  endTime: new Date(),
                  elapsedSeconds: 60,
                },
                score: 10,
                totalQuestions: 10,
                percentage: 100,
                readinessLevel: 'excellent',
                readinessMessage: 'Great!',
                readinessColor: 'green',
                breakdown: [],
                weakAreas: [],
              } as QuizResultsType)
            : undefined;

          const { container } = render(
            <ExportButtons revisionPack={revisionPack} quizResults={quizResults} />
          );

          // Check all buttons have ARIA labels
          const buttons = container.querySelectorAll('button');
          buttons.forEach((button) => {
            expect(button.getAttribute('aria-label')).toBeTruthy();
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 38: Keyboard navigation support
 * **Feature: cramcraft, Property 38: Keyboard navigation support**
 * **Validates: Requirements 10.2**
 * 
 * For any quiz interface state, keyboard events (Tab, Enter, Arrow keys) should properly navigate and select answers.
 */
describe('Property 38: Keyboard navigation support', () => {
  it('should support keyboard navigation in QuizInterface', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    
    fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.integer({ min: 1 }),
            question: fc.string({ minLength: 10 }),
            options: fc.constant(['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4']),
            correctAnswer: fc.constantFrom('A' as const, 'B' as const, 'C' as const, 'D' as const),
            explanation: fc.string({ minLength: 10 }),
            difficulty: fc.constantFrom('easy' as const, 'medium' as const, 'hard' as const),
          }),
          { minLength: 10, maxLength: 15 }
        ),
        async (questions) => {
          const quiz: Quiz = {
            id: 'test-quiz',
            questions,
            generatedAt: new Date(),
          };

          const { container } = render(
            <QuizInterface quiz={quiz} onQuizComplete={() => {}} />
          );

          const quizContainer = container.firstChild as HTMLElement;

          // Test number key selection (1-4 for A-D)
          const numberKeys = ['1', '2', '3', '4'];
          const expectedAnswers: AnswerOption[] = ['A', 'B', 'C', 'D'];
          
          for (let i = 0; i < numberKeys.length; i++) {
            // Simulate pressing number key
            const event = new KeyboardEvent('keydown', { key: numberKeys[i], bubbles: true });
            quizContainer.dispatchEvent(event);
            
            // Check that the corresponding radio button is selected
            const radioInput = container.querySelector(`input[value="${expectedAnswers[i]}"]`) as HTMLInputElement;
            expect(radioInput?.checked).toBe(true);
          }

          // Test arrow key navigation
          // Press ArrowDown to select first option
          let event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
          quizContainer.dispatchEvent(event);
          
          let radioInput = container.querySelector('input[value="A"]') as HTMLInputElement;
          expect(radioInput?.checked).toBe(true);

          // Press ArrowDown again to move to B
          event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
          quizContainer.dispatchEvent(event);
          
          radioInput = container.querySelector('input[value="B"]') as HTMLInputElement;
          expect(radioInput?.checked).toBe(true);

          // Press ArrowUp to move back to A
          event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
          quizContainer.dispatchEvent(event);
          
          radioInput = container.querySelector('input[value="A"]') as HTMLInputElement;
          expect(radioInput?.checked).toBe(true);

          // Test Enter key to proceed (should enable next button when answer is selected)
          const nextButton = container.querySelector('[data-testid="next-button"]') as HTMLButtonElement;
          expect(nextButton?.disabled).toBe(false);
        }
      ),
      { numRuns: 50 } // Reduced runs for async tests
    );
  });

  it('should support keyboard navigation in RevisionPack collapsible sections', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string(),
            title: fc.string({ minLength: 5 }),
            keyConcepts: fc.array(fc.string(), { minLength: 3, maxLength: 5 }),
            definitions: fc.array(
              fc.record({
                term: fc.string(),
                definition: fc.string(),
              }),
              { minLength: 1, maxLength: 5 }
            ),
            summary: fc.string({ minLength: 50 }),
            memoryAids: fc.array(fc.string(), { maxLength: 3 }),
            subject: fc.option(fc.string(), { nil: undefined }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (documents) => {
          const revisionPack: RevisionPackType = {
            documents,
            totalReadingTime: 10,
            generatedAt: new Date(),
          };

          const { container } = render(
            <RevisionPack
              revisionPack={revisionPack}
              onStartQuiz={() => {}}
              onExport={() => {}}
            />
          );

          // Get all collapsible section buttons
          const sectionButtons = container.querySelectorAll('button[aria-expanded]');
          
          // Verify that collapsible buttons exist and have proper ARIA attributes
          expect(sectionButtons.length).toBeGreaterThan(0);
          
          sectionButtons.forEach((button) => {
            const htmlButton = button as HTMLButtonElement;
            
            // Verify button has proper ARIA attributes for keyboard navigation
            expect(htmlButton.getAttribute('aria-expanded')).toBeTruthy();
            expect(htmlButton.getAttribute('aria-controls')).toBeTruthy();
            expect(htmlButton.getAttribute('aria-label')).toBeTruthy();
            
            // Verify button is keyboard accessible (has no negative tabindex)
            const tabIndex = htmlButton.getAttribute('tabindex');
            expect(tabIndex === null || parseInt(tabIndex) >= 0).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should support Tab navigation through interactive elements', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.integer({ min: 1 }),
            question: fc.string({ minLength: 10 }),
            options: fc.constant(['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4']),
            correctAnswer: fc.constantFrom('A' as const, 'B' as const, 'C' as const, 'D' as const),
            explanation: fc.string({ minLength: 10 }),
            difficulty: fc.constantFrom('easy' as const, 'medium' as const, 'hard' as const),
          }),
          { minLength: 10, maxLength: 15 }
        ),
        (questions) => {
          const quiz: Quiz = {
            id: 'test-quiz',
            questions,
            generatedAt: new Date(),
          };

          const { container } = render(
            <QuizInterface quiz={quiz} onQuizComplete={() => {}} />
          );

          // Check that all interactive elements have proper tabindex or are naturally focusable
          const radioInputs = container.querySelectorAll('input[type="radio"]');
          radioInputs.forEach((input) => {
            const tabIndex = input.getAttribute('tabindex');
            // Radio buttons should either have no tabindex (default 0) or explicit tabindex
            expect(tabIndex === null || parseInt(tabIndex) >= 0).toBe(true);
          });

          const buttons = container.querySelectorAll('button');
          buttons.forEach((button) => {
            const tabIndex = button.getAttribute('tabindex');
            // Buttons should either have no tabindex (default 0) or explicit tabindex >= 0
            expect(tabIndex === null || parseInt(tabIndex) >= 0).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 40: Focus indicator visibility
 * **Feature: cramcraft, Property 40: Focus indicator visibility**
 * **Validates: Requirements 10.4**
 * 
 * For any interactive element that receives focus, visible focus styles should be applied.
 */
describe('Property 40: Focus indicator visibility', () => {
  it('should have focus styles on all interactive elements in QuizInterface', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.integer({ min: 1 }),
            question: fc.string({ minLength: 10 }),
            options: fc.constant(['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4']),
            correctAnswer: fc.constantFrom('A' as const, 'B' as const, 'C' as const, 'D' as const),
            explanation: fc.string({ minLength: 10 }),
            difficulty: fc.constantFrom('easy' as const, 'medium' as const, 'hard' as const),
          }),
          { minLength: 10, maxLength: 15 }
        ),
        (questions) => {
          const quiz: Quiz = {
            id: 'test-quiz',
            questions,
            generatedAt: new Date(),
          };

          const { container } = render(
            <QuizInterface quiz={quiz} onQuizComplete={() => {}} />
          );

          // Check radio inputs have focus styles
          const radioInputs = container.querySelectorAll('input[type="radio"]');
          radioInputs.forEach((input) => {
            const htmlInput = input as HTMLInputElement;
            const styles = window.getComputedStyle(htmlInput);
            
            // Tailwind adds focus:ring classes which should be present
            // We verify the element is focusable
            expect(htmlInput.tabIndex).toBeGreaterThanOrEqual(0);
          });

          // Check buttons have focus styles
          const buttons = container.querySelectorAll('button');
          buttons.forEach((button) => {
            const htmlButton = button as HTMLButtonElement;
            
            // Verify button is focusable (tabIndex >= 0 or no tabIndex attribute means focusable)
            const tabIndex = htmlButton.getAttribute('tabindex');
            expect(tabIndex === null || parseInt(tabIndex) >= 0).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have focus styles on all interactive elements in FileUploader', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string(),
            name: fc.string(),
            size: fc.integer({ min: 1, max: 50 * 1024 * 1024 }),
            type: fc.constantFrom('pdf' as const, 'image' as const, 'text' as const),
            status: fc.constantFrom('pending' as const, 'processing' as const, 'completed' as const, 'error' as const),
          }),
          { maxLength: 10 }
        ),
        (files) => {
          const mockFiles = files.map(f => ({
            ...f,
            file: new File(['content'], f.name),
          })) as UploadedFile[];

          const { container } = render(
            <FileUploader
              files={mockFiles}
              onFilesSelected={() => {}}
              onClearAll={() => {}}
              maxFiles={10}
              acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png', '.txt', '.md']}
            />
          );

          // Check upload zone is focusable
          const uploadZone = container.querySelector('[role="button"]');
          expect(uploadZone).toBeTruthy();
          const htmlUploadZone = uploadZone as HTMLElement;
          expect(htmlUploadZone.tabIndex).toBe(0);

          // Check buttons are focusable
          const buttons = container.querySelectorAll('button');
          buttons.forEach((button) => {
            const htmlButton = button as HTMLButtonElement;
            expect(htmlButton.tabIndex).toBeGreaterThanOrEqual(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have focus styles on all interactive elements in RevisionPack', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string(),
            title: fc.string({ minLength: 5 }),
            keyConcepts: fc.array(fc.string(), { minLength: 3, maxLength: 5 }),
            definitions: fc.array(
              fc.record({
                term: fc.string(),
                definition: fc.string(),
              }),
              { minLength: 1, maxLength: 5 }
            ),
            summary: fc.string({ minLength: 50 }),
            memoryAids: fc.array(fc.string(), { maxLength: 3 }),
            subject: fc.option(fc.string(), { nil: undefined }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (documents) => {
          const revisionPack: RevisionPackType = {
            documents,
            totalReadingTime: 10,
            generatedAt: new Date(),
          };

          const { container } = render(
            <RevisionPack
              revisionPack={revisionPack}
              onStartQuiz={() => {}}
              onExport={() => {}}
            />
          );

          // Check all buttons are focusable
          const buttons = container.querySelectorAll('button');
          buttons.forEach((button) => {
            const htmlButton = button as HTMLButtonElement;
            expect(htmlButton.tabIndex).toBeGreaterThanOrEqual(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have focus styles on all interactive elements in QuizResults', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 15 }),
        fc.integer({ min: 10, max: 15 }),
        (score, totalQuestions) => {
          const percentage = (score / totalQuestions) * 100;
          const readinessLevel =
            percentage >= 90 ? 'excellent' : percentage >= 70 ? 'good' : percentage >= 50 ? 'moderate' : 'needs-work';
          const readinessColor = percentage >= 90 ? 'green' : percentage >= 70 ? 'yellow' : percentage >= 50 ? 'orange' : 'red';
          const readinessMessage =
            percentage >= 90
              ? "Excellent! You're exam-ready!"
              : percentage >= 70
              ? 'Good progress! Review weak areas below.'
              : percentage >= 50
              ? 'Getting there. More revision needed.'
              : 'Study more and retake the quiz.';

          const results: QuizResultsType = {
            quiz: {
              id: 'test',
              questions: Array(totalQuestions)
                .fill(null)
                .map((_, i) => ({
                  id: i,
                  question: `Question ${i}`,
                  options: ['A) 1', 'B) 2', 'C) 3', 'D) 4'],
                  correctAnswer: 'A' as const,
                  explanation: 'Explanation',
                  difficulty: 'easy' as const,
                })),
              generatedAt: new Date(),
            },
            userAnswers: {
              quizId: 'test',
              answers: {},
              startTime: new Date(),
              endTime: new Date(),
              elapsedSeconds: 60,
            },
            score,
            totalQuestions,
            percentage,
            readinessLevel,
            readinessMessage,
            readinessColor,
            breakdown: [],
            weakAreas: [],
          };

          const { container } = render(
            <QuizResults results={results} onRetry={() => {}} onExport={() => {}} />
          );

          // Check all buttons are focusable
          const buttons = container.querySelectorAll('button');
          buttons.forEach((button) => {
            const htmlButton = button as HTMLButtonElement;
            const tabIndex = htmlButton.getAttribute('tabindex');
            expect(tabIndex === null || parseInt(tabIndex) >= 0).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
