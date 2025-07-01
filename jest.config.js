module.exports = {
  // Shared configuration options
  forceExit: true,
  testTimeout: 30000,
  verbose: false,
  bail: false,
  clearMocks: true,
  detectOpenHandles: true,
  maxWorkers: 1,

  // Run server (Node) and client (browser) tests with separate configs
  projects: [
    /**
     * -------------------------------
     * Backend / Node-side tests
     * -------------------------------
     */
    {
      displayName: 'server',

      // Node environment for API / service layer tests
      testEnvironment: 'node',

      // Load environment variables from .env file
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

      // Only run the dedicated tests in /tests and any *.test.* under src (server code)
      testMatch: [
        '**/tests/**/*.test.[jt]s',
        '**/tests/**/*.test.[jt]sx',
      ],

      // Coverage – include backend source only
      collectCoverageFrom: [
        'src/**/*.{js,ts}',
        '!src/index.js',
        '!**/node_modules/**',
      ],

      // Module aliasing (keep identical to legacy config)
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@tests/(.*)$': '<rootDir>/tests/$1',
      },

      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
        '^.+\\.css$': 'jest-transform-css',
      },

      testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/coverage/'],
    },

    /**
     * -------------------------------
     * Frontend / React client tests
     * -------------------------------
     */
    {
      displayName: 'client',

      // jsdom simulates the browser for React Testing Library etc.
      testEnvironment: 'jsdom',

      // Add client-specific setup (mocks etc.)
      setupFilesAfterEnv: ['<rootDir>/client/src/setupTests.js'],

      testMatch: [
        '<rootDir>/client/src/**/__tests__/**/*.[jt]s?(x)',
        '<rootDir>/client/src/**/*.{spec,test}.[jt]s?(x)',
      ],

      // Coverage – include client source only
      collectCoverageFrom: [
        'client/src/**/*.{js,jsx,ts,tsx}',
        '!**/node_modules/**',
      ],

      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^@client/(.*)$': '<rootDir>/client/src/$1',
      },

      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
        '^.+\\.css$': 'jest-transform-css',
      },

      testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/coverage/'],
    },
  ],
};
