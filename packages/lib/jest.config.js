module.exports = {
  globals: {
    "js-jest": {
      isolatedModules: true,
    },
  },
  moduleFileExtensions: ["js", "json", "ts"],
  modulePaths: ["<rootDir>"],
  testRegex: ".*.spec.js$",
  testPathIgnorePatterns: ["/(common-js|node_modules)/"],
  testEnvironment: "node",
  preset: "ts-jest",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
};
