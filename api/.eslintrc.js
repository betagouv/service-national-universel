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
    "no-unused-vars": "off",
    "no-inner-declarations": "warn",
    "jest/no-conditional-expect": "warn",
    "import/extensions": ["warn"],
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "jest/no-mocks-import": "warn",
  },
  plugins: ["@typescript-eslint", "eslint-plugin-import", "jest", "prettier"],
};
