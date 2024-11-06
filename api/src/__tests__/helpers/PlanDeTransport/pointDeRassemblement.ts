import { LigneBusModel, LigneToPointModel, CohortModel, PointDeRassemblementModel } from "../../../models";
import getNewLigneBusFixture from "../../fixtures/PlanDeTransport/ligneBus";
import getNewLigneToPointFixture from "../../fixtures/PlanDeTransport/ligneToPoint";
import getNewCohortFixture from "../../fixtures/cohort";

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

export { createPointDeRassemblementHelper, createPointDeRassemblementWithBus, notExistingMeetingPointId };
