// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:react/jsx-runtime", "plugin:react-hooks/recommended", "plugin:@next/next/recommended", "prettier"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "react-hooks", "@next/next", "prettier"],
  rules: {
    "react/prop-types": 0,
    "prettier/prettier": ["warn"],
    "no-unused-vars": "warn",
    "no-async-promise-executor": "warn",
    "react/no-unescaped-entities": "off",
    "react-hooks/rules-of-hooks": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
