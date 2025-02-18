const { YOUNG_STATUS } = require("snu-lib");
const { SessionPhase1Model, CohortModel, CohesionCenterModel, YoungModel } = require("../src/models");
const { logger } = require("../src/logger");

const { ObjectId } = require("mongoose").Types;

const data = [
  {
    sessionId: "61e0440cc6470a07ce47e011",
    centerId: "609bebc40c1cc9a888ae907a",
    cohortName: "Février 2022",
  },
  {
    sessionId: "61e041c4d6d38907c8e6004a",
    centerId: "63bec528b6afd806283c0578",
    cohortName: "Février 2022",
  },
];

function createSessionPhase1({ sessionId, center, cohort, placesTaken }) {
  // Les volontaires ont déjà un sessionId : on n'y touche pas, on recrée les sessions manquantes et on rajoute le centerId aux jeunes.
  const placesTotal = center.placesTotal || 0;
  return new SessionPhase1Model({
    _id: new ObjectId(sessionId),
    cohesionCenterId: center.id,
    cohort: cohort.name,
    headCenterId: center.id,
    placesTotal: center.placesTotal,
    placesLeft: Math.floor(placesTotal - placesTaken),
    status: "VALIDATED",
    cityCentre: center.city,
    codeCentre: center.code,
    department: center.department,
    nameCentre: center.name,
    region: center.region,
    zipCentre: center.zip,
    hasTimeSchedule: false,
    timeScheduleFiles: [],
    hasPedagoProject: false,
    pedagoProjectFiles: [],
    cohortId: cohort.id,
  });
}

module.exports = {
  async up() {
    for await (const session of data) {
      const cohort = await CohortModel.findOne({ name: session.cohortName });
      if (!cohort) {
        logger.error(`❌ Cohort not found: ${session.cohortName}`);
        continue;
      }
      const center = await CohesionCenterModel.findById(session.centerId);
      if (!center) {
        logger.error(`❌ Cohesion center not found: ${session.centerId}`);
        continue;
      }
      const placesTaken = await YoungModel.countDocuments({ sessionPhase1Id: session.sessionId, status: YOUNG_STATUS.VALIDATED });
      const sessionToCreate = createSessionPhase1({
        sessionId: session.sessionId,
        center,
        cohort,
        placesTaken,
      });

      const res = await sessionToCreate.save();
      logger.info(`✅ Session created: ${res._id}`);

      logger.info(`✅ Updating youngs for session ${session.sessionId}`);
      await YoungModel.updateMany({ sessionPhase1Id: session.sessionId }, { cohesionCenterId: center.id });
    }
  },

  async down() {
    for (const session of data) {
      await SessionPhase1Model.deleteOne({ _id: session.sessionId });
      await YoungModel.updateMany({ sessionPhase1Id: session.sessionId }, { $unset: { cohesionCenterId: "" } });
    }
  },
};
