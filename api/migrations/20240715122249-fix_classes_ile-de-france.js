module.exports = {
  async up(db) {
    db.collection("etablissements").updateMany({ region: "Ile-de-France" }, { $set: { region: "Île-de-France" } });

    db.collection("classes").updateMany({ region: "Ile-de-France" }, { $set: { region: "Île-de-France" } });
  },
};
