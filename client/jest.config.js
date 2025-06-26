module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Force Jest to exit when tests complete
  forceExit: true,

  // Detect open handles to identify hanging operations
  detectOpenHandles: true,

  // Set reasonable timeout for tests (30 seconds)
  testTimeout: 30000,

  // Use only one worker to avoid conflicts
  maxWorkers: 1,

  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.test.ts'
  ],

  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/index.js',
    '!**/node_modules/**'
  ],

  // Module path mapping for easier imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },

  // Setup files to run before tests
  // setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Transform settings for modern JS (commented out - may not be needed)
  // transform: {
  //   '^.+\\.js$': 'babel-jest'
  // },

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/'
  ],

  // Verbose output for debugging
  verbose: false,

  // Exit on first test failure to speed up debugging
  bail: false
};
