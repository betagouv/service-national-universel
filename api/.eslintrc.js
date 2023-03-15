module.exports = {
  root: true,
  env: {
    browser: false,
    commonjs: true,
    node: true,
    es6: true,
    jest: true,
  },
  extends: ["eslint:recommended", "plugin:import/recommended", "plugin:prettier/recommended", "plugin:import/errors", "plugin:import/warnings"],
  plugins: ["prettier", "jest"],
  parserOptions: {
    ecmaVersion: 2021,
  },
  rules: {
    "no-unreachable": "warn",
    "no-unused-vars": "warn",
    "import/no-unused-modules": [
      1,
      {
        unusedExports: true,
        missingExports: true,
        ignoreExports: ["./.eslintrc.js", "./jest.config.js"],
      },
    ],
  },
  settings: {
    "import/extensions": [".js"],
  },
};
