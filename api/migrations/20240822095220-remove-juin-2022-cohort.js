const {
  CohortModel,
  YoungModel,
  ImportPlanTransportModel,
  LigneBusModel,
  ModificationBusModel,
  PlanTransportModel,
  PointDeRassemblementModel,
  SchemaDeRepartitionModel,
  TableDeRepartitionModel,
  ApplicationModel,
  BusModel,
  ClasseModel,
  DepartmentServiceModel,
  InscriptionGoalModel,
  MeetingPointModel,
  SessionPhase1Model,
} = require("../src/models");
const collectionsWithCohortIdToCheck = [
  YoungModel,
  ImportPlanTransportModel,
  LigneBusModel,
  ModificationBusModel,
  PlanTransportModel,
  PointDeRassemblementModel,
  SchemaDeRepartitionModel,
  TableDeRepartitionModel,
  ApplicationModel,
  BusModel,
  ClasseModel,
  DepartmentServiceModel,
  InscriptionGoalModel,
  MeetingPointModel,
  SessionPhase1Model,
];
const { logger } = require("../src/logger");
const collectionsWithOriginalCohortIdToCheck = [YoungModel];
module.exports = {
  async up() {
    const cohorts = await CohortModel.find({ name: "Juin 2022" });

    let totalOfDocumentsLinkedToCohort0 = 0;
    let totalOfDocumentsLinkedToCohort1 = 0;
    for (const mongooseModel of collectionsWithCohortIdToCheck) {
      const documentsWithCohort0 = await mongooseModel.count({ cohortId: cohorts[0]._id });
      const documentsWithCohort1 = await mongooseModel.count({ cohortId: cohorts[1]._id });
      totalOfDocumentsLinkedToCohort0 += documentsWithCohort0;
      totalOfDocumentsLinkedToCohort1 += documentsWithCohort1;
      logger.info(
        `${mongooseModel.modelName} : ${documentsWithCohort0} documents with cohortId ${cohorts[0]._id} and ${documentsWithCohort1} documents with cohortId ${cohorts[1]._id}`,
      );
    }

    for (const mongooseModel of collectionsWithOriginalCohortIdToCheck) {
      const documentsWithCohort0 = await mongooseModel.count({ originalCohortId: cohorts[0]._id });
      const documentsWithCohort1 = await mongooseModel.count({ originalCohortId: cohorts[1]._id });
      totalOfDocumentsLinkedToCohort0 += documentsWithCohort0;
      totalOfDocumentsLinkedToCohort1 += documentsWithCohort1;

      logger.info(
        `${mongooseModel.modelName} : ${documentsWithCohort0} documents with originalCohortId ${cohorts[0]._id} and ${documentsWithCohort1} documents with cohortId ${cohorts[1]._id}`,
      );
    }
    logger.info(`${totalOfDocumentsLinkedToCohort0} documents for cohort._id : ${cohorts[0]._id}`);
    logger.info(`${totalOfDocumentsLinkedToCohort1} documents for cohort._id : ${cohorts[1]._id}`);

    if (totalOfDocumentsLinkedToCohort0 === 0) {
      logger.info(`Removing cohort with _id : ${cohorts[0]._id}`);
      await CohortModel.deleteOne({ _id: cohorts[0]._id });
    }
  },

  async down() {},
};
