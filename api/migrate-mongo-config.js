// Keep this configuration to allow using the migrate-mongo command line (in package.json)
const { migrateMongoConfiguration } = require("./src/migration");
const { initDB } = require("./src/mongo");
const config = require("config");

// This IIFE is needed to allow using mongoose into down script as it will be called from CLI
if (config.ENVIRONMENT === "development") {
  (async () => {
    console.log("MIGRATE-MONGO-CONFIG - Initializing database and Mongoose Connection...");
    await initDB();
  })();
}

module.exports = migrateMongoConfiguration;
