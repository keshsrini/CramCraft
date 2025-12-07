import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onClose();
      }
    }, 10);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
  };

  const colors = {
    success: {
      bg: 'bg-lime-500/10',
      border: 'border-lime-500/40',
      text: 'text-lime-300',
      icon: 'text-lime-400',
      progress: 'bg-lime-500',
      glow: 'rgba(132,204,22,0.4)',
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/40',
      text: 'text-red-300',
      icon: 'text-red-400',
      progress: 'bg-red-500',
      glow: 'rgba(239,68,68,0.4)',
    },
    info: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/40',
      text: 'text-cyan-300',
      icon: 'text-cyan-400',
      progress: 'bg-cyan-500',
      glow: 'rgba(6,182,212,0.4)',
    },
  };

  const Icon = icons[type];
  const colorScheme = colors[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.8 }}
        className="fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]"
      >
        <motion.div
          animate={{
            boxShadow: [
              `0 0 20px ${colorScheme.glow}`,
              `0 0 40px ${colorScheme.glow}`,
              `0 0 20px ${colorScheme.glow}`,
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`${colorScheme.bg} backdrop-blur-sm ${colorScheme.border} border-2 rounded-xl shadow-lg overflow-hidden`}
        >
          <div className="p-4 flex items-start gap-3">
            <Icon className={`w-6 h-6 ${colorScheme.icon} flex-shrink-0 mt-0.5`} />
            <p className={`flex-1 ${colorScheme.text}`}>{message}</p>
            <button
              onClick={onClose}
              className={`${colorScheme.icon} hover:opacity-70 transition-opacity`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="h-1 bg-gray-900">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              className={`h-full ${colorScheme.progress}`}
              style={{
                boxShadow: `0 0 10px ${colorScheme.glow}`,
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
