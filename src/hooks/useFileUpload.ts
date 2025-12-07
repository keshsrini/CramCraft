import { useState, useCallback } from 'react';
import type { UploadedFile } from '../types';
import { validateFiles, getFileType, generateThumbnail, canGenerateThumbnail } from '../utils';

export function useFileUpload(maxFiles: number = 10) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFilesSelected = useCallback(
    async (selectedFiles: File[]) => {
      // Validate files
      const validationResult = validateFiles(selectedFiles, files.length);

      if (!validationResult.isValid) {
        setErrors(validationResult.errors.map((e) => e.message));
        // Don't add any files if validation fails
        return;
      }

      // Clear previous errors
      setErrors([]);

      // Process files
      const newFiles: UploadedFile[] = [];

      for (const file of selectedFiles) {
        const fileType = getFileType(file);
        if (!fileType) {
          // Skip invalid file types
          continue;
        }

        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          name: file.name,
          size: file.size,
          type: fileType,
          status: 'pending',
        };

        // Generate thumbnail for images
        if (fileType === 'image' && canGenerateThumbnail(file)) {
          try {
            const thumbnail = await generateThumbnail(file);
            uploadedFile.thumbnail = thumbnail;
          } catch (error) {
            console.error('Failed to generate thumbnail:', error);
          }
        }

        newFiles.push(uploadedFile);
      }

      // Only add files if we have valid ones
      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles]);
      }
    },
    [files.length]
  );

  const handleClearAll = useCallback(() => {
    setFiles([]);
    setErrors([]);
    // Clear localStorage if used
    localStorage.removeItem('cramcraft-files');
  }, []);

  const updateFileStatus = useCallback(
    (fileId: string, status: UploadedFile['status'], error?: string) => {
      setFiles((prev) =>
        prev.map((file) =>
          file.id === fileId ? { ...file, status, error } : file
        )
      );
    },
    []
  );

  return {
    files,
    errors,
    handleFilesSelected,
    handleClearAll,
    updateFileStatus,
  };
}
