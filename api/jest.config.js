const config = {
  // verbose: true,
  roots: ["src/"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/__mocks__/", "/helpers/", "/fixtures/", "/scripts/", "/config/"],
  testSequencer: require.resolve("./jest-sequencer-alphabetical.js"),
  testMatch: ["**/?(*.)+(test).[jt]s?(x)"],
  preset: "ts-jest",
  coveragePathIgnorePatterns: ["/node_modules/", "/__mocks__/", "/helpers/", "/fixtures/", "/scripts/", "/config/"],
  globals: {
    "ts-jest": {
      tsconfig: "build.tsconfig.json",
    },
  },
};

module.exports = config;
