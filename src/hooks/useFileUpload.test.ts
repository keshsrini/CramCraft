import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import fc from 'fast-check';
import { useFileUpload } from './useFileUpload';

describe('useFileUpload Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Property 4: State reset completeness', () => {
    it('should reset to initial empty state when clearAll is called', async () => {
      // **Feature: cramcraft, Property 4: State reset completeness**
      // **Validates: Requirements 1.5**
      
      // Test with a single example to verify the property
      const { result, rerender } = renderHook(() => useFileUpload());

      // Create mock files
      const files = [
        new File(['content'], 'file_1.pdf', { type: 'application/pdf' }),
        new File(['content'], 'file_2.pdf', { type: 'application/pdf' }),
      ];

      // Add files
      await act(async () => {
        await result.current.handleFilesSelected(files);
      });

      // Verify files were added
      expect(result.current.files.length).toBe(2);

      // Clear all
      act(() => {
        result.current.handleClearAll();
      });

      // Verify state is reset to initial empty state
      expect(result.current.files).toEqual([]);
      expect(result.current.errors).toEqual([]);
      expect(localStorage.getItem('cramcraft-files')).toBeNull();
    });

    it('should clear localStorage when clearAll is called', () => {
      // **Feature: cramcraft, Property 4: State reset completeness**
      // **Validates: Requirements 1.5**
      const { result } = renderHook(() => useFileUpload());

      // Set some data in localStorage
      localStorage.setItem('cramcraft-files', 'test-data');

      // Clear all
      act(() => {
        result.current.handleClearAll();
      });

      // Verify localStorage is cleared
      expect(localStorage.getItem('cramcraft-files')).toBeNull();
    });
  });

  describe('Basic functionality', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useFileUpload());

      expect(result.current.files).toEqual([]);
      expect(result.current.errors).toEqual([]);
    });

    it('should add valid files', async () => {
      const { result } = renderHook(() => useFileUpload());

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      await act(async () => {
        await result.current.handleFilesSelected([file]);
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0].name).toBe('test.pdf');
      expect(result.current.files[0].type).toBe('pdf');
    });

    it('should update file status', async () => {
      const { result } = renderHook(() => useFileUpload());

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      await act(async () => {
        await result.current.handleFilesSelected([file]);
      });

      const fileId = result.current.files[0].id;

      act(() => {
        result.current.updateFileStatus(fileId, 'completed');
      });

      expect(result.current.files[0].status).toBe('completed');
    });
  });
});
