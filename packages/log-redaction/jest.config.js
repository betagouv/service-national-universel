const config = {
  roots: ["src/"],
  testEnvironment: "node",
  testMatch: ["**/?(*.)+(test).ts"],
  preset: "ts-jest",
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.spec.json" }],
  },
};

module.exports = config;
