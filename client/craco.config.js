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
  },
  webpack: {
    configure: (webpackConfig) => {
      // Resolve deprecation warnings
      webpackConfig.ignoreWarnings = [/DEP0176/];
      return webpackConfig;
    },
  },
};

