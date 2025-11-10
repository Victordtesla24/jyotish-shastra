import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import ChartPage from './pages/ChartPage.jsx';
import ComprehensiveAnalysisPage from './pages/ComprehensiveAnalysisPage.jsx';
import BirthTimeRectificationPage from './components/BirthTimeRectification.jsx';
import NotFound from './pages/NotFound.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import PreLoader from './components/ui/PreLoader.jsx';
import { ChartProvider } from './contexts/ChartContext.js';
import { AnalysisProvider } from './contexts/AnalysisContext.js';
import { ThemeProvider } from './contexts/ThemeContext.js';
import './styles/chris-cole-enhancements.css';

/**
 * Main App Component - Chris Cole Template Replication
 * Preloader-first architecture: show preloader first, then render content
 * Saturn animation appears within each component (PreLoader and HomePage)
 */
function App() {
  // Check sessionStorage for preloader display logic
  const hasPreloaderBeenShown = typeof window !== 'undefined' && 
    sessionStorage.getItem('chrisColePreloaderShown') === 'true';
  
  // Preloader visibility state - only show if not already shown
  const [showPreloader, setShowPreloader] = useState(!hasPreloaderBeenShown);
  const [showContent, setShowContent] = useState(hasPreloaderBeenShown);

  // Handle preloader completion
  const handlePreloaderComplete = useCallback(() => {
    console.log('[App] Preloader completed, showing content');
    
    // Set sessionStorage flag to prevent preloader on refresh
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('chrisColePreloaderShown', 'true');
    }
    
    setShowPreloader(false);
    // Small delay for smooth transition
    setTimeout(() => {
      setShowContent(true);
    }, 200); // Slightly longer delay for navigation entrance
  }, []);

  // Initialize body classes
  useEffect(() => {
    if (showPreloader) {
      document.body.classList.add('preloader-visible');
      document.body.classList.remove('content-visible');
    } else {
      document.body.classList.remove('preloader-visible');
      document.body.classList.add('content-visible');
    }
  }, [showPreloader]);

  // Preloader phase - show only the preloader with its Saturn
  if (showPreloader) {
    return (
      <ErrorBoundary>
        <ThemeProvider>
          <ChartProvider>
            <AnalysisProvider>
              <PreLoader 
                onComplete={handlePreloaderComplete}
                delay={4000} 
              />
            </AnalysisProvider>
          </ChartProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  // Content phase - show routes with smooth fade-in
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ChartProvider>
          <AnalysisProvider>
            <div className={`site-container ${showContent ? 'visible' : ''}`}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/chart" element={<ChartPage />} />
                <Route path="/analysis" element={<ComprehensiveAnalysisPage />} />
                <Route path="/birth-time-rectification" element={<BirthTimeRectificationPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </AnalysisProvider>
        </ChartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

