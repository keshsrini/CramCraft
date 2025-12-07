import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  AppState,
  UploadedFile,
  ExtractedText,
  RevisionPack,
  Quiz,
  ViewType,
  UserAnswers,
  QuizResults,
} from '../types';

// ============================================================================
// Context Types
// ============================================================================

interface AppContextType {
  // State
  state: AppState;
  
  // File management
  addFiles: (files: UploadedFile[]) => void;
  removeFile: (fileId: string) => void;
  updateFileStatus: (fileId: string, status: UploadedFile['status'], error?: string) => void;
  clearAllFiles: () => void;
  
  // Text extraction
  addExtractedText: (text: ExtractedText) => void;
  clearExtractedTexts: () => void;
  
  // Content generation
  setRevisionPack: (pack: RevisionPack | null) => void;
  setQuiz: (quiz: Quiz | null) => void;
  
  // Quiz state
  quizAnswers: UserAnswers | null;
  setQuizAnswers: (answers: UserAnswers | null) => void;
  quizResults: QuizResults | null;
  setQuizResults: (results: QuizResults | null) => void;
  
  // View navigation
  setCurrentView: (view: ViewType) => void;
  
  // Processing state
  setIsProcessing: (isProcessing: boolean) => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Reset
  resetApp: () => void;
}

// ============================================================================
// Context Creation
// ============================================================================

const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================================================
// Initial State
// ============================================================================

const initialState: AppState = {
  files: [],
  extractedTexts: [],
  revisionPack: null,
  quiz: null,
  currentView: 'upload',
  isProcessing: false,
  error: null,
};

// ============================================================================
// Provider Component
// ============================================================================

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, setState] = useState<AppState>(initialState);
  const [quizAnswers, setQuizAnswers] = useState<UserAnswers | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);

  // File management functions
  const addFiles = (files: UploadedFile[]) => {
    setState((prev) => ({
      ...prev,
      files: [...prev.files, ...files],
    }));
  };

  const removeFile = (fileId: string) => {
    setState((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== fileId),
      extractedTexts: prev.extractedTexts.filter((t) => t.fileId !== fileId),
    }));
  };

  const updateFileStatus = (
    fileId: string,
    status: UploadedFile['status'],
    error?: string
  ) => {
    setState((prev) => ({
      ...prev,
      files: prev.files.map((f) =>
        f.id === fileId ? { ...f, status, error } : f
      ),
    }));
  };

  const clearAllFiles = () => {
    setState((prev) => ({
      ...prev,
      files: [],
      extractedTexts: [],
    }));
  };

  // Text extraction functions
  const addExtractedText = (text: ExtractedText) => {
    setState((prev) => ({
      ...prev,
      extractedTexts: [...prev.extractedTexts, text],
    }));
  };

  const clearExtractedTexts = () => {
    setState((prev) => ({
      ...prev,
      extractedTexts: [],
    }));
  };

  // Content generation functions
  const setRevisionPack = (pack: RevisionPack | null) => {
    setState((prev) => ({
      ...prev,
      revisionPack: pack,
    }));
  };

  const setQuiz = (quiz: Quiz | null) => {
    setState((prev) => ({
      ...prev,
      quiz: quiz,
    }));
  };

  // View navigation
  const setCurrentView = useCallback((view: ViewType) => {
    setState((prev) => ({
      ...prev,
      currentView: view,
    }));
  }, []);

  // Processing state
  const setIsProcessing = (isProcessing: boolean) => {
    setState((prev) => ({
      ...prev,
      isProcessing,
    }));
  };

  // Error handling
  const setError = (error: string | null) => {
    setState((prev) => ({
      ...prev,
      error,
    }));
  };

  const clearError = () => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  };

  // Reset application
  const resetApp = () => {
    setState(initialState);
    setQuizAnswers(null);
    setQuizResults(null);
  };

  const value: AppContextType = {
    state,
    addFiles,
    removeFile,
    updateFileStatus,
    clearAllFiles,
    addExtractedText,
    clearExtractedTexts,
    setRevisionPack,
    setQuiz,
    quizAnswers,
    setQuizAnswers,
    quizResults,
    setQuizResults,
    setCurrentView,
    setIsProcessing,
    setError,
    clearError,
    resetApp,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
