const config = {
  // verbose: true,
  roots: ["src/"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/__mocks__/", "/helpers/", "/fixtures/", "/scripts/", "/config/"],
  testSequencer: require.resolve("./jest-sequencer-alphabetical.js"),
  testMatch: ["**/?(*.)+(test).[jt]s?(x)"],
  preset: "ts-jest",
};

module.exports = config;
