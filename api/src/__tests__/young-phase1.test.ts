import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;

import { department2region, FUNCTIONAL_ERRORS, YOUNG_STATUS } from "snu-lib";

import { InscriptionGoalModel, LigneBusModel, YoungModel } from "../models";

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
import { getCompletionObjectifs } from "../services/inscription-goal";

beforeAll(() => dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(dbClose);
beforeEach(async () => {
  await YoungModel.deleteMany({});
  await InscriptionGoalModel.deleteMany({});
});

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

    it("should not update young in waiting list when goal is reached", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "youngCohort", manualAffectionOpenForAdmin: true }));
      const young = await createYoungHelper(
        getNewYoungFixture({
          status: YOUNG_STATUS.WAITING_LIST,
          cohort: cohort.name,
          cohortId: cohort._id,
          department: "Loire-Atlantique",
          schoolDepartment: "Loire-Atlantique",
          region: department2region["Loire-Atlantique"],
        }),
      );
      const sessionPhase1 = await createSessionPhase1(
        getNewSessionPhase1Fixture({ cohort: cohort.name, cohortId: cohort._id, cohesionCenterId: new ObjectId().toString(), department: young.department }),
      );
      const ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({ sessionId: sessionPhase1._id, centerId: sessionPhase1.cohesionCenterId, cohort: sessionPhase1.cohort, cohortId: sessionPhase1.cohortId }),
      );
      const pointDeRassemblement = await createPointDeRassemblementHelper(getNewPointDeRassemblementFixture());
      await createInscriptionGoal(getNewInscriptionGoalFixture({ department: young.department, region: young.region, cohort: young.cohort, max: 1 }));

      await createYoungHelper(
        getNewYoungFixture({ status: YOUNG_STATUS.VALIDATED, department: young.department, region: young.region, cohort: young.cohort, cohortId: young.cohortId }),
      );
      const { department, region, isAtteint } = await getCompletionObjectifs(young.department!, young.cohort!);
      expect(department.objectif).toBe(1);
      expect(department.isAtteint).toBe(true);
      expect(region.objectif).toBe(1);
      expect(region.jeunesCount).toBe(1);
      expect(region.isAtteint).toBe(true);
      expect(isAtteint).toBe(true);

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
