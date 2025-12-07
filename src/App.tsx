import { useState } from 'react';
import { UploadView } from './components/UploadView';
import { ProcessingView } from './components/ProcessingView';
import { RevisionPack } from './components/RevisionPack';
import { QuizView } from './components/QuizView';
import { QuizResults } from './components/QuizResults';
import { Toast } from './components/ui/Toast';
import { extractText } from './utils/textExtraction';
import { aggregateRevisionPack, generateQuiz } from './utils/aiGeneration';
import type { DocumentSummary, Quiz, ExtractedText } from './types';

type ViewType = 'upload' | 'processing' | 'revision' | 'quiz' | 'results';

interface QuizResult {
  questionId: number;
  correct: boolean;
  timeSpent: number;
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [processingStep, setProcessingStep] = useState<'extracting' | 'generating-summary' | 'generating-quiz'>('extracting');
  const [currentFile, setCurrentFile] = useState<string>('');
  const [error, setError] = useState<string>('');

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleFilesUploaded = async (files: File[]) => {
    setUploadedFiles(files);
    setCurrentView('processing');
    setError('');

    try {
      // Step 1: Extract text from files
      setProcessingStep('extracting');
      
      const extractedTexts: ExtractedText[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFile(`Extracting text from ${file.name}...`);
        
        try {
          const extracted = await extractText(file, `file-${i}`);
          extractedTexts.push(extracted);
        } catch (err) {
          console.error(`Failed to extract text from ${file.name}:`, err);
          // Continue with other files
        }
      }
      
      if (extractedTexts.length === 0) {
        throw new Error('No text could be extracted from your files');
      }

      // Step 2: Generate revision pack
      setProcessingStep('generating-summary');
      setCurrentFile('Generating AI summaries...');
      
      const revisionPack = await aggregateRevisionPack(extractedTexts);
      setDocuments(revisionPack.documents);

      // Step 3: Generate quiz
      setProcessingStep('generating-quiz');
      setCurrentFile('Creating quiz questions...');
      
      // Wait 5 seconds to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const generatedQuiz = await generateQuiz(extractedTexts);
      setQuiz(generatedQuiz);

      // Success!
      setCurrentView('revision');
      showToast('Study pack generated successfully!', 'success');
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMsg);
      showToast(`Failed to process files: ${errorMsg}`, 'error');
      // Still go to revision if we have documents
      if (documents.length > 0) {
        setCurrentView('revision');
      } else {
        setCurrentView('upload');
      }
    }
  };

  const handleStartQuiz = () => {
    if (!quiz || quiz.questions.length === 0) {
      showToast('No quiz available. Please generate study materials first.', 'error');
      return;
    }
    setQuizResults([]);
    setCurrentView('quiz');
  };

  const handleQuizComplete = (results: QuizResult[]) => {
    setQuizResults(results);
    setCurrentView('results');
  };

  const handleRetakeQuiz = () => {
    setQuizResults([]);
    setCurrentView('quiz');
  };

  const handleBackToRevision = () => {
    setCurrentView('revision');
  };

  const handleStartOver = () => {
    setUploadedFiles([]);
    setDocuments([]);
    setQuiz(null);
    setQuizResults([]);
    setError('');
    setCurrentView('upload');
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {currentView === 'upload' && (
        <UploadView onFilesUploaded={handleFilesUploaded} />
      )}
      
      {currentView === 'processing' && (
        <ProcessingView 
          files={uploadedFiles}
          step={processingStep}
          currentFile={currentFile}
        />
      )}
      
      {currentView === 'revision' && (
        <RevisionPack 
          documents={documents} 
          onStartQuiz={handleStartQuiz}
          onStartOver={handleStartOver}
        />
      )}
      
      {currentView === 'quiz' && quiz && (
        <QuizView 
          questions={quiz.questions}
          onComplete={handleQuizComplete}
          onBack={handleBackToRevision}
        />
      )}
      
      {currentView === 'results' && quiz && (
        <QuizResults 
          questions={quiz.questions}
          results={quizResults}
          onRetake={handleRetakeQuiz}
          onBackToRevision={handleBackToRevision}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
