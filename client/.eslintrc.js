module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    requireConfigFile: true,
    babelOptions: {
      configFile: require.resolve('./babel.config.js')
    }
  }
};

