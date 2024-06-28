// Keep this configuration to allow using the migrate-mongo command line (in package.json)
const { migrateMongoConfiguration } = require("./src/migration");
module.exports = migrateMongoConfiguration;
