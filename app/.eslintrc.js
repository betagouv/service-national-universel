module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:react-hooks/recommended", "prettier"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "react-hooks", "eslint-plugin-import", "prettier"],
  rules: {
    "react/prop-types": 0,
    "prettier/prettier": ["warn"],
    "no-unused-vars": "warn",
    "no-async-promise-executor": "warn",
    "react/no-unescaped-entities": "off",
    "react-hooks/rules-of-hooks": "warn",
    "import/extensions": ["error"],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
