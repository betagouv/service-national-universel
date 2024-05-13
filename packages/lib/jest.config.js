module.exports = {
  globals: {
    "js-jest": {
      isolatedModules: true,
    },
  },
  moduleFileExtensions: ["js", "json"],
  modulePaths: ["<rootDir>"],
  testRegex: ".*.spec.js$",
  testPathIgnorePatterns: ["/(common-js|node_modules)/"],
  testEnvironment: "node",
};
