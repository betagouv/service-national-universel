const config = {
  // verbose: true,
  roots: ["src/"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/__mocks__/", "/helpers/", "/fixtures/"],
  testSequencer: require.resolve("./jest-sequencer-alphabetical.js"),
};

module.exports = config;
