# CramCraft Implementation Plan

- [x] 1. Set up project structure and dependencies





  - Initialize React + Vite project with TypeScript
  - Install core dependencies: Tailwind CSS, React hooks
  - Install file processing libraries: PDF.js, Tesseract.js
  - Install testing libraries: Vitest, React Testing Library, fast-check
  - Install PDF generation: jsPDF, jsPDF-AutoTable
  - Configure Tailwind CSS with custom theme (calming blues/purples)
  - Set up environment variables for Claude API configuration
  - Create folder structure: components/, utils/, types/, hooks/
  - _Requirements: All requirements (foundation)_

- [x] 2. Implement core data models and TypeScript interfaces





  - Create TypeScript interfaces for UploadedFile, ExtractedText, RevisionPack, Quiz, UserAnswers, QuizResults
  - Define type guards for runtime validation
  - Create constants for file limits, supported types, readiness thresholds
  - _Requirements: 1.1, 1.2, 3.1-3.6, 4.1-4.4, 6.1-6.10_
-

- [x] 3. Build file upload and validation system



  - [x] 3.1 Create FileUploader component with drag-and-drop zone


    - Implement drag-and-drop event handlers
    - Add file selection via click
    - Display upload zone with visual feedback
    - _Requirements: 1.1_

  - [x] 3.2 Implement file validation logic


    - Validate file types (.pdf, .jpg, .jpeg, .png, .txt, .md)
    - Validate file size (max 50MB per file)
    - Validate file count (max 10 files)
    - Generate appropriate error messages
    - _Requirements: 1.1, 1.2, 9.1, 9.2_

  - [x] 3.3 Write property test for file validation


    - **Property 1: File type validation**
    - **Validates: Requirements 1.1, 9.2**

  - [x] 3.4 Write property test for file count limit


    - **Property 2: File count limit enforcement**
    - **Validates: Requirements 1.2**

  - [x] 3.5 Create file display UI with thumbnails/icons


    - Display file names and sizes
    - Generate thumbnails for images
    - Show file type icons for PDFs and text files
    - Add progress indicators during upload
    - _Requirements: 1.3, 1.4_

  - [x] 3.6 Write property test for file information display






    - **Property 3: File information display**
    - **Validates: Requirements 1.3, 1.4**

  - [x] 3.7 Implement Clear All functionality


    - Add Clear All button
    - Reset application state to initial empty state
    - Clear localStorage if applicable
    - _Requirements: 1.5_

  - [x] 3.8 Write property test for state reset


    - **Property 4: State reset completeness**
    - **Validates: Requirements 1.5**
-


- [x] 4. Implement text extraction system






  - [x] 4.1 Create PDF text extraction utility


    - Integrate PDF.js library
    - Extract text from PDF files
    - Handle multi-page PDFs
    - Handle errors for corrupted or password-protected PDFs
    - _Requirements: 2.1, 9.3_

  - [x] 4.2 Create OCR text extraction utility

    - Integrate Tesseract.js library
    - Configure OCR for both printed and handwritten text
    - Extract text from image files
    - Return confidence scores
    - Handle OCR failures gracefully
    - _Requirements: 2.2, 9.3_

  - [x] 4.3 Create text file reader utility

    - Read .txt and .md files
    - Handle different text encodings
    - _Requirements: 2.3_

  - [x] 4.4 Write property test for text extraction universality


    - **Property 5: Text extraction universality**
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [x] 4.5 Write property test for text file round-trip

    - **Property 6: Text file round-trip**
    - **Validates: Requirements 2.3**

  - [x] 4.6 Create ProcessingStatus component


    - Display current file being processed
    - Show processing step (extracting, generating summary, generating quiz)
    - Display progress indicator
    - Show files completed count
    - _Requirements: 2.4_

  - [x] 4.7 Create text preview component


    - Display extracted text for user verification
    - Add scrollable container for long text
    - Show word count
    - _Requirements: 2.5_

  - [x] 4.8 Write property test for processing feedback


    - **Property 7: Processing feedback visibility**
    - **Validates: Requirements 2.4, 2.5**

  - [x] 4.9 Implement extracted text storage in state


    - Store all extracted texts in application state
    - Associate extracted text with source file
    - Implement retrieval functions
    - _Requirements: 2.6_

  - [x] 4.10 Write property test for text persistence


    - **Property 8: Extracted text persistence**
    - **Validates: Requirements 2.6**

- [x] 5. Integrate Claude API for content generation




  - [x] 5.1 Create API client utility


    - Set up Claude API client with authentication
    - Implement request/response handling
    - Add error handling for API failures
    - Implement retry logic with exponential backoff
    - _Requirements: 3.1, 4.1, 9.4_

  - [x] 5.2 Implement revision summary generation


    - Create prompt template for summary generation
    - Call Claude API with extracted text
    - Parse JSON response into RevisionPack structure
    - Validate response structure
    - Handle API errors and timeouts
    - _Requirements: 3.1-3.5_

  - [x] 5.3 Write property test for summary structure


    - **Property 9: Summary structure completeness**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5**

  - [x] 5.4 Implement revision pack aggregation


    - Combine multiple document summaries
    - Organize by document order
    - Calculate total reading time
    - Detect and tag subjects
    - _Requirements: 3.6_

  - [x] 5.5 Write property test for revision pack aggregation


    - **Property 10: Revision pack aggregation**
    - **Validates: Requirements 3.6**

  - [x] 5.6 Implement quiz generation

    - Create prompt template for quiz generation
    - Call Claude API with all extracted texts
    - Parse JSON response into Quiz structure
    - Validate question count (10-15)
    - Validate question structure (4 options, correct answer, explanation)
    - _Requirements: 4.1-4.4_

  - [x] 5.7 Write property test for quiz length


    - **Property 11: Quiz length constraint**
    - **Validates: Requirements 4.1**

  - [x] 5.8 Write property test for question structure


    - **Property 12: Question structure validity**
    - **Validates: Requirements 4.2, 4.3**

  - [x] 5.9 Write property test for difficulty distribution


    - **Property 13: Difficulty distribution**
    - **Validates: Requirements 4.4**
-

- [x] 6. Build revision pack display component





  - [x] 6.1 Create RevisionPack component

    - Implement clean typography with heading hierarchy
    - Create document sections

    - Add estimated reading time display
    - _Requirements: 7.1, 7.2, 7.4_

  - [x] 6.2 Write property test for document sections

    - **Property 26: Document section organization**
    - **Validates: Requirements 7.2**

  - [x] 6.3 Write property test for reading time display


    - **Property 28: Reading time display**
    - **Validates: Requirements 7.4**

  - [x] 6.4 Implement collapsible sections

    - Add expand/collapse functionality for each document section
    - Persist collapse state during session
    - Add visual indicators (arrows/icons)
    - _Requirements: 7.3_

  - [x] 6.5 Write property test for section collapsibility


    - **Property 27: Section collapsibility**
    - **Validates: Requirements 7.3**

  - [x] 6.6 Implement subject tagging with color coding

    - Detect multiple subjects in revision pack
    - Apply different color tags to different subjects
    - Create color palette for subject tags
    - _Requirements: 7.5_

  - [x] 6.7 Write property test for subject tags


    - **Property 29: Subject tag differentiation**
    - **Validates: Requirements 7.5**

  - [x] 6.8 Add Start Quiz and Export buttons

    - Create action buttons at bottom of revision pack
    - Wire up navigation to quiz interface
    - Wire up export functionality
    - _Requirements: 7.2_
-

- [x] 7. Build interactive quiz interface



  - [x] 7.1 Create QuizInterface component


    - Display one question at a time
    - Implement question navigation state
    - Add timer for elapsed time tracking
    - _Requirements: 5.1, 5.7_

  - [x] 7.2 Write property test for single question display


    - **Property 14: Single question display**
    - **Validates: Requirements 5.1**

  - [x] 7.3 Write property test for timer visibility


    - **Property 19: Timer visibility**
    - **Validates: Requirements 5.7**

  - [x] 7.4 Implement progress indicator

    - Show current question number and total
    - Display progress bar
    - Update on question navigation
    - _Requirements: 5.2_

  - [x] 7.5 Write property test for progress indicator


    - **Property 15: Progress indicator accuracy**
    - **Validates: Requirements 5.2**

  - [x] 7.6 Create answer selection UI

    - Display radio buttons for 4 options
    - Handle answer selection
    - Store selected answer in state
    - _Requirements: 5.3_

  - [x] 7.7 Write property test for answer selection UI


    - **Property 16: Answer selection UI presence**
    - **Validates: Requirements 5.3**

  - [x] 7.8 Implement Next/Submit button logic

    - Disable Next button when no answer selected
    - Enable Next button when answer selected
    - Show Submit button on last question
    - Handle navigation between questions
    - _Requirements: 5.4, 5.5, 5.6_

  - [x] 7.9 Write property test for button state management


    - **Property 17: Next button state management**
    - **Validates: Requirements 5.4, 5.5**

  - [x] 7.10 Write property test for final question button


    - **Property 18: Final question button swap**
    - **Validates: Requirements 5.6**

  - [x] 7.11 Implement quiz submission

    - Collect all user answers
    - Calculate elapsed time
    - Transition to results view
    - _Requirements: 5.6_
-

- [x] 8. Build quiz results and readiness assessment




  - [x] 8.1 Create score calculation utility


    - Compare user answers with correct answers
    - Calculate number correct and percentage
    - _Requirements: 6.1_

  - [x] 8.2 Write property test for score calculation


    - **Property 20: Score calculation correctness**
    - **Validates: Requirements 6.1**

  - [x] 8.3 Implement readiness level determination

    - Map score percentage to readiness level
    - Assign color (green/yellow/orange/red)
    - Assign message based on score range
    - _Requirements: 6.2, 6.3, 6.4, 6.5_

  - [x] 8.4 Write property test for readiness assessment

    - **Property 21: Readiness assessment mapping**
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5**

  - [x] 8.5 Create QuizResults component


    - Display overall score prominently
    - Show readiness status with color-coded badge
    - Display progress bar
    - _Requirements: 6.1, 6.2-6.5_

  - [x] 8.6 Implement question-by-question breakdown

    - Show each question with user's answer vs correct answer
    - Display explanation for each question
    - Highlight incorrect answers in red, correct in green
    - _Requirements: 6.6, 6.7, 6.8_

  - [x] 8.7 Write property test for results breakdown


    - **Property 22: Results breakdown completeness**
    - **Validates: Requirements 6.6, 6.7**

  - [x] 8.8 Write property test for answer highlighting

    - **Property 23: Answer highlighting correctness**
    - **Validates: Requirements 6.8**

  - [x] 8.9 Implement weak areas identification

    - Extract topics from incorrectly answered questions
    - Display list of weak areas
    - Provide actionable feedback
    - _Requirements: 6.9_

  - [x] 8.10 Write property test for weak areas

    - **Property 24: Weak areas identification**
    - **Validates: Requirements 6.9**

  - [x] 8.11 Add Retry Quiz button

    - Reset quiz state
    - Navigate back to quiz start
    - Preserve revision pack
    - _Requirements: 6.10_

  - [x] 8.12 Write property test for retry button

    - **Property 25: Retry functionality presence**
    - **Validates: Requirements 6.10**

- [x] 9. Implement PDF export functionality



  - [x] 9.1 Create PDF export utility


    - Integrate jsPDF library
    - Create PDF generation functions
    - _Requirements: 8.1, 8.2_

  - [x] 9.2 Implement revision pack PDF export

    - Format revision pack content for PDF
    - Add page breaks between documents
    - Include headers and footers
    - Apply professional styling
    - _Requirements: 8.1, 8.3, 8.4, 8.5_

  - [x] 9.3 Write property test for PDF generation


    - **Property 30: PDF export generation**
    - **Validates: Requirements 8.1, 8.2**

  - [x] 9.4 Write property test for page breaks


    - **Property 31: PDF page break insertion**
    - **Validates: Requirements 8.3**

  - [x] 9.5 Write property test for headers and footers


    - **Property 32: PDF header and footer presence**
    - **Validates: Requirements 8.4**

  - [x] 9.6 Implement quiz results PDF export

    - Format quiz results for PDF
    - Include score and readiness assessment
    - Include question breakdown
    - Add headers and footers
    - _Requirements: 8.2, 8.4_

  - [x] 9.7 Create ExportButtons component


    - Add export revision pack button
    - Add export quiz results button
    - Handle PDF download
    - Show export progress
    - _Requirements: 8.1, 8.2_

- [x] 10. Implement comprehensive error handling





  - [x] 10.1 Create error handling utilities


    - Define error types and messages
    - Create error display component
    - Implement error logging
    - _Requirements: 9.1-9.6_

  - [x] 10.2 Implement file upload error handling


    - Handle file size errors
    - Handle unsupported file type errors
    - Handle file count limit errors
    - Display appropriate error messages
    - _Requirements: 9.1, 9.2_

  - [x] 10.3 Write property test for error messages


    - **Property 33: Error message appropriateness**
    - **Validates: Requirements 9.1, 9.2, 9.3**

  - [x] 10.3 Implement extraction error handling


    - Handle PDF parsing failures
    - Handle OCR failures
    - Show retry options
    - _Requirements: 9.3_

  - [x] 10.4 Implement API error handling


    - Handle rate limit errors
    - Handle authentication errors
    - Handle timeout errors
    - Handle invalid response format
    - Show retry option with state preservation
    - _Requirements: 9.4_

  - [x] 10.5 Write property test for error recovery


    - **Property 34: Error recovery with state preservation**
    - **Validates: Requirements 9.4**

  - [x] 10.6 Implement empty content validation


    - Check if all extracted texts are empty
    - Display warning before quiz generation
    - Allow revision pack generation to proceed
    - _Requirements: 9.5_

  - [x] 10.7 Write property test for empty content validation


    - **Property 35: Empty content validation**
    - **Validates: Requirements 9.5**

  - [x] 10.8 Implement network error handling


    - Detect network failures
    - Save state to localStorage
    - Allow resume when connection restored
    - _Requirements: 9.6_

  - [x] 10.9 Write property test for state persistence


    - **Property 36: State persistence on network failure**
    - **Validates: Requirements 9.6**

- [ ] 11. Implement accessibility features







  - [x] 11.1 Add ARIA labels to all interactive elements


    - Add labels to buttons, inputs, and controls
    - Add role attributes where appropriate
    - Add aria-live regions for dynamic content
    - _Requirements: 10.1_

  - [x] 11.2 Write property test for ARIA labels


    - **Property 37: ARIA label presence**
    - **Validates: Requirements 10.1**

  - [x] 11.3 Implement keyboard navigation


    - Add keyboard event handlers for quiz interface
    - Support Tab, Enter, Arrow keys
    - Ensure logical tab order
    - Add keyboard shortcuts where helpful
    - _Requirements: 10.2_

  - [x] 11.4 Write property test for keyboard navigation


    - **Property 38: Keyboard navigation support**
    - **Validates: Requirements 10.2**

  - [x] 11.5 Ensure color contrast compliance


    - Use high contrast colors for text
    - Verify WCAG AA compliance (4.5:1 ratio)
    - Test with contrast checking tools
    - _Requirements: 10.3_

  - [x] 11.6 Write property test for color contrast


    - **Property 39: Color contrast compliance**
    - **Validates: Requirements 10.3**

  - [x] 11.7 Implement focus indicators


    - Add visible focus styles to all interactive elements
    - Use outline or border for focus indication
    - Ensure focus indicators are not removed
    - _Requirements: 10.4_

  - [x] 11.8 Write property test for focus indicators


    - **Property 40: Focus indicator visibility**
    - **Validates: Requirements 10.4**
-

-

- [x] 12. Implement responsive UI and feedback





  - [x] 12.1 Add loading states for async operations


    - Create loading spinner component
    - Show loading during file processing
    - Show loading during AI generation
    - Show loading during PDF export
    - _Requirements: 11.1_

  - [x] 12.2 Write property test for loading states


    - **Property 41: Loading state visibility**
    - **Validates: Requirements 11.1**

  - [x] 12.3 Implement success and error messages


    - Create toast/notification component
    - Show success messages for completed actions
    - Show error messages for failed actions
    - Auto-dismiss after timeout
    - _Requirements: 11.2, 11.3_

  - [x] 12.4 Write property test for user feedback


    - **Property 42: User action feedback**
    - **Validates: Requirements 11.2, 11.3**

  - [x] 12.5 Implement responsive design


    - Use Tailwind responsive utilities
    - Test on desktop viewport (1920x1080)
    - Test on tablet viewport (768x1024)
    - Ensure layouts adapt without breaking
    - _Requirements: 11.4_

  - [x] 12.6 Write property test for responsive layout


    - **Property 43: Responsive layout adaptation**
    - **Validates: Requirements 11.4**
-

- [x] 13. Create main App component and routing



  - [x] 13.1 Create App component with state management


    - Set up React Context for global state
    - Define application state structure
    - Implement state update functions
    - _Requirements: All requirements_

  - [x] 13.2 Implement view routing logic


    - Create view state management (upload/processing/revision/quiz/results)
    - Implement navigation between views
    - Handle browser back button
    - _Requirements: All requirements_

  - [x] 13.3 Create Header component


    - Display application title and description
    - Add navigation breadcrumbs
    - Show current view indicator
    - _Requirements: 11.4_

  - [x] 13.4 Wire up all components


    - Connect FileUploader to extraction system
    - Connect extraction to AI generation
    - Connect AI generation to RevisionPack display
    - Connect RevisionPack to QuizInterface
    - Connect QuizInterface to QuizResults
    - Connect export functionality throughout
    - _Requirements: All requirements_
-

- [x] 14. Final checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.
