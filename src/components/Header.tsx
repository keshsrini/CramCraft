import React from 'react';
import type { ViewType } from '../types';

interface HeaderProps {
  currentView: ViewType;
}

const viewLabels: Record<ViewType, string> = {
  upload: 'Upload Files',
  processing: 'Processing',
  revision: 'Revision Pack',
  quiz: 'Quiz',
  results: 'Results',
};

const viewDescriptions: Record<ViewType, string> = {
  upload: 'Upload your study materials to get started',
  processing: 'Extracting text and generating content',
  revision: 'Review your AI-generated study materials',
  quiz: 'Test your knowledge',
  results: 'See how you performed',
};

export function Header({ currentView }: HeaderProps) {
  // Generate breadcrumb trail based on current view
  const getBreadcrumbs = () => {
    const breadcrumbs: ViewType[] = ['upload'];
    
    if (currentView === 'processing' || currentView === 'revision' || currentView === 'quiz' || currentView === 'results') {
      breadcrumbs.push('processing');
    }
    
    if (currentView === 'revision' || currentView === 'quiz' || currentView === 'results') {
      breadcrumbs.push('revision');
    }
    
    if (currentView === 'quiz' || currentView === 'results') {
      breadcrumbs.push('quiz');
    }
    
    if (currentView === 'results') {
      breadcrumbs.push('results');
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        {/* Title and Description */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold mb-2">CramCraft</h1>
          <p className="text-blue-100 text-sm">
            Transform your study materials into AI-powered revision packs and quizzes
          </p>
        </div>

        {/* Breadcrumbs */}
        <nav aria-label="Progress breadcrumbs" className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((view, index) => (
            <React.Fragment key={view}>
              {index > 0 && (
                <span className="text-blue-200" aria-hidden="true">
                  →
                </span>
              )}
              <span
                className={`
                  px-3 py-1 rounded-full transition-colors
                  ${
                    view === currentView
                      ? 'bg-white text-blue-600 font-semibold'
                      : 'bg-blue-500 bg-opacity-50 text-blue-100'
                  }
                `}
                aria-current={view === currentView ? 'page' : undefined}
              >
                {viewLabels[view]}
              </span>
            </React.Fragment>
          ))}
        </nav>

        {/* Current View Indicator */}
        <div className="mt-4 pt-4 border-t border-blue-400 border-opacity-30">
          <p className="text-lg font-medium">{viewLabels[currentView]}</p>
          <p className="text-blue-100 text-sm mt-1">{viewDescriptions[currentView]}</p>
        </div>
      </div>
    </header>
  );
}
