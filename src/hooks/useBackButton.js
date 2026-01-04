import { useEffect } from 'react';

/**
 * Handle back button for modals/overlays
 * @param {boolean} isOpen - Whether the modal/overlay is open
 * @param {function} onClose - Function to call when back button is pressed
 */
export const useBackHandler = (isOpen, onClose) => {
  useEffect(() => {
    if (!isOpen) return;

    // Add a state to history when modal opens
    const stateId = `modal-${Date.now()}`;
    window.history.pushState({ modalOpen: true, id: stateId }, '');

    const handlePopState = (event) => {
      // Only handle if modal is open
      if (isOpen) {
        onClose();
        // Prevent further propagation
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener('popstate', handlePopState, true); // Use capture phase

    return () => {
      window.removeEventListener('popstate', handlePopState, true);
      // Clean up: remove the history state we added if modal is still open
      if (isOpen && window.history.state?.modalOpen) {
        try {
          window.history.back();
        } catch (e) {
          // Ignore errors
        }
      }
    };
  }, [isOpen, onClose]);
};