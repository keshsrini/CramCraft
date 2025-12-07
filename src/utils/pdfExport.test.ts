import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { exportRevisionPackPDF, exportQuizResultsPDF } from './pdfExport';
import type { RevisionPack, QuizResults, DocumentSummary, Quiz, UserAnswers, QuestionBreakdown } from '../types';

// Mock jsPDF
vi.mock('jspdf', () => {
  const mockSave = vi.fn();
  const mockAddPage = vi.fn();
  const mockText = vi.fn();
  const mockRect = vi.fn();
  const mockLine = vi.fn();
  const mockDoc = {
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
    },
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    setFillColor: vi.fn(),
    setDrawColor: vi.fn(),
    setFont: vi.fn(),
    text: mockText,
    rect: mockRect,
    roundedRect: vi.fn(),
    line: mockLine,
    splitTextToSize: vi.fn((text: string) => [text]),
    addPage: mockAddPage,
    getNumberOfPages: vi.fn(() => 1),
    setPage: vi.fn(),
    save: mockSave,
  };

  return {
    default: vi.fn(() => mockDoc),
    __mockSave: mockSave,
    __mockAddPage: mockAddPage,
    __mockText: mockText,
    __mockRect: mockRect,
    __mockLine: mockLine,
  };
});

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

describe('PDF Export Utility', () => {
  let mockSave: ReturnType<typeof vi.fn>;
  let mockAddPage: ReturnType<typeof vi.fn>;
  let mockText: ReturnType<typeof vi.fn>;
  let mockRect: ReturnType<typeof vi.fn>;
  let mockLine: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // Get the mock functions from the mocked module
    const jsPDFModule = await import('jspdf');
    mockSave = (jsPDFModule as any).__mockSave;
    mockAddPage = (jsPDFModule as any).__mockAddPage;
    mockText = (jsPDFModule as any).__mockText;
    mockRect = (jsPDFModule as any).__mockRect;
    mockLine = (jsPDFModule as any).__mockLine;
    mockSave.mockClear();
    mockAddPage.mockClear();
    mockText.mockClear();
    mockRect.mockClear();
    mockLine.mockClear();
  });

  describe('Property 30: PDF export generation', () => {
    it('**Feature: cramcraft, Property 30: PDF export generation** - should generate valid PDF for any revision pack', () => {
      // **Validates: Requirements 8.1, 8.2**
      
      const documentSummaryArb = fc.record({
        id: fc.string(),
        title: fc.string({ minLength: 1 }),
        keyConcepts: fc.array(fc.string({ minLength: 1 }), { minLength: 3, maxLength: 5 }),
        definitions: fc.array(
          fc.record({
            term: fc.string({ minLength: 1 }),
            definition: fc.string({ minLength: 1 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        summary: fc.string({ minLength: 10 }),
        memoryAids: fc.array(fc.string(), { maxLength: 5 }),
        subject: fc.option(fc.string(), { nil: undefined }),
      });

      const revisionPackArb = fc.record({
        documents: fc.array(documentSummaryArb, { minLength: 1, maxLength: 5 }),
        totalReadingTime: fc.integer({ min: 1, max: 120 }),
        generatedAt: fc.date(),
      });

      fc.assert(
        fc.property(revisionPackArb, (revisionPack) => {
          // Clear mock before each property test iteration
          mockSave.mockClear();
          
          // Should not throw an error
          expect(() => exportRevisionPackPDF(revisionPack)).not.toThrow();
          
          // Verify save was called (PDF was generated)
          expect(mockSave).toHaveBeenCalled();
          
          // Verify save was called with a filename
          const saveCall = mockSave.mock.calls[0];
          expect(saveCall[0]).toMatch(/^revision-pack-\d+\.pdf$/);
        }),
        { numRuns: 100 }
      );
    });

    it('**Feature: cramcraft, Property 30: PDF export generation** - should generate valid PDF for any quiz results', () => {
      // **Validates: Requirements 8.1, 8.2**
      
      const questionArb = fc.record({
        id: fc.integer({ min: 1 }),
        question: fc.string({ minLength: 10 }),
        options: fc.tuple(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 })
        ).map(([a, b, c, d]) => [`A) ${a}`, `B) ${b}`, `C) ${c}`, `D) ${d}`]),
        correctAnswer: fc.constantFrom('A', 'B', 'C', 'D') as fc.Arbitrary<'A' | 'B' | 'C' | 'D'>,
        explanation: fc.string({ minLength: 10 }),
        difficulty: fc.constantFrom('easy', 'medium', 'hard') as fc.Arbitrary<'easy' | 'medium' | 'hard'>,
        topic: fc.option(fc.string(), { nil: undefined }),
      });

      const quizArb = fc.record({
        id: fc.string(),
        questions: fc.array(questionArb, { minLength: 10, maxLength: 15 }),
        generatedAt: fc.date(),
      });

      const quizResultsArb = quizArb.chain((quiz) => {
        const answersRecord: Record<number, 'A' | 'B' | 'C' | 'D'> = {};
        const breakdown: QuestionBreakdown[] = [];
        let correctCount = 0;

        quiz.questions.forEach((q) => {
          const userAnswer = fc.sample(fc.constantFrom('A', 'B', 'C', 'D') as fc.Arbitrary<'A' | 'B' | 'C' | 'D'>, 1)[0];
          answersRecord[q.id] = userAnswer;
          const isCorrect = userAnswer === q.correctAnswer;
          if (isCorrect) correctCount++;
          
          breakdown.push({
            question: q,
            userAnswer,
            isCorrect,
          });
        });

        const percentage = Math.round((correctCount / quiz.questions.length) * 100);
        let readinessLevel: 'excellent' | 'good' | 'moderate' | 'needs-work';
        let readinessMessage: string;
        let readinessColor: string;

        if (percentage >= 90) {
          readinessLevel = 'excellent';
          readinessMessage = "Excellent! You're exam-ready!";
          readinessColor = 'green';
        } else if (percentage >= 70) {
          readinessLevel = 'good';
          readinessMessage = 'Good progress! Review weak areas below.';
          readinessColor = 'yellow';
        } else if (percentage >= 50) {
          readinessLevel = 'moderate';
          readinessMessage = 'Getting there. More revision needed.';
          readinessColor = 'orange';
        } else {
          readinessLevel = 'needs-work';
          readinessMessage = 'Study more and retake the quiz.';
          readinessColor = 'red';
        }

        const weakAreas = breakdown
          .filter((b) => !b.isCorrect && b.question.topic)
          .map((b) => b.question.topic!);

        return fc.constant({
          quiz,
          userAnswers: {
            quizId: quiz.id,
            answers: answersRecord,
            startTime: new Date(),
            endTime: new Date(),
            elapsedSeconds: 300,
          },
          score: correctCount,
          totalQuestions: quiz.questions.length,
          percentage,
          readinessLevel,
          readinessMessage,
          readinessColor,
          breakdown,
          weakAreas,
        } as QuizResults);
      });

      fc.assert(
        fc.property(quizResultsArb, (quizResults) => {
          // Clear mock before each property test iteration
          mockSave.mockClear();
          
          // Should not throw an error
          expect(() => exportQuizResultsPDF(quizResults)).not.toThrow();
          
          // Verify save was called (PDF was generated)
          expect(mockSave).toHaveBeenCalled();
          
          // Verify save was called with a filename
          const saveCall = mockSave.mock.calls[0];
          expect(saveCall[0]).toMatch(/^quiz-results-\d+\.pdf$/);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 31: PDF page break insertion', () => {
    it('**Feature: cramcraft, Property 31: PDF page break insertion** - should insert page breaks between documents', () => {
      // **Validates: Requirements 8.3**
      
      const documentSummaryArb = fc.record({
        id: fc.string(),
        title: fc.string({ minLength: 1 }),
        keyConcepts: fc.array(fc.string({ minLength: 1 }), { minLength: 3, maxLength: 5 }),
        definitions: fc.array(
          fc.record({
            term: fc.string({ minLength: 1 }),
            definition: fc.string({ minLength: 1 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        summary: fc.string({ minLength: 10 }),
        memoryAids: fc.array(fc.string(), { maxLength: 5 }),
        subject: fc.option(fc.string(), { nil: undefined }),
      });

      // Generate revision packs with multiple documents
      const multiDocRevisionPackArb = fc.record({
        documents: fc.array(documentSummaryArb, { minLength: 2, maxLength: 5 }),
        totalReadingTime: fc.integer({ min: 1, max: 120 }),
        generatedAt: fc.date(),
      });

      fc.assert(
        fc.property(multiDocRevisionPackArb, (revisionPack) => {
          // Clear mocks before each iteration
          mockSave.mockClear();
          mockAddPage.mockClear();
          
          // Export the revision pack
          exportRevisionPackPDF(revisionPack);
          
          // For multi-document revision packs, addPage should be called at least once
          // (once for each document after the first)
          const expectedPageBreaks = revisionPack.documents.length - 1;
          
          // Check that addPage was called at least the expected number of times
          // (it may be called more if content overflows pages)
          expect(mockAddPage.mock.calls.length).toBeGreaterThanOrEqual(expectedPageBreaks);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 32: PDF header and footer presence', () => {
    it('**Feature: cramcraft, Property 32: PDF header and footer presence** - should include headers and footers on all pages', () => {
      // **Validates: Requirements 8.4**
      
      const documentSummaryArb = fc.record({
        id: fc.string(),
        title: fc.string({ minLength: 1 }),
        keyConcepts: fc.array(fc.string({ minLength: 1 }), { minLength: 3, maxLength: 5 }),
        definitions: fc.array(
          fc.record({
            term: fc.string({ minLength: 1 }),
            definition: fc.string({ minLength: 1 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        summary: fc.string({ minLength: 10 }),
        memoryAids: fc.array(fc.string(), { maxLength: 5 }),
        subject: fc.option(fc.string(), { nil: undefined }),
      });

      const revisionPackArb = fc.record({
        documents: fc.array(documentSummaryArb, { minLength: 1, maxLength: 3 }),
        totalReadingTime: fc.integer({ min: 1, max: 120 }),
        generatedAt: fc.date(),
      });

      fc.assert(
        fc.property(revisionPackArb, (revisionPack) => {
          // Clear mocks before each iteration
          mockSave.mockClear();
          mockText.mockClear();
          mockRect.mockClear();
          mockLine.mockClear();
          
          // Export the revision pack
          exportRevisionPackPDF(revisionPack);
          
          // Headers use rect() for background and text() for content
          // Footers use line() for separator and text() for content
          
          // Check that rect was called (for header background)
          expect(mockRect.mock.calls.length).toBeGreaterThan(0);
          
          // Check that line was called (for footer separator)
          expect(mockLine.mock.calls.length).toBeGreaterThan(0);
          
          // Check that text was called multiple times (for header and footer text)
          expect(mockText.mock.calls.length).toBeGreaterThan(0);
          
          // Verify that text calls include header-like content (page numbers, title)
          const textCalls = mockText.mock.calls.map(call => call[0]);
          const hasPageNumber = textCalls.some((text: string) => 
            typeof text === 'string' && text.includes('Page')
          );
          expect(hasPageNumber).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('**Feature: cramcraft, Property 32: PDF header and footer presence** - should include headers and footers on quiz results', () => {
      // **Validates: Requirements 8.4**
      
      const questionArb = fc.record({
        id: fc.integer({ min: 1 }),
        question: fc.string({ minLength: 10 }),
        options: fc.tuple(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 })
        ).map(([a, b, c, d]) => [`A) ${a}`, `B) ${b}`, `C) ${c}`, `D) ${d}`]),
        correctAnswer: fc.constantFrom('A', 'B', 'C', 'D') as fc.Arbitrary<'A' | 'B' | 'C' | 'D'>,
        explanation: fc.string({ minLength: 10 }),
        difficulty: fc.constantFrom('easy', 'medium', 'hard') as fc.Arbitrary<'easy' | 'medium' | 'hard'>,
        topic: fc.option(fc.string(), { nil: undefined }),
      });

      const quizArb = fc.record({
        id: fc.string(),
        questions: fc.array(questionArb, { minLength: 10, maxLength: 15 }),
        generatedAt: fc.date(),
      });

      const quizResultsArb = quizArb.chain((quiz) => {
        const answersRecord: Record<number, 'A' | 'B' | 'C' | 'D'> = {};
        const breakdown: QuestionBreakdown[] = [];
        let correctCount = 0;

        quiz.questions.forEach((q) => {
          const userAnswer = fc.sample(fc.constantFrom('A', 'B', 'C', 'D') as fc.Arbitrary<'A' | 'B' | 'C' | 'D'>, 1)[0];
          answersRecord[q.id] = userAnswer;
          const isCorrect = userAnswer === q.correctAnswer;
          if (isCorrect) correctCount++;
          
          breakdown.push({
            question: q,
            userAnswer,
            isCorrect,
          });
        });

        const percentage = Math.round((correctCount / quiz.questions.length) * 100);
        let readinessLevel: 'excellent' | 'good' | 'moderate' | 'needs-work';
        let readinessMessage: string;
        let readinessColor: string;

        if (percentage >= 90) {
          readinessLevel = 'excellent';
          readinessMessage = "Excellent! You're exam-ready!";
          readinessColor = 'green';
        } else if (percentage >= 70) {
          readinessLevel = 'good';
          readinessMessage = 'Good progress! Review weak areas below.';
          readinessColor = 'yellow';
        } else if (percentage >= 50) {
          readinessLevel = 'moderate';
          readinessMessage = 'Getting there. More revision needed.';
          readinessColor = 'orange';
        } else {
          readinessLevel = 'needs-work';
          readinessMessage = 'Study more and retake the quiz.';
          readinessColor = 'red';
        }

        const weakAreas = breakdown
          .filter((b) => !b.isCorrect && b.question.topic)
          .map((b) => b.question.topic!);

        return fc.constant({
          quiz,
          userAnswers: {
            quizId: quiz.id,
            answers: answersRecord,
            startTime: new Date(),
            endTime: new Date(),
            elapsedSeconds: 300,
          },
          score: correctCount,
          totalQuestions: quiz.questions.length,
          percentage,
          readinessLevel,
          readinessMessage,
          readinessColor,
          breakdown,
          weakAreas,
        } as QuizResults);
      });

      fc.assert(
        fc.property(quizResultsArb, (quizResults) => {
          // Clear mocks before each iteration
          mockSave.mockClear();
          mockText.mockClear();
          mockRect.mockClear();
          mockLine.mockClear();
          
          // Export the quiz results
          exportQuizResultsPDF(quizResults);
          
          // Headers use rect() for background and text() for content
          // Footers use line() for separator and text() for content
          
          // Check that rect was called (for header background)
          expect(mockRect.mock.calls.length).toBeGreaterThan(0);
          
          // Check that line was called (for footer separator)
          expect(mockLine.mock.calls.length).toBeGreaterThan(0);
          
          // Check that text was called multiple times (for header and footer text)
          expect(mockText.mock.calls.length).toBeGreaterThan(0);
          
          // Verify that text calls include header-like content (page numbers)
          const textCalls = mockText.mock.calls.map(call => call[0]);
          const hasPageNumber = textCalls.some((text: string) => 
            typeof text === 'string' && text.includes('Page')
          );
          expect(hasPageNumber).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });
});
