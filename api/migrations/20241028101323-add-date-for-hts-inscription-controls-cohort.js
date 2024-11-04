module.exports = {
  async up(db) {
    await db.collection("cohorts").updateMany(
      {},
      {
        $set: {
          inscriptionHTSStartOffsetForReferentRegion: 0,
          inscriptionHTSEndOffsetForReferentRegion: 0,
          inscriptionHTSStartOffsetForReferentDepartment: 0,
          inscriptionHTSEndOffsetForReferentDepartment: 0,
        },
      },
    );
  },

  async down(db) {
    await db.collection("cohorts").updateMany(
      {},
      {
        $unset: {
          inscriptionHTSStartOffsetForReferentRegion: "",
          inscriptionHTSEndOffsetForReferentRegion: "",
          inscriptionHTSStartOffsetForReferentDepartment: "",
          inscriptionHTSEndOffsetForReferentDepartment: "",
        },
      },
    );
  },
};
