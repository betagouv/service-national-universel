const config = {
  roots: ["src/"],
  testEnvironment: "node",
  // file-type est ESM-only : voir src/__tests__/helpers/loadFileType.js.
  moduleNameMapper: { "^\\./loadFileType$": "<rootDir>/src/__tests__/helpers/loadFileType.js" },
  testPathIgnorePatterns: ["/node_modules/", "/__mocks__/", "/helpers/", "/fixtures/", "/scripts/"],
  testMatch: ["**/?(*.)+(test).[jt]s?(x)"],
  coveragePathIgnorePatterns: ["/node_modules/", "/__mocks__/", "/helpers/", "/fixtures/", "/scripts/"],
  // Controllers require the TypeScript middlewares (validation, authenticationGuards),
  // so route-level tests need the .ts files transformed.
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { isolatedModules: true, diagnostics: false }],
  },
};

module.exports = config;
