module.exports = {
  root: true,
  env: {
    browser: false,
    commonjs: true,
    node: true,
    es6: true,
    jest: true,
  },
  extends: ["eslint:recommended", "plugin:import/recommended", "plugin:prettier/recommended"],
  plugins: ["prettier"],
  ignorePatterns: ["dist/*.js"],
  parserOptions: {
    ecmaVersion: 2021,
  },
};
