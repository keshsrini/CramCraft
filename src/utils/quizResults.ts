// Quiz results calculation utilities for CramCraft
// Handles score calculation, readiness assessment, and weak areas identification

import type {
  Quiz,
  UserAnswers,
  QuizResults,
  QuestionBreakdown,
  ReadinessLevel,
  AnswerOption,
} from '../types';
import { READINESS_THRESHOLDS } from '../types';

// ============================================================================
// Score Calculation
// ============================================================================

/**
 * Calculate quiz results from user answers
 * Property 20: Score calculation correctness
 */
export function calculateQuizResults(quiz: Quiz, userAnswers: UserAnswers): QuizResults {
  // Calculate score
  const breakdown = createQuestionBreakdown(quiz, userAnswers);
  const score = breakdown.filter((item) => item.isCorrect).length;
  const totalQuestions = quiz.questions.length;
  const percentage = (score / totalQuestions) * 100;

  // Determine readiness level
  const readiness = determineReadinessLevel(percentage);

  // Identify weak areas
  const weakAreas = identifyWeakAreas(breakdown);

  return {
    quiz,
    userAnswers,
    score,
    totalQuestions,
    percentage,
    readinessLevel: readiness.level,
    readinessMessage: readiness.message,
    readinessColor: readiness.color,
    breakdown,
    weakAreas,
  };
}

/**
 * Create question-by-question breakdown
 */
function createQuestionBreakdown(quiz: Quiz, userAnswers: UserAnswers): QuestionBreakdown[] {
  return quiz.questions.map((question) => {
    const userAnswer = userAnswers.answers[question.id];
    const isCorrect = userAnswer === question.correctAnswer;

    // Format user answer for display
    const userAnswerText = userAnswer
      ? question.options.find((opt) => opt.startsWith(`${userAnswer})`)) || userAnswer
      : 'No answer';

    return {
      question,
      userAnswer: userAnswerText,
      isCorrect,
    };
  });
}

// ============================================================================
// Readiness Assessment
// ============================================================================

interface ReadinessInfo {
  level: ReadinessLevel;
  message: string;
  color: string;
}

/**
 * Determine readiness level based on score percentage
 * Property 21: Readiness assessment mapping
 */
export function determineReadinessLevel(percentage: number): ReadinessInfo {
  if (percentage >= READINESS_THRESHOLDS.EXCELLENT.min && percentage <= READINESS_THRESHOLDS.EXCELLENT.max) {
    return {
      level: 'excellent',
      message: READINESS_THRESHOLDS.EXCELLENT.message,
      color: READINESS_THRESHOLDS.EXCELLENT.color,
    };
  }

  if (percentage >= READINESS_THRESHOLDS.GOOD.min && percentage <= READINESS_THRESHOLDS.GOOD.max) {
    return {
      level: 'good',
      message: READINESS_THRESHOLDS.GOOD.message,
      color: READINESS_THRESHOLDS.GOOD.color,
    };
  }

  if (percentage >= READINESS_THRESHOLDS.MODERATE.min && percentage <= READINESS_THRESHOLDS.MODERATE.max) {
    return {
      level: 'moderate',
      message: READINESS_THRESHOLDS.MODERATE.message,
      color: READINESS_THRESHOLDS.MODERATE.color,
    };
  }

  // Below 50% or any other case
  return {
    level: 'needs-work',
    message: READINESS_THRESHOLDS.NEEDS_WORK.message,
    color: READINESS_THRESHOLDS.NEEDS_WORK.color,
  };
}

// ============================================================================
// Weak Areas Identification
// ============================================================================

/**
 * Identify weak areas from incorrect answers
 * Property 24: Weak areas identification
 */
export function identifyWeakAreas(breakdown: QuestionBreakdown[]): string[] {
  const incorrectQuestions = breakdown.filter((item) => !item.isCorrect);

  // Extract topics from incorrect questions
  const topics = incorrectQuestions
    .map((item) => item.question.topic)
    .filter((topic): topic is string => topic !== undefined && topic.trim().length > 0);

  // Remove duplicates and return
  return Array.from(new Set(topics));
}
