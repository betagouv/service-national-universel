module.exports = {
  async up(db) {
    await db.collection("etablissements").updateMany({ region: "Ile-de-France" }, { $set: { region: "Île-de-France" } });

    await db.collection("classes").updateMany({ region: "Ile-de-France" }, { $set: { region: "Île-de-France" } });
  },
};
