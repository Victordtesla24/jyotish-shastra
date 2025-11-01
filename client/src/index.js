import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.js';
import reportWebVitals from './reportWebVitals.js';

// Enhanced error handling for React initialization
const initializeReactApp = () => {
  try {
    console.log('🚀 React initialization started...');

    // Verify DOM is ready
    if (document.readyState === 'loading') {
      console.log('⏳ Waiting for DOM to be ready...');
      document.addEventListener('DOMContentLoaded', initializeReactApp);
      return;
    }

    // Find the root element with enhanced error handling
    const container = document.getElementById('root');

    if (!container) {
      console.error('❌ Root element not found');
      document.body.innerHTML = '<div style="padding: 20px; color: red; font-family: Arial;">Error: React root element not found. Please check your HTML structure.</div>';
      return;
    }

    console.log('✅ Root element found:', container);

    // Create root with comprehensive error handling
    const root = createRoot(container, {
      onUncaughtError: (error, errorInfo) => {
        console.error('🚨 Uncaught React Error:', error);
        console.error('Error Info:', errorInfo);
        // Don't throw - just log to prevent white screen
      },
      onCaughtError: (error, errorInfo) => {
        console.error('🚨 Caught React Error:', error);
        console.error('Error Info:', errorInfo);
        // Don't throw - just log to prevent white screen
      }
    });

    console.log('✅ React root created successfully');

    // Global error handlers to catch any missed errors
    window.addEventListener('error', (event) => {
      console.error('🚨 Global Error:', event.error);
      console.error('Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
      console.error('Promise:', event.promise);
    });

    // Render with error boundary
    console.log('🎨 Rendering App component...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    console.log('✅ React app rendered successfully');

    // Verify React has mounted
    setTimeout(() => {
      const reactRoot = document.getElementById('root');
      if (reactRoot && reactRoot.children.length > 0) {
        console.log('✅ React mounted successfully - children found:', reactRoot.children.length);
      } else {
        console.error('❌ React mounting failed - no children found');
      }
    }, 100);

  } catch (error) {
    console.error('❌ Fatal error during React initialization:', error);
    console.error('Error stack:', error.stack);

    // Provide user-friendly error message
    const container = document.getElementById('root') || document.body;
    container.innerHTML = `
      <div style="
        padding: 20px;
        margin: 20px;
        border: 2px solid #f44336;
        border-radius: 8px;
        background: #ffebee;
        color: #c62828;
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 50px auto;
      ">
        <h2 style="margin-top: 0;">Application Error</h2>
        <p><strong>The React application failed to start.</strong></p>
        <p>Error: ${error.message}</p>
        <details style="margin-top: 10px;">
          <summary style="cursor: pointer;">Technical Details</summary>
          <pre style="background: #f5f5f5; padding: 10px; margin-top: 10px; font-size: 12px; overflow: auto;">${error.stack}</pre>
        </details>
        <p style="margin-bottom: 0;">
          <small>Please refresh the page or contact support if the problem persists.</small>
        </p>
      </div>
    `;
  }
};

// Performance and development insights
if (process.env.NODE_ENV === 'development') {
  reportWebVitals((metric) => {
    console.log('📊 Web Vital:', metric);
  });
}

// Initialize the React app
console.log('🔍 Environment check:', {
  nodeEnv: process.env.NODE_ENV,
  readyState: document.readyState,
  hasRoot: !!document.getElementById('root'),
  timestamp: new Date().toISOString()
});

initializeReactApp();
