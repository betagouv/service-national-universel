const migrateMongo = require("migrate-mongo");

const { up, status } = migrateMongo;
const { getDb } = require("./mongo");

const CHANGHELOG_LOCK_COLLECTION = "changeloglock";
const CHANGELOG_LOCK_ID = "changeloglock_id";

const runMigrations = async () => {
  const db = getDb();
  db.on("connected", async () => {
    const isLocked = await isChangelogLocked(db);
    if (isLocked) {
      console.error("runMigrations - Changelog is locked. Skipping migrations");
      await unlockChangelogLock(db);
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

module.exports = runMigrations;
