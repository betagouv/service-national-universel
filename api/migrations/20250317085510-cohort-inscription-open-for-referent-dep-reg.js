const { COHORT_TYPE } = require("snu-lib");
const { CohortModel } = require("../src/models");

module.exports = {
  async up(db, client) {
    await CohortModel.updateMany(
      { name: new RegExp(`${new Date().getFullYear()}`), type: COHORT_TYPE.VOLONTAIRE },
      { $set: { inscriptionOpenForReferentRegion: false, inscriptionOpenForReferentDepartment: false } },
    );
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
