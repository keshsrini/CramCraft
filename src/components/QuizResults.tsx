import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  RotateCcw, 
  ArrowLeft, 
  ChevronDown,
  CheckCircle2,
  XCircle,
  Sparkles,
  Clock,
  Target
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Question } from '../types';

interface QuizResult {
  questionId: number;
  correct: boolean;
  timeTaken: number;
}

interface QuizResultsProps {
  questions: Question[];
  results: QuizResult[];
  onRetake: () => void;
  onBackToRevision: () => void;
}

export function QuizResults({ questions, results, onRetake, onBackToRevision }: QuizResultsProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  const correctCount = results.filter(r => r.correct).length;
  const score = Math.round((correctCount / results.length) * 100);
  const totalTime = results.reduce((acc, r) => acc + r.timeTaken, 0);
  const passed = score >= 70;

  // Performance by difficulty
  const difficultyStats = questions.reduce((acc, q, i) => {
    const result = results[i];
    if (!acc[q.difficulty]) {
      acc[q.difficulty] = { correct: 0, total: 0 };
    }
    acc[q.difficulty].total++;
    if (result?.correct) {
      acc[q.difficulty].correct++;
    }
    return acc;
  }, {} as Record<string, { correct: number; total: number }>);

  const pieData = [
    { name: 'Correct', value: correctCount, color: '#84CC16' },
    { name: 'Incorrect', value: results.length - correctCount, color: '#EF4444' },
  ];

  const difficultyData = Object.entries(difficultyStats).map(([difficulty, stats]) => ({
    name: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
    value: Math.round((stats.correct / stats.total) * 100),
    color: difficulty === 'easy' ? '#84CC16' : difficulty === 'medium' ? '#F59E0B' : '#EF4444',
  }));

  return (
    <div className="min-h-screen pb-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a_1px,transparent_1px),linear-gradient(to_bottom,#0a0a0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Confetti Effect */}
      {showConfetti && passed && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: -20,
                rotate: 0,
                opacity: 1,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: (typeof window !== 'undefined' ? window.innerHeight : 1000) + 20,
                rotate: Math.random() * 720,
                opacity: 0,
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                delay: Math.random() * 0.5,
                ease: 'linear',
              }}
              onAnimationComplete={() => {
                if (i === 49) setShowConfetti(false);
              }}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 8 + 4 + 'px',
                height: Math.random() * 8 + 4 + 'px',
                backgroundColor: ['#06B6D4', '#84CC16', '#F59E0B', '#EF4444', '#D946EF'][i % 5],
                boxShadow: `0 0 10px ${['#06B6D4', '#84CC16', '#F59E0B', '#EF4444', '#D946EF'][i % 5]}`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className="relative border-b border-cyan-500/20 bg-gray-900/80 backdrop-blur-xl shadow-[0_0_15px_rgba(6,182,212,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
              Quiz Results
            </h1>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Score Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto mb-12 text-center"
        >
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-3xl p-12 border shadow-lg"
            style={{
              borderColor: passed ? '#84CC1660' : '#F59E0B60',
              boxShadow: passed 
                ? '0 0 40px rgba(132,204,22,0.3)'
                : '0 0 40px rgba(245,158,11,0.3)',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: passed 
                  ? 'linear-gradient(135deg, #84CC16, #10B981)'
                  : 'linear-gradient(135deg, #F59E0B, #EF4444)',
                boxShadow: passed
                  ? '0 0 60px rgba(132,204,22,0.6)'
                  : '0 0 60px rgba(245,158,11,0.6)',
              }}
            >
              <Trophy className="w-16 h-16 text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 mb-2">
                {passed ? 'Great Job!' : 'Keep Practicing!'}
              </h2>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400 mb-4"
                style={{ fontSize: '4rem', lineHeight: 1 }}
              >
                {score}%
              </motion.p>
              <p className="text-gray-300 mb-2">
                {correctCount} out of {results.length} questions correct
              </p>
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Completed in {Math.floor(totalTime / 60)}m {totalTime % 60}s</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Performance Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Overall Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20"
            style={{
              boxShadow: '0 0 20px rgba(6,182,212,0.2)',
            }}
          >
            <h3 className="text-gray-200 mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-cyan-400" />
              Overall Performance
            </h3>
            <div className="h-64" style={{ minHeight: '256px', minWidth: '200px' }}>
              <ResponsiveContainer width="100%" height={256}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #06B6D440',
                      borderRadius: '0.5rem',
                      color: '#E5E7EB',
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      color: '#E5E7EB',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Difficulty Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-fuchsia-500/20"
            style={{
              boxShadow: '0 0 20px rgba(217,70,239,0.2)',
            }}
          >
            <h3 className="text-gray-200 mb-6">Performance by Difficulty</h3>
            <div className="space-y-6">
              {difficultyData.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">{item.name}</span>
                    <span className="text-gray-200">{item.value}%</span>
                  </div>
                  <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className="absolute top-0 left-0 h-full rounded-full"
                      style={{ 
                        backgroundColor: item.color,
                        boxShadow: `0 0 10px ${item.color}80`,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Question Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 mb-6">
            Question Review
          </h3>
          <div className="space-y-3">
            {questions.map((question, index) => {
              const result = results[index];
              const isExpanded = expandedQuestion === question.id;

              return (
                <div
                  key={question.id}
                  className="bg-gray-900/80 backdrop-blur-sm rounded-xl border overflow-hidden"
                  style={{
                    borderColor: result?.correct ? '#84CC1640' : '#EF444460',
                    boxShadow: result?.correct 
                      ? '0 0 15px rgba(132,204,22,0.2)'
                      : '0 0 15px rgba(239,68,68,0.2)',
                  }}
                >
                  <button
                    onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {result?.correct ? (
                        <CheckCircle2 className="w-6 h-6 text-lime-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                      )}
                      <div className="text-left">
                        <p className="text-gray-200 mb-1">Question {index + 1}</p>
                        <p className="text-gray-400">{question.question}</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-6 h-6 text-gray-500" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-800"
                      >
                        <div className="p-6 space-y-3">
                          {question.options.map((option, optIndex) => {
                            const isCorrect = optIndex === question.correctAnswer;
                            const wasSelected = optIndex === result?.selectedAnswer;

                            return (
                              <div
                                key={optIndex}
                                className={`
                                  p-4 rounded-lg border-2
                                  ${isCorrect 
                                    ? 'border-lime-500 bg-lime-500/10' 
                                    : wasSelected 
                                    ? 'border-red-500 bg-red-500/10'
                                    : 'border-gray-800 bg-gray-800/50'
                                  }
                                `}
                                style={{
                                  boxShadow: isCorrect
                                    ? '0 0 15px rgba(132,204,22,0.3)'
                                    : wasSelected
                                    ? '0 0 15px rgba(239,68,68,0.3)'
                                    : 'none',
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`
                                    w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                    ${isCorrect 
                                      ? 'border-lime-500 bg-lime-500 text-white' 
                                      : wasSelected 
                                      ? 'border-red-500 bg-red-500 text-white'
                                      : 'border-gray-700 text-gray-500'
                                    }
                                  `}
                                  style={{
                                    boxShadow: isCorrect
                                      ? '0 0 10px rgba(132,204,22,0.6)'
                                      : wasSelected
                                      ? '0 0 10px rgba(239,68,68,0.6)'
                                      : 'none',
                                  }}
                                  >
                                    {String.fromCharCode(65 + optIndex)}
                                  </span>
                                  <span className={
                                    isCorrect 
                                      ? 'text-lime-300' 
                                      : wasSelected 
                                      ? 'text-red-300'
                                      : 'text-gray-400'
                                  }>
                                    {option}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          
                          <div className="mt-4 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30"
                            style={{
                              boxShadow: '0 0 15px rgba(6,182,212,0.2)',
                            }}
                          >
                            <p className="text-cyan-400 mb-1">Explanation:</p>
                            <p className="text-gray-300">{question.explanation}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex items-center justify-center gap-4 flex-wrap"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetake}
            animate={{
              boxShadow: [
                '0 0 20px rgba(6,182,212,0.5)',
                '0 0 40px rgba(217,70,239,0.6)',
                '0 0 20px rgba(6,182,212,0.5)',
              ],
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white rounded-xl"
          >
            <RotateCcw className="w-5 h-5" />
            Retake Quiz
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBackToRevision}
            className="flex items-center gap-2 px-8 py-4 bg-gray-900 border-2 border-cyan-500/30 text-gray-200 rounded-xl hover:bg-gray-800 hover:border-cyan-500/50 transition-colors"
            style={{
              boxShadow: '0 0 15px rgba(6,182,212,0.2)',
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Revision Pack
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
