import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Custom hook to handle back button for modals/overlays
 * @param {boolean} isOpen - Whether the modal/overlay is open
 * @param {function} onClose - Function to call when back button is pressed
 * @param {string} stateName - Unique identifier for this modal/overlay
 */
export const useBackButton = (isOpen, onClose, stateName = 'modal') => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isOpen) return;

    // Push a new history state when modal opens
    const historyState = { [stateName]: true };
    window.history.pushState(historyState, '');

    const handlePopState = (event) => {
      // Check if this pop state is for our modal
      if (event.state?.[stateName]) {
        // Don't do anything, let it pop
        return;
      }
      // If we're popping and the modal is open, close it
      if (isOpen) {
        event.preventDefault();
        onClose();
        // Push the state back so we don't actually navigate away
        window.history.pushState(historyState, '');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Clean up: if modal is still open when unmounting, remove the history state
      if (window.history.state?.[stateName]) {
        window.history.back();
      }
    };
  }, [isOpen, onClose, stateName]);
};

/**
 * Simpler version for components that just need to close on back
 */
export const useBackHandler = (isOpen, onClose) => {
  useEffect(() => {
    if (!isOpen) return;

    // Add a hash to the URL when opening
    window.history.pushState({ modalOpen: true }, '');

    const handlePopState = () => {
      if (isOpen) {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);
};