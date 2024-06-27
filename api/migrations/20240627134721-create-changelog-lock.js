module.exports = {
  async up(db) {
    await db.collection("changeloglock").insertOne({
      _id: "changeloglock_id",
      locked: false,
      lockedBy: "",
    });
  },
};
