module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^mongoose$': '<rootDir>/tests/__mocks__/mongoose.js',
    '^(.*/)?wasm-loader\\.js$': '<rootDir>/tests/__mocks__/wasm-loader.js',
    '^.*/wasm-loader$': '<rootDir>/tests/__mocks__/wasm-loader.js'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.test.jsx',
    '<rootDir>/tests/**/*.test.cjs'
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
