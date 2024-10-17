const { env } = require("node:process");

function getEnv(name) {
  const value = env[name];
  if (!value) {
    throw new Error("A required environment variable is not set", {
      cause: name,
    });
  }
  return value;
}

function getEnvOrDefault(name, defaultVal) {
  const value = env[name];
  if (!value) {
    return defaultVal;
  }
  return value;
}

module.exports = {
  getEnv,
  getEnvOrDefault,
};
