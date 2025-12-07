import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Lightbulb, 
  BookOpen, 
  FileText, 
  Download,
  PlayCircle,
  Clock,
  Sparkles,
  Home
} from 'lucide-react';
import type { DocumentSummary } from '../types';
import { jsPDF } from 'jspdf';

interface RevisionPackProps {
  documents: DocumentSummary[];
  onStartQuiz: () => void;
  onStartOver: () => void;
}

export function RevisionPack({ documents, onStartQuiz, onStartOver }: RevisionPackProps) {
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set([documents[0]?.id]));
  const [activeTab, setActiveTab] = useState<'revision' | 'quiz'>('revision');

  const handleExportPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    const pageHeight = 280;
    const margin = 20;
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(6, 182, 212); // Cyan color
    doc.text('CramCraft Study Pack', margin, yPos);
    yPos += 15;
    
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPos);
    yPos += 20;
    
    documents.forEach((document, docIndex) => {
      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      
      // Document title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(`${docIndex + 1}. ${document.title}`, margin, yPos);
      yPos += 10;
      
      // Subject
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Subject: ${document.subject}`, margin, yPos);
      yPos += 10;
      
      // Key Concepts
      if (document.keyConcepts.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(6, 182, 212);
        doc.text('Key Concepts:', margin, yPos);
        yPos += 7;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        document.keyConcepts.forEach((concept) => {
          if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = 20;
          }
          const lines = doc.splitTextToSize(`• ${concept}`, 170);
          doc.text(lines, margin + 5, yPos);
          yPos += lines.length * 5 + 2;
        });
        yPos += 5;
      }
      
      // Definitions
      if (document.definitions.length > 0) {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(12);
        doc.setTextColor(217, 70, 239); // Fuchsia
        doc.text('Definitions:', margin, yPos);
        yPos += 7;
        
        doc.setFontSize(10);
        document.definitions.forEach((def) => {
          if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = 20;
          }
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text(`${def.term}:`, margin + 5, yPos);
          doc.setFont('helvetica', 'normal');
          const defLines = doc.splitTextToSize(def.definition, 160);
          doc.text(defLines, margin + 10, yPos + 5);
          yPos += defLines.length * 5 + 10;
        });
        yPos += 5;
      }
      
      // Summary
      if (document.summary) {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(12);
        doc.setTextColor(132, 204, 22); // Lime
        doc.text('Summary:', margin, yPos);
        yPos += 7;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const summaryLines = doc.splitTextToSize(document.summary, 170);
        doc.text(summaryLines, margin + 5, yPos);
        yPos += summaryLines.length * 5 + 10;
      }
      
      yPos += 15; // Space between documents
    });
    
    doc.save('cramcraft-study-pack.pdf');
  };

  const toggleDocument = (id: string) => {
    setExpandedDocs(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const neonColors = {
    Science: { main: '#06B6D4', glow: 'rgba(6,182,212,0.4)' },
    Mathematics: { main: '#D946EF', glow: 'rgba(217,70,239,0.4)' },
    History: { main: '#F59E0B', glow: 'rgba(245,158,11,0.4)' },
    Literature: { main: '#84CC16', glow: 'rgba(132,204,22,0.4)' },
  };

  return (
    <div className="min-h-screen pb-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a_1px,transparent_1px),linear-gradient(to_bottom,#0a0a0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Header */}
      <header className="relative border-b border-cyan-500/20 bg-gray-900/80 backdrop-blur-xl sticky top-0 z-10 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
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
            
            <button
              onClick={onStartOver}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors border border-gray-800 hover:border-cyan-500/30"
            >
              <Home className="w-5 h-5" />
              Start Over
            </button>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-8 bg-gray-900/80 backdrop-blur-sm rounded-xl p-2 border border-cyan-500/20 w-fit shadow-[0_0_20px_rgba(6,182,212,0.1)]"
        >
          <button
            onClick={() => setActiveTab('revision')}
            className={`
              relative px-6 py-3 rounded-lg transition-all
              ${activeTab === 'revision' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}
            `}
          >
            {activeTab === 'revision' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg"
                style={{
                  boxShadow: '0 0 20px rgba(6,182,212,0.6)',
                }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Revision Pack
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('quiz')}
            className={`
              relative px-6 py-3 rounded-lg transition-all
              ${activeTab === 'quiz' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}
            `}
          >
            {activeTab === 'quiz' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg"
                style={{
                  boxShadow: '0 0 20px rgba(6,182,212,0.6)',
                }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              Quiz
            </span>
          </button>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'revision' ? (
            <motion.div
              key="revision"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Actions Bar */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  Your Study Materials
                </h2>
                <button 
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors border border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  <Download className="w-5 h-5" />
                  Export PDF
                </button>
              </div>

              {/* Document Cards */}
              <div className="space-y-4">
                {documents.map((doc, index) => {
                  const colors = neonColors[doc.subject as keyof typeof neonColors] || neonColors.Science;
                  
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border overflow-hidden"
                      style={{
                        borderColor: `${colors.main}40`,
                        boxShadow: expandedDocs.has(doc.id) ? `0 0 30px ${colors.glow}` : `0 0 15px ${colors.glow}`,
                      }}
                    >
                      {/* Document Header */}
                      <button
                        onClick={() => toggleDocument(doc.id)}
                        className="w-full p-6 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <motion.div 
                            animate={{
                              boxShadow: [
                                `0 0 10px ${colors.glow}`,
                                `0 0 20px ${colors.glow}`,
                                `0 0 10px ${colors.glow}`,
                              ],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                            className="w-12 h-12 rounded-lg flex items-center justify-center border"
                            style={{ 
                              backgroundColor: `${colors.main}20`,
                              borderColor: `${colors.main}60`,
                            }}
                          >
                            <FileText className="w-6 h-6" style={{ color: colors.main }} />
                          </motion.div>
                          
                          <div className="text-left">
                            <h3 className="text-gray-200 mb-1">{doc.title}</h3>
                            <div className="flex items-center gap-3">
                              <motion.span 
                                whileHover={{ scale: 1.05 }}
                                className="px-3 py-1 rounded-full text-white border"
                                style={{ 
                                  backgroundColor: `${colors.main}40`,
                                  borderColor: colors.main,
                                  boxShadow: `0 0 10px ${colors.glow}`,
                                }}
                              >
                                {doc.subject}
                              </motion.span>
                              <span className="flex items-center gap-1 text-gray-400">
                                <Clock className="w-4 h-4" />
                                {doc.readingTime} min read
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <motion.div
                          animate={{ rotate: expandedDocs.has(doc.id) ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="w-6 h-6 text-gray-500" />
                        </motion.div>
                      </button>

                      {/* Expandable Content */}
                      <AnimatePresence>
                        {expandedDocs.has(doc.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t"
                            style={{ borderColor: `${colors.main}30` }}
                          >
                            <div className="p-6 space-y-8">
                              {/* Key Concepts */}
                              <div>
                                <h4 className="text-gray-200 mb-4 flex items-center gap-2">
                                  <motion.div
                                    animate={{
                                      boxShadow: [
                                        '0 0 10px rgba(6,182,212,0.4)',
                                        '0 0 20px rgba(6,182,212,0.6)',
                                        '0 0 10px rgba(6,182,212,0.4)',
                                      ],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: 'easeInOut',
                                    }}
                                    className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-500/40"
                                  >
                                    <Sparkles className="w-5 h-5 text-cyan-400" />
                                  </motion.div>
                                  Key Concepts
                                </h4>
                                <ul className="space-y-2">
                                  {doc.keyConcepts.map((concept, i) => (
                                    <motion.li
                                      key={i}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: i * 0.1 }}
                                      className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-cyan-500/30 transition-colors"
                                    >
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5"
                                        style={{
                                          boxShadow: '0 0 10px rgba(6,182,212,0.5)',
                                        }}
                                      >
                                        {i + 1}
                                      </motion.div>
                                      <span className="text-gray-300">{concept}</span>
                                    </motion.li>
                                  ))}
                                </ul>
                              </div>

                              {/* Definitions */}
                              <div>
                                <h4 className="text-gray-200 mb-4 flex items-center gap-2">
                                  <motion.div
                                    animate={{
                                      boxShadow: [
                                        '0 0 10px rgba(217,70,239,0.4)',
                                        '0 0 20px rgba(217,70,239,0.6)',
                                        '0 0 10px rgba(217,70,239,0.4)',
                                      ],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: 'easeInOut',
                                    }}
                                    className="w-8 h-8 bg-fuchsia-500/20 rounded-lg flex items-center justify-center border border-fuchsia-500/40"
                                  >
                                    <BookOpen className="w-5 h-5 text-fuchsia-400" />
                                  </motion.div>
                                  Key Definitions
                                </h4>
                                <div className="space-y-3">
                                  {doc.definitions.map((def, i) => (
                                    <motion.div
                                      key={i}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: i * 0.1 }}
                                      whileHover={{ scale: 1.01 }}
                                      className="p-4 bg-fuchsia-500/5 rounded-xl border border-fuchsia-500/20 hover:border-fuchsia-500/40 transition-colors"
                                      style={{
                                        boxShadow: '0 0 10px rgba(217,70,239,0.1)',
                                      }}
                                    >
                                      <p className="text-gray-200 mb-2">{def.term}</p>
                                      <p className="text-gray-400">{def.definition}</p>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>

                              {/* Summary */}
                              <div>
                                <h4 className="text-gray-200 mb-4 flex items-center gap-2">
                                  <motion.div
                                    animate={{
                                      boxShadow: [
                                        '0 0 10px rgba(132,204,22,0.4)',
                                        '0 0 20px rgba(132,204,22,0.6)',
                                        '0 0 10px rgba(132,204,22,0.4)',
                                      ],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: 'easeInOut',
                                    }}
                                    className="w-8 h-8 bg-lime-500/20 rounded-lg flex items-center justify-center border border-lime-500/40"
                                  >
                                    <FileText className="w-5 h-5 text-lime-400" />
                                  </motion.div>
                                  Summary
                                </h4>
                                <p className="text-gray-300 leading-relaxed p-4 bg-lime-500/5 rounded-xl border border-lime-500/20"
                                  style={{
                                    boxShadow: '0 0 10px rgba(132,204,22,0.1)',
                                  }}
                                >
                                  {doc.summary}
                                </p>
                              </div>

                              {/* Memory Aids */}
                              <div>
                                <h4 className="text-gray-200 mb-4 flex items-center gap-2">
                                  <motion.div
                                    animate={{
                                      boxShadow: [
                                        '0 0 10px rgba(245,158,11,0.4)',
                                        '0 0 20px rgba(245,158,11,0.6)',
                                        '0 0 10px rgba(245,158,11,0.4)',
                                      ],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: 'easeInOut',
                                    }}
                                    className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center border border-amber-500/40"
                                  >
                                    <Lightbulb className="w-5 h-5 text-amber-400" />
                                  </motion.div>
                                  Memory Aids
                                </h4>
                                <div className="space-y-2">
                                  {doc.memoryAids.map((aid, i) => (
                                    <motion.div
                                      key={i}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: i * 0.1 }}
                                      className="flex items-start gap-3 p-3 bg-amber-500/5 rounded-lg border border-amber-500/20 hover:border-amber-500/40 transition-colors"
                                      style={{
                                        boxShadow: '0 0 10px rgba(245,158,11,0.1)',
                                      }}
                                    >
                                      <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                      <span className="text-gray-300">{aid}</span>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto text-center py-16"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 40px rgba(6,182,212,0.4)',
                    '0 0 80px rgba(217,70,239,0.6)',
                    '0 0 40px rgba(6,182,212,0.4)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-fuchsia-500 rounded-full flex items-center justify-center"
              >
                <PlayCircle className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 mb-4">
                Ready to Test Your Knowledge?
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Challenge yourself with an interactive quiz based on your study materials. Track your progress and identify areas for improvement.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartQuiz}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(6,182,212,0.5)',
                    '0 0 40px rgba(217,70,239,0.7)',
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
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white rounded-xl flex items-center gap-2 mx-auto"
              >
                <PlayCircle className="w-6 h-6" />
                Start Quiz
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
