const config = {
  // verbose: true,
  roots: ["src/"],
  testPathIgnorePatterns: ["/node_modules/", "/__mocks__/", "/helpers/", "/fixtures/"],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
};

module.exports = config;
