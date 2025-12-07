// AI content generation utilities for CramCraft
// Handles revision summary and quiz generation using Claude API

import { claudeApiClient, ClaudeAPIError } from './claudeApi';
import type { DocumentSummary, ExtractedText, Quiz, Question } from '../types';
import { SUMMARY_CONSTRAINTS, QUIZ_CONSTRAINTS } from '../types';

// ============================================================================
// Response Interfaces
// ============================================================================

interface SummaryResponse {
  title: string;
  keyConcepts: string[];
  definitions: Array<{ term: string; definition: string }>;
  summary: string;
  memoryAids: string[];
}

interface QuizResponse {
  questions: Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topic?: string;
  }>;
}

// ============================================================================
// Revision Summary Generation
// ============================================================================

/**
 * Generate a revision summary for a single document
 */
export async function generateRevisionSummary(
  extractedText: ExtractedText
): Promise<DocumentSummary> {
  const prompt = createSummaryPrompt(extractedText.content, extractedText.fileName);

  try {
    const responseText = await claudeApiClient.sendMessage(prompt, {
      maxTokens: 4096,
      temperature: 1.0,
    });

    const summaryData = parseSummaryResponse(responseText);
    validateSummaryStructure(summaryData);

    return {
      id: extractedText.fileId,
      title: summaryData.title,
      keyConcepts: summaryData.keyConcepts,
      definitions: summaryData.definitions,
      summary: summaryData.summary,
      memoryAids: summaryData.memoryAids,
      subject: detectSubject(summaryData.title),
    };
  } catch (error) {
    if (error instanceof ClaudeAPIError) {
      throw error;
    }
    throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create the prompt for summary generation
 */
function createSummaryPrompt(extractedText: string, fileName: string): string {
  return `You are creating a revision summary for a student. Based on the following extracted text from study materials, generate:

1. KEY CONCEPTS (${SUMMARY_CONSTRAINTS.MIN_KEY_CONCEPTS}-${SUMMARY_CONSTRAINTS.MAX_KEY_CONCEPTS} bullet points of main ideas)
2. IMPORTANT DEFINITIONS (at least ${SUMMARY_CONSTRAINTS.MIN_DEFINITIONS} key terms and explanations)
3. QUICK SUMMARY (${SUMMARY_CONSTRAINTS.MIN_SUMMARY_PARAGRAPHS}-${SUMMARY_CONSTRAINTS.MAX_SUMMARY_PARAGRAPHS} paragraphs in simple, clear language)
4. MEMORY AIDS (mnemonics or recall tips if applicable, can be empty array if none are appropriate)

Keep it concise, student-friendly, and focused on exam preparation.

DOCUMENT NAME: ${fileName}

EXTRACTED TEXT:
${extractedText}

Format your response as JSON:
{
  "title": "auto-detected topic from the content",
  "keyConcepts": ["concept 1", "concept 2", "concept 3"],
  "definitions": [{"term": "term1", "definition": "definition1"}],
  "summary": "A clear 2-3 paragraph summary...",
  "memoryAids": ["tip 1", "tip 2"]
}

IMPORTANT: Return ONLY the JSON object, no additional text before or after.`;
}

/**
 * Parse the JSON response from Claude
 */
function parseSummaryResponse(responseText: string): SummaryResponse {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed as SummaryResponse;
  } catch (error) {
    throw new Error(`Failed to parse summary response: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
  }
}

/**
 * Validate that the summary structure meets requirements
 */
function validateSummaryStructure(summary: SummaryResponse): void {
  const errors: string[] = [];

  if (!summary.title || typeof summary.title !== 'string') {
    errors.push('Missing or invalid title');
  }

  if (!Array.isArray(summary.keyConcepts)) {
    errors.push('keyConcepts must be an array');
  } else if (
    summary.keyConcepts.length < SUMMARY_CONSTRAINTS.MIN_KEY_CONCEPTS ||
    summary.keyConcepts.length > SUMMARY_CONSTRAINTS.MAX_KEY_CONCEPTS
  ) {
    errors.push(
      `keyConcepts must have ${SUMMARY_CONSTRAINTS.MIN_KEY_CONCEPTS}-${SUMMARY_CONSTRAINTS.MAX_KEY_CONCEPTS} items`
    );
  }

  if (!Array.isArray(summary.definitions)) {
    errors.push('definitions must be an array');
  } else if (summary.definitions.length < SUMMARY_CONSTRAINTS.MIN_DEFINITIONS) {
    errors.push(`definitions must have at least ${SUMMARY_CONSTRAINTS.MIN_DEFINITIONS} item`);
  } else {
    summary.definitions.forEach((def, idx) => {
      if (!def.term || !def.definition) {
        errors.push(`Definition ${idx} missing term or definition`);
      }
    });
  }

  if (!summary.summary || typeof summary.summary !== 'string') {
    errors.push('Missing or invalid summary');
  } else if (summary.summary.trim().length < 100) {
    // Only validate if summary is too short - otherwise accept any format
    errors.push('summary must be at least 100 characters');
  }

  if (!Array.isArray(summary.memoryAids)) {
    errors.push('memoryAids must be an array');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid summary structure: ${errors.join(', ')}`);
  }
}

/**
 * Detect subject from title (simple heuristic)
 */
function detectSubject(title: string): string {
  const lowerTitle = title.toLowerCase();

  // Simple subject detection based on keywords
  const subjects: Record<string, string[]> = {
    Mathematics: ['math', 'calculus', 'algebra', 'geometry', 'statistics'],
    Science: ['biology', 'chemistry', 'physics', 'science'],
    History: ['history', 'historical', 'war', 'revolution'],
    Literature: ['literature', 'novel', 'poetry', 'shakespeare'],
    Computer: ['programming', 'computer', 'software', 'algorithm', 'code'],
    Language: ['language', 'grammar', 'vocabulary', 'linguistics'],
  };

  for (const [subject, keywords] of Object.entries(subjects)) {
    if (keywords.some((keyword) => lowerTitle.includes(keyword))) {
      return subject;
    }
  }

  return 'General';
}

// ============================================================================
// Quiz Generation
// ============================================================================

/**
 * Generate a quiz based on all extracted texts
 */
export async function generateQuiz(extractedTexts: ExtractedText[]): Promise<Quiz> {
  if (extractedTexts.length === 0) {
    throw new Error('No extracted texts provided for quiz generation');
  }

  // Check if all texts are empty
  const hasContent = extractedTexts.some((text) => text.content.trim().length > 0);
  if (!hasContent) {
    throw new Error('All extracted texts are empty. Cannot generate quiz.');
  }

  const prompt = createQuizPrompt(extractedTexts);

  try {
    const responseText = await claudeApiClient.sendMessage(prompt, {
      maxTokens: 8192,
      temperature: 1.0,
    });

    const quizData = parseQuizResponse(responseText);
    validateQuizStructure(quizData);

    return {
      id: generateQuizId(),
      questions: quizData.questions,
      generatedAt: new Date(),
    };
  } catch (error) {
    if (error instanceof ClaudeAPIError) {
      throw error;
    }
    throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create the prompt for quiz generation
 */
function createQuizPrompt(extractedTexts: ExtractedText[]): string {
  const combinedText = extractedTexts
    .map((text) => `=== ${text.fileName} ===\n${text.content}`)
    .join('\n\n');

  const targetQuestions = 12; // Aim for middle of 10-15 range
  const easyCount = Math.round(targetQuestions * QUIZ_CONSTRAINTS.DIFFICULTY_DISTRIBUTION.easy);
  const mediumCount = Math.round(targetQuestions * QUIZ_CONSTRAINTS.DIFFICULTY_DISTRIBUTION.medium);
  const hardCount = Math.round(targetQuestions * QUIZ_CONSTRAINTS.DIFFICULTY_DISTRIBUTION.hard);

  return `You are creating a quiz to test student readiness. Based on the following study materials, generate ${targetQuestions} multiple-choice questions.

Requirements:
- Mix difficulty: ${easyCount} easy, ${mediumCount} medium, ${hardCount} hard questions
- Each question has exactly 4 options (A, B, C, D) with only one correct answer
- Format options as: "A) option text", "B) option text", etc.
- Include an explanation for why the correct answer is correct
- Test understanding, not just memorization
- Cover different aspects of the material
- Number questions starting from 1

STUDY MATERIALS:
${combinedText}

Format your response as JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "What is...",
      "options": ["A) option 1", "B) option 2", "C) option 3", "D) option 4"],
      "correctAnswer": "A",
      "explanation": "This is correct because...",
      "difficulty": "easy",
      "topic": "Topic name"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object, no additional text before or after.`;
}

/**
 * Parse the JSON response from Claude
 */
function parseQuizResponse(responseText: string): QuizResponse {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed as QuizResponse;
  } catch (error) {
    throw new Error(`Failed to parse quiz response: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
  }
}

/**
 * Validate that the quiz structure meets requirements
 */
function validateQuizStructure(quiz: QuizResponse): void {
  const errors: string[] = [];

  if (!Array.isArray(quiz.questions)) {
    errors.push('questions must be an array');
  } else {
    // Be more lenient - accept any number of questions as long as there's at least 3
    if (quiz.questions.length < 3) {
      errors.push('Quiz must have at least 3 questions');
    }

    quiz.questions.forEach((q, idx) => {
      if (typeof q.id !== 'number') {
        errors.push(`Question ${idx}: id must be a number`);
      }
      if (!q.question || typeof q.question !== 'string') {
        errors.push(`Question ${idx}: missing or invalid question text`);
      }
      if (!Array.isArray(q.options) || q.options.length !== QUIZ_CONSTRAINTS.OPTIONS_PER_QUESTION) {
        errors.push(`Question ${idx}: must have exactly ${QUIZ_CONSTRAINTS.OPTIONS_PER_QUESTION} options`);
      }
      if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
        errors.push(`Question ${idx}: correctAnswer must be A, B, C, or D`);
      }
      if (!q.explanation || typeof q.explanation !== 'string') {
        errors.push(`Question ${idx}: missing or invalid explanation`);
      }
      if (!['easy', 'medium', 'hard'].includes(q.difficulty)) {
        errors.push(`Question ${idx}: difficulty must be easy, medium, or hard`);
      }
    });
  }

  if (errors.length > 0) {
    throw new Error(`Invalid quiz structure: ${errors.join(', ')}`);
  }
}

/**
 * Generate a unique quiz ID
 */
function generateQuizId(): string {
  return `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// Revision Pack Aggregation
// ============================================================================

/**
 * Aggregate multiple document summaries into a revision pack
 */
export async function aggregateRevisionPack(
  extractedTexts: ExtractedText[]
): Promise<import('../types').RevisionPack> {
  if (extractedTexts.length === 0) {
    throw new Error('No extracted texts provided for revision pack generation');
  }

  // Generate summaries for all documents in order with delays to avoid rate limiting
  const summaries: DocumentSummary[] = [];
  for (let i = 0; i < extractedTexts.length; i++) {
    const text = extractedTexts[i];
    
    // Add delay between requests (except for the first one)
    if (i > 0) {
      console.log(`⏳ Waiting 3 seconds before processing next document...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    try {
      console.log(`📄 Processing document ${i + 1}/${extractedTexts.length}: ${text.fileName}`);
      const summary = await generateRevisionSummary(text);
      summaries.push(summary);
    } catch (error) {
      // If one document fails, we can still continue with others
      console.error(`Failed to generate summary for ${text.fileName}:`, error);
      // Create a minimal summary for failed documents
      summaries.push({
        id: text.fileId,
        title: text.fileName,
        keyConcepts: ['Content extraction failed'],
        definitions: [],
        summary: 'Unable to generate summary for this document.',
        memoryAids: [],
        subject: 'Unknown',
      });
    }
  }

  // Calculate total reading time (average 200 words per minute)
  const totalWords = extractedTexts.reduce((sum, text) => sum + text.wordCount, 0);
  const totalReadingTime = Math.ceil(totalWords / 200); // in minutes

  // Detect and tag subjects
  const summariesWithSubjects = summaries.map((summary) => ({
    ...summary,
    subject: summary.subject || detectSubject(summary.title),
  }));

  return {
    documents: summariesWithSubjects,
    totalReadingTime,
    generatedAt: new Date(),
  };
}
