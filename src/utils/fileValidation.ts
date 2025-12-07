import type { FileType } from '../types';
import {
  FILE_LIMITS,
  ALL_SUPPORTED_EXTENSIONS,
  SUPPORTED_FILE_TYPES,
} from '../types';
import {
  getFileSizeErrorMessage,
  getFileTypeErrorMessage,
  getFileCountErrorMessage,
} from './errorHandling';

export interface ValidationError {
  type: 'file-size' | 'file-type' | 'file-count';
  message: string;
  fileName?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates if a file type is supported
 */
export function isValidFileType(file: File): boolean {
  const fileName = file.name.toLowerCase();
  return ALL_SUPPORTED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
}

/**
 * Validates if a file size is within limits
 */
export function isValidFileSize(file: File): boolean {
  return file.size <= FILE_LIMITS.MAX_FILE_SIZE;
}

/**
 * Validates if the file count is within limits
 */
export function isValidFileCount(currentCount: number, newFilesCount: number): boolean {
  return currentCount + newFilesCount <= FILE_LIMITS.MAX_FILES;
}

/**
 * Gets the file type category from a file
 */
export function getFileType(file: File): FileType | null {
  const fileName = file.name.toLowerCase();

  if (SUPPORTED_FILE_TYPES.PDF.some((ext) => fileName.endsWith(ext))) {
    return 'pdf';
  }
  if (SUPPORTED_FILE_TYPES.IMAGE.some((ext) => fileName.endsWith(ext))) {
    return 'image';
  }
  if (SUPPORTED_FILE_TYPES.TEXT.some((ext) => fileName.endsWith(ext))) {
    return 'text';
  }

  return null;
}

/**
 * Validates a single file
 */
export function validateFile(file: File): ValidationResult {
  const errors: ValidationError[] = [];

  // Check file type
  if (!isValidFileType(file)) {
    errors.push({
      type: 'file-type',
      message: getFileTypeErrorMessage(file.name),
      fileName: file.name,
    });
  }

  // Check file size
  if (!isValidFileSize(file)) {
    const sizeMB = file.size / (1024 * 1024);
    errors.push({
      type: 'file-size',
      message: getFileSizeErrorMessage(file.name, sizeMB),
      fileName: file.name,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates multiple files
 */
export function validateFiles(
  files: File[],
  currentFileCount: number = 0
): ValidationResult {
  const errors: ValidationError[] = [];

  // Check file count
  if (!isValidFileCount(currentFileCount, files.length)) {
    errors.push({
      type: 'file-count',
      message: getFileCountErrorMessage(FILE_LIMITS.MAX_FILES),
    });
    return {
      isValid: false,
      errors,
    };
  }

  // Validate each file
  files.forEach((file) => {
    const result = validateFile(file);
    errors.push(...result.errors);
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
