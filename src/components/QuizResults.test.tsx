// Property-based tests for QuizResults component
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';
import { QuizResults } from './QuizResults';
import { calculateQuizResults } from '../utils/quizResults';
import type { Quiz, UserAnswers, AnswerOption } from '../types';

// ============================================================================
// Generators
// ============================================================================

const answerOptionArb = fc.constantFrom<AnswerOption>('A', 'B', 'C', 'D');

const questionArb = fc.record({
  id: fc.integer({ min: 1, max: 100 }),
  question: fc.string({ minLength: 10, maxLength: 200 }),
  options: fc.tuple(
    fc.string({ minLength: 5 }),
    fc.string({ minLength: 5 }),
    fc.string({ minLength: 5 }),
    fc.string({ minLength: 5 })
  ).map((opts) => opts.map((o, i) => `${['A', 'B', 'C', 'D'][i]}) ${o}`)),
  correctAnswer: answerOptionArb,
  explanation: fc.string({ minLength: 20, maxLength: 200 }),
  difficulty: fc.constantFrom('easy', 'medium', 'hard') as fc.Arbitrary<'easy' | 'medium' | 'hard'>,
  topic: fc.option(fc.string({ minLength: 3, maxLength: 50 }), { nil: undefined }),
});

const quizArb = fc.record({
  id: fc.string({ minLength: 5 }),
  questions: fc.array(questionArb, { minLength: 10, maxLength: 15 }).map((questions) =>
    // Ensure unique IDs for each question
    questions.map((q, idx) => ({ ...q, id: idx + 1 }))
  ),
  generatedAt: fc.date(),
});

// ============================================================================
// Property Tests
// ============================================================================

describe('QuizResults Component - Property Tests', () => {
  it('Property 22: Results breakdown completeness', () => {
    // **Feature: cramcraft, Property 22: Results breakdown completeness**
    // **Validates: Requirements 6.6, 6.7**
    fc.assert(
      fc.property(quizArb, (quiz) => {
        // Generate random answers
        const answers: Record<number, AnswerOption> = {};
        quiz.questions.forEach((q) => {
          const isCorrect = Math.random() > 0.5;
          answers[q.id] = isCorrect ? q.correctAnswer : getWrongAnswer(q.correctAnswer);
        });

        const userAnswers: UserAnswers = {
          quizId: quiz.id,
          answers,
          startTime: new Date(),
          endTime: new Date(),
          elapsedSeconds: 60,
        };

        const results = calculateQuizResults(quiz, userAnswers);

        const onRetry = vi.fn();
        const onExport = vi.fn();

        const { unmount } = render(<QuizResults results={results} onRetry={onRetry} onExport={onExport} />);

        // Verify breakdown completeness
        // Each question should have a breakdown entry
        expect(results.breakdown.length).toBe(quiz.questions.length);

        // Each breakdown entry should contain:
        // - question
        // - userAnswer
        // - explanation
        results.breakdown.forEach((item, idx) => {
          expect(item.question).toBeDefined();
          expect(item.userAnswer).toBeDefined();
          expect(item.question.explanation).toBeDefined();

          // Verify the breakdown is rendered in the UI
          const breakdownElement = screen.getByTestId(`question-breakdown-${idx}`);
          expect(breakdownElement).toBeInTheDocument();

          // Verify user answer is displayed
          const userAnswerElement = screen.getByTestId(`user-answer-${idx}`);
          expect(userAnswerElement).toBeInTheDocument();
          expect(userAnswerElement.textContent).toBe(item.userAnswer);

          // Verify explanation is present
          expect(breakdownElement.textContent).toContain(item.question.explanation);
        });

        // Clean up after each render
        unmount();
      }),
      { numRuns: 10 }
    );
  });

  it('Property 23: Answer highlighting correctness', () => {
    // **Feature: cramcraft, Property 23: Answer highlighting correctness**
    // **Validates: Requirements 6.8**
    fc.assert(
      fc.property(quizArb, (quiz) => {
        // Generate random answers
        const answers: Record<number, AnswerOption> = {};
        quiz.questions.forEach((q) => {
          const isCorrect = Math.random() > 0.5;
          answers[q.id] = isCorrect ? q.correctAnswer : getWrongAnswer(q.correctAnswer);
        });

        const userAnswers: UserAnswers = {
          quizId: quiz.id,
          answers,
          startTime: new Date(),
          endTime: new Date(),
          elapsedSeconds: 60,
        };

        const results = calculateQuizResults(quiz, userAnswers);

        const onRetry = vi.fn();
        const onExport = vi.fn();

        const { unmount } = render(<QuizResults results={results} onRetry={onRetry} onExport={onExport} />);

        // Verify answer highlighting
        results.breakdown.forEach((item, idx) => {
          const userAnswerElement = screen.getByTestId(`user-answer-${idx}`);

          if (item.isCorrect) {
            // Correct answers should have green styling
            expect(userAnswerElement.className).toContain('text-green-700');
          } else {
            // Incorrect answers should have red styling
            expect(userAnswerElement.className).toContain('text-red-700');

            // Correct answer should also be displayed for incorrect responses
            const correctAnswerElement = screen.getByTestId(`correct-answer-${idx}`);
            expect(correctAnswerElement).toBeInTheDocument();
            expect(correctAnswerElement.className).toContain('text-green-700');
          }
        });

        // Clean up after each render
        unmount();
      }),
      { numRuns: 10 }
    );
  });

  it('Property 25: Retry functionality presence', () => {
    // **Feature: cramcraft, Property 25: Retry functionality presence**
    // **Validates: Requirements 6.10**
    fc.assert(
      fc.property(quizArb, (quiz) => {
        // Generate random answers
        const answers: Record<number, AnswerOption> = {};
        quiz.questions.forEach((q) => {
          answers[q.id] = q.correctAnswer;
        });

        const userAnswers: UserAnswers = {
          quizId: quiz.id,
          answers,
          startTime: new Date(),
          endTime: new Date(),
          elapsedSeconds: 60,
        };

        const results = calculateQuizResults(quiz, userAnswers);

        const onRetry = vi.fn();
        const onExport = vi.fn();

        const { unmount } = render(<QuizResults results={results} onRetry={onRetry} onExport={onExport} />);

        // Verify retry button is present
        const retryButton = screen.getByTestId('retry-button');
        expect(retryButton).toBeInTheDocument();
        expect(retryButton).toHaveAttribute('aria-label', 'Retry quiz');

        // Clean up after each render
        unmount();
      }),
      { numRuns: 10 }
    );
  });
});

// ============================================================================
// Helper Functions
// ============================================================================

function getWrongAnswer(correctAnswer: AnswerOption): AnswerOption {
  const options: AnswerOption[] = ['A', 'B', 'C', 'D'];
  const wrongOptions = options.filter((opt) => opt !== correctAnswer);
  return wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
}
