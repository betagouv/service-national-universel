const { LigneBusModel, LigneToPointModel, CohortModel, PointDeRassemblementModel } = require("../../../models");

const getNewLigneBusFixture = require("../../fixtures/PlanDeTransport/ligneBus");
const getNewLigneToPointFixture = require("../../fixtures/PlanDeTransport/ligneToPoint");
const getNewCohortFixture = require("../../fixtures/cohort");

async function createPointDeRassemblementHelper(PointDeRassemblement) {
  return await PointDeRassemblementModel.create(PointDeRassemblement);
}
async function createPointDeRassemblementWithBus(PointDeRassemblement, centerId, sessionId) {
  await CohortModel.create({ ...getNewCohortFixture(), name: PointDeRassemblement.cohorts[0] });
  const pdr = await PointDeRassemblementModel.create(PointDeRassemblement);
  const bus = await LigneBusModel.create(getNewLigneBusFixture({ meetingPointsIds: [pdr._id], cohort: pdr.cohorts[0], centerId, sessionId }));
  const ligneToPoint = await LigneToPointModel.create({ ...getNewLigneToPointFixture(), lineId: bus._id, meetingPointId: pdr._id });

  return { pdr, bus, ligneToPoint };
}

const notExistingMeetingPointId = "104a49ba223040e4d2153223";

module.exports = {
  createPointDeRassemblementHelper,
  createPointDeRassemblementWithBus,
  notExistingMeetingPointId,
};
