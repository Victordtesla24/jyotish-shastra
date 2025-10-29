import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ChartProvider } from './contexts/ChartContext';
import { AnalysisProvider } from './contexts/AnalysisContext';
import usePWA from './hooks/usePWA';
import Header from './components/Header';
import Footer from './components/Footer';
import { Button } from './components/ui';
import { initializeErrorHandling } from './utils/apiErrorHandler';
import './styles/vedic-design-system.css';

// Import pages directly instead of lazy loading to fix mounting issues
import HomePage from './pages/HomePage';
import ChartPage from './pages/ChartPage';
import AnalysisPage from './pages/AnalysisPage';
import ComprehensiveAnalysisPage from './pages/ComprehensiveAnalysisPage';
import ReportPage from './pages/ReportPage';

// Details pages
import MeshaPage from './pages/vedic-details/MeshaPage';

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

// PWA Update Banner Component
const PWAUpdateBanner = () => {
  const { updateAvailable, updateApp } = usePWA();

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-cosmic-purple text-white p-3 z-50 shadow-cosmic">
      <div className="container-vedic flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-gold">✨</span>
          <span className="font-medium">
            A new version of Jyotish Shastra is available!
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={updateApp}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            Update Now
          </Button>
        </div>
      </div>
    </div>
  );
};

// PWA Install Banner Component
const PWAInstallBanner = () => {
  const { isInstallable, installApp } = usePWA();

  if (!isInstallable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-cosmic p-4 z-40">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-cosmic rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🕉️</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-earth-brown dark:text-dark-text-primary mb-1">
            Install Jyotish Shastra
          </h4>
          <p className="text-sm text-wisdom-gray dark:text-dark-text-secondary mb-3">
            Get quick access to your cosmic insights with our app!
          </p>
          <div className="flex space-x-2">
            <Button
              variant="cosmic"
              size="sm"
              onClick={installApp}
              className="flex-1"
            >
              Install
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Offline Banner Component
const OfflineBanner = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-600 text-white p-2 z-50">
      <div className="container-vedic text-center">
        <span className="font-medium">
          ⚠️ You're offline. Some features may be limited.
        </span>
      </div>
    </div>
  );
};

// Removed unused AppLoadingFallback component

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-sacred-white to-gray-50 dark:from-dark-bg-primary dark:to-dark-bg-secondary flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🔮</div>
            <h1 className="font-accent text-2xl text-earth-brown dark:text-dark-text-primary mb-4">
              Cosmic Disturbance Detected
            </h1>
            <p className="text-wisdom-gray dark:text-dark-text-secondary mb-6">
              The stars seem to be misaligned. Please refresh the page to restore harmony.
            </p>
            <Button
              variant="cosmic"
              onClick={() => window.location.reload()}
            >
              Restore Cosmic Balance
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  // Initialize enhanced error handling
  useEffect(() => {
    initializeErrorHandling();
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider defaultTheme="system">
          <ChartProvider>
            <AnalysisProvider>
              <QueryClientProvider client={queryClient}>
                <div className="app-container min-h-screen bg-gradient-to-br from-sacred-white to-gray-50 dark:from-dark-bg-primary dark:to-dark-bg-secondary transition-colors duration-300">
                {/* PWA Status Banners */}
                <PWAUpdateBanner />
                <OfflineBanner />

                <Header />

                <main className="flex-grow" id="main-content">
                  <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/chart" element={<ChartPage />} />
                  <Route path="/analysis" element={<AnalysisPage />} />
                  <Route path="/comprehensive-analysis" element={<ComprehensiveAnalysisPage />} />
                  <Route path="/report" element={<ReportPage />} />
                  <Route path="/report/:id" element={<ReportPage />} />
                  <Route path="/rashi/mesha" element={<MeshaPage />} />

                  {/* Enhanced 404 Page */}
                  <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center p-4">
                      <div className="text-center max-w-md">
                        <div className="text-8xl mb-6 animate-float">🌌</div>
                        <h1 className="font-accent text-4xl text-earth-brown dark:text-dark-text-primary mb-4">
                          404 - Lost in the Cosmos
                        </h1>
                        <p className="text-lg text-wisdom-gray dark:text-dark-text-secondary mb-8 leading-relaxed">
                          The cosmic path you seek does not exist in our realm.
                          Let us guide you back to the sacred knowledge.
                        </p>
                        <div className="space-y-4">
                          <Button
                            variant="cosmic"
                            size="lg"
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto"
                          >
                            ← Return to Previous Path
                          </Button>
                          <br />
                          <Button
                            variant="secondary"
                            size="lg"
                            onClick={() => window.location.href = '/'}
                            className="w-full sm:w-auto"
                          >
                            🏠 Return to Sacred Home
                          </Button>
                        </div>
                      </div>
                    </div>
                  } />
                </Routes>
              </main>

              <Footer />

              {/* PWA Install Banner */}
              <PWAInstallBanner />
                </div>
              </QueryClientProvider>
            </AnalysisProvider>
          </ChartProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
