module.exports = {
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
  moduleFileExtensions: ["js", "json", "ts"],
  modulePaths: ["<rootDir>/src"],
  testRegex: ".*.spec.(js|ts)$",
  testPathIgnorePatterns: ["/(dist|common-js|node_modules)/"],
  testEnvironment: "node",
  preset: "ts-jest",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "ts-jest",
  },
};
