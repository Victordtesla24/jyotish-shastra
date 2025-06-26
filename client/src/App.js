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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <div className="app-container">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/chart" element={<ChartPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/report/:id" element={<ReportPage />} />
              {/* 404 fallback */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sacred-white to-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-accent font-bold text-earth-brown mb-4">
                      404 - Page Not Found
                    </h1>
                    <p className="text-wisdom-gray mb-8">
                      The cosmic path you seek does not exist in our realm.
                    </p>
                    <a
                      href="/"
                      className="btn-vedic-primary inline-block"
                    >
                      Return to Sacred Home
                    </a>
                  </div>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
