module.exports = {
    env: {
        browser: true,
        es2022: true,
        node: true,
        jest: true
    },
    extends: ["eslint:recommended"],
    globals: {
        cy: "readonly",
        Cypress: "readonly"
    },
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
            jsx: true
        }
    },
    ignorePatterns: [
        "client/build/**",
        "node_modules/**",
        "dist/**",
        "build/**",
        "temp-data/**",
        "test-results/**",
        "tests/ui/test-logs/**"
    ],
    plugins: ["boundaries"],
    settings: {
      "boundaries/elements": [
        { type: "ui", pattern: "client/src/**" },
        { type: "api", pattern: "src/api/**" },
        { type: "services", pattern: "src/services/**" },
        { type: "core", pattern: "src/core/**" },
        { type: "data", pattern: "src/data/**" }
      ]
    },
    rules: {
      "no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "boundaries/element-types": ["error", {
        default: "disallow",
        rules: [
          { from: "ui", allow: ["ui","services"] },
          { from: "services", allow: ["services","core","data"] },
          { from: "api", allow: ["api","services","data"] },
          { from: "core", allow: ["core"] },
          { from: "data", allow: ["data"] }
        ]
      }]
    }
  };
  