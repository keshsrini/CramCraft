import { useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import type { ViewType } from '../types';

/**
 * Custom hook for managing view navigation and browser history
 */
export function useViewNavigation() {
  const { state, setCurrentView } = useAppContext();

  // Navigate to a specific view
  const navigateTo = useCallback(
    (view: ViewType) => {
      setCurrentView(view);
      
      // Update browser history
      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      window.history.pushState({ view }, '', url.toString());
    },
    [setCurrentView]
  );

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view as ViewType);
      } else {
        // If no state, check URL params
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view') as ViewType;
        if (view && ['upload', 'processing', 'revision', 'quiz', 'results'].includes(view)) {
          setCurrentView(view);
        } else {
          setCurrentView('upload');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initialize view from URL on mount
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') as ViewType;
    if (view && ['upload', 'processing', 'revision', 'quiz', 'results'].includes(view)) {
      setCurrentView(view);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [setCurrentView]);

  // Navigation helper functions
  const goToUpload = useCallback(() => navigateTo('upload'), [navigateTo]);
  const goToProcessing = useCallback(() => navigateTo('processing'), [navigateTo]);
  const goToRevision = useCallback(() => navigateTo('revision'), [navigateTo]);
  const goToQuiz = useCallback(() => navigateTo('quiz'), [navigateTo]);
  const goToResults = useCallback(() => navigateTo('results'), [navigateTo]);

  return {
    currentView: state.currentView,
    navigateTo,
    goToUpload,
    goToProcessing,
    goToRevision,
    goToQuiz,
    goToResults,
  };
}
