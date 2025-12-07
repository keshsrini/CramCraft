import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Brain, CheckCircle2 } from 'lucide-react';

interface ProcessingViewProps {
  files: File[];
  step: 'extracting' | 'generating-summary' | 'generating-quiz';
  currentFile: string;
}

const steps = [
  { id: 1, name: 'Extract', icon: FileText, description: 'Analyzing document content', color: '#06B6D4' },
  { id: 2, name: 'Summarize', icon: Brain, description: 'Generating key concepts', color: '#D946EF' },
  { id: 3, name: 'Generate Quiz', icon: Sparkles, description: 'Creating questions', color: '#84CC16' },
];

export function ProcessingView({ files, step, currentFile }: ProcessingViewProps) {
  const stepMap = {
    'extracting': 0,
    'generating-summary': 1,
    'generating-quiz': 2,
  };
  
  const currentStep = stepMap[step];
  const progress = ((currentStep + 1) / 3) * 100;

  // Progress is controlled by parent component via step prop

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a_1px,transparent_1px),linear-gradient(to_bottom,#0a0a0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Animated neon circles */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(217,70,239,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            animate={{ 
              rotate: 360,
              boxShadow: [
                '0 0 40px rgba(6,182,212,0.5)',
                '0 0 80px rgba(217,70,239,0.5)',
                '0 0 40px rgba(132,204,22,0.5)',
                '0 0 40px rgba(6,182,212,0.5)',
              ],
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
              boxShadow: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500 via-fuchsia-500 to-lime-500 rounded-full flex items-center justify-center"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 mb-2">
            Creating Your Study Pack
          </h2>
          <p className="text-gray-400">
            {currentFile || 'Processing your documents...'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: 1,
                      boxShadow: index === currentStep 
                        ? [
                            `0 0 20px ${step.color}80`,
                            `0 0 40px ${step.color}`,
                            `0 0 20px ${step.color}80`,
                          ]
                        : index < currentStep
                        ? `0 0 15px ${step.color}60`
                        : 'none',
                    }}
                    transition={{ 
                      scale: { delay: index * 0.2 },
                      boxShadow: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-500 border-2
                      ${index < currentStep 
                        ? 'bg-gradient-to-br text-white' 
                        : index === currentStep
                        ? 'bg-gradient-to-br text-white'
                        : 'bg-gray-900 text-gray-600 border-gray-800'
                      }
                    `}
                    style={
                      index <= currentStep
                        ? {
                            borderColor: step.color,
                            background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)`,
                          }
                        : {}
                    }
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <step.icon className="w-8 h-8" />
                    )}
                  </motion.div>
                  <p className={`text-center transition-colors duration-500 ${
                    index <= currentStep ? 'text-gray-200' : 'text-gray-600'
                  }`}>
                    {step.name}
                  </p>
                  <motion.p
                    animate={{
                      opacity: index === currentStep ? [0.7, 1, 0.7] : 0.5,
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="text-center"
                    style={{
                      color: index === currentStep ? step.color : '#6B7280',
                    }}
                  >
                    {index === currentStep ? step.description : ''}
                  </motion.p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-4 bg-gray-800 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ 
                        width: index < currentStep ? '100%' : index === currentStep ? `${(progress % (100 / steps.length)) * steps.length}%` : '0%'
                      }}
                      transition={{ duration: 0.3 }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${steps[index].color}, ${steps[index + 1].color})`,
                        boxShadow: `0 0 10px ${steps[index].color}`,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400">Overall Progress</span>
            <motion.span
              key={progress}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400"
            >
              {progress}%
            </motion.span>
          </div>
          
          <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #06B6D4, #D946EF, #84CC16)',
                backgroundSize: '200% 100%',
                boxShadow: '0 0 20px rgba(6,182,212,0.6)',
              }}
            >
              <motion.div
                animate={{ 
                  x: ['-100%', '100%'],
                  backgroundPosition: ['0%', '200%'],
                }}
                transition={{ 
                  x: { duration: 1, repeat: Infinity, ease: 'linear' },
                  backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
                }}
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                }}
              />
            </motion.div>
          </div>

          <div className="mt-6 flex items-center justify-between text-gray-500">
            <span>Processing {files.length} {files.length === 1 ? 'file' : 'files'}</span>
            <span>This may take a few minutes...</span>
          </div>
        </div>

        {/* Animated Particles */}
        <div className="relative mt-12 h-32">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 600 - 300,
                y: 0,
                opacity: 0.8,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{ 
                y: -200,
                opacity: 0,
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeOut'
              }}
              className="absolute left-1/2 bottom-0 w-2 h-2 rounded-full"
              style={{
                background: ['#06B6D4', '#D946EF', '#84CC16'][i % 3],
                boxShadow: `0 0 10px ${['#06B6D4', '#D946EF', '#84CC16'][i % 3]}`,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
