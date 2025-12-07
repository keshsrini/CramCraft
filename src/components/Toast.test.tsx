import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fc from 'fast-check';
import { Toast } from './Toast';
import { ToastContainer } from './ToastContainer';
import type { ToastMessage } from './ToastContainer';

describe('Toast', () => {
  it('renders success toast', () => {
    const onClose = vi.fn();
    render(<Toast message="Success!" type="success" onClose={onClose} />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders error toast', () => {
    const onClose = vi.fn();
    render(<Toast message="Error occurred" type="error" onClose={onClose} />);
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });

  it('renders info toast', () => {
    const onClose = vi.fn();
    render(<Toast message="Info message" type="info" onClose={onClose} />);
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Toast message="Test" type="success" onClose={onClose} />);

    const closeButton = screen.getByLabelText('Close notification');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after duration', async () => {
    const onClose = vi.fn();
    render(<Toast message="Test" type="success" onClose={onClose} duration={100} />);

    await waitFor(
      () => {
        expect(onClose).toHaveBeenCalledTimes(1);
      },
      { timeout: 200 }
    );
  });

  it('does not auto-dismiss when duration is 0', async () => {
    const onClose = vi.fn();
    render(<Toast message="Test" type="success" onClose={onClose} duration={0} />);

    // Wait a bit to ensure it doesn't auto-dismiss
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('ToastContainer', () => {
  it('renders multiple toasts', () => {
    const toasts: ToastMessage[] = [
      { id: '1', message: 'First toast', type: 'success' },
      { id: '2', message: 'Second toast', type: 'error' },
    ];
    const onRemoveToast = vi.fn();

    render(<ToastContainer toasts={toasts} onRemoveToast={onRemoveToast} />);

    expect(screen.getByText('First toast')).toBeInTheDocument();
    expect(screen.getByText('Second toast')).toBeInTheDocument();
  });

  it('renders empty when no toasts', () => {
    const onRemoveToast = vi.fn();
    const { container } = render(<ToastContainer toasts={[]} onRemoveToast={onRemoveToast} />);

    expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument();
  });
});

describe('Property Tests', () => {
  /**
   * **Feature: cramcraft, Property 42: User action feedback**
   * **Validates: Requirements 11.2, 11.3**
   * 
   * For any completed user action, appropriate feedback (success or error message) should be displayed.
   */
  it('Property 42: User action feedback visibility', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('success', 'error', 'info'),
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        (type, message) => {
          const onClose = vi.fn();
          const { container, unmount } = render(
            <Toast message={message} type={type} onClose={onClose} duration={0} />
          );

          try {
            // Toast should always have alert role for accessibility
            const alertElement = container.querySelector('[role="alert"]');
            expect(alertElement).toBeInTheDocument();

            // Toast should have aria-live for screen readers
            expect(alertElement).toHaveAttribute('aria-live', 'polite');

            // Message should be displayed
            expect(container.textContent).toContain(message);

            // Close button should be present
            const closeButton = container.querySelector('[aria-label="Close notification"]');
            expect(closeButton).toBeInTheDocument();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 42: Toast auto-dismisses after timeout', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('success', 'error', 'info'),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.integer({ min: 100, max: 500 }),
        async (type, message, duration) => {
          const onClose = vi.fn();
          const { unmount } = render(
            <Toast message={message} type={type} onClose={onClose} duration={duration} />
          );

          try {
            // Wait for the duration plus a buffer
            await waitFor(
              () => {
                expect(onClose).toHaveBeenCalled();
              },
              { timeout: duration + 300 }
            );
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 10 } // Fewer runs since this involves timeouts
    );
  });

  it('Property 42: Multiple toasts can be displayed simultaneously', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string(),
            message: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            type: fc.constantFrom('success', 'error', 'info'),
          }),
          { minLength: 0, maxLength: 5 }
        ),
        (toasts) => {
          const onRemoveToast = vi.fn();
          const { container, unmount } = render(
            <ToastContainer toasts={toasts} onRemoveToast={onRemoveToast} />
          );

          try {
            const alertElements = container.querySelectorAll('[role="alert"]');

            // Number of alert elements should match number of toasts
            expect(alertElements.length).toBe(toasts.length);

            // Each toast message should be present
            toasts.forEach((toast) => {
              expect(container.textContent).toContain(toast.message);
            });
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
