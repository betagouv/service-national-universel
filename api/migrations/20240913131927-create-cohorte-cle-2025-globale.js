const { STATUS_CLASSE, COHORT_TYPE } = require("snu-lib");
const { CohortModel, ClasseModel } = require("../src/models");
const { logger } = require("../src/logger");

const cohortName = "2025 CLE Globale";

module.exports = {
  async up() {
    try {
      const classesVerifiedAndNoCohort = await ClasseModel.find({ $or: [{ cohortId: { $exists: false } }, { cohortId: null }], status: STATUS_CLASSE.VERIFIED });
      const cohort = new CohortModel({
        snuId: cohortName,
        name: cohortName,
        dateStart: new Date("2024-01-01"),
        dateEnd: new Date("2024-12-31"),
        type: COHORT_TYPE.CLE,
        eligibility: {
          zones: ["A", "B", "C"],
          schoolLevels: ["4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "1ereCAP", "2ndeCAP", "Autre", "NOT_SCOLARISE"],
          bornAfter: new Date("2010-01-01"),
          bornBefore: new Date("2007-12-31"),
        },
        inscriptionStartDate: new Date("2024-09-18"),
        inscriptionEndDate: new Date("2024-11-30"),
        instructionEndDate: new Date("2024-11-30"),
        buffer: 1,
        event: "Event Name",
      });

      const cohortCle2025Saved = await cohort.save();
      logger.info(`Cohorte ${cohortName} is created with success (id: ${cohortCle2025Saved._id})`);

      const updateResult = await ClasseModel.updateMany(
        { _id: { $in: classesVerifiedAndNoCohort.map((classe) => classe._id) } },
        { $set: { cohortId: cohortCle2025Saved._id, cohort: cohortCle2025Saved.name } },
      );
      logger.info(`${updateResult.modifiedCount} classes added to cohort ${cohortName}`);
    } catch (error) {
      logger.error(`Error while migration up: ${error.message}`);
      throw error;
    }
  },

  async down() {
    try {
      const cohortCle2025ToDelete = await CohortModel.findOne({ name: cohortName });

      if (cohortCle2025ToDelete === null) {
        logger.info(`Cohorte ${cohortName} not found`);
        return;
      }

      const updateResult = await ClasseModel.updateMany({ cohortId: cohortCle2025ToDelete._id }, { $set: { cohortId: null, cohort: null } });
      logger.info(`${updateResult.modifiedCount} Classes removed from cohort ${cohortName}`);
      await CohortModel.deleteOne({ name: cohortName });
      logger.info(`Cohorte ${cohortName} is deleted with success`);
    } catch (error) {
      logger.error(`Error while migration down: ${error.message}`);
    }
  },
};
