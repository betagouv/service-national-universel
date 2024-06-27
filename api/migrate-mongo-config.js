// Keep this configuration to allow using the migrate-mongo create command
const migrateMongoConfig = {
  migrationsDir: "migrations",
  migrationFileExtension: ".js",
  moduleSystem: "commonjs",
};

module.exports = migrateMongoConfig;
