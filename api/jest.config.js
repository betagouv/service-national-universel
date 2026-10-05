const config = {
  roots: ["src/"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/__mocks__/", "/helpers/", "/fixtures/", "/scripts/", "/config/", "/phase1/"],
  testMatch: ["**/?(*.)+(test).[jt]s?(x)"],
  preset: "ts-jest",
  // file-type est ESM-only : voir src/__tests__/helpers/loadFileType.js.
  moduleNameMapper: { "^\\./loadFileType$": "<rootDir>/src/__tests__/helpers/loadFileType.js" },
  coveragePathIgnorePatterns: ["/node_modules/", "/__mocks__/", "/helpers/", "/fixtures/", "/scripts/", "/config/", "/phase1/"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.build.json",
    },
  },
};

module.exports = config;
