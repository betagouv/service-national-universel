const { CohortModel, CohesionCenterModel, PointDeRassemblementModel, ReferentModel } = require("../src/models");
const collectionsWithCohortIdsToAdd = [CohesionCenterModel, PointDeRassemblementModel, ReferentModel];
const { logger } = require("../src/logger");

module.exports = {
  async up() {
    const cohorts = await CohortModel.find({}, { name: 1 }).lean();
    const cohortsMap = new Map();
    for (const cohort of cohorts) {
      cohortsMap.set(cohort.name, cohort._id?.toString());
    }

    const addCohortIdsToCollection = async (mongooseModel, cohortsMap) => {
      let updatedDocumentsCount = 0;
      const documents = await mongooseModel.find({ cohorts: { $exists: true } });

      for (const document of documents) {
        const cohortIds = document.cohorts.map((cohortName) => cohortsMap.get(cohortName));
        if (cohortIds?.length === 0) {
          continue;
        }
        document.set({ cohortIds });
        await document.save();
        updatedDocumentsCount++;
      }

      return updatedDocumentsCount;
    };

    for (const mongooseModel of collectionsWithCohortIdsToAdd) {
      const updatedDocumentsCount = await addCohortIdsToCollection(mongooseModel, cohortsMap);
      logger.info(`Total documents updated: ${updatedDocumentsCount} on ${mongooseModel.collection.name}`);
    }
  },

  async down() {
    for (const mongooseModel of collectionsWithCohortIdsToAdd) {
      const updatedDocuments = await mongooseModel.updateMany({ cohortIds: { $exists: true } }, { $unset: { cohortIds: 1 } });
      logger.info(`Collection ${mongooseModel.collection.name} - Matched: ${updatedDocuments.matchedCount} Removed property cohortId on : ${updatedDocuments.modifiedCount}`);
    }
  },
};
