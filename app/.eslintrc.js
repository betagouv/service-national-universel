module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    node: true,
    es6: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:import/recommended", "plugin:import/errors", "plugin:import/warnings", "plugin:prettier/recommended"],
  plugins: ["prettier", "import"],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "react/jsx-no-duplicate-props": "warn",
    "react/prop-types": "off",
    "no-unreachable": "warn",
    "no-unused-vars": "warn",
    "import/no-unused-modules": [
      1,
      {
        unusedExports: true,
        missingExports: true,
        ignoreExports: ["./.eslintrc.js", "./webpack.config.js", "./webpack.dev.config.js", "./tailwind.config.js"],
      },
    ],
  },
  settings: {
    "import/extensions": [".js", ".jsx"],
  },
};
