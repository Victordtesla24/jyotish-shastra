import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import ChartPage from './pages/ChartPage.jsx';
import ComprehensiveAnalysisPage from './pages/ComprehensiveAnalysisPage.jsx';
import BirthTimeRectificationPage from './components/BirthTimeRectification.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import PreLoader from './components/ui/PreLoader.jsx';
import { ChartProvider } from './contexts/ChartContext.js';
import { AnalysisProvider } from './contexts/AnalysisContext.js';
import { ThemeProvider } from './contexts/ThemeContext.js';
import './styles/chris-cole-enhancements.css';

/**
 * Main App Component
 * Implementation Plan: @implementation-plan-UI.md
 * Routes configured for Chris Cole-inspired design
 */
function App() {
  const [isPreloaderComplete, setIsPreloaderComplete] = useState(false);

  const handlePreloaderComplete = () => {
    setIsPreloaderComplete(true);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ChartProvider>
          <AnalysisProvider>
            {!isPreloaderComplete && (
              <PreLoader 
                delay={2000} 
                onComplete={handlePreloaderComplete} 
              />
            )}
            {isPreloaderComplete && (
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/chart" element={<ChartPage />} />
                <Route path="/analysis" element={<ComprehensiveAnalysisPage />} />
                <Route path="/birth-time-rectification" element={<BirthTimeRectificationPage />} />
              </Routes>
            )}
          </AnalysisProvider>
        </ChartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

