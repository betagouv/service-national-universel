module.exports = {
  async up(db) {
    await db.collection("migrationchangeloglock").insertOne({
      _id: "changeloglock_id",
      locked: false,
      lockedBy: "",
    });
  },
};
