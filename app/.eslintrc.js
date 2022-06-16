module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    node: true,
    es6: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:import/recommended", "plugin:prettier/recommended"],
  plugins: ["prettier"],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "react/jsx-no-duplicate-props": "warn",
    "react/prop-types": "off",
    "no-unreachable": "warn",
  },
};
