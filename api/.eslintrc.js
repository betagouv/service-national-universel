module.exports = {
  root: true,
  env: {
    browser: false,
    commonjs: true,
    node: true,
    es6: true,
  },
  extends: ["eslint:recommended", "plugin:import/recommended", "plugin:prettier/recommended"],
  plugins: ["prettier"],
  parserOptions: {
    ecmaVersion: 2020,
  },
};
