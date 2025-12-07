import { useCallback, useState, DragEvent, ChangeEvent } from 'react';
import type { UploadedFile } from '../types';

interface FileUploaderProps {
  files: UploadedFile[];
  onFilesSelected: (files: File[]) => void;
  onClearAll: () => void;
  maxFiles: number;
  acceptedTypes: string[];
}

export function FileUploader({
  files,
  onFilesSelected,
  onClearAll,
  maxFiles,
  acceptedTypes,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        onFilesSelected(droppedFiles);
      }
    },
    [onFilesSelected]
  );

  const handleFileInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        onFilesSelected(Array.from(selectedFiles));
      }
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    },
    [onFilesSelected]
  );

  const handleClick = () => {
    document.getElementById('file-input')?.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 md:p-12 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50 scale-105'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload files by clicking or dragging and dropping"
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="File input"
        />

        <div className="flex flex-col items-center gap-3 md:gap-4">
          <svg
            className="w-12 h-12 md:w-16 md:h-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <div>
            <p className="text-base md:text-lg font-medium text-gray-700">
              {isDragging ? 'Drop files here' : 'Drag and drop files here'}
            </p>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              or click to browse
            </p>
          </div>

          <div className="text-xs text-gray-400 mt-2 space-y-1">
            <p>Supported: PDF, JPG, JPEG, PNG, TXT, MD</p>
            <p>Max {maxFiles} files, 50MB each</p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p className="text-sm text-gray-600" aria-live="polite" aria-atomic="true">
            {files.length} file{files.length !== 1 ? 's' : ''} uploaded
          </p>
          <button
            onClick={onClearAll}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 
                     hover:bg-red-50 rounded-md transition-colors"
            aria-label={`Clear all ${files.length} uploaded files`}
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
