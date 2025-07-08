const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');

// Environment-specific configurations
const environments = {
  local: {
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:8000/api'
  },
  development: {
    baseUrl: 'https://dev.jyotish-app.com',
    apiUrl: 'https://dev-api.jyotish-app.com'
  },
  staging: {
    baseUrl: 'https://staging.jyotish-app.com',
    apiUrl: 'https://staging-api.jyotish-app.com'
  },
  production: {
    baseUrl: 'https://jyotish-app.com',
    apiUrl: 'https://api.jyotish-app.com'
  }
};

// Get environment from process.env or default to local
const currentEnv = process.env.CYPRESS_ENV || 'local';
const envConfig = environments[currentEnv];

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Enhanced webpack configuration
      on('file:preprocessor', require('@cypress/webpack-preprocessor')({
        webpackOptions: {
          resolve: {
            fallback: {
              "ajv": require.resolve("ajv"),
              "fs": false,
              "os": false,
              "path": false,
              "stream": require.resolve("stream-browserify"),
              "crypto": require.resolve("crypto-browserify"),
              "buffer": require.resolve("buffer")
            },
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
          },
          module: {
            rules: [
              {
                test: /\.m?js$/,
                resolve: {
                  fullySpecified: false
                }
              },
              {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
              },
              {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env', '@babel/preset-react']
                  }
                }
              }
            ]
          }
        },
        watchOptions: {
          ignored: /node_modules/
        }
      }));

      // Custom task for database seeding
      on('task', {
        seedDatabase(fixture) {
          // Seed test database with fixture data
          return new Promise((resolve) => {
            console.log('Seeding database with:', fixture);
            resolve(null);
          });
        },

        clearDatabase() {
          // Clear test database
          return new Promise((resolve) => {
            console.log('Clearing test database');
            resolve(null);
          });
        },

        generateTestReport(results) {
          // Generate custom test report
          const reportPath = path.join(__dirname, 'cypress/reports/custom-report.json');
          fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
          return null;
        },

        log(message) {
          console.log(message);
          return null;
        },

        fileExists(filename) {
          return fs.existsSync(filename);
        },

        readFile(filename) {
          return fs.readFileSync(filename, 'utf8');
        }
      });

      // Browser launch options
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          // Add Chrome flags for better testing
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push('--allow-running-insecure-content');
          launchOptions.args.push('--disable-features=VizDisplayCompositor');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-dev-shm-usage');

          // Performance optimizations
          launchOptions.args.push('--disable-background-timer-throttling');
          launchOptions.args.push('--disable-backgrounding-occluded-windows');
          launchOptions.args.push('--disable-renderer-backgrounding');
        }

        if (browser.family === 'firefox') {
          // Firefox specific configurations
          launchOptions.preferences['media.navigator.permission.disabled'] = true;
          launchOptions.preferences['media.autoplay.default'] = 0;
        }

        return launchOptions;
      });

      // Environment configuration injection
      config.env = {
        ...config.env,
        ...envConfig,
        ENVIRONMENT: currentEnv,
        TEST_DATA_PATH: path.join(__dirname, 'cypress/fixtures'),
        SCREENSHOTS_PATH: path.join(__dirname, 'cypress/screenshots'),
        VIDEOS_PATH: path.join(__dirname, 'cypress/videos'),
        DOWNLOADS_PATH: path.join(__dirname, 'cypress/downloads')
      };

      // Conditional configuration based on environment
      if (currentEnv === 'production') {
        config.video = false;
        config.screenshotOnRunFailure = false;
      }

      return config;
    },

    // Base configuration
    baseUrl: envConfig.baseUrl,

    // Spec patterns
    specPattern: [
      'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
      'cypress/integration/**/*.spec.{js,jsx,ts,tsx}'
    ],

    // Exclude patterns
    excludeSpecPattern: [
      '**/examples/**',
      '**/node_modules/**',
      '**/.git/**'
    ],

    // Support file
    supportFile: 'cypress/support/e2e.js',

    // Fixtures
    fixturesFolder: 'cypress/fixtures',

    // Downloads
    downloadsFolder: 'cypress/downloads',

    // Screenshots and videos
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',

    // Video recording
    video: true,
    videoCompression: 32,
    videoUploadOnPasses: false,

    // Screenshots
    screenshotOnRunFailure: true,

    // Timeouts
    defaultCommandTimeout: 10000,
    execTimeout: 60000,
    taskTimeout: 60000,
    pageLoadTimeout: 30000,
    requestTimeout: 10000,
    responseTimeout: 30000,

    // Viewport
    viewportWidth: 1280,
    viewportHeight: 720,

    // Test isolation
    testIsolation: true,

    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0
    },

    // Experimental features
    experimentalStudio: true,
    experimentalWebKitSupport: false,
    experimentalMemoryManagement: true,

    // Security
    chromeWebSecurity: false,

    // Cookies and storage
    clearCookies: true,

    // Node events and plugins
    env: {
      // API configuration
      API_URL: envConfig.apiUrl,

      // Feature flags
      ENABLE_VISUAL_TESTING: true,
      ENABLE_API_TESTING: true,
      ENABLE_PERFORMANCE_TESTING: true,
      ENABLE_ACCESSIBILITY_TESTING: true,

      // Test data
      TEST_USER_EMAIL: 'test@example.com',
      TEST_USER_PASSWORD: 'TestPassword123!',

      // Jyotish-specific configurations
      ENABLE_KUNDLI_GENERATION: true,
      ENABLE_CHART_VALIDATION: true,
      VEDIC_CALCULATIONS_TIMEOUT: 15000,

      // Debugging
      DEBUG_MODE: false,
      VERBOSE_LOGGING: false,

      // Performance thresholds
      MAX_CHART_GENERATION_TIME: 5000,
      MAX_PAGE_LOAD_TIME: 3000,

      // Browser configurations
      HEADLESS: process.env.CI === 'true',

      // Report configurations
      GENERATE_REPORTS: true,
      REPORT_FORMAT: 'html',

      // Parallel execution
      PARALLEL_RUNS: process.env.CI === 'true' ? 4 : 1
    }
  },

  // Component testing configuration
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: {
        resolve: {
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        },
        module: {
          rules: [
            {
              test: /\.tsx?$/,
              use: 'ts-loader',
              exclude: /node_modules/
            },
            {
              test: /\.jsx?$/,
              exclude: /node_modules/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env', '@babel/preset-react']
                }
              }
            },
            {
              test: /\.css$/,
              use: ['style-loader', 'css-loader', 'postcss-loader']
            }
          ]
        }
      }
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js'
  },

  // Global configuration
  watchForFileChanges: true,
  animationDistanceThreshold: 5,
  waitForAnimations: true,
  scrollBehavior: 'center',

  // Browser configuration
  browsers: [
    {
      name: 'chrome',
      family: 'chromium',
      channel: 'stable',
      displayName: 'Chrome',
      version: 'detect',
      path: '',
      majorVersion: 'detect'
    },
    {
      name: 'firefox',
      family: 'firefox',
      channel: 'stable',
      displayName: 'Firefox',
      version: 'detect',
      path: '',
      majorVersion: 'detect'
    },
    {
      name: 'edge',
      family: 'chromium',
      channel: 'stable',
      displayName: 'Edge',
      version: 'detect',
      path: '',
      majorVersion: 'detect'
    }
  ],

  // Mobile viewport configurations
  // These can be used with cy.viewport() command
  mobileViewports: {
    iphone6: { width: 375, height: 667 },
    iphone6Plus: { width: 414, height: 736 },
    iphoneX: { width: 375, height: 812 },
    ipad: { width: 768, height: 1024 },
    androidPhone: { width: 360, height: 640 },
    androidTablet: { width: 800, height: 1280 }
  }
});
