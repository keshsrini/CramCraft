# CramCraft Design Document

## Overview

CramCraft is a client-side React web application that transforms study materials into AI-enhanced revision packs and quizzes. The architecture follows a component-based design with clear separation between file handling, content processing, AI integration, and presentation layers.

The application flow consists of five main stages:
1. **File Upload**: Users upload study materials via drag-and-drop interface
2. **Content Extraction**: Text is extracted from PDFs, images (via OCR), and text files
3. **AI Generation**: Claude API generates structured summaries and quiz questions
4. **Interactive Assessment**: Users take quizzes with real-time feedback
5. **Export**: Users download formatted PDFs of revision packs and results

## Architecture

### Technology Stack

**Frontend Framework**: React 18+ with functional components and hooks
- Modern, component-based architecture
- Efficient state management with built-in hooks
- Large ecosystem and community support

**Styling**: Tailwind CSS
- Utility-first CSS framework for rapid UI development
- Responsive design out of the box
- Consistent design system

**PDF Processing**: PDF.js (Mozilla)
- Industry-standard PDF rendering and text extraction
- Works entirely in browser (no server needed)
- Supports complex PDF structures

**OCR Engine**: Tesseract.js
- JavaScript port of Tesseract OCR engine
- Runs in browser via WebAssembly
- Supports both printed and handwritten text recognition
- Multiple language support

**AI Integration**: Anthropic Claude API (Sonnet 4)
- Advanced language understanding for content summarization
- Structured output generation (JSON)
- Context window large enough for multiple documents

**PDF Generation**: jsPDF with jsPDF-AutoTable
- Client-side PDF creation
- Professional formatting capabilities
- Table and multi-page support

**State Management**: React hooks (useState, useEffect, useContext)
- Built-in, no additional dependencies
- Sufficient for application complexity
- Easy to understand and maintain

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CramCraft UI                         │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   File     │  │  Revision    │  │      Quiz        │   │
│  │  Uploader  │  │  Pack View   │  │   Interface      │   │
│  └─────┬──────┘  └──────▲───────┘  └────────▲─────────┘   │
│        │                 │                    │              │
│        ▼                 │                    │              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Application State (React Context)          │   │
│  └──────┬──────────────────────┬──────────────┬────────┘   │
└─────────┼──────────────────────┼──────────────┼─────────────┘
          │                      │              │
          ▼                      │              │
┌──────────────────┐             │              │
│  File Processors │             │              │
│  ┌────────────┐  │             │              │
│  │ PDF Parser │  │             │              │
│  ├────────────┤  │             │              │
│  │ OCR Engine │  │             │              │
│  ├────────────┤  │             │              │
│  │Text Reader │  │             │              │
│  └────────────┘  │             │              │
└────────┬─────────┘             │              │
         │                       │              │
         ▼                       │              │
┌──────────────────┐             │              │
│  Text Extraction │             │              │
│     Storage      │             │              │
└────────┬─────────┘             │              │
         │                       │              │
         ▼                       │              │
┌──────────────────┐             │              │
│   AI Generator   │─────────────┘              │
│  (Claude API)    │                            │
└────────┬─────────┘                            │
         │                                      │
         ▼                                      │
┌──────────────────┐                            │
│  Generated       │────────────────────────────┘
│  Content Store   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Export Module   │
│    (jsPDF)       │
└──────────────────┘
```

## Components and Interfaces

### Core Components

#### 1. App Component
Root component managing global state and routing between views.

**State:**
```typescript
interface AppState {
  files: UploadedFile[];
  extractedTexts: ExtractedText[];
  revisionPack: RevisionPack | null;
  quiz: Quiz | null;
  currentView: 'upload' | 'processing' | 'revision' | 'quiz' | 'results';
  isProcessing: boolean;
  error: string | null;
}
```

#### 2. FileUploader Component
Handles file selection, drag-and-drop, and upload management.

**Props:**
```typescript
interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles: number;
  acceptedTypes: string[];
}
```

**Features:**
- Drag-and-drop zone with visual feedback
- File type validation
- File size checking
- Progress indicators
- Thumbnail generation
- Clear all functionality

#### 3. ProcessingStatus Component
Displays real-time processing status for each file.

**Props:**
```typescript
interface ProcessingStatusProps {
  currentFile: string;
  currentStep: 'extracting' | 'generating-summary' | 'generating-quiz';
  progress: number;
  filesCompleted: number;
  totalFiles: number;
}
```

#### 4. RevisionPack Component
Renders the formatted revision pack with collapsible sections.

**Props:**
```typescript
interface RevisionPackProps {
  revisionPack: RevisionPack;
  onStartQuiz: () => void;
  onExport: () => void;
}
```

**Features:**
- Collapsible document sections
- Color-coded subject tags
- Estimated reading time
- Clean typography hierarchy
- Smooth scrolling navigation

#### 5. QuizInterface Component
Interactive quiz presentation with one question at a time.

**Props:**
```typescript
interface QuizInterfaceProps {
  quiz: Quiz;
  onQuizComplete: (answers: UserAnswers) => void;
}
```

**State:**
```typescript
interface QuizState {
  currentQuestion: number;
  selectedAnswer: string | null;
  userAnswers: Record<number, string>;
  startTime: number;
  elapsedTime: number;
}
```

#### 6. QuizResults Component
Displays comprehensive quiz results with readiness assessment.

**Props:**
```typescript
interface QuizResultsProps {
  quiz: Quiz;
  userAnswers: UserAnswers;
  onRetry: () => void;
  onExport: () => void;
}
```

**Computed Data:**
- Score calculation
- Readiness level determination
- Weak areas identification
- Question-by-question breakdown

#### 7. ExportButtons Component
Handles PDF generation and download.

**Props:**
```typescript
interface ExportButtonsProps {
  revisionPack?: RevisionPack;
  quizResults?: QuizResults;
  onExportRevisionPack: () => void;
  onExportQuizResults: () => void;
}
```

## Data Models

### UploadedFile
```typescript
interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: 'pdf' | 'image' | 'text';
  thumbnail?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}
```

### ExtractedText
```typescript
interface ExtractedText {
  fileId: string;
  fileName: string;
  content: string;
  wordCount: number;
  extractionMethod: 'pdf-parser' | 'ocr' | 'direct';
  confidence?: number; // For OCR results
}
```

### RevisionPack
```typescript
interface RevisionPack {
  documents: DocumentSummary[];
  totalReadingTime: number;
  generatedAt: Date;
}

interface DocumentSummary {
  id: string;
  title: string;
  keyConcepts: string[];
  definitions: Definition[];
  summary: string;
  memoryAids: string[];
  subject?: string;
}

interface Definition {
  term: string;
  definition: string;
}
```

### Quiz
```typescript
interface Quiz {
  id: string;
  questions: Question[];
  generatedAt: Date;
}

interface Question {
  id: number;
  question: string;
  options: string[]; // ["A) ...", "B) ...", "C) ...", "D) ..."]
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
}
```

### UserAnswers
```typescript
interface UserAnswers {
  quizId: string;
  answers: Record<number, 'A' | 'B' | 'C' | 'D'>;
  startTime: Date;
  endTime: Date;
  elapsedSeconds: number;
}
```

### QuizResults
```typescript
interface QuizResults {
  quiz: Quiz;
  userAnswers: UserAnswers;
  score: number;
  totalQuestions: number;
  percentage: number;
  readinessLevel: 'excellent' | 'good' | 'moderate' | 'needs-work';
  readinessMessage: string;
  readinessColor: string;
  breakdown: QuestionBreakdown[];
  weakAreas: string[];
}

interface QuestionBreakdown {
  question: Question;
  userAnswer: string;
  isCorrect: boolean;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: File type validation
*For any* file with a given extension, the upload system should accept files with extensions .pdf, .jpg, .jpeg, .png, .txt, .md and reject all other file types with an appropriate error message.
**Validates: Requirements 1.1, 9.2**

### Property 2: File count limit enforcement
*For any* number of files selected, the system should accept up to 10 files and reject attempts to upload more than 10 files.
**Validates: Requirements 1.2**

### Property 3: File information display
*For any* set of uploaded files, the UI should display file names, sizes, and either thumbnails or icons for each file.
**Validates: Requirements 1.3, 1.4**

### Property 4: State reset completeness
*For any* application state with uploaded files, clicking Clear All should result in a state that matches the initial empty state.
**Validates: Requirements 1.5**

### Property 5: Text extraction universality
*For any* supported file type (PDF, image, or text), the extraction process should return text content.
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 6: Text file round-trip
*For any* text content, creating a text file with that content and then reading it should return the same content.
**Validates: Requirements 2.3**

### Property 7: Processing feedback visibility
*For any* file being processed, the UI should display a status indicator containing the file name during extraction and a preview of extracted text after completion.
**Validates: Requirements 2.4, 2.5**

### Property 8: Extracted text persistence
*For any* set of files processed, all extracted texts should be stored and retrievable from application state.
**Validates: Requirements 2.6**

### Property 9: Summary structure completeness
*For any* generated revision summary, it should contain 3-5 key concepts, at least one definition, a summary with 2-3 paragraphs, and a memoryAids field (which may be empty).
**Validates: Requirements 3.2, 3.3, 3.4, 3.5**

### Property 10: Revision pack aggregation
*For any* set of document summaries, the revision pack should contain all summaries organized by document in the same order.
**Validates: Requirements 3.6**

### Property 11: Quiz length constraint
*For any* generated quiz, the number of questions should be between 10 and 15 inclusive.
**Validates: Requirements 4.1**

### Property 12: Question structure validity
*For any* question in a generated quiz, it should have exactly 4 options, a correctAnswer that is one of A/B/C/D, and a non-empty explanation.
**Validates: Requirements 4.2, 4.3**

### Property 13: Difficulty distribution
*For any* generated quiz with 10+ questions, the distribution of difficulty levels should be approximately 40% easy, 40% medium, and 20% hard (within ±10% tolerance).
**Validates: Requirements 4.4**

### Property 14: Single question display
*For any* active quiz state, the UI should render exactly one question at a time.
**Validates: Requirements 5.1**

### Property 15: Progress indicator accuracy
*For any* displayed question in a quiz, the progress indicator should show the correct current question number and total question count.
**Validates: Requirements 5.2**

### Property 16: Answer selection UI presence
*For any* displayed question, the UI should contain radio button elements for answer selection.
**Validates: Requirements 5.3**

### Property 17: Next button state management
*For any* quiz question state, the Next button should be disabled when no answer is selected and enabled when an answer is selected.
**Validates: Requirements 5.4, 5.5**

### Property 18: Final question button swap
*For any* quiz state where the current question is the last question, the UI should display a Submit button instead of a Next button.
**Validates: Requirements 5.6**

### Property 19: Timer visibility
*For any* active quiz, the UI should display a timer showing elapsed time.
**Validates: Requirements 5.7**

### Property 20: Score calculation correctness
*For any* quiz and set of user answers, the calculated score should equal (number of correct answers / total questions) × 100.
**Validates: Requirements 6.1**

### Property 21: Readiness assessment mapping
*For any* quiz score percentage, the readiness level should be: "excellent" with green indicator for 90-100%, "good" with yellow for 70-89%, "moderate" with orange for 50-69%, and "needs-work" with red for below 50%, each with the appropriate message.
**Validates: Requirements 6.2, 6.3, 6.4, 6.5**

### Property 22: Results breakdown completeness
*For any* quiz results, the breakdown should contain an entry for each question showing the user's answer, correct answer, and explanation.
**Validates: Requirements 6.6, 6.7**

### Property 23: Answer highlighting correctness
*For any* question in the results breakdown, incorrect answers should have red styling and correct answers should have green styling.
**Validates: Requirements 6.8**

### Property 24: Weak areas identification
*For any* quiz results, the weak areas list should contain topics from all questions that were answered incorrectly.
**Validates: Requirements 6.9**

### Property 25: Retry functionality presence
*For any* quiz results display, a Retry button should be present in the UI.
**Validates: Requirements 6.10**

### Property 26: Document section organization
*For any* revision pack with multiple documents, each document should have its own distinct section in the rendered output.
**Validates: Requirements 7.2**

### Property 27: Section collapsibility
*For any* revision pack section, it should have collapse/expand functionality.
**Validates: Requirements 7.3**

### Property 28: Reading time display
*For any* revision pack, the UI should display an estimated reading time.
**Validates: Requirements 7.4**

### Property 29: Subject tag differentiation
*For any* revision pack with multiple detected subjects, different color-coded tags should be applied to different subjects.
**Validates: Requirements 7.5**

### Property 30: PDF export generation
*For any* revision pack or quiz results, the export function should produce a valid PDF file.
**Validates: Requirements 8.1, 8.2**

### Property 31: PDF page break insertion
*For any* multi-document revision pack PDF, page breaks should exist between documents.
**Validates: Requirements 8.3**

### Property 32: PDF header and footer presence
*For any* generated PDF, headers and footers should be present on pages.
**Validates: Requirements 8.4**

### Property 33: Error message appropriateness
*For any* error condition (file too large, unsupported type, OCR failure), an appropriate error message should be displayed to the user.
**Validates: Requirements 9.1, 9.2, 9.3**

### Property 34: Error recovery with state preservation
*For any* AI generation error, a retry option should be shown and uploaded files should remain in application state.
**Validates: Requirements 9.4**

### Property 35: Empty content validation
*For any* state where all extracted texts are empty, a warning should be displayed before quiz generation.
**Validates: Requirements 9.5**

### Property 36: State persistence on network failure
*For any* network error, application state should be saved to localStorage and be restorable.
**Validates: Requirements 9.6**

### Property 37: ARIA label presence
*For any* interactive element in the UI, appropriate ARIA labels should be present in the rendered output.
**Validates: Requirements 10.1**

### Property 38: Keyboard navigation support
*For any* quiz interface state, keyboard events (Tab, Enter, Arrow keys) should properly navigate and select answers.
**Validates: Requirements 10.2**

### Property 39: Color contrast compliance
*For any* text element, the color contrast ratio should meet WCAG AA standards (4.5:1 for normal text).
**Validates: Requirements 10.3**

### Property 40: Focus indicator visibility
*For any* interactive element that receives focus, visible focus styles should be applied.
**Validates: Requirements 10.4**

### Property 41: Loading state visibility
*For any* asynchronous operation in progress, a loading indicator should be displayed in the UI.
**Validates: Requirements 11.1**

### Property 42: User action feedback
*For any* completed user action, appropriate feedback (success or error message) should be displayed.
**Validates: Requirements 11.2, 11.3**

### Property 43: Responsive layout adaptation
*For any* viewport width (desktop or tablet range), the layout should adapt appropriately without breaking.
**Validates: Requirements 11.4**

## Error Handling

### File Upload Errors

**File Size Validation:**
- Maximum file size: 50MB per file
- Error message: "File '{filename}' is too large. Please upload files smaller than 50MB."
- Action: Reject file, allow user to continue with other files

**File Type Validation:**
- Supported types: .pdf, .jpg, .jpeg, .png, .txt, .md
- Error message: "File '{filename}' is not supported. Please upload PDF, image, or text files."
- Action: Reject file, show supported formats

**File Count Validation:**
- Maximum files: 10 per session
- Error message: "Maximum 10 files allowed. Please remove some files or start a new session."
- Action: Prevent additional uploads, highlight Clear All button

### Text Extraction Errors

**PDF Parsing Failure:**
- Scenario: Corrupted PDF or unsupported PDF version
- Error message: "Could not extract text from '{filename}'. The file may be corrupted or password-protected."
- Action: Mark file as failed, allow user to remove and try another file
- Recovery: Provide option to retry or skip file

**OCR Failure:**
- Scenario: Image quality too poor, unsupported image format
- Error message: "Could not read text from '{filename}'. Please ensure the image is clear and contains readable text."
- Action: Mark file as failed, show confidence score if partial extraction
- Recovery: Allow user to retry with different image or skip

**Empty Content:**
- Scenario: No text extracted from any file
- Error message: "No text could be extracted from your files. Please upload files with readable content."
- Action: Prevent quiz generation, allow revision pack generation to proceed
- Recovery: Prompt user to upload different files

### AI Generation Errors

**API Rate Limit:**
- Scenario: Too many requests to Claude API
- Error message: "Service is busy. Please wait a moment and try again."
- Action: Show retry button with countdown timer (30 seconds)
- Recovery: Preserve all extracted text, allow retry without re-uploading

**API Authentication Error:**
- Scenario: Invalid or missing API key
- Error message: "Configuration error. Please contact support."
- Action: Log error details for debugging
- Recovery: Provide fallback to manual summary entry (future enhancement)

**API Timeout:**
- Scenario: Request takes longer than 30 seconds
- Error message: "Generation is taking longer than expected. Please try again."
- Action: Cancel request, preserve state
- Recovery: Retry with smaller content chunks

**Invalid Response Format:**
- Scenario: AI returns malformed JSON
- Error message: "Received invalid response. Retrying..."
- Action: Automatically retry up to 3 times
- Recovery: If all retries fail, show error and allow manual retry

### Network Errors

**Connection Loss:**
- Scenario: Network disconnected during API call
- Error message: "Connection lost. Your progress has been saved."
- Action: Save state to localStorage
- Recovery: Auto-resume when connection restored

**Slow Connection:**
- Scenario: Request taking longer than expected
- Action: Show extended loading message: "This is taking a while. Please keep this tab open..."
- Recovery: Continue waiting, no timeout for initial request

### Export Errors

**PDF Generation Failure:**
- Scenario: jsPDF encounters error during generation
- Error message: "Could not create PDF. Please try again."
- Action: Log error details
- Recovery: Retry button, option to copy text content instead

**Browser Storage Full:**
- Scenario: localStorage quota exceeded
- Error message: "Browser storage is full. Some features may not work."
- Action: Clear old saved states, continue with current session
- Recovery: Prompt user to clear browser data

### Error Recovery Strategy

**State Preservation:**
- All user uploads and extracted text saved to localStorage
- State persists across page refreshes
- Maximum storage: 10MB (approximately 5000 pages of text)

**Graceful Degradation:**
- If AI generation fails, allow manual summary entry
- If export fails, provide copy-to-clipboard option
- If OCR fails, allow manual text input

**User Communication:**
- All errors show clear, non-technical messages
- Provide specific actions user can take
- Show progress of recovery attempts
- Never lose user's uploaded content

## Testing Strategy

### Unit Testing

CramCraft will use **Vitest** as the testing framework for unit tests, chosen for its:
- Native ESM support and fast execution
- Excellent React Testing Library integration
- Jest-compatible API with better performance
- Built-in TypeScript support

**Unit Test Coverage:**

1. **File Processing Functions:**
   - PDF text extraction with various PDF structures
   - OCR processing with different image qualities
   - Text file reading with various encodings
   - File validation (type, size, count)

2. **Data Transformation:**
   - Revision pack aggregation from multiple summaries
   - Quiz results calculation
   - Readiness level determination
   - Weak areas identification

3. **UI Component Rendering:**
   - FileUploader with drag-and-drop states
   - QuizInterface question navigation
   - QuizResults breakdown display
   - RevisionPack collapsible sections

4. **Error Handling:**
   - File upload errors (size, type, count)
   - Extraction failures (PDF, OCR)
   - API errors (rate limit, timeout, invalid response)
   - Network failures with state recovery

5. **Export Functions:**
   - PDF generation for revision packs
   - PDF generation for quiz results
   - PDF structure validation (headers, footers, page breaks)

**Example Unit Tests:**

```typescript
describe('File Validation', () => {
  it('should accept valid PDF files', () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    expect(isValidFileType(file)).toBe(true);
  });

  it('should reject files exceeding size limit', () => {
    const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.pdf');
    expect(isValidFileSize(largeFile)).toBe(false);
  });

  it('should reject more than 10 files', () => {
    const files = Array(11).fill(null).map((_, i) => 
      new File(['content'], `file${i}.pdf`)
    );
    expect(validateFileCount(files)).toBe(false);
  });
});

describe('Score Calculation', () => {
  it('should calculate percentage correctly', () => {
    const quiz = createMockQuiz(10);
    const answers = { 1: 'A', 2: 'B', 3: 'A', 4: 'C', 5: 'D', 
                     6: 'A', 7: 'B', 8: 'A', 9: 'C', 10: 'D' };
    const results = calculateResults(quiz, answers);
    expect(results.percentage).toBe(70); // Assuming 7 correct
  });
});

describe('Readiness Assessment', () => {
  it('should return excellent for 90%+ scores', () => {
    const level = getReadinessLevel(95);
    expect(level.status).toBe('excellent');
    expect(level.color).toBe('green');
    expect(level.message).toContain('exam-ready');
  });

  it('should return needs-work for scores below 50%', () => {
    const level = getReadinessLevel(45);
    expect(level.status).toBe('needs-work');
    expect(level.color).toBe('red');
  });
});
```

### Property-Based Testing

CramCraft will use **fast-check** as the property-based testing library, chosen for its:
- Excellent TypeScript support
- Rich set of built-in generators
- Shrinking capabilities for minimal failing examples
- Integration with Vitest

**Configuration:**
- Minimum 100 iterations per property test
- Custom generators for domain-specific types
- Shrinking enabled for debugging

**Property Test Implementation:**

Each property-based test will:
1. Be tagged with a comment referencing the design document property
2. Use appropriate generators for input data
3. Run at least 100 iterations
4. Include clear assertion messages

**Example Property Tests:**

```typescript
import fc from 'fast-check';

describe('Property Tests', () => {
  it('Property 1: File type validation', () => {
    // **Feature: cramcraft, Property 1: File type validation**
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('.pdf'),
          fc.constant('.jpg'),
          fc.constant('.jpeg'),
          fc.constant('.png'),
          fc.constant('.txt'),
          fc.constant('.md'),
          fc.string().filter(s => !['.pdf', '.jpg', '.jpeg', '.png', '.txt', '.md'].includes(s))
        ),
        (extension) => {
          const file = new File(['content'], `test${extension}`);
          const isValid = isValidFileType(file);
          const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.txt', '.md'];
          
          if (validExtensions.includes(extension)) {
            expect(isValid).toBe(true);
          } else {
            expect(isValid).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 6: Text file round-trip', () => {
    // **Feature: cramcraft, Property 6: Text file round-trip**
    fc.assert(
      fc.property(
        fc.string(),
        async (content) => {
          const file = new File([content], 'test.txt', { type: 'text/plain' });
          const extracted = await extractTextFromFile(file);
          expect(extracted).toBe(content);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 9: Summary structure completeness', () => {
    // **Feature: cramcraft, Property 9: Summary structure completeness**
    fc.assert(
      fc.property(
        fc.string({ minLength: 100 }), // Extracted text
        async (text) => {
          const summary = await generateSummary(text);
          
          expect(summary.keyConcepts).toHaveLength(expect.any(Number));
          expect(summary.keyConcepts.length).toBeGreaterThanOrEqual(3);
          expect(summary.keyConcepts.length).toBeLessThanOrEqual(5);
          
          expect(summary.definitions).toHaveLength(expect.any(Number));
          expect(summary.definitions.length).toBeGreaterThanOrEqual(1);
          
          const paragraphs = summary.summary.split('\n\n').filter(p => p.trim());
          expect(paragraphs.length).toBeGreaterThanOrEqual(2);
          expect(paragraphs.length).toBeLessThanOrEqual(3);
          
          expect(summary).toHaveProperty('memoryAids');
          expect(Array.isArray(summary.memoryAids)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 20: Score calculation correctness', () => {
    // **Feature: cramcraft, Property 20: Score calculation correctness**
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.integer({ min: 1, max: 100 }),
          correctAnswer: fc.constantFrom('A', 'B', 'C', 'D')
        }), { minLength: 10, maxLength: 15 }),
        fc.func(fc.constantFrom('A', 'B', 'C', 'D')),
        (questions, answerGenerator) => {
          const quiz = { questions };
          const userAnswers = {};
          let correctCount = 0;
          
          questions.forEach(q => {
            const answer = answerGenerator();
            userAnswers[q.id] = answer;
            if (answer === q.correctAnswer) correctCount++;
          });
          
          const results = calculateResults(quiz, userAnswers);
          const expectedPercentage = (correctCount / questions.length) * 100;
          
          expect(results.percentage).toBeCloseTo(expectedPercentage, 2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Custom Generators:**

```typescript
// Generator for valid file types
const validFileArb = fc.record({
  name: fc.string(),
  extension: fc.constantFrom('.pdf', '.jpg', '.jpeg', '.png', '.txt', '.md'),
  size: fc.integer({ min: 1, max: 50 * 1024 * 1024 })
});

// Generator for quiz questions
const questionArb = fc.record({
  id: fc.integer({ min: 1 }),
  question: fc.string({ minLength: 10 }),
  options: fc.tuple(
    fc.string(),
    fc.string(),
    fc.string(),
    fc.string()
  ).map(opts => opts.map((o, i) => `${['A', 'B', 'C', 'D'][i]}) ${o}`)),
  correctAnswer: fc.constantFrom('A', 'B', 'C', 'D'),
  explanation: fc.string({ minLength: 20 }),
  difficulty: fc.constantFrom('easy', 'medium', 'hard')
});

// Generator for revision summaries
const summaryArb = fc.record({
  title: fc.string(),
  keyConcepts: fc.array(fc.string(), { minLength: 3, maxLength: 5 }),
  definitions: fc.array(
    fc.record({
      term: fc.string(),
      definition: fc.string()
    }),
    { minLength: 1, maxLength: 10 }
  ),
  summary: fc.array(fc.string(), { minLength: 2, maxLength: 3 })
    .map(paras => paras.join('\n\n')),
  memoryAids: fc.array(fc.string(), { maxLength: 5 })
});
```

### Integration Testing

**End-to-End User Flows:**

1. **Complete Study Session Flow:**
   - Upload multiple files
   - Extract text from all files
   - Generate revision pack
   - Generate quiz
   - Take quiz
   - View results
   - Export PDFs

2. **Error Recovery Flow:**
   - Upload files
   - Simulate API error
   - Verify state preservation
   - Retry successfully
   - Complete flow

3. **Accessibility Flow:**
   - Navigate entire app with keyboard only
   - Verify screen reader announcements
   - Check focus management
   - Validate ARIA attributes

**Testing Tools:**
- Vitest for test runner
- React Testing Library for component testing
- fast-check for property-based testing
- Testing Library User Event for interaction simulation

### Test Execution Strategy

**Development:**
- Run unit tests on file save (watch mode)
- Run property tests before commits
- Fast feedback loop (< 5 seconds for unit tests)

**CI/CD:**
- Run all tests on pull requests
- Require 80%+ code coverage
- Property tests with 100 iterations minimum
- Integration tests on staging environment

**Performance Benchmarks:**
- PDF extraction: < 2 seconds per file
- OCR processing: < 5 seconds per image
- AI generation: < 10 seconds per request
- Quiz completion: < 1 second for results calculation
- PDF export: < 3 seconds for full revision pack

## Implementation Notes

### AI Prompt Engineering

**Summary Generation Prompt:**
```
You are creating a revision summary for a student. Based on the following extracted text from study materials, generate:

1. KEY CONCEPTS (3-5 bullet points of main ideas)
2. IMPORTANT DEFINITIONS (key terms and explanations)
3. QUICK SUMMARY (2-3 paragraphs in simple, clear language)
4. MEMORY AIDS (mnemonics or recall tips if applicable)

Keep it concise, student-friendly, and focused on exam preparation.

EXTRACTED TEXT:
{extractedText}

Format your response as JSON:
{
  "title": "auto-detected topic",
  "keyConcepts": ["concept 1", "concept 2", ...],
  "definitions": [{"term": "...", "definition": "..."}],
  "summary": "...",
  "memoryAids": ["tip 1", "tip 2", ...]
}
```

**Quiz Generation Prompt:**
```
You are creating a quiz to test student readiness. Based on the following study materials, generate 12 multiple-choice questions.

Requirements:
- Mix difficulty: 5 easy, 5 medium, 2 hard questions
- Each question has 4 options (A, B, C, D) with only one correct answer
- Include an explanation for the correct answer
- Test understanding, not just memorization
- Cover different aspects of the material

STUDY MATERIALS:
{allExtractedTexts}

Format your response as JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "A",
      "explanation": "...",
      "difficulty": "easy|medium|hard",
      "topic": "..."
    },
    ...
  ]
}
```

### Performance Optimizations

**File Processing:**
- Process files in parallel using Promise.all()
- Use Web Workers for OCR to avoid blocking main thread
- Implement progress callbacks for long-running operations
- Cache extracted text to avoid re-processing

**AI API Calls:**
- Batch multiple documents into single API call when possible
- Implement request queuing to avoid rate limits
- Cache responses in localStorage for retry scenarios
- Use streaming responses for real-time feedback (future enhancement)

**UI Rendering:**
- Virtualize long lists (quiz questions, revision pack sections)
- Lazy load images and thumbnails
- Debounce search and filter operations
- Use React.memo for expensive components

**State Management:**
- Use Context API for global state
- Local component state for UI-only state
- localStorage for persistence
- Clear old data after successful completion

### Browser Compatibility

**Minimum Requirements:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required APIs:**
- File API
- FileReader API
- localStorage
- Canvas API (for PDF.js)
- WebAssembly (for Tesseract.js)

**Polyfills:**
- None required for target browsers
- Graceful degradation for older browsers with warning message

### Security Considerations

**File Upload:**
- Client-side file type validation
- File size limits enforced
- No server-side storage (all processing in browser)
- Sanitize file names before display

**API Keys:**
- Store Claude API key securely (environment variables)
- Never expose API key in client code
- Use backend proxy for API calls (production)
- Implement rate limiting

**Data Privacy:**
- All processing happens client-side
- No data sent to servers except AI API
- localStorage cleared on user request
- No tracking or analytics without consent

**Content Security:**
- Sanitize all user-generated content before display
- Escape HTML in extracted text
- Validate JSON responses from AI
- Prevent XSS attacks in quiz content

### Deployment Strategy

**Development:**
- Vite dev server for local development
- Hot module replacement for fast iteration
- Mock AI responses for offline development

**Production:**
- Static site deployment (Vercel, Netlify, or similar)
- CDN for assets
- Environment-based configuration
- Error tracking (Sentry or similar)

**Environment Variables:**
```
VITE_CLAUDE_API_KEY=sk-...
VITE_API_ENDPOINT=https://api.anthropic.com/v1
VITE_MAX_FILE_SIZE=52428800
VITE_MAX_FILES=10
```

## Future Enhancements

**Phase 2 Features:**
1. Study progress tracking with localStorage
2. Spaced repetition scheduling
3. Flashcard mode from key concepts
4. Shareable quiz links
5. Dark mode support
6. Text-to-speech for revision pack

**Phase 3 Features:**
1. Multi-user collaboration
2. Study group features
3. Performance analytics
4. Custom quiz generation parameters
5. Integration with learning management systems
6. Mobile app (React Native)

## Success Criteria

The CramCraft MVP is successful when:

✅ Users can upload 3+ different file types simultaneously
✅ Text extraction works reliably for PDFs and images (>90% accuracy)
✅ Revision packs are well-formatted and readable
✅ Quizzes contain 10+ relevant, high-quality questions
✅ Quiz results clearly indicate readiness level with actionable feedback
✅ Users can export both revision packs and quiz results as PDFs
✅ Entire flow completes without crashes or data loss
✅ Processing completes within 60 seconds for typical use (3-5 documents)
✅ Application is accessible (keyboard navigation, screen reader support)
✅ Error handling provides clear guidance for recovery
