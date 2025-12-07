// Network error handling utilities for CramCraft
// Detects network failures and manages state persistence

import { saveState, loadState } from './stateRecovery';
import { getNetworkErrorMessage } from './errorHandling';
import type { UploadedFile, ExtractedText } from '../types';

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    // Check for common network error patterns
    return (
      error.message.includes('network') ||
      error.message.includes('Network') ||
      error.message.includes('fetch') ||
      error.message.includes('Failed to fetch') ||
      error.name === 'NetworkError' ||
      error.name === 'TypeError' && error.message.includes('fetch')
    );
  }
  return false;
}

/**
 * Check if browser is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Handle network error by saving state
 */
export function handleNetworkError(
  files: UploadedFile[],
  extractedTexts: ExtractedText[]
): string {
  // Save state to localStorage
  saveState(files, extractedTexts);
  
  // Return user-friendly error message
  return getNetworkErrorMessage();
}

/**
 * Attempt to recover from network error
 * Returns saved state if available
 */
export function recoverFromNetworkError(): {
  files: UploadedFile[];
  extractedTexts: ExtractedText[];
} | null {
  const savedState = loadState();
  
  if (!savedState) {
    return null;
  }
  
  return {
    files: savedState.files,
    extractedTexts: savedState.extractedTexts,
  };
}

/**
 * Set up online/offline event listeners
 */
export function setupNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

/**
 * Wait for network to come back online
 */
export function waitForOnline(timeoutMs: number = 30000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve(true);
      return;
    }
    
    const timeout = setTimeout(() => {
      cleanup();
      resolve(false);
    }, timeoutMs);
    
    const onlineHandler = () => {
      cleanup();
      resolve(true);
    };
    
    const cleanup = () => {
      clearTimeout(timeout);
      window.removeEventListener('online', onlineHandler);
    };
    
    window.addEventListener('online', onlineHandler);
  });
}
