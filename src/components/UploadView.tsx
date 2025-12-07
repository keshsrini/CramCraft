import { useState, useRef } from 'react';
import { Upload, FileText, Image, X, Sparkles, Zap, Brain, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadViewProps {
  onFilesUploaded: (files: File[]) => void;
}

export function UploadView({ onFilesUploaded }: UploadViewProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf' || file.type.startsWith('image/')
    );
    
    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    if (files.length > 0) {
      onFilesUploaded(files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a_1px,transparent_1px),linear-gradient(to_bottom,#0a0a0a_1px,transparent_1px)] bg-[size:4rem_4rem]">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-fuchsia-500/5" />
      </div>

      {/* Floating neon orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[100px]"
        />
      </div>

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
              CramCraft
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-4 px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/30"
            style={{
              boxShadow: '0 0 20px rgba(6,182,212,0.3)',
            }}
          >
            AI-Powered Study Companion
          </motion.div>
          <motion.h2
            className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-400 mb-4"
            animate={{
              backgroundPosition: ['0%', '100%', '0%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              backgroundSize: '200% auto',
            }}
          >
            Transform Your PDFs into<br />Smart Study Materials
          </motion.h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Upload your documents and let AI create comprehensive revision packs, summaries, and interactive quizzes to help you learn faster and retain more.
          </p>
        </motion.div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-3xl mx-auto mb-12"
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
              transition-all duration-300 bg-gray-900/50 backdrop-blur-sm
              ${isDragging 
                ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)] scale-105' 
                : 'border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <motion.div
              animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(6,182,212,0.3)',
                    '0 0 40px rgba(6,182,212,0.6)',
                    '0 0 20px rgba(6,182,212,0.3)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center"
              >
                <Upload className="w-8 h-8 text-white" />
              </motion.div>
              
              <h3 className="text-gray-200 mb-2">
                Drop your files here, or <span className="text-cyan-400">browse</span>
              </h3>
              <p className="text-gray-500 mb-4">
                Support for PDF documents and images
              </p>
              
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span>PDF</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Image className="w-5 h-5 text-fuchsia-400" />
                  <span>Images</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* File Previews */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 space-y-3"
              >
                {files.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                  >
                    <motion.div
                      animate={{
                        boxShadow: [
                          '0 0 10px rgba(6,182,212,0.3)',
                          '0 0 20px rgba(6,182,212,0.5)',
                          '0 0 10px rgba(6,182,212,0.3)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-cyan-500/30"
                    >
                      {file.type === 'application/pdf' ? (
                        <FileText className="w-6 h-6 text-cyan-400" />
                      ) : (
                        <Image className="w-6 h-6 text-fuchsia-400" />
                      )}
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 truncate">{file.name}</p>
                      <p className="text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generate Button */}
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(6,182,212,0.5)',
                    '0 0 40px rgba(6,182,212,0.8)',
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
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <Sparkles className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Generate Study Pack</span>
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: Brain,
              title: 'Smart Summaries',
              description: 'AI-powered extraction of key concepts, definitions, and memory aids from your documents',
              gradient: 'from-cyan-500 to-blue-500',
              glow: 'rgba(6,182,212,0.3)',
            },
            {
              icon: Target,
              title: 'Interactive Quizzes',
              description: 'Test your knowledge with automatically generated questions tailored to your materials',
              gradient: 'from-fuchsia-500 to-purple-500',
              glow: 'rgba(217,70,239,0.3)',
            },
            {
              icon: Zap,
              title: 'Learn Faster',
              description: 'Efficient study techniques and spaced repetition to maximize retention and save time',
              gradient: 'from-lime-500 to-emerald-500',
              glow: 'rgba(132,204,22,0.3)',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="text-center p-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 relative group"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    `0 0 20px ${feature.glow}`,
                    `0 0 40px ${feature.glow}`,
                    `0 0 20px ${feature.glow}`,
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.3,
                }}
                className={`w-14 h-14 mx-auto mb-4 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center`}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="text-gray-200 mb-2">{feature.title}</h3>
              <p className="text-gray-500">
                {feature.description}
              </p>
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  boxShadow: `0 0 30px ${feature.glow}`,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
