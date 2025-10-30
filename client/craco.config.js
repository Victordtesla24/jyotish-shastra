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
    presets: [
      [
        '@babel/preset-react',
        {
          runtime: 'automatic',
          development: process.env.NODE_ENV !== 'production',
        },
      ],
    ],
    plugins: [
      // React Scripts automatically handles react-refresh/babel plugin
      // No need to add it manually to avoid duplicates
    ],
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

