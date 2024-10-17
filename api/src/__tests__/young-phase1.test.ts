import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;

import { FUNCTIONAL_ERRORS, YOUNG_STATUS } from "snu-lib";

import { LigneBusModel } from "../models";

import { dbConnect, dbClose } from "./helpers/db";
import getAppHelper from "./helpers/app";

import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper } from "./helpers/young";
import { createCohortHelper } from "./helpers/cohort";
import getNewCohortFixture from "./fixtures/cohort";
import { createSessionPhase1 } from "./helpers/sessionPhase1";
import { getNewSessionPhase1Fixture } from "./fixtures/sessionPhase1";
import getNewLigneBusFixture from "./fixtures/PlanDeTransport/ligneBus";
import { createPointDeRassemblementHelper } from "./helpers/PlanDeTransport/pointDeRassemblement";
import getNewPointDeRassemblementFixture from "./fixtures/PlanDeTransport/pointDeRassemblement";
import { createInscriptionGoal } from "./helpers/inscriptionGoal";
import getNewInscriptionGoalFixture from "./fixtures/inscriptionGoal";

beforeAll(() => dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(dbClose);

describe("Young Phase1 Controller", () => {
  describe("POST /young/:id/phase1/affectation", () => {
    it("should update validated young", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ manualAffectionOpenForAdmin: true }));
      const young = await createYoungHelper(getNewYoungFixture({ status: YOUNG_STATUS.VALIDATED, cohort: cohort.name, cohortId: cohort._id }));
      const sessionPhase1 = await createSessionPhase1(getNewSessionPhase1Fixture({ cohort: cohort.name, cohortId: cohort._id, cohesionCenterId: new ObjectId().toString() }));
      const ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({ sessionId: sessionPhase1._id, centerId: sessionPhase1.cohesionCenterId, cohort: sessionPhase1.cohort, cohortId: sessionPhase1.cohortId }),
      );
      const pointDeRassemblement = await createPointDeRassemblementHelper(getNewPointDeRassemblementFixture());

      const res = await request(getAppHelper()).post(`/young/${young._id.toString()}/phase1/affectation`).send({
        centerId: cohort._id,
        sessionId: sessionPhase1._id,
        meetingPointId: pointDeRassemblement._id,
        ligneId: ligneBus._id,
        id: young._id,
        pdrOption: "ref-select",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.ok).toEqual(true);
    });

    it("should not update waiting_list young and goal reached", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "youngCohort", manualAffectionOpenForAdmin: true }));
      const young = await createYoungHelper(
        getNewYoungFixture({ status: YOUNG_STATUS.WAITING_LIST, cohort: cohort.name, cohortId: cohort._id, department: "Loire-Atlantique", schoolDepartment: "Loire-Atlantique" }),
      );
      const sessionPhase1 = await createSessionPhase1(
        getNewSessionPhase1Fixture({ cohort: cohort.name, cohortId: cohort._id, cohesionCenterId: new ObjectId().toString(), department: young.department }),
      );
      const ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({ sessionId: sessionPhase1._id, centerId: sessionPhase1.cohesionCenterId, cohort: sessionPhase1.cohort, cohortId: sessionPhase1.cohortId }),
      );
      const pointDeRassemblement = await createPointDeRassemblementHelper(getNewPointDeRassemblementFixture());

      await createYoungHelper(getNewYoungFixture({ status: YOUNG_STATUS.VALIDATED, department: young.department, cohort: young.cohort, cohortId: young.cohortId }));
      await createInscriptionGoal(getNewInscriptionGoalFixture({ department: young.department, cohort: young.cohort, max: 1 }));

      const response = await request(getAppHelper()).post(`/young/${young._id.toString()}/phase1/affectation`).send({
        centerId: cohort._id,
        sessionId: sessionPhase1._id,
        meetingPointId: pointDeRassemblement._id,
        ligneId: ligneBus._id,
        id: young._id,
        pdrOption: "ref-select",
      });

      expect(response.statusCode).not.toEqual(200);
      expect(response.body.code).toBe(FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_REACHED);
    });
  });
});
