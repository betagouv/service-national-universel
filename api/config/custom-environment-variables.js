/*
Allow overrides of configuration from environment
(see https://github.com/node-config/node-config/wiki/Environment-Variables#custom-environment-variables)

By default every options defined in default.js are overridable from environment,
except the ones defined in BLACKLIST_KEYS
*/

const config = require("./default.js");

const BLACKLIST_KEYS = ["RUN_CRONS", "ENVIRONMENT", "PORT", "IMAGES_ROOTDIR", "FONT_ROOTDIR", "ENABLE_FLATTEN_ERROR_LOGS"];

const keys = Object.keys(config).filter((x) => !BLACKLIST_KEYS.includes(x));

const env = {};

for (const key of keys) {
  env[key] = key;
}

module.exports = env;
