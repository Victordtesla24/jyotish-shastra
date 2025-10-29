/**
 * CRACO Configuration
 * Override Create React App webpack configuration
 */

module.exports = {
  devServer: {
    allowedHosts: 'all',
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
  webpack: {
    configure: (webpackConfig) => {
      // Resolve deprecation warnings
      webpackConfig.ignoreWarnings = [/DEP0176/];
      
      // Completely remove ESLint from webpack config
      webpackConfig.module.rules = webpackConfig.module.rules.filter(rule => {
        if (rule.enforce === 'pre' && rule.test && rule.test.toString().includes('jsx')) {
          return false;
        }
        return true;
      });
      
      return webpackConfig;
    },
  },
};

