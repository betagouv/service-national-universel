const migrateMongo = require("migrate-mongo");
const config = require("config");
const { up, status, config: migrateMongoConfig } = migrateMongo;
const { getDb } = require("./mongo");

const CHANGHELOG_LOCK_COLLECTION = "changeloglock";
const CHANGELOG_LOCK_ID = "changeloglock_id";

const runMigrations = async () => {
  const db = getDb();
  migrateMongoConfig.set(migrateMongoConfiguration);
  db.on("connected", async () => {
    const isLocked = await isChangelogLocked(db);
    if (isLocked) {
      console.error("runMigrations - Changelog is locked. Skipping migrations");
    }
    if (!isLocked) {
      console.log("runMigrations - Connected to MongoDB");
      try {
        const statusResult = await status(db);
        console.log("runMigrations - Migration status:", JSON.stringify(statusResult));

        await doMigrations(db);
      } catch (error) {
        console.error("runMigrations - Migration failed: ", error);
      } finally {
        await unlockChangelogLock(db);
      }
    }
  });
};

const unlockChangelogLock = async (db) => {
  await db.collection(CHANGHELOG_LOCK_COLLECTION).updateOne(
    { _id: CHANGELOG_LOCK_ID },
    {
      $set: {
        locked: false,
        lockedBy: null,
        lockedAt: null,
      },
    },
  );
};

const isChangelogLocked = async (db) => {
  const changeloglock = await db.collection(CHANGHELOG_LOCK_COLLECTION).findOne({ _id: CHANGELOG_LOCK_ID });
  return changeloglock?.locked === true;
};

const doMigrations = async (db) => {
  await db.collection(CHANGHELOG_LOCK_COLLECTION).updateOne({ _id: CHANGELOG_LOCK_ID }, { $set: { locked: true, lockedBy: "runMigrations", lockedAt: new Date() } });
  const migrationResult = await up(db);
  console.log("runMigrations - Migrations completed:", migrationResult);
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
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js",
  moduleSystem: "commonjs",
};

module.exports = { runMigrations };
