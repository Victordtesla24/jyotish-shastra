import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// Performance monitoring
import { performanceMonitor } from './utils/performance';

// Start performance monitoring
performanceMonitor.recordMetric('app-start', performance.now());

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Performance measurement after render
window.addEventListener('load', () => {
  performanceMonitor.recordMetric('app-loaded', performance.now());

  // Log performance metrics in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      const metrics = performanceMonitor.getMetrics();
      console.log('🚀 Jyotish Shastra Performance Metrics:', metrics);
    }, 1000);
  }
});

// Service worker registration for PWA capabilities
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
