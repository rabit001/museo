import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Custom hook to trap focus within a modal/dialog container,
 * handle Escape key dismissal, and restore focus to the previously active element on close.
 */
export function useModalFocusTrap({
  isOpen,
  onClose,
  restoreFocus = true,
}: {
  isOpen: boolean;
  onClose?: () => void;
  restoreFocus?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Capture triggering element before dialog takes focus
    triggerRef.current = document.activeElement as HTMLElement | null;

    const container = containerRef.current;
    if (container) {
      // Focus first interactive element inside dialog or container itself
      const focusables = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        container.focus();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (onClose) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
        return;
      }

      if (e.key === 'Tab') {
        const dialog = containerRef.current;
        if (!dialog) return;

        const focusableElements = Array.from(
          dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null || el === document.activeElement);

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !dialog.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !dialog.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (restoreFocus && triggerRef.current && typeof triggerRef.current.focus === 'function') {
        // Return focus smoothly
        try {
          triggerRef.current.focus();
        } catch {
          // Ignore if unmounted
        }
      }
    };
  }, [isOpen, onClose, restoreFocus]);

  return containerRef;
}
