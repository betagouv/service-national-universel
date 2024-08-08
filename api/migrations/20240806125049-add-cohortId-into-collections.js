const { CohortModel } = require("../src/models");
const collectionsWithCohortIdToAdd = [
  "youngs",
  "importplandetransports",
  "lignebuses",
  "modificationbuses",
  "plandetransports",
  "pointderassemblements",
  "schemaderepartitions",
  "tablederepartitions",
  "applications",
  "buses",
  "classes",
  "departmentservices",
  "inscriptiongoals",
  "stats-young-centers",
  "meetingpoints",
  "sessionphase1",
];

module.exports = {
  async up(db) {
    const cohorts = await CohortModel.find({}, { name: 1 }).lean();
    const cohortsMap = new Map();
    for (const cohort of cohorts) {
      cohortsMap.set(cohort.name, cohort._id?.toString());
    }
    let updatedDocumentsCount = 0;
    let updatedDocumentsForOriginalCohortCount = 0;

    const addCohortIdToCollection = async (collectionName, cohort) => {
      let updatedDocuments = await db.collection(collectionName).updateMany({ cohort: cohort[0] }, { $set: { cohortId: cohort[1] } });

      updatedDocumentsCount += updatedDocuments.modifiedCount;
      console.log(
        `Collection ${collectionName} - Added cohortId: ${cohort[1]} for cohort: ${cohort[0]} - Matched: ${updatedDocuments.matchedCount}, Added property cohortId : ${updatedDocuments.modifiedCount}`,
      );
    };

    const addOriginalCohortIdToCollection = async (collectionName, cohort) => {
      let updatedDocuments = await db.collection(collectionName).updateMany({ originalCohort: cohort[0] }, { $set: { originalCohortId: cohort[1] } });

      updatedDocumentsForOriginalCohortCount += updatedDocuments.modifiedCount;
      console.log(
        `Collection ${collectionName} - Added originalCohortId: ${cohort[1]} for originalCohort: ${cohort[0]} - Matched: ${updatedDocuments.matchedCount}, Added property originalCohortId : ${updatedDocuments.modifiedCount}`,
      );
    };

    // For every collection declared above
    for (const collectionName of collectionsWithCohortIdToAdd) {
      updatedDocumentsCount = 0;
      for (const cohort of cohortsMap) {
        await addCohortIdToCollection(collectionName, cohort);
      }
      console.log(`Total documents updated: ${updatedDocumentsCount} on ${collectionName}`);
    }

    // Collections with originalCohort field : youngs
    for (const cohort of cohortsMap) {
      await addOriginalCohortIdToCollection("youngs", cohort);
    }
    console.log(`Total documents updated for originalCohortId: ${updatedDocumentsForOriginalCohortCount}`);
  },

  async down(db) {
    for (const collectionName of collectionsWithCohortIdToAdd) {
      const updatedDocuments = await db.collection(collectionName).updateMany({ cohortId: { $exists: true } }, { $unset: { cohortId: 1 } });
      console.log(`Collection ${collectionName} - Matched: ${updatedDocuments.matchedCount} Removed property cohortId on : ${updatedDocuments.modifiedCount}`);
    }
    const updatedDocumentsForOriginalCohort = await db.collection("youngs").updateMany({ originalCohortId: { $exists: true } }, { $unset: { originalCohortId: 1 } });
    console.log(
      `Collection youngs - Matched: ${updatedDocumentsForOriginalCohort.matchedCount} Removed property originalCohortId on : ${updatedDocumentsForOriginalCohort.modifiedCount}`,
    );
  },
};
