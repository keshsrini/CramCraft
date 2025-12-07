// Core type definitions for CramCraft

// ============================================================================
// Constants
// ============================================================================

export const FILE_LIMITS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB in bytes
  MAX_FILES: 10,
} as const;

export const SUPPORTED_FILE_TYPES = {
  PDF: ['.pdf'],
  IMAGE: ['.jpg', '.jpeg', '.png'],
  TEXT: ['.txt', '.md'],
} as const;

export const ALL_SUPPORTED_EXTENSIONS = [
  ...SUPPORTED_FILE_TYPES.PDF,
  ...SUPPORTED_FILE_TYPES.IMAGE,
  ...SUPPORTED_FILE_TYPES.TEXT,
] as const;

export const READINESS_THRESHOLDS = {
  EXCELLENT: { min: 90, max: 100, color: 'green', message: "Excellent! You're exam-ready!" },
  GOOD: { min: 70, max: 89, color: 'yellow', message: 'Good progress! Review weak areas below.' },
  MODERATE: { min: 50, max: 69, color: 'orange', message: 'Getting there. More revision needed.' },
  NEEDS_WORK: { min: 0, max: 49, color: 'red', message: 'Study more and retake the quiz.' },
} as const;

export const QUIZ_CONSTRAINTS = {
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 8,
  OPTIONS_PER_QUESTION: 4,
  DIFFICULTY_DISTRIBUTION: {
    easy: 0.4,
    medium: 0.4,
    hard: 0.2,
  },
} as const;

export const SUMMARY_CONSTRAINTS = {
  MIN_KEY_CONCEPTS: 5,
  MAX_KEY_CONCEPTS: 10,
  MIN_DEFINITIONS: 1,
  MIN_SUMMARY_PARAGRAPHS: 2,
  MAX_SUMMARY_PARAGRAPHS: 3,
} as const;

// ============================================================================
// Core Data Models
// ============================================================================

export type FileType = 'pdf' | 'image' | 'text';
export type FileStatus = 'pending' | 'processing' | 'completed' | 'error';
export type ExtractionMethod = 'pdf-parser' | 'ocr' | 'direct';
export type ProcessingStep = 'extracting' | 'generating-summary' | 'generating-quiz';
export type ViewType = 'upload' | 'processing' | 'revision' | 'quiz' | 'results';
export type AnswerOption = 'A' | 'B' | 'C' | 'D';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type ReadinessLevel = 'excellent' | 'good' | 'moderate' | 'needs-work';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: FileType;
  thumbnail?: string;
  status: FileStatus;
  error?: string;
}

export interface ExtractedText {
  fileId: string;
  fileName: string;
  content: string;
  wordCount: number;
  extractionMethod: ExtractionMethod;
  confidence?: number; // For OCR results
}

export interface Definition {
  term: string;
  definition: string;
}

export interface DocumentSummary {
  id: string;
  title: string;
  keyConcepts: string[];
  definitions: Definition[];
  summary: string;
  memoryAids: string[];
  subject?: string;
}

export interface RevisionPack {
  documents: DocumentSummary[];
  totalReadingTime: number;
  generatedAt: Date;
}

export interface Question {
  id: number;
  question: string;
  options: string[]; // ["A) ...", "B) ...", "C) ...", "D) ..."]
  correctAnswer: AnswerOption;
  explanation: string;
  difficulty: DifficultyLevel;
  topic?: string;
}

export interface Quiz {
  id: string;
  questions: Question[];
  generatedAt: Date;
}

export interface UserAnswers {
  quizId: string;
  answers: Record<number, AnswerOption>;
  startTime: Date;
  endTime: Date;
  elapsedSeconds: number;
}

export interface QuestionBreakdown {
  question: Question;
  userAnswer: string;
  isCorrect: boolean;
}

export interface QuizResults {
  quiz: Quiz;
  userAnswers: UserAnswers;
  score: number;
  totalQuestions: number;
  percentage: number;
  readinessLevel: ReadinessLevel;
  readinessMessage: string;
  readinessColor: string;
  breakdown: QuestionBreakdown[];
  weakAreas: string[];
}

export interface AppState {
  files: UploadedFile[];
  extractedTexts: ExtractedText[];
  revisionPack: RevisionPack | null;
  quiz: Quiz | null;
  currentView: ViewType;
  isProcessing: boolean;
  error: string | null;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isFileType(value: unknown): value is FileType {
  return typeof value === 'string' && ['pdf', 'image', 'text'].includes(value);
}

export function isFileStatus(value: unknown): value is FileStatus {
  return typeof value === 'string' && ['pending', 'processing', 'completed', 'error'].includes(value);
}

export function isExtractionMethod(value: unknown): value is ExtractionMethod {
  return typeof value === 'string' && ['pdf-parser', 'ocr', 'direct'].includes(value);
}

export function isAnswerOption(value: unknown): value is AnswerOption {
  return typeof value === 'string' && ['A', 'B', 'C', 'D'].includes(value);
}

export function isDifficultyLevel(value: unknown): value is DifficultyLevel {
  return typeof value === 'string' && ['easy', 'medium', 'hard'].includes(value);
}

export function isReadinessLevel(value: unknown): value is ReadinessLevel {
  return typeof value === 'string' && ['excellent', 'good', 'moderate', 'needs-work'].includes(value);
}

export function isUploadedFile(value: unknown): value is UploadedFile {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.id === 'string' &&
    obj.file instanceof File &&
    typeof obj.name === 'string' &&
    typeof obj.size === 'number' &&
    isFileType(obj.type) &&
    isFileStatus(obj.status) &&
    (obj.thumbnail === undefined || typeof obj.thumbnail === 'string') &&
    (obj.error === undefined || typeof obj.error === 'string')
  );
}

export function isExtractedText(value: unknown): value is ExtractedText {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.fileId === 'string' &&
    typeof obj.fileName === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.wordCount === 'number' &&
    isExtractionMethod(obj.extractionMethod) &&
    (obj.confidence === undefined || typeof obj.confidence === 'number')
  );
}

export function isDefinition(value: unknown): value is Definition {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.term === 'string' &&
    typeof obj.definition === 'string'
  );
}

export function isDocumentSummary(value: unknown): value is DocumentSummary {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    Array.isArray(obj.keyConcepts) &&
    obj.keyConcepts.every((k) => typeof k === 'string') &&
    Array.isArray(obj.definitions) &&
    obj.definitions.every(isDefinition) &&
    typeof obj.summary === 'string' &&
    Array.isArray(obj.memoryAids) &&
    obj.memoryAids.every((m) => typeof m === 'string') &&
    (obj.subject === undefined || typeof obj.subject === 'string')
  );
}

export function isRevisionPack(value: unknown): value is RevisionPack {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  
  return (
    Array.isArray(obj.documents) &&
    obj.documents.every(isDocumentSummary) &&
    typeof obj.totalReadingTime === 'number' &&
    obj.generatedAt instanceof Date
  );
}

export function isQuestion(value: unknown): value is Question {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.id === 'number' &&
    typeof obj.question === 'string' &&
    Array.isArray(obj.options) &&
    obj.options.length === QUIZ_CONSTRAINTS.OPTIONS_PER_QUESTION &&
    obj.options.every((o) => typeof o === 'string') &&
    isAnswerOption(obj.correctAnswer) &&
    typeof obj.explanation === 'string' &&
    isDifficultyLevel(obj.difficulty) &&
    (obj.topic === undefined || typeof obj.topic === 'string')
  );
}

export function isQuiz(value: unknown): value is Quiz {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.id === 'string' &&
    Array.isArray(obj.questions) &&
    obj.questions.every(isQuestion) &&
    obj.generatedAt instanceof Date
  );
}

export function isUserAnswers(value: unknown): value is UserAnswers {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  
  if (
    typeof obj.quizId !== 'string' ||
    typeof obj.answers !== 'object' ||
    obj.answers === null ||
    !(obj.startTime instanceof Date) ||
    !(obj.endTime instanceof Date) ||
    typeof obj.elapsedSeconds !== 'number'
  ) {
    return false;
  }
  
  const answers = obj.answers as Record<string, unknown>;
  return Object.entries(answers).every(
    ([key, value]) => !isNaN(Number(key)) && isAnswerOption(value)
  );
}

export function isQuestionBreakdown(value: unknown): value is QuestionBreakdown {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  
  return (
    isQuestion(obj.question) &&
    typeof obj.userAnswer === 'string' &&
    typeof obj.isCorrect === 'boolean'
  );
}

export function isQuizResults(value: unknown): value is QuizResults {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  
  return (
    isQuiz(obj.quiz) &&
    isUserAnswers(obj.userAnswers) &&
    typeof obj.score === 'number' &&
    typeof obj.totalQuestions === 'number' &&
    typeof obj.percentage === 'number' &&
    isReadinessLevel(obj.readinessLevel) &&
    typeof obj.readinessMessage === 'string' &&
    typeof obj.readinessColor === 'string' &&
    Array.isArray(obj.breakdown) &&
    obj.breakdown.every(isQuestionBreakdown) &&
    Array.isArray(obj.weakAreas) &&
    obj.weakAreas.every((w) => typeof w === 'string')
  );
}
