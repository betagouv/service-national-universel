module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:jest/recommended", "prettier"],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "prettier/prettier": ["warn"],
    "no-unused-vars": "warn",
    "no-inner-declarations": "warn",
    "jest/no-conditional-expect": "warn",
    "import/extensions": ["warn"],
  },
  plugins: ["eslint-plugin-import", "jest", "prettier"],
};
