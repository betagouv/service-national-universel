import request from "supertest";
import mongoose from "mongoose";
import { ROLES } from "snu-lib";
import { LigneBusModel } from "../models";
import getAppHelper, { resetAppAuth } from "./helpers/app";
import { mockEsClient } from "./helpers/es";
import { createSessionPhase1, notExistingSessionPhase1Id } from "./helpers/sessionPhase1";
import { createSessionWithCohesionCenter } from "./helpers/cohesionCenter";
import { dbConnect, dbClose } from "./helpers/db";
import { createReferentHelper } from "./helpers/referent";
import { createCohortHelper } from "./helpers/cohort";
import { getNewCohesionCenterFixtureV2 } from "./fixtures/cohesionCenter";
import { getNewSessionPhase1Fixture } from "./fixtures/sessionPhase1";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewCohortFixture from "./fixtures/cohort";
import getNewLigneBusFixture from "./fixtures/PlanDeTransport/ligneBus";
import { ReferentAuthFacade } from "../../../apiv2/src/admin/infra/iam/auth/ReferentAuth.facade";

mockEsClient({
  sessionphase1: [{ _id: "sessionId" }],
});

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
}));

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  getSignedUrl: () => "",
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
afterEach(resetAppAuth);

describe("Session Phase 1", () => {
  describe("POST /session-phase1", () => {
    it("should return 200", async () => {
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.HEAD_CENTER }));
      const session = getNewSessionPhase1Fixture({ headCenterId: referent.id });
      const res = await request(getAppHelper()).post("/session-phase1").send(session);
      expect(res.status).toBe(200);
    });
    it("should only not be accessible by responsible", async () => {
      const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
        .post("/session-phase1")
        .send(getNewSessionPhase1Fixture());
      expect(res.status).toBe(403);
    });
  });

  describe("GET /session-phase1", () => {
    it("should return 200", async () => {
      const res = await request(getAppHelper()).get("/cohesion-center/").send();
      expect(res.status).toBe(200);
    });
  });

  describe("PUT /session-phase1/:id", () => {
    it("should return 404 when session-phase1 is not found", async () => {
      const res = await request(getAppHelper())
        .put("/session-phase1/" + notExistingSessionPhase1Id)
        .send({
          cohort: "2020",
        });
      expect(res.status).toBe(404);
    });
    it("should return 200 when session-phase1 is found and updated", async () => {
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_REGION }));
      const cohort = await createCohortHelper(
        getNewCohortFixture({ name: "2020", sessionEditionOpenForReferentRegion: true, sessionEditionOpenForReferentDepartment: true, sessionEditionOpenForTransporter: true }),
      );
      const sessionPhase1 = await createSessionWithCohesionCenter(
        getNewCohesionCenterFixtureV2(),
        getNewSessionPhase1Fixture({ headCenterId: referent.id, cohort: cohort.name, cohortId: cohort._id }),
      );
      const res = await request(getAppHelper())
        .put("/session-phase1/" + sessionPhase1._id)
        .send({ cohort: "2020", cohesionCenterId: sessionPhase1.cohesionCenterId });
      expect(res.status).toBe(200);
      expect(res.body.data.cohesionCenterId).toBe(sessionPhase1.cohesionCenterId);
      expect(res.body.data.cohort).toBe("2020");
    });
    it("should be only allowed to admin and referent", async () => {
      const cohort = await createCohortHelper(
        getNewCohortFixture({
          sessionEditionOpenForReferentRegion: true,
          sessionEditionOpenForReferentDepartment: true,
          sessionEditionOpenForTransporter: true,
        }),
      );
      const sessionPhase1 = await createSessionPhase1({ ...getNewSessionPhase1Fixture(), cohort: cohort.name, cohortId: cohort._id });

      const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
        .put("/session-phase1/" + sessionPhase1._id)
        .send({
          cohort: "2020",
        });
      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /session-phase1/:id", () => {
    it("should return 400 when session-phase1 id is invalid", async () => {
      const res = await request(getAppHelper()).delete("/session-phase1/invalideId").send();
      expect(res.status).toBe(400);
    });
    it("should return 404 when session-phase1 is not found", async () => {
      const res = await request(getAppHelper())
        .delete("/session-phase1/" + notExistingSessionPhase1Id)
        .send();
      expect(res.status).toBe(404);
    });
    it("should return 200 when session-phase1 is found", async () => {
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.HEAD_CENTER }));
      const sessionPhase1 = await createSessionWithCohesionCenter(getNewCohesionCenterFixtureV2(), getNewSessionPhase1Fixture({ headCenterId: referent.id }));
      const res = await request(getAppHelper())
        .delete("/session-phase1/" + sessionPhase1._id)
        .send();
      expect(res.status).toBe(200);
    });
    it("should be only allowed to admin and referents", async () => {
      const sessionPhase1 = await createSessionPhase1(getNewSessionPhase1Fixture());
      const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
        .delete("/session-phase1/" + sessionPhase1._id)
        .send();
      expect(res.status).toBe(403);
    });
    it("should return 403 when youngs are registered to the session", async () => {
      const sessionPhase1 = await createSessionPhase1(getNewSessionPhase1Fixture({ placesLeft: 0 }));
      const res = await request(getAppHelper())
        .delete("/session-phase1/" + sessionPhase1._id)
        .send();
      expect(res.status).toBe(403);
    });
    it("should return 403 when buses are associated with the session", async () => {
      const sessionPhase1 = await createSessionPhase1(getNewSessionPhase1Fixture({ cohesionCenterId: new mongoose.Types.ObjectId().toString() }));
      await LigneBusModel.create(
        getNewLigneBusFixture({ sessionId: sessionPhase1._id, centerId: sessionPhase1.cohesionCenterId, cohort: sessionPhase1.cohort, cohortId: sessionPhase1.cohortId }),
      );

      const res = await request(getAppHelper())
        .delete("/session-phase1/" + sessionPhase1._id)
        .send();

      expect(res.status).toBe(403);
    });
  });

  describe("POST /elasticsearch/sessionphase1/export", () => {
    it("should return 200 when export is successful", async () => {
      const res = await request(getAppHelper())
        .post("/elasticsearch/sessionphase1/export")
        .send({ filters: {}, exportFields: ["codeCentre", "cohesionCenterId"] });
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
