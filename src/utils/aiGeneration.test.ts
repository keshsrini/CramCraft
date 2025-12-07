// Property-based tests for AI generation utilities
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { generateRevisionSummary, generateQuiz, aggregateRevisionPack } from './aiGeneration';
import type { ExtractedText, DocumentSummary, Quiz, RevisionPack } from '../types';
import { SUMMARY_CONSTRAINTS, QUIZ_CONSTRAINTS } from '../types';
import * as claudeApi from './claudeApi';

// ============================================================================
// Mock Setup
// ============================================================================

// Mock the Claude API client
vi.mock('./claudeApi', () => {
  class ClaudeAPIError extends Error {
    statusCode?: number;
    errorType?: string;
    retryable: boolean;

    constructor(
      message: string,
      statusCode?: number,
      errorType?: string,
      retryable: boolean = false
    ) {
      super(message);
      this.name = 'ClaudeAPIError';
      this.statusCode = statusCode;
      this.errorType = errorType;
      this.retryable = retryable;
    }
  }

  return {
    claudeApiClient: {
      sendMessage: vi.fn(),
    },
    ClaudeAPIError,
  };
});

// ============================================================================
// Test Helpers
// ============================================================================



function createMockSummaryResponse(overrides?: Partial<any>): string {
  const response = {
    title: 'Mathematics Basics',
    keyConcepts: ['Concept 1', 'Concept 2', 'Concept 3'],
    definitions: [
      { term: 'Algebra', definition: 'Branch of mathematics' },
      { term: 'Variable', definition: 'A symbol representing a number' },
    ],
    summary: 'This is paragraph one.\n\nThis is paragraph two.',
    memoryAids: ['Remember PEMDAS', 'Use the quadratic formula'],
    ...overrides,
  };
  return JSON.stringify(response);
}

function createMockQuizResponse(questionCount: number = 12): string {
  // Create questions with proper difficulty distribution (40% easy, 40% medium, 20% hard)
  const easyCount = Math.round(questionCount * 0.4);
  const mediumCount = Math.round(questionCount * 0.4);

  const questions = Array.from({ length: questionCount }, (_, i) => {
    let difficulty: 'easy' | 'medium' | 'hard';
    if (i < easyCount) {
      difficulty = 'easy';
    } else if (i < easyCount + mediumCount) {
      difficulty = 'medium';
    } else {
      difficulty = 'hard';
    }

    return {
      id: i + 1,
      question: `Question ${i + 1}?`,
      options: ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'],
      correctAnswer: ['A', 'B', 'C', 'D'][i % 4] as 'A' | 'B' | 'C' | 'D',
      explanation: `Explanation for question ${i + 1}`,
      difficulty,
      topic: 'Test Topic',
    };
  });

  return JSON.stringify({ questions });
}

// ============================================================================
// Property Tests
// ============================================================================

describe('AI Generation - Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Property 9: Summary structure completeness', () => {
    /**
     * **Feature: cramcraft, Property 9: Summary structure completeness**
     * **Validates: Requirements 3.2, 3.3, 3.4, 3.5**
     *
     * For any generated revision summary, it should contain:
     * - 3-5 key concepts
     * - At least one definition
     * - A summary with 2-3 paragraphs
     * - A memoryAids field (which may be empty)
     */
    it('should generate summaries with complete structure for any valid input', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            fileId: fc.string({ minLength: 1 }),
            fileName: fc.string({ minLength: 1 }),
            content: fc.string({ minLength: 50 }),
            wordCount: fc.integer({ min: 10, max: 10000 }),
          }),
          async (textData) => {
            const extractedText: ExtractedText = {
              ...textData,
              extractionMethod: 'pdf-parser',
            };

            // Mock the API response with valid structure
            const mockResponse = createMockSummaryResponse();
            vi.mocked(claudeApi.claudeApiClient.sendMessage).mockResolvedValue(mockResponse);

            const summary: DocumentSummary = await generateRevisionSummary(extractedText);

            // Validate key concepts: 3-5 items
            expect(summary.keyConcepts).toBeInstanceOf(Array);
            expect(summary.keyConcepts.length).toBeGreaterThanOrEqual(
              SUMMARY_CONSTRAINTS.MIN_KEY_CONCEPTS
            );
            expect(summary.keyConcepts.length).toBeLessThanOrEqual(
              SUMMARY_CONSTRAINTS.MAX_KEY_CONCEPTS
            );

            // Validate definitions: at least 1 item
            expect(summary.definitions).toBeInstanceOf(Array);
            expect(summary.definitions.length).toBeGreaterThanOrEqual(
              SUMMARY_CONSTRAINTS.MIN_DEFINITIONS
            );
            summary.definitions.forEach((def) => {
              expect(def).toHaveProperty('term');
              expect(def).toHaveProperty('definition');
              expect(typeof def.term).toBe('string');
              expect(typeof def.definition).toBe('string');
            });

            // Validate summary: 2-3 paragraphs
            expect(typeof summary.summary).toBe('string');
            const paragraphs = summary.summary.split('\n\n').filter((p) => p.trim().length > 0);
            expect(paragraphs.length).toBeGreaterThanOrEqual(
              SUMMARY_CONSTRAINTS.MIN_SUMMARY_PARAGRAPHS
            );
            expect(paragraphs.length).toBeLessThanOrEqual(
              SUMMARY_CONSTRAINTS.MAX_SUMMARY_PARAGRAPHS
            );

            // Validate memoryAids field exists (can be empty)
            expect(summary).toHaveProperty('memoryAids');
            expect(Array.isArray(summary.memoryAids)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10: Revision pack aggregation', () => {
    /**
     * **Feature: cramcraft, Property 10: Revision pack aggregation**
     * **Validates: Requirements 3.6**
     *
     * For any set of document summaries, the revision pack should contain
     * all summaries organized by document in the same order.
     */
    it('should aggregate summaries in the same order as input documents', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              fileId: fc.string({ minLength: 1 }),
              fileName: fc.string({ minLength: 1 }),
              content: fc.string({ minLength: 50 }),
              wordCount: fc.integer({ min: 10, max: 1000 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          async (textsData) => {
            const extractedTexts: ExtractedText[] = textsData.map((data) => ({
              ...data,
              extractionMethod: 'pdf-parser' as const,
            }));

            // Mock the API response for each document
            vi.mocked(claudeApi.claudeApiClient.sendMessage).mockResolvedValue(
              createMockSummaryResponse()
            );

            const revisionPack: RevisionPack = await aggregateRevisionPack(extractedTexts);

            // Validate that all documents are present
            expect(revisionPack.documents).toBeInstanceOf(Array);
            expect(revisionPack.documents.length).toBe(extractedTexts.length);

            // Validate that documents are in the same order
            revisionPack.documents.forEach((doc, index) => {
              expect(doc.id).toBe(extractedTexts[index].fileId);
            });

            // Validate that totalReadingTime is calculated
            expect(typeof revisionPack.totalReadingTime).toBe('number');
            expect(revisionPack.totalReadingTime).toBeGreaterThan(0);

            // Validate that generatedAt is set
            expect(revisionPack.generatedAt).toBeInstanceOf(Date);

            // Validate that all documents have subjects
            revisionPack.documents.forEach((doc) => {
              expect(doc).toHaveProperty('subject');
              expect(typeof doc.subject).toBe('string');
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 11: Quiz length constraint', () => {
    /**
     * **Feature: cramcraft, Property 11: Quiz length constraint**
     * **Validates: Requirements 4.1**
     *
     * For any generated quiz, the number of questions should be
     * between 10 and 15 inclusive.
     */
    it('should generate quizzes with 10-15 questions for any valid input', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              fileId: fc.string({ minLength: 1 }),
              fileName: fc.string({ minLength: 1 }),
              content: fc.string({ minLength: 100 }),
              wordCount: fc.integer({ min: 20, max: 5000 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          fc.integer({ min: 10, max: 15 }),
          async (textsData, questionCount) => {
            const extractedTexts: ExtractedText[] = textsData.map((data) => ({
              ...data,
              extractionMethod: 'pdf-parser' as const,
            }));

            // Mock the API response with the specified number of questions
            const mockResponse = createMockQuizResponse(questionCount);
            vi.mocked(claudeApi.claudeApiClient.sendMessage).mockResolvedValue(mockResponse);

            const quiz: Quiz = await generateQuiz(extractedTexts);

            // Validate quiz length constraint
            expect(quiz.questions).toBeInstanceOf(Array);
            expect(quiz.questions.length).toBeGreaterThanOrEqual(QUIZ_CONSTRAINTS.MIN_QUESTIONS);
            expect(quiz.questions.length).toBeLessThanOrEqual(QUIZ_CONSTRAINTS.MAX_QUESTIONS);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 12: Question structure validity', () => {
    /**
     * **Feature: cramcraft, Property 12: Question structure validity**
     * **Validates: Requirements 4.2, 4.3**
     *
     * For any question in a generated quiz, it should have:
     * - Exactly 4 options
     * - A correctAnswer that is one of A/B/C/D
     * - A non-empty explanation
     */
    it('should generate questions with valid structure for any quiz', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              fileId: fc.string({ minLength: 1 }),
              fileName: fc.string({ minLength: 1 }),
              content: fc.string({ minLength: 100 }),
              wordCount: fc.integer({ min: 20, max: 5000 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          fc.integer({ min: 10, max: 15 }),
          async (textsData, questionCount) => {
            const extractedTexts: ExtractedText[] = textsData.map((data) => ({
              ...data,
              extractionMethod: 'pdf-parser' as const,
            }));

            // Mock the API response
            const mockResponse = createMockQuizResponse(questionCount);
            vi.mocked(claudeApi.claudeApiClient.sendMessage).mockResolvedValue(mockResponse);

            const quiz: Quiz = await generateQuiz(extractedTexts);

            // Validate each question structure
            quiz.questions.forEach((question) => {
              // Validate exactly 4 options
              expect(question.options).toBeInstanceOf(Array);
              expect(question.options.length).toBe(QUIZ_CONSTRAINTS.OPTIONS_PER_QUESTION);

              // Validate correctAnswer is A, B, C, or D
              expect(['A', 'B', 'C', 'D']).toContain(question.correctAnswer);

              // Validate non-empty explanation
              expect(typeof question.explanation).toBe('string');
              expect(question.explanation.length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 13: Difficulty distribution', () => {
    /**
     * **Feature: cramcraft, Property 13: Difficulty distribution**
     * **Validates: Requirements 4.4**
     *
     * For any generated quiz with 10+ questions, the distribution of
     * difficulty levels should be approximately 40% easy, 40% medium,
     * and 20% hard (within ±10% tolerance).
     */
    it('should distribute difficulty levels appropriately for any quiz', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc
            .array(
              fc.record({
                fileId: fc.string({ minLength: 1 }),
                fileName: fc.string({ minLength: 1 }),
                content: fc.string({ minLength: 100 }),
                wordCount: fc.integer({ min: 20, max: 5000 }),
              }),
              { minLength: 1, maxLength: 5 }
            )
            .filter((texts) => {
              // Filter out cases where all content is empty/whitespace
              return texts.some((text) => text.content.trim().length > 0);
            }),
          fc.integer({ min: 10, max: 15 }),
          async (textsData, questionCount) => {
            const extractedTexts: ExtractedText[] = textsData.map((data) => ({
              ...data,
              extractionMethod: 'pdf-parser' as const,
            }));

            // Mock the API response with proper difficulty distribution
            const mockResponse = createMockQuizResponse(questionCount);
            vi.mocked(claudeApi.claudeApiClient.sendMessage).mockResolvedValue(mockResponse);

            const quiz: Quiz = await generateQuiz(extractedTexts);

            // Count difficulty levels
            const difficultyCounts = {
              easy: 0,
              medium: 0,
              hard: 0,
            };

            quiz.questions.forEach((question) => {
              difficultyCounts[question.difficulty]++;
            });

            const total = quiz.questions.length;

            // Calculate percentages
            const easyPercentage = (difficultyCounts.easy / total) * 100;
            const mediumPercentage = (difficultyCounts.medium / total) * 100;
            const hardPercentage = (difficultyCounts.hard / total) * 100;

            // Validate distribution (40% easy, 40% medium, 20% hard with ±10% tolerance)
            const tolerance = 10;

            expect(easyPercentage).toBeGreaterThanOrEqual(
              QUIZ_CONSTRAINTS.DIFFICULTY_DISTRIBUTION.easy * 100 - tolerance
            );
            expect(easyPercentage).toBeLessThanOrEqual(
              QUIZ_CONSTRAINTS.DIFFICULTY_DISTRIBUTION.easy * 100 + tolerance
            );

            expect(mediumPercentage).toBeGreaterThanOrEqual(
              QUIZ_CONSTRAINTS.DIFFICULTY_DISTRIBUTION.medium * 100 - tolerance
            );
            expect(mediumPercentage).toBeLessThanOrEqual(
              QUIZ_CONSTRAINTS.DIFFICULTY_DISTRIBUTION.medium * 100 + tolerance
            );

            expect(hardPercentage).toBeGreaterThanOrEqual(
              QUIZ_CONSTRAINTS.DIFFICULTY_DISTRIBUTION.hard * 100 - tolerance
            );
            expect(hardPercentage).toBeLessThanOrEqual(
              QUIZ_CONSTRAINTS.DIFFICULTY_DISTRIBUTION.hard * 100 + tolerance
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
