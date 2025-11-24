const config = {
  roots: ["src/"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/__mocks__/", "/helpers/", "/fixtures/", "/scripts/", "/config/", "/phase1/"],
  testMatch: ["**/?(*.)+(test).[jt]s?(x)"],
  preset: "ts-jest",
  coveragePathIgnorePatterns: ["/node_modules/", "/__mocks__/", "/helpers/", "/fixtures/", "/scripts/", "/config/", "/phase1/"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.build.json",
    },
  },
};

module.exports = config;
