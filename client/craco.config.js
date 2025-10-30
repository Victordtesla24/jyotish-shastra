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
      // Only enable React Refresh in development
      ...(process.env.NODE_ENV !== 'production'
        ? [['react-refresh/babel', { skipEnvCheck: false }]]
        : []),
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
      
      if (isProduction) {
        // Find and remove React Refresh plugin
        if (webpackConfig.plugins) {
          webpackConfig.plugins = webpackConfig.plugins.filter(
            (plugin) => {
              // Check if plugin is ReactRefreshPlugin or react-refresh
              const pluginName = plugin?.constructor?.name || '';
              return !pluginName.includes('ReactRefresh') && 
                     !pluginName.includes('react-refresh');
            }
          );
        }
        
        // Remove React Refresh from babel-loader options
        const processBabelLoader = (useItem) => {
          if (useItem.loader && useItem.loader.includes('babel-loader')) {
            if (useItem.options && useItem.options.plugins) {
              useItem.options.plugins = useItem.options.plugins.filter(
                (plugin) => {
                  // Remove react-refresh plugin
                  if (Array.isArray(plugin)) {
                    const pluginPath = plugin[0] || '';
                    return !String(pluginPath).includes('react-refresh') &&
                           !String(pluginPath).includes('react-refresh/babel');
                  }
                  return !String(plugin).includes('react-refresh');
                }
              );
            }
          }
        };
        
        webpackConfig.module.rules.forEach((rule) => {
          if (rule.oneOf) {
            rule.oneOf.forEach((loader) => {
              if (loader.use && Array.isArray(loader.use)) {
                loader.use.forEach(processBabelLoader);
              } else if (loader.use) {
                processBabelLoader(loader.use);
              }
            });
          }
          
          // Also check regular rules
          if (rule.use) {
            if (Array.isArray(rule.use)) {
              rule.use.forEach(processBabelLoader);
            } else {
              processBabelLoader(rule.use);
            }
          }
        });
        
        // Also check for babel-loader in test rules
        webpackConfig.module.rules.forEach((rule) => {
          if (rule.test && String(rule.test).includes('jsx')) {
            if (rule.use && Array.isArray(rule.use)) {
              rule.use.forEach(processBabelLoader);
            } else if (rule.use) {
              processBabelLoader(rule.use);
            }
          }
        });
      }
      
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

