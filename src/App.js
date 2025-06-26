import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ChartPage from './pages/ChartPage';
import AnalysisPage from './pages/AnalysisPage';
import ReportPage from './pages/ReportPage';

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen flex flex-col bg-white dark:bg-dark-bg-primary text-gray-900 dark:text-dark-text-primary transition-colors duration-300">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/chart" element={<ChartPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/report/:id" element={<ReportPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
