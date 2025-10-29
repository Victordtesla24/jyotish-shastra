module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^mongoose$': '<rootDir>/tests/__mocks__/mongoose.js'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
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
    'node_modules/(?!(swisseph|uuid|bson|mongodb)/)'
  ],
  testTimeout: 10000,
  verbose: true
};
