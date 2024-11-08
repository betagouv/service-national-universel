module.exports = {
  async up(db) {
    await db.collection("youngs").updateMany(
      {
        inscriptionStep2023: "WAITING_CONSENT",
        parentAllowSNU: "true",
        $or: [{ parent1AllowSNU: "true" }, { parent2AllowSNU: "true" }],
      },
      {
        $set: { inscriptionStep2023: "DONE" },
      },
    );
    await db.collection("youngs").updateMany(
      {
        reinscriptionStep2023: "WAITING_CONSENT",
        parentAllowSNU: "true",
        $or: [{ parent1AllowSNU: "true" }, { parent2AllowSNU: "true" }],
      },
      {
        $set: { reinscriptionStep2023: "DONE" },
      },
    );
  },
};
