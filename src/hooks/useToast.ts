import { useState, useCallback } from 'react';
import type { ToastType } from '../components/Toast';
import type { ToastMessage } from '../components/ToastContainer';

export interface UseToastReturn {
  toasts: ToastMessage[];
  showToast: (message: string, type: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

/**
 * Hook for managing toast notifications
 * Provides functions to show success, error, and info messages
 */
export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastMessage = { id, message, type };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const showSuccess = useCallback(
    (message: string) => {
      showToast(message, 'success');
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string) => {
      showToast(message, 'error');
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string) => {
      showToast(message, 'info');
    },
    [showToast]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    removeToast,
    clearAllToasts,
  };
}
