module.exports = {
  testEnvironment: 'node', // Use Node.js environment for Puppeteer tests
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^mongoose$': '<rootDir>/tests/__mocks__/mongoose.js',
    '^ws$': '<rootDir>/tests/__mocks__/ws.js'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js', '<rootDir>/tests/ui/setup-websocket.js'],
  testMatch: [
    '<rootDir>/tests/ui/**/*.test.js',
    '<rootDir>/tests/ui/**/*.test.jsx'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    'client/src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/**/*.test.{js,jsx}',
    '!client/src/**/*.test.{js,jsx}'
  ],
  moduleDirectories: ['node_modules', '<rootDir>/src', '<rootDir>/client/src'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(swisseph|uuid|bson|mongodb|puppeteer)/)'
  ],
  testTimeout: 30000, // Increased timeout for Puppeteer tests
  verbose: true,
  // Puppeteer-specific configuration
  globalSetup: '<rootDir>/tests/ui/setup-puppeteer.js',
  globalTeardown: '<rootDir>/tests/ui/teardown-puppeteer.js'
};
