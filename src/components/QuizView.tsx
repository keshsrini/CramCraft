import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import type { Question } from '../types';

interface QuizResult {
  questionId: number;
  selectedAnswer: number;
  correct: boolean;
  timeTaken: number;
}

interface QuizViewProps {
  questions: Question[];
  onComplete: (results: QuizResult[]) => void;
  onBack: () => void;
}

export function QuizView({ questions, onComplete, onBack }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const difficultyColors = {
    easy: { bg: 'bg-lime-500/20', text: 'text-lime-400', border: 'border-lime-500/40', glow: 'rgba(132,204,22,0.4)' },
    medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', glow: 'rgba(245,158,11,0.4)' },
    hard: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40', glow: 'rgba(239,68,68,0.4)' },
  };

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (index: number) => {
    if (!showFeedback) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    // Convert letter answer (A, B, C, D) to index (0, 1, 2, 3)
    const correctIndex = currentQuestion.correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0);
    const isCorrect = selectedAnswer === correctIndex;
    
    // Debug logging
    console.log('🎯 Answer Check:', {
      selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      correctIndex,
      isCorrect
    });

    const result: QuizResult = {
      questionId: currentQuestion.id,
      selectedAnswer,
      correct: isCorrect,
      timeTaken,
    };

    setResults(prev => [...prev, result]);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(results);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setResults(prev => prev.slice(0, -1));
    }
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a_1px,transparent_1px),linear-gradient(to_bottom,#0a0a0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Header */}
      <header className="relative border-b border-cyan-500/20 bg-gray-900/80 backdrop-blur-xl sticky top-0 z-10 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Revision
            </button>
            
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(6,182,212,0.5)',
                    '0 0 40px rgba(6,182,212,0.8)',
                    '0 0 20px rgba(6,182,212,0.5)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Quiz Mode
              </h1>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #06B6D4, #D946EF)',
                boxShadow: '0 0 20px rgba(6,182,212,0.6)',
              }}
            />
          </div>
        </div>
      </header>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <motion.span 
                  animate={{
                    boxShadow: [
                      `0 0 10px ${difficultyColors[currentQuestion.difficulty].glow}`,
                      `0 0 20px ${difficultyColors[currentQuestion.difficulty].glow}`,
                      `0 0 10px ${difficultyColors[currentQuestion.difficulty].glow}`,
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className={`px-3 py-1 rounded-full border ${difficultyColors[currentQuestion.difficulty].bg} ${difficultyColors[currentQuestion.difficulty].text} ${difficultyColors[currentQuestion.difficulty].border}`}
                >
                  {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                </motion.span>
              </div>
              
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <p className="text-gray-200 text-xl leading-relaxed">
                  {currentQuestion.question}
                </p>
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                // Convert letter answer to index for comparison
                const correctIndex = currentQuestion.correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0);
                const isCorrect = index === correctIndex;
                const showCorrect = showFeedback && isCorrect;
                const showIncorrect = showFeedback && isSelected && !isCorrect;

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showFeedback}
                    whileHover={!showFeedback ? { scale: 1.01, x: 5 } : {}}
                    whileTap={!showFeedback ? { scale: 0.99 } : {}}
                    className={`
                      w-full p-6 rounded-xl border-2 text-left transition-all
                      ${showCorrect 
                        ? 'border-lime-500 bg-lime-500/10' 
                        : showIncorrect 
                        ? 'border-red-500 bg-red-500/10'
                        : isSelected 
                        ? 'border-cyan-500 bg-cyan-500/10' 
                        : 'border-gray-800 bg-gray-900/50 hover:border-cyan-500/50 hover:bg-cyan-500/5'
                      }
                      ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    style={{
                      boxShadow: showCorrect 
                        ? '0 0 20px rgba(132,204,22,0.4)'
                        : showIncorrect 
                        ? '0 0 20px rgba(239,68,68,0.4)'
                        : isSelected
                        ? '0 0 20px rgba(6,182,212,0.3)'
                        : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <motion.div
                          animate={
                            showCorrect || showIncorrect
                              ? {
                                  scale: [1, 1.2, 1],
                                }
                              : {}
                          }
                          transition={{ duration: 0.3 }}
                          className={`
                            w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0
                            ${showCorrect 
                              ? 'border-lime-500 bg-lime-500 text-white' 
                              : showIncorrect 
                              ? 'border-red-500 bg-red-500 text-white'
                              : isSelected 
                              ? 'border-cyan-500 bg-cyan-500 text-white' 
                              : 'border-gray-700 text-gray-500'
                            }
                          `}
                          style={{
                            boxShadow: showCorrect
                              ? '0 0 15px rgba(132,204,22,0.6)'
                              : showIncorrect
                              ? '0 0 15px rgba(239,68,68,0.6)'
                              : isSelected
                              ? '0 0 15px rgba(6,182,212,0.6)'
                              : 'none',
                          }}
                        >
                          {showFeedback ? (
                            showCorrect ? (
                              <CheckCircle2 className="w-6 h-6" />
                            ) : showIncorrect ? (
                              <XCircle className="w-6 h-6" />
                            ) : (
                              String.fromCharCode(65 + index)
                            )
                          ) : (
                            String.fromCharCode(65 + index)
                          )}
                        </motion.div>
                        <span className={`
                          ${showCorrect 
                            ? 'text-lime-300' 
                            : showIncorrect 
                            ? 'text-red-300'
                            : isSelected 
                            ? 'text-cyan-300' 
                            : 'text-gray-300'
                          }
                        `}>
                          {option}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback Section */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`
                    rounded-xl p-6 mb-8 border-2
                    ${selectedAnswer === (currentQuestion.correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0))
                      ? 'bg-lime-500/10 border-lime-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                    }
                  `}
                  style={{
                    boxShadow: selectedAnswer === (currentQuestion.correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0))
                      ? '0 0 20px rgba(132,204,22,0.3)'
                      : '0 0 20px rgba(239,68,68,0.3)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    {selectedAnswer === (currentQuestion.correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0)) ? (
                      <CheckCircle2 className="w-6 h-6 text-lime-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`mb-2 ${
                        selectedAnswer === (currentQuestion.correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0))
                          ? 'text-lime-300'
                          : 'text-red-300'
                      }`}>
                        {selectedAnswer === (currentQuestion.correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0))
                          ? 'Correct!'
                          : 'Incorrect'}
                      </p>
                      <p className="text-gray-300">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-800"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              {!showFeedback ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null}
                  animate={{
                    boxShadow: selectedAnswer !== null
                      ? [
                          '0 0 20px rgba(6,182,212,0.5)',
                          '0 0 40px rgba(217,70,239,0.6)',
                          '0 0 20px rgba(6,182,212,0.5)',
                        ]
                      : 'none',
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(6,182,212,0.5)',
                      '0 0 40px rgba(217,70,239,0.6)',
                      '0 0 20px rgba(6,182,212,0.5)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white rounded-xl"
                >
                  {isLastQuestion ? 'View Results' : 'Next Question'}
                  {!isLastQuestion && <ChevronRight className="w-5 h-5" />}
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
