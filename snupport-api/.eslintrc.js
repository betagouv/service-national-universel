module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:jest/recommended", "prettier"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "prettier/prettier": ["warn"],
    "no-unused-vars": "warn",
    "jest/no-conditional-expect": "warn",
  },
  plugins: ["prettier", "jest"],
};
