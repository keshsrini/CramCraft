// Error handling utilities for CramCraft
// Defines error types, messages, and error display logic

export type ErrorType =
  | 'file-size'
  | 'file-type'
  | 'file-count'
  | 'pdf-parsing'
  | 'ocr-failure'
  | 'empty-content'
  | 'api-rate-limit'
  | 'api-auth'
  | 'api-timeout'
  | 'api-invalid-response'
  | 'network-error'
  | 'export-failure'
  | 'storage-full'
  | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  fileName?: string;
  retryable: boolean;
  timestamp: Date;
}

/**
 * Create a standardized error object
 */
export function createError(
  type: ErrorType,
  message: string,
  options: {
    fileName?: string;
    retryable?: boolean;
  } = {}
): AppError {
  return {
    type,
    message,
    fileName: options.fileName,
    retryable: options.retryable ?? false,
    timestamp: new Date(),
  };
}

/**
 * Get user-friendly error message for file size errors
 */
export function getFileSizeErrorMessage(fileName: string, sizeMB: number): string {
  return `File '${fileName}' is too large (${sizeMB.toFixed(2)}MB). Please upload files smaller than 50MB.`;
}

/**
 * Get user-friendly error message for file type errors
 */
export function getFileTypeErrorMessage(fileName: string): string {
  return `File '${fileName}' is not supported. Please upload PDF, image, or text files.`;
}

/**
 * Get user-friendly error message for file count errors
 */
export function getFileCountErrorMessage(maxFiles: number = 10): string {
  return `Maximum ${maxFiles} files allowed. Please remove some files or start a new session.`;
}

/**
 * Get user-friendly error message for PDF parsing errors
 */
export function getPDFParsingErrorMessage(fileName: string): string {
  return `Could not extract text from '${fileName}'. The file may be corrupted or password-protected.`;
}

/**
 * Get user-friendly error message for OCR errors
 */
export function getOCRErrorMessage(fileName: string): string {
  return `Could not read text from '${fileName}'. Please ensure the image is clear and contains readable text.`;
}

/**
 * Get user-friendly error message for empty content
 */
export function getEmptyContentErrorMessage(): string {
  return 'No text could be extracted from your files. Please upload files with readable content.';
}

/**
 * Get user-friendly error message for API rate limit errors
 */
export function getRateLimitErrorMessage(): string {
  return 'Service is busy. Please wait a moment and try again.';
}

/**
 * Get user-friendly error message for API authentication errors
 */
export function getAuthErrorMessage(): string {
  return 'Configuration error. Please contact support.';
}

/**
 * Get user-friendly error message for API timeout errors
 */
export function getTimeoutErrorMessage(): string {
  return 'Generation is taking longer than expected. Please try again.';
}

/**
 * Get user-friendly error message for invalid API response
 */
export function getInvalidResponseErrorMessage(): string {
  return 'Received invalid response. Retrying...';
}

/**
 * Get user-friendly error message for network errors
 */
export function getNetworkErrorMessage(): string {
  return 'Connection lost. Your progress has been saved.';
}

/**
 * Get user-friendly error message for export failures
 */
export function getExportErrorMessage(): string {
  return 'Could not create PDF. Please try again.';
}

/**
 * Get user-friendly error message for storage full errors
 */
export function getStorageFullErrorMessage(): string {
  return 'Browser storage is full. Some features may not work.';
}

/**
 * Log error for debugging purposes
 */
export function logError(error: AppError | Error, context?: string): void {
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}]` : '';
  
  if (error instanceof Error) {
    console.error(`${timestamp} ${prefix} Error:`, error.message, error.stack);
  } else {
    console.error(`${timestamp} ${prefix} AppError:`, {
      type: error.type,
      message: error.message,
      fileName: error.fileName,
      retryable: error.retryable,
      timestamp: error.timestamp,
    });
  }
}

/**
 * Determine if an error is retryable
 */
export function isRetryableError(error: AppError | Error): boolean {
  if (error instanceof Error) {
    return false;
  }
  return error.retryable;
}

/**
 * Get error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unknown error occurred';
}
