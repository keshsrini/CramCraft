import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizInterface } from './QuizInterface';
import type { Quiz } from '../types';
import fc from 'fast-check';

// Helper to create a mock quiz
const createMockQuiz = (numQuestions: number): Quiz => {
  return {
    id: 'test-quiz-' + Math.random(),
    questions: Array.from({ length: numQuestions }, (_, i) => ({
      id: i + 1,
      question: `Question ${i + 1}?`,
      options: [
        `A) Option A for question ${i + 1}`,
        `B) Option B for question ${i + 1}`,
        `C) Option C for question ${i + 1}`,
        `D) Option D for question ${i + 1}`,
      ],
      correctAnswer: 'A' as const,
      explanation: `Explanation for question ${i + 1}`,
      difficulty: 'medium' as const,
      topic: `Topic ${i + 1}`,
    })),
    generatedAt: new Date(),
  };
};

describe('QuizInterface Component', () => {
  describe('Property 14: Single question display', () => {
    it('should display exactly one question at a time for any quiz', () => {
      // **Feature: cramcraft, Property 14: Single question display**
      // **Validates: Requirements 5.1**
      
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 15 }), // Number of questions
          (numQuestions) => {
            const quiz = createMockQuiz(numQuestions);
            const mockOnComplete = vi.fn();

            const { container, unmount } = render(
              <QuizInterface quiz={quiz} onQuizComplete={mockOnComplete} />
            );

            try {
              // Should display exactly one question text
              const questionElement = screen.getByTestId('question-text');
              expect(questionElement).toBeInTheDocument();

              // The displayed question should be the first question
              expect(questionElement).toHaveTextContent(quiz.questions[0].question);

              // Should display exactly 4 answer options (A, B, C, D)
              const optionA = screen.getByTestId('option-A');
              const optionB = screen.getByTestId('option-B');
              const optionC = screen.getByTestId('option-C');
              const optionD = screen.getByTestId('option-D');

              expect(optionA).toBeInTheDocument();
              expect(optionB).toBeInTheDocument();
              expect(optionC).toBeInTheDocument();
              expect(optionD).toBeInTheDocument();

              // Should not display other questions
              for (let i = 1; i < quiz.questions.length; i++) {
                expect(container).not.toHaveTextContent(quiz.questions[i].question);
              }
            } finally {
              // Clean up after each iteration
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 19: Timer visibility', () => {
    it('should display a timer showing elapsed time for any active quiz', () => {
      // **Feature: cramcraft, Property 19: Timer visibility**
      // **Validates: Requirements 5.7**
      
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 15 }), // Number of questions
          (numQuestions) => {
            const quiz = createMockQuiz(numQuestions);
            const mockOnComplete = vi.fn();

            const { unmount } = render(
              <QuizInterface quiz={quiz} onQuizComplete={mockOnComplete} />
            );

            try {
              // Should display a timer element
              const timer = screen.getByTestId('quiz-timer');
              expect(timer).toBeInTheDocument();

              // Timer should display time in format MM:SS
              const timerText = timer.textContent;
              expect(timerText).toMatch(/⏱️\s*\d+:\d{2}/);

              // Timer should have aria-label for accessibility
              expect(timer).toHaveAttribute('aria-label');
              expect(timer.getAttribute('aria-label')).toMatch(/Elapsed time:/);

              // Timer should have aria-live for screen readers
              expect(timer).toHaveAttribute('aria-live', 'polite');
            } finally {
              // Clean up after each iteration
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 15: Progress indicator accuracy', () => {
    it('should show correct current question number and total for any quiz state', { timeout: 15000 }, () => {
      // **Feature: cramcraft, Property 15: Progress indicator accuracy**
      // **Validates: Requirements 5.2**
      
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 15 }), // Number of questions
          (numQuestions) => {
            const quiz = createMockQuiz(numQuestions);
            const mockOnComplete = vi.fn();

            const { unmount } = render(
              <QuizInterface quiz={quiz} onQuizComplete={mockOnComplete} />
            );

            try {
              // Should display progress text with current question and total
              const progressText = screen.getByTestId('progress-text');
              expect(progressText).toBeInTheDocument();
              expect(progressText).toHaveTextContent(`Question 1 of ${numQuestions}`);

              // Should display progress bar
              const progressBar = screen.getByRole('progressbar');
              expect(progressBar).toBeInTheDocument();

              // Progress bar should have correct aria attributes
              expect(progressBar).toHaveAttribute('aria-valuenow');
              expect(progressBar).toHaveAttribute('aria-valuemin', '0');
              expect(progressBar).toHaveAttribute('aria-valuemax', '100');

              // Progress should be calculated correctly (first question)
              const expectedProgress = (1 / numQuestions) * 100;
              const actualProgress = parseFloat(progressBar.getAttribute('aria-valuenow') || '0');
              expect(actualProgress).toBeCloseTo(expectedProgress, 1);

              // Progress bar should have aria-label
              expect(progressBar).toHaveAttribute('aria-label');
              expect(progressBar.getAttribute('aria-label')).toMatch(/Quiz progress:/);
            } finally {
              // Clean up after each iteration
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 16: Answer selection UI presence', () => {
    it('should provide radio buttons for answer selection for any question', { timeout: 15000 }, () => {
      // **Feature: cramcraft, Property 16: Answer selection UI presence**
      // **Validates: Requirements 5.3**
      
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 15 }), // Number of questions
          (numQuestions) => {
            const quiz = createMockQuiz(numQuestions);
            const mockOnComplete = vi.fn();

            const { unmount } = render(
              <QuizInterface quiz={quiz} onQuizComplete={mockOnComplete} />
            );

            try {
              // Should have a radiogroup for answer options
              const radioGroup = screen.getByRole('radiogroup');
              expect(radioGroup).toBeInTheDocument();
              expect(radioGroup).toHaveAttribute('aria-label', 'Answer options');

              // Should have exactly 4 radio buttons (A, B, C, D)
              const radioButtons = screen.getAllByRole('radio');
              expect(radioButtons).toHaveLength(4);

              // Each radio button should have the correct value
              const values = radioButtons.map((rb) => rb.getAttribute('value'));
              expect(values).toEqual(['A', 'B', 'C', 'D']);

              // Each radio button should have an aria-label
              radioButtons.forEach((rb) => {
                expect(rb).toHaveAttribute('aria-label');
              });

              // All radio buttons should have the same name for grouping
              radioButtons.forEach((rb) => {
                expect(rb).toHaveAttribute('name', 'answer');
              });

              // Initially, no radio button should be checked
              radioButtons.forEach((rb) => {
                expect(rb).not.toBeChecked();
              });
            } finally {
              // Clean up after each iteration
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 17: Next button state management', () => {
    it('should disable Next button when no answer selected and enable when answer selected', { timeout: 15000 }, async () => {
      // **Feature: cramcraft, Property 17: Next button state management**
      // **Validates: Requirements 5.4, 5.5**
      
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 10, max: 15 }), // Number of questions
          fc.constantFrom('A', 'B', 'C', 'D'), // Selected answer
          async (numQuestions, selectedAnswer) => {
            const quiz = createMockQuiz(numQuestions);
            const mockOnComplete = vi.fn();
            const user = userEvent.setup();

            const { unmount } = render(
              <QuizInterface quiz={quiz} onQuizComplete={mockOnComplete} />
            );

            try {
              // Initially, Next button should be disabled (no answer selected)
              const nextButton = screen.getByTestId('next-button');
              expect(nextButton).toBeDisabled();

              // Select an answer
              const radioButton = screen.getByRole('radio', { name: new RegExp(`${selectedAnswer}\\)`) });
              await user.click(radioButton);

              // After selecting an answer, Next button should be enabled
              expect(nextButton).toBeEnabled();
            } finally {
              // Clean up after each iteration
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 18: Final question button swap', () => {
    it('should display Submit button instead of Next button on the last question', { timeout: 10000 }, async () => {
      // **Feature: cramcraft, Property 18: Final question button swap**
      // **Validates: Requirements 5.6**
      
      await fc.assert(
        fc.asyncProperty(
          fc.constant(10), // Use minimum questions for faster test
          async (numQuestions) => {
            const quiz = createMockQuiz(numQuestions);
            const mockOnComplete = vi.fn();
            const user = userEvent.setup();

            const { unmount } = render(
              <QuizInterface quiz={quiz} onQuizComplete={mockOnComplete} />
            );

            try {
              // Navigate to the last question by answering all previous questions
              for (let i = 0; i < numQuestions - 1; i++) {
                // Select answer A
                const radioButton = screen.getByRole('radio', { name: /A\)/ });
                await user.click(radioButton);

                // Click Next button
                const nextButton = screen.getByTestId('next-button');
                await user.click(nextButton);
              }

              // Now we should be on the last question
              // Verify we're on the last question
              const progressText = screen.getByTestId('progress-text');
              expect(progressText).toHaveTextContent(`Question ${numQuestions} of ${numQuestions}`);

              // Next button should not exist
              expect(screen.queryByTestId('next-button')).not.toBeInTheDocument();

              // Submit button should exist
              const submitButton = screen.getByTestId('submit-button');
              expect(submitButton).toBeInTheDocument();
              expect(submitButton).toHaveTextContent(/Submit Quiz/i);
            } finally {
              // Clean up after each iteration
              unmount();
            }
          }
        ),
        { numRuns: 5 } // Reduced to 5 runs due to expensive navigation (each run ~1.5s)
      );
    });
  });
});
