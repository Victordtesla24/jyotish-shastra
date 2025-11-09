import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import ChartPage from './pages/ChartPage.jsx';
import ComprehensiveAnalysisPage from './pages/ComprehensiveAnalysisPage.jsx';
import BirthTimeRectificationPage from './components/BirthTimeRectification.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ChartProvider } from './contexts/ChartContext.js';
import { AnalysisProvider } from './contexts/AnalysisContext.js';
import { ThemeProvider } from './contexts/ThemeContext.js';

/**
 * Main App Component
 * Implementation Plan: @implementation-plan-UI.md
 * Routes configured for Chris Cole-inspired design
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ChartProvider>
          <AnalysisProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/chart" element={<ChartPage />} />
              <Route path="/analysis" element={<ComprehensiveAnalysisPage />} />
              <Route path="/birth-time-rectification" element={<BirthTimeRectificationPage />} />
            </Routes>
          </AnalysisProvider>
        </ChartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

