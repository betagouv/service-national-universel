module.exports = {
  async up(db) {
    await db.collection("cohorts").updateMany(
      {},
      {
        $set: {
          inscriptionOpenForReferentClasse: true,
          inscriptionOpenForReferentRegion: true,
          inscriptionOpenForReferentDepartment: true,
          inscriptionOpenForAdministrateurCle: true,
        },
      },
    );
  },

  async down(db) {
    await db.collection("cohorts").updateMany(
      {},
      {
        $unset: {
          inscriptionOpenForReferentClasse: "",
          inscriptionOpenForReferentRegion: "",
          inscriptionOpenForReferentDepartment: "",
          inscriptionOpenForAdministrateurCle: "",
        },
      },
    );
  },
};
