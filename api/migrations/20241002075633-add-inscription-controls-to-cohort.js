module.exports = {
  async up(db) {
    await db.collection("cohorts").updateMany(
      {},
      {
        $set: {
          inscriptionOpenForReferentClasse: false,
          inscriptionOpenForReferentRegion: false,
          inscriptionOpenForReferentDepartment: false,
          inscriptionOpenForAdministrateurCle: false,
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
