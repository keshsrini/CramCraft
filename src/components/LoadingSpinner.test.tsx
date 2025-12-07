import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';
import { LoadingSpinner } from './LoadingSpinner';
import { LoadingOverlay } from './LoadingOverlay';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Processing files..." />);
    expect(screen.getByText('Processing files...')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<LoadingSpinner size="medium" />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<LoadingSpinner size="large" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('LoadingOverlay', () => {
  it('does not render when isLoading is false', () => {
    render(<LoadingOverlay isLoading={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when isLoading is true', () => {
    render(<LoadingOverlay isLoading={true} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingOverlay isLoading={true} message="Generating quiz..." />);
    expect(screen.getByText('Generating quiz...')).toBeInTheDocument();
  });
});

describe('Property Tests', () => {
  /**
   * **Feature: cramcraft, Property 41: Loading state visibility**
   * **Validates: Requirements 11.1**
   * 
   * For any asynchronous operation in progress, a loading indicator should be displayed in the UI.
   */
  it('Property 41: Loading state visibility', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // isLoading state
        fc.option(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0), 
          { nil: undefined }
        ), // optional non-empty message
        (isLoading, message) => {
          const { container, unmount } = render(
            <LoadingOverlay isLoading={isLoading} message={message} />
          );

          try {
            const dialog = screen.queryByRole('dialog');
            const statusIndicator = container.querySelector('[role="status"]');

            if (isLoading) {
              // When loading is true, loading indicator should be visible
              expect(dialog).toBeInTheDocument();
              expect(statusIndicator).toBeInTheDocument();

              // If message is provided and non-empty, it should be displayed
              if (message && message.trim().length > 0) {
                // Check that the message text exists in the container
                expect(container.textContent).toContain(message);
              }
            } else {
              // When loading is false, no loading indicator should be visible
              expect(dialog).not.toBeInTheDocument();
            }
          } finally {
            // Clean up after each iteration
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 41: LoadingSpinner always has status role', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('small', 'medium', 'large'),
        fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
        (size, message) => {
          const { container, unmount } = render(<LoadingSpinner size={size} message={message} />);

          try {
            // Loading spinner should always have status role for accessibility
            const statusElement = container.querySelector('[role="status"]');
            expect(statusElement).toBeInTheDocument();

            // Should have aria-live for screen readers
            expect(statusElement).toHaveAttribute('aria-live', 'polite');
          } finally {
            // Clean up after each iteration
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
