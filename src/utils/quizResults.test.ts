// Property-based tests for quiz results utilities
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { calculateQuizResults, determineReadinessLevel, identifyWeakAreas } from './quizResults';
import type { Quiz, UserAnswers, AnswerOption, Question, QuestionBreakdown } from '../types';

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

describe('Quiz Results - Property Tests', () => {
  it('Property 20: Score calculation correctness', () => {
    // **Feature: cramcraft, Property 20: Score calculation correctness**
    // **Validates: Requirements 6.1**
    fc.assert(
      fc.property(quizArb, (quiz) => {
        // Generate random answers for the quiz
        const answers: Record<number, AnswerOption> = {};
        let expectedCorrectCount = 0;

        quiz.questions.forEach((q) => {
          // Randomly decide if answer is correct or not
          const isCorrect = Math.random() > 0.5;
          const answer = isCorrect ? q.correctAnswer : getWrongAnswer(q.correctAnswer);
          answers[q.id] = answer;
          if (isCorrect) {
            expectedCorrectCount++;
          }
        });

        const userAnswers: UserAnswers = {
          quizId: quiz.id,
          answers,
          startTime: new Date(),
          endTime: new Date(),
          elapsedSeconds: 60,
        };

        const results = calculateQuizResults(quiz, userAnswers);

        // Verify score calculation
        const expectedPercentage = (expectedCorrectCount / quiz.questions.length) * 100;
        
        expect(results.score).toBe(expectedCorrectCount);
        expect(results.totalQuestions).toBe(quiz.questions.length);
        expect(results.percentage).toBeCloseTo(expectedPercentage, 2);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 21: Readiness assessment mapping', () => {
    // **Feature: cramcraft, Property 21: Readiness assessment mapping**
    // **Validates: Requirements 6.2, 6.3, 6.4, 6.5**
    fc.assert(
      fc.property(fc.float({ min: 0, max: 100 }), (percentage) => {
        const readiness = determineReadinessLevel(percentage);

        if (percentage >= 90 && percentage <= 100) {
          expect(readiness.level).toBe('excellent');
          expect(readiness.color).toBe('green');
          expect(readiness.message).toBe("Excellent! You're exam-ready!");
        } else if (percentage >= 70 && percentage < 90) {
          expect(readiness.level).toBe('good');
          expect(readiness.color).toBe('yellow');
          expect(readiness.message).toBe('Good progress! Review weak areas below.');
        } else if (percentage >= 50 && percentage < 70) {
          expect(readiness.level).toBe('moderate');
          expect(readiness.color).toBe('orange');
          expect(readiness.message).toBe('Getting there. More revision needed.');
        } else {
          expect(readiness.level).toBe('needs-work');
          expect(readiness.color).toBe('red');
          expect(readiness.message).toBe('Study more and retake the quiz.');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property 24: Weak areas identification', () => {
    // **Feature: cramcraft, Property 24: Weak areas identification**
    // **Validates: Requirements 6.9**
    fc.assert(
      fc.property(
        fc.array(questionArb, { minLength: 5, maxLength: 15 }),
        fc.array(fc.boolean(), { minLength: 5, maxLength: 15 }),
        (questions, correctnessArray) => {
          // Ensure arrays are same length
          const minLength = Math.min(questions.length, correctnessArray.length);
          const trimmedQuestions = questions.slice(0, minLength);
          const trimmedCorrectness = correctnessArray.slice(0, minLength);

          // Create breakdown
          const breakdown: QuestionBreakdown[] = trimmedQuestions.map((q, idx) => ({
            question: q,
            userAnswer: trimmedCorrectness[idx] ? q.correctAnswer : getWrongAnswer(q.correctAnswer),
            isCorrect: trimmedCorrectness[idx],
          }));

          const weakAreas = identifyWeakAreas(breakdown);

          // Get expected weak areas (topics from incorrect answers)
          const expectedTopics = trimmedQuestions
            .filter((_, idx) => !trimmedCorrectness[idx])
            .map((q) => q.topic)
            .filter((topic): topic is string => topic !== undefined && topic.trim().length > 0);

          const uniqueExpectedTopics = Array.from(new Set(expectedTopics));

          // Weak areas should match topics from incorrect questions
          expect(weakAreas.length).toBe(uniqueExpectedTopics.length);
          uniqueExpectedTopics.forEach((topic) => {
            expect(weakAreas).toContain(topic);
          });
        }
      ),
      { numRuns: 100 }
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
