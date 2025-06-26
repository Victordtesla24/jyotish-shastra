import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import { Skeleton } from './components/ui';

// Code splitting for performance optimization
const ChartPage = React.lazy(() => import('./pages/ChartPage'));
const AnalysisPage = React.lazy(() => import('./pages/AnalysisPage'));
const ReportPage = React.lazy(() => import('./pages/ReportPage'));
const RashiDetailPage = React.lazy(() => import('./pages/RashiDetailPage'));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="flex flex-col min-h-screen bg-sacred-white dark:bg-gray-900 transition-colors duration-300">
          <Header />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Suspense fallback={
              <div className="min-h-[400px] flex items-center justify-center">
                <div className="space-y-4 w-full max-w-4xl">
                  <Skeleton className="h-8 w-64 mx-auto" />
                  <Skeleton className="h-32 w-full" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                  </div>
                </div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/rashi/:rashiName" element={<RashiDetailPage />} />
                <Route path="/chart" element={<ChartPage />} />
                <Route path="/analysis" element={<AnalysisPage />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/report/:id" element={<ReportPage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
