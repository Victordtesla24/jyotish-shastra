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
  babel: {
    // Let React Scripts handle all Babel configuration automatically
    // This prevents conflicts with JSX transforms and react-refresh
  },
  webpack: {
    configure: (webpackConfig) => {
      // Resolve deprecation warnings
      webpackConfig.ignoreWarnings = [/DEP0176/];
      
      // Disable React Refresh in production builds
      const isProduction = process.env.NODE_ENV === 'production' || 
                          process.env.BABEL_ENV === 'production' ||
                          !process.env.NODE_ENV || 
                          webpackConfig.mode === 'production';
      
      // React Scripts handles react-refresh automatically in development
      // No need to manually remove it in production
      
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

