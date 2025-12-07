// State recovery utilities for CramCraft
// Handles saving and restoring application state on errors

import type { UploadedFile, ExtractedText } from '../types';

export interface SavedState {
  files: UploadedFile[];
  extractedTexts: ExtractedText[];
  timestamp: number;
}

const STATE_KEY = 'cramcraft-saved-state';

/**
 * Save application state to localStorage
 */
export function saveState(files: UploadedFile[], extractedTexts: ExtractedText[]): void {
  try {
    const state: SavedState = {
      files,
      extractedTexts,
      timestamp: Date.now(),
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state:', error);
    // If localStorage is full, try to clear old data
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      try {
        localStorage.removeItem(STATE_KEY);
        localStorage.setItem(STATE_KEY, JSON.stringify({
          files,
          extractedTexts,
          timestamp: Date.now(),
        }));
      } catch (retryError) {
        console.error('Failed to save state after clearing:', retryError);
      }
    }
  }
}

/**
 * Load saved state from localStorage
 */
export function loadState(): SavedState | null {
  try {
    const stateStr = localStorage.getItem(STATE_KEY);
    if (!stateStr) {
      return null;
    }
    
    const state = JSON.parse(stateStr) as SavedState;
    
    // Check if state is too old (more than 24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (Date.now() - state.timestamp > maxAge) {
      clearState();
      return null;
    }
    
    return state;
  } catch (error) {
    console.error('Failed to load state:', error);
    return null;
  }
}

/**
 * Clear saved state from localStorage
 */
export function clearState(): void {
  try {
    localStorage.removeItem(STATE_KEY);
  } catch (error) {
    console.error('Failed to clear state:', error);
  }
}

/**
 * Check if there is saved state available
 */
export function hasSavedState(): boolean {
  return localStorage.getItem(STATE_KEY) !== null;
}
