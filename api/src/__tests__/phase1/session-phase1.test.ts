import request from "supertest";
import { ROLES } from "snu-lib";
import getAppHelper, { resetAppAuth } from "../helpers/app";
import { mockEsClient } from "../helpers/es";
import { dbConnect, dbClose } from "../helpers/db";
import { createReferentHelper } from "../helpers/referent";
import { getNewSessionPhase1Fixture } from "../fixtures/sessionPhase1";
import { getNewReferentFixture } from "../fixtures/referent";
import { ReferentAuthFacade } from "../../../../apiv2/src/admin/infra/iam/auth/ReferentAuth.facade";

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
