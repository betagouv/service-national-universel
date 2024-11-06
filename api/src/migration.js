const migrateMongo = require("migrate-mongo");
const config = require("config");
const { up, status, config: migrateMongoConfig } = migrateMongo;
const { getDb } = require("./mongo");
const { capture } = require("./sentry");
const { logger } = require("./logger");

const CHANGHELOG_LOCK_COLLECTION = "migrationchangeloglock";
const CHANGELOG_LOCK_ID = "changeloglock_id";

const runMigrations = async () => {
  const db = getDb();
  migrateMongoConfig.set(migrateMongoConfiguration);
  const isLocked = await isChangelogLocked(db);
  if (isLocked) {
    logger.warn("runMigrations - Changelog is locked. Skipping migrations");
    return;
  }
  if (!config.DO_MIGRATION) {
    logger.info("runMigrations - Won't run migrations as DO_MIGRATION is false");
    return;
  }

  try {
    const statusResult = await status(db);
    logger.info("runMigrations - Migration status:", statusResult);

    await doMigrations(db);
  } catch (error) {
    capture(error);
  } finally {
    await unlockChangelogLock(db);
  }
};

const unlockChangelogLock = async (db) => {
  await db.collection(CHANGHELOG_LOCK_COLLECTION).updateOne(
    { _id: CHANGELOG_LOCK_ID },
    {
      $set: {
        locked: false,
        lockedBy: null,
        lockedAt: null,
        lockedByEnvironment: null,
        apiUrlEnvironment: null,
      },
    },
  );
};

const isChangelogLocked = async (db) => {
  const changeloglock = await db.collection(CHANGHELOG_LOCK_COLLECTION).findOne({ _id: CHANGELOG_LOCK_ID });
  return changeloglock?.locked === true;
};

const doMigrations = async (db) => {
  await db
    .collection(CHANGHELOG_LOCK_COLLECTION)
    .updateOne(
      { _id: CHANGELOG_LOCK_ID },
      { $set: { locked: true, lockedBy: "runMigrations", lockedAt: new Date(), lockedByEnvironment: config?.ENVIRONMENT, apiUrlEnvironment: config?.API_URL } },
    );
  const migrationResult = await up(db);
  logger.info("runMigrations - Migrations completed:", migrationResult);
};

const migrateMongoConfiguration = {
  mongodb: {
    url: config.MONGO_URL,
    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
    },
  },
  migrationsDir: config.ENVIRONMENT === "development" ? "migrations" : "api/migrations",
  changelogCollectionName: "migrationchangelog",
  migrationFileExtension: ".js",
  moduleSystem: "commonjs",
};

module.exports = { runMigrations, migrateMongoConfiguration };
