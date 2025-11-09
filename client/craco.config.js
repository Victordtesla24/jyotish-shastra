/**
 * CRACO Configuration
 * Override Create React App webpack configuration
 */

module.exports = {
  devServer: {
    port: 3002,
    allowedHosts: 'all',
    historyApiFallback: true, // Enable client-side routing for React Router
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
      },
    },
  },
  babel: {
    // Let React Scripts handle all Babel configuration automatically
    // This prevents conflicts with JSX transforms and react-refresh
  },
  webpack: {
    configure: (webpackConfig) => {
      // Resolve deprecation warnings
      webpackConfig.ignoreWarnings = [/DEP0176/];
      
      // React Scripts handles react-refresh automatically in development
      // No need to manually remove it in production
      
      // Completely remove ESLint from webpack config
      webpackConfig.module.rules = webpackConfig.module.rules.filter(rule => {
        if (rule.enforce === 'pre' && rule.test && rule.test.toString().includes('jsx')) {
          return false;
        }
        return true;
      });
      
      // Configure webpack resolve for proper module resolution
      if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
      }
      
      // Ensure proper file extensions are resolved
      if (!webpackConfig.resolve.extensions) {
        webpackConfig.resolve.extensions = [];
      }
      
      // Add extensions if not already present (ensuring .js is included)
      const requiredExtensions = ['.js', '.jsx', '.json'];
      requiredExtensions.forEach(ext => {
        if (!webpackConfig.resolve.extensions.includes(ext)) {
          webpackConfig.resolve.extensions.unshift(ext);
        }
      });
      
      // Disable fullySpecified to allow imports without .js extension
      webpackConfig.resolve.fullySpecified = false;
      
      // Ensure modules array includes proper resolution paths
      // Use relative paths from webpack config, not absolute paths
      if (!webpackConfig.resolve.modules) {
        webpackConfig.resolve.modules = ['node_modules'];
      }
      
      // Ensure node_modules is resolved from client directory
      const path = require('path');
      const nodeModulesPath = path.resolve(__dirname, 'node_modules');
      if (!webpackConfig.resolve.modules.includes(nodeModulesPath)) {
        webpackConfig.resolve.modules.unshift(nodeModulesPath);
      }
      
      // Add src directory to modules for absolute imports (if needed)
      const srcPath = path.resolve(__dirname, 'src');
      if (!webpackConfig.resolve.modules.includes(srcPath)) {
        webpackConfig.resolve.modules.push(srcPath);
      }
      
      // Fix symlinks resolution for proper module resolution
      webpackConfig.resolve.symlinks = true;
      
      return webpackConfig;
    },
  },
};

