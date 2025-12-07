import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportButtons } from './ExportButtons';
import type { RevisionPack, QuizResults } from '../types';
import * as pdfExport from '../utils/pdfExport';

// Mock the PDF export functions
vi.mock('../utils/pdfExport', () => ({
  exportRevisionPackPDF: vi.fn(),
  exportQuizResultsPDF: vi.fn(),
}));

describe('ExportButtons', () => {
  const mockRevisionPack: RevisionPack = {
    documents: [
      {
        id: '1',
        title: 'Test Document',
        keyConcepts: ['Concept 1', 'Concept 2', 'Concept 3'],
        definitions: [{ term: 'Term', definition: 'Definition' }],
        summary: 'Test summary',
        memoryAids: ['Aid 1'],
        subject: 'Math',
      },
    ],
    totalReadingTime: 10,
    generatedAt: new Date(),
  };

  const mockQuizResults: QuizResults = {
    quiz: {
      id: '1',
      questions: [
        {
          id: 1,
          question: 'Test question?',
          options: ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'],
          correctAnswer: 'A',
          explanation: 'Test explanation',
          difficulty: 'easy',
        },
      ],
      generatedAt: new Date(),
    },
    userAnswers: {
      quizId: '1',
      answers: { 1: 'A' },
      startTime: new Date(),
      endTime: new Date(),
      elapsedSeconds: 60,
    },
    score: 1,
    totalQuestions: 1,
    percentage: 100,
    readinessLevel: 'excellent',
    readinessMessage: "Excellent! You're exam-ready!",
    readinessColor: 'green',
    breakdown: [
      {
        question: {
          id: 1,
          question: 'Test question?',
          options: ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'],
          correctAnswer: 'A',
          explanation: 'Test explanation',
          difficulty: 'easy',
        },
        userAnswer: 'A',
        isCorrect: true,
      },
    ],
    weakAreas: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render export revision pack button when revision pack is provided', () => {
    render(<ExportButtons revisionPack={mockRevisionPack} />);
    
    const button = screen.getByRole('button', { name: /export revision pack/i });
    expect(button).toBeInTheDocument();
  });

  it('should render export quiz results button when quiz results are provided', () => {
    render(<ExportButtons quizResults={mockQuizResults} />);
    
    const button = screen.getByRole('button', { name: /export quiz results/i });
    expect(button).toBeInTheDocument();
  });

  it('should render both buttons when both props are provided', () => {
    render(<ExportButtons revisionPack={mockRevisionPack} quizResults={mockQuizResults} />);
    
    const revisionButton = screen.getByRole('button', { name: /export revision pack/i });
    const quizButton = screen.getByRole('button', { name: /export quiz results/i });
    
    expect(revisionButton).toBeInTheDocument();
    expect(quizButton).toBeInTheDocument();
  });

  it('should not render any buttons when no props are provided', () => {
    const { container } = render(<ExportButtons />);
    
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(0);
  });

  it('should call exportRevisionPackPDF when export revision pack button is clicked', async () => {
    render(<ExportButtons revisionPack={mockRevisionPack} />);
    
    const button = screen.getByRole('button', { name: /export revision pack/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(pdfExport.exportRevisionPackPDF).toHaveBeenCalledWith(mockRevisionPack);
    });
  });

  it('should call exportQuizResultsPDF when export quiz results button is clicked', async () => {
    render(<ExportButtons quizResults={mockQuizResults} />);
    
    const button = screen.getByRole('button', { name: /export quiz results/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(pdfExport.exportQuizResultsPDF).toHaveBeenCalledWith(mockQuizResults);
    });
  });

  it('should show loading state when exporting revision pack', async () => {
    // Make the export function take some time
    vi.mocked(pdfExport.exportRevisionPackPDF).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 200))
    );

    render(<ExportButtons revisionPack={mockRevisionPack} />);
    
    const button = screen.getByRole('button', { name: /export revision pack/i });
    fireEvent.click(button);
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/exporting/i)).toBeInTheDocument();
    });
    
    // Button should be disabled during export
    expect(button).toBeDisabled();
  });

  it('should show loading state when exporting quiz results', async () => {
    // Make the export function take some time
    vi.mocked(pdfExport.exportQuizResultsPDF).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 200))
    );

    render(<ExportButtons quizResults={mockQuizResults} />);
    
    const button = screen.getByRole('button', { name: /export quiz results/i });
    fireEvent.click(button);
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/exporting/i)).toBeInTheDocument();
    });
    
    // Button should be disabled during export
    expect(button).toBeDisabled();
  });

  it('should handle export errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    vi.mocked(pdfExport.exportRevisionPackPDF).mockImplementation(() => {
      throw new Error('Export failed');
    });

    render(<ExportButtons revisionPack={mockRevisionPack} />);
    
    const button = screen.getByRole('button', { name: /export revision pack/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Failed to export revision pack. Please try again.');
    }, { timeout: 2000 });
    
    // Button should be enabled again after error
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
    
    consoleErrorSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('should have proper ARIA labels for accessibility', () => {
    render(<ExportButtons revisionPack={mockRevisionPack} quizResults={mockQuizResults} />);
    
    const revisionButton = screen.getByLabelText('Export revision pack as PDF');
    const quizButton = screen.getByLabelText('Export quiz results as PDF');
    
    expect(revisionButton).toBeInTheDocument();
    expect(quizButton).toBeInTheDocument();
  });
});
