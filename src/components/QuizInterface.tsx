import { useState, useEffect } from 'react';
import type { Quiz, AnswerOption, UserAnswers } from '../types';

export interface QuizInterfaceProps {
  quiz: Quiz;
  onQuizComplete: (answers: UserAnswers) => void;
}

export function QuizInterface({ quiz, onQuizComplete }: QuizInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerOption | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, AnswerOption>>({});
  const [startTime] = useState<Date>(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const currentQ = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  // Load saved answer for current question
  useEffect(() => {
    const savedAnswer = userAnswers[currentQ.id];
    setSelectedAnswer(savedAnswer || null);
  }, [currentQuestion, currentQ.id, userAnswers]);

  const handleAnswerSelect = (answer: AnswerOption) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (selectedAnswer) {
      // Save the answer
      setUserAnswers((prev) => ({
        ...prev,
        [currentQ.id]: selectedAnswer,
      }));

      // Move to next question
      if (!isLastQuestion) {
        setCurrentQuestion((prev) => prev + 1);
      }
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer) {
      // Save the final answer
      const finalAnswers = {
        ...userAnswers,
        [currentQ.id]: selectedAnswer,
      };

      const endTime = new Date();
      const elapsedSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      const userAnswersData: UserAnswers = {
        quizId: quiz.id,
        answers: finalAnswers,
        startTime,
        endTime,
        elapsedSeconds,
      };

      onQuizComplete(userAnswersData);
    }
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Number keys 1-4 to select answers A-D
    if (e.key >= '1' && e.key <= '4') {
      const answerMap: Record<string, AnswerOption> = {
        '1': 'A',
        '2': 'B',
        '3': 'C',
        '4': 'D',
      };
      handleAnswerSelect(answerMap[e.key]);
      e.preventDefault();
    }
    // Arrow keys to select answers
    else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const options: AnswerOption[] = ['A', 'B', 'C', 'D'];
      const currentIndex = selectedAnswer ? options.indexOf(selectedAnswer) : -1;
      
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        handleAnswerSelect(options[currentIndex - 1]);
      } else if (e.key === 'ArrowDown' && currentIndex < options.length - 1) {
        handleAnswerSelect(options[currentIndex + 1]);
      } else if (e.key === 'ArrowDown' && currentIndex === -1) {
        handleAnswerSelect(options[0]);
      }
      e.preventDefault();
    }
    // Enter to submit/next
    else if (e.key === 'Enter' && selectedAnswer) {
      if (isLastQuestion) {
        handleSubmit();
      } else {
        handleNext();
      }
      e.preventDefault();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6" onKeyDown={handleKeyDown}>
      {/* Header with timer and progress */}
      <div className="mb-6 md:mb-8">
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Quiz</h1>
          <div
            className="text-base md:text-lg font-semibold text-blue-600"
            data-testid="quiz-timer"
            aria-live="polite"
            aria-label={`Elapsed time: ${formatTime(elapsedTime)}`}
          >
            ⏱️ {formatTime(elapsedTime)}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span data-testid="progress-text">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Quiz progress: ${Math.round(progress)}%`}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-8 mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6" data-testid="question-text">
          {currentQ.question}
        </h2>
        
        {/* Keyboard shortcuts hint */}
        <div className="text-xs text-gray-500 mb-4 flex flex-wrap items-center gap-1 md:gap-2">
          <span className="hidden sm:inline">💡 Keyboard shortcuts:</span>
          <span className="px-2 py-0.5 bg-gray-100 rounded">1-4</span>
          <span>or</span>
          <span className="px-2 py-0.5 bg-gray-100 rounded">↑↓</span>
          <span className="hidden sm:inline">to select,</span>
          <span className="px-2 py-0.5 bg-gray-100 rounded">Enter</span>
          <span className="hidden sm:inline">to continue</span>
        </div>

        {/* Answer options */}
        <div className="space-y-2 md:space-y-3" role="radiogroup" aria-label="Answer options">
          {(['A', 'B', 'C', 'D'] as AnswerOption[]).map((option) => {
            const optionText = currentQ.options.find((o) => o.startsWith(`${option})`));
            const isSelected = selectedAnswer === option;

            return (
              <label
                key={option}
                className={`flex items-start md:items-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
                data-testid={`option-${option}`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={isSelected}
                  onChange={() => handleAnswerSelect(option)}
                  className="w-4 h-4 md:w-5 md:h-5 mt-0.5 md:mt-0 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  aria-label={optionText || option}
                />
                <span className="ml-2 md:ml-3 text-sm md:text-base text-gray-700">{optionText}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-end">
        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className={`px-6 md:px-8 py-2 md:py-3 text-sm md:text-base rounded-lg font-semibold transition-all ${
              selectedAnswer
                ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-300'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            data-testid="submit-button"
            aria-label="Submit quiz"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className={`px-6 md:px-8 py-2 md:py-3 text-sm md:text-base rounded-lg font-semibold transition-all ${
              selectedAnswer
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            data-testid="next-button"
            aria-label="Next question"
          >
            <span className="hidden sm:inline">Next Question →</span>
            <span className="sm:hidden">Next →</span>
          </button>
        )}
      </div>
    </div>
  );
}
