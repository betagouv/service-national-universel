// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended", "prettier"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "prettier"],
  rules: {
    "react/prop-types": 0,
    "prettier/prettier": ["warn"],
    "no-unused-vars": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
