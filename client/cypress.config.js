const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Add custom webpack configuration to handle Ajv dependency issues
      on('file:preprocessor', require('@cypress/webpack-preprocessor')({
        webpackOptions: {
          resolve: {
            fallback: {
              "ajv": require.resolve("ajv"),
              "fs": false,
              "os": false,
              "path": false
            }
          },
          module: {
            rules: [
              {
                test: /\.m?js$/,
                resolve: {
                  fullySpecified: false
                }
              }
            ]
          }
        },
        watchOptions: {}
      }));
    },
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
  },
});
