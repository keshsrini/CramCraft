# Requirements Document

## Introduction

CramCraft is a web-based application that transforms study materials into organized revision packs with AI-generated summaries and quizzes. The system accepts multiple file formats (PDFs, images, text files), extracts content using OCR and parsing technologies, and leverages AI to generate comprehensive revision summaries and assessment quizzes. The application provides immediate feedback on student readiness through an interactive quiz interface with detailed performance analytics.

## Glossary

- **CramCraft System**: The complete web-based application including file upload, processing, content generation, and export capabilities
- **Revision Pack**: A structured document containing AI-generated summaries, key concepts, definitions, and memory aids derived from uploaded study materials
- **Quiz Interface**: The interactive component that presents multiple-choice questions to users one at a time
- **Readiness Assessment**: A color-coded evaluation of quiz performance indicating the user's preparedness level
- **OCR Engine**: Optical Character Recognition component that converts images to text
- **PDF Parser**: Component that extracts text content from PDF documents
- **AI Generator**: The Claude API integration that produces summaries and quiz questions
- **Export Module**: Component responsible for generating downloadable PDF files

## Requirements

### Requirement 1

**User Story:** As a student, I want to upload multiple study files at once, so that I can quickly prepare all my materials for processing.

#### Acceptance Criteria

1. WHEN a user drags files into the upload zone, THE CramCraft System SHALL accept PDF files, image files (JPG, JPEG, PNG), and text files (TXT, MD)
2. WHEN a user selects multiple files, THE CramCraft System SHALL accept up to 10 files in a single upload session
3. WHEN files are uploading, THE CramCraft System SHALL display progress indicators showing file names and sizes
4. WHEN files are uploaded, THE CramCraft System SHALL display thumbnails or file icons for each uploaded file
5. WHEN a user clicks the Clear All button, THE CramCraft System SHALL remove all uploaded files and reset the interface to initial state

### Requirement 2

**User Story:** As a student, I want my documents automatically processed and text extracted, so that I don't have to manually copy content.

#### Acceptance Criteria

1. WHEN a PDF file is uploaded, THE CramCraft System SHALL extract all text content using the PDF Parser
2. WHEN an image file is uploaded, THE CramCraft System SHALL convert the image to text using the OCR Engine
3. WHEN a text file is uploaded, THE CramCraft System SHALL read the file content directly
4. WHEN text extraction is in progress, THE CramCraft System SHALL display a processing status indicator with the current file name
5. WHEN text extraction completes, THE CramCraft System SHALL display a preview of extracted text for user verification
6. WHEN text extraction completes for all files, THE CramCraft System SHALL store all extracted text in memory for subsequent processing

### Requirement 3

**User Story:** As a student, I want AI-generated revision summaries for each document, so that I can quickly review key concepts without reading everything.

#### Acceptance Criteria

1. WHEN extracted text is available, THE CramCraft System SHALL generate a revision summary using the AI Generator
2. WHEN generating a revision summary, THE CramCraft System SHALL produce 3-5 key concepts as bullet points
3. WHEN generating a revision summary, THE CramCraft System SHALL identify and define important terms
4. WHEN generating a revision summary, THE CramCraft System SHALL create a 2-3 paragraph overview in simple language
5. WHEN generating a revision summary, THE CramCraft System SHALL provide memory aids or mnemonics where applicable
6. WHEN multiple documents are processed, THE CramCraft System SHALL combine all summaries into one cohesive Revision Pack organized by document

### Requirement 4

**User Story:** As a student, I want an AI-generated quiz based on my materials, so that I can test my understanding of the content.

#### Acceptance Criteria

1. WHEN all documents are processed, THE CramCraft System SHALL generate a quiz with 10-15 multiple choice questions using the AI Generator
2. WHEN generating quiz questions, THE CramCraft System SHALL create 4 answer options (A, B, C, D) for each question with only one correct answer
3. WHEN generating quiz questions, THE CramCraft System SHALL include an explanation for why each correct answer is correct
4. WHEN generating quiz questions, THE CramCraft System SHALL distribute difficulty levels as 40% easy, 40% medium, and 20% hard
5. WHEN generating quiz questions, THE CramCraft System SHALL test understanding rather than memorization

### Requirement 5

**User Story:** As a student, I want to take the quiz one question at a time with clear progress tracking, so that I can focus on each question without distraction.

#### Acceptance Criteria

1. WHEN the quiz starts, THE CramCraft System SHALL display one question at a time with clear formatting
2. WHEN a question is displayed, THE CramCraft System SHALL show a progress indicator displaying current question number and total questions
3. WHEN a question is displayed, THE CramCraft System SHALL provide radio buttons for answer selection
4. WHEN no answer is selected, THE CramCraft System SHALL disable the Next Question button
5. WHEN an answer is selected, THE CramCraft System SHALL enable the Next Question button
6. WHEN the last question is reached, THE CramCraft System SHALL display a Submit Quiz button instead of Next Question button
7. WHEN the quiz is in progress, THE CramCraft System SHALL display a timer showing elapsed time

### Requirement 6

**User Story:** As a student, I want detailed quiz results with a readiness assessment, so that I know if I'm prepared for my exam.

#### Acceptance Criteria

1. WHEN a quiz is submitted, THE CramCraft System SHALL calculate and display the overall score as correct answers out of total questions with percentage
2. WHEN the score is 90-100%, THE CramCraft System SHALL display a green status indicator with message "Excellent! You're exam-ready!"
3. WHEN the score is 70-89%, THE CramCraft System SHALL display a yellow status indicator with message "Good progress! Review weak areas below."
4. WHEN the score is 50-69%, THE CramCraft System SHALL display an orange status indicator with message "Getting there. More revision needed."
5. WHEN the score is below 50%, THE CramCraft System SHALL display a red status indicator with message "Study more and retake the quiz."
6. WHEN quiz results are displayed, THE CramCraft System SHALL show a question-by-question breakdown with user's answer versus correct answer
7. WHEN quiz results are displayed, THE CramCraft System SHALL display the explanation for each question
8. WHEN quiz results are displayed, THE CramCraft System SHALL highlight incorrect answers in red and correct answers in green
9. WHEN quiz results are displayed, THE CramCraft System SHALL list topics or concepts where the user answered incorrectly as weak areas
10. WHEN quiz results are displayed, THE CramCraft System SHALL provide a Retry Quiz button to retake the assessment

### Requirement 7

**User Story:** As a student, I want a well-formatted revision pack display, so that I can easily read and navigate my study materials.

#### Acceptance Criteria

1. WHEN the Revision Pack is displayed, THE CramCraft System SHALL use clean typography with proper heading hierarchy
2. WHEN the Revision Pack is displayed, THE CramCraft System SHALL organize content into sections for each document
3. WHEN the Revision Pack is displayed, THE CramCraft System SHALL provide collapsible sections to reduce scrolling
4. WHEN the Revision Pack is displayed, THE CramCraft System SHALL show estimated reading time at the top
5. WHEN multiple topics are detected, THE CramCraft System SHALL apply color-coded tags for different subjects

### Requirement 8

**User Story:** As a student, I want to download my revision pack and quiz results as PDFs, so that I can study offline or print them.

#### Acceptance Criteria

1. WHEN a user requests export, THE CramCraft System SHALL generate a PDF version of the complete Revision Pack
2. WHEN a user requests export, THE CramCraft System SHALL generate a PDF version of quiz results
3. WHEN generating PDF exports, THE CramCraft System SHALL include page breaks between documents
4. WHEN generating PDF exports, THE CramCraft System SHALL include headers and footers
5. WHEN generating PDF exports, THE CramCraft System SHALL apply professional styling

### Requirement 9

**User Story:** As a student, I want clear error messages when something goes wrong, so that I know how to fix the problem.

#### Acceptance Criteria

1. WHEN a file exceeds size limits, THE CramCraft System SHALL display an error message suggesting smaller files
2. WHEN an unsupported file type is uploaded, THE CramCraft System SHALL display a clear error message
3. WHEN the OCR Engine fails to extract text, THE CramCraft System SHALL notify the user that text could not be extracted
4. WHEN the AI Generator encounters an error, THE CramCraft System SHALL show a retry option without losing user's files
5. WHEN no text is extracted from any file, THE CramCraft System SHALL warn the user before attempting to generate a quiz
6. WHEN network issues occur, THE CramCraft System SHALL save state locally and allow the user to resume

### Requirement 10

**User Story:** As a student with accessibility needs, I want the application to be keyboard navigable and screen reader friendly, so that I can use it effectively.

#### Acceptance Criteria

1. WHEN interactive elements are present, THE CramCraft System SHALL provide proper ARIA labels for screen readers
2. WHEN the Quiz Interface is active, THE CramCraft System SHALL support keyboard navigation for answering questions
3. WHEN text is displayed, THE CramCraft System SHALL use high contrast colors for readability
4. WHEN interactive elements receive focus, THE CramCraft System SHALL display clear focus indicators

### Requirement 11

**User Story:** As a student, I want responsive visual feedback during all operations, so that I know the application is working and what it's doing.

#### Acceptance Criteria

1. WHEN any asynchronous operation is in progress, THE CramCraft System SHALL display loading states
2. WHEN a user action completes successfully, THE CramCraft System SHALL display a success message
3. WHEN a user action fails, THE CramCraft System SHALL display an error message
4. WHEN the interface is accessed on different devices, THE CramCraft System SHALL provide responsive design that works on desktop and tablet
