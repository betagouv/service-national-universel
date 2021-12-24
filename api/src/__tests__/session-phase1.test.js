require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const { getNewSessionPhase1Fixture } = require("./fixtures/sessionPhase1");
const getAppHelper = require("./helpers/app");
const { createSessionPhase1, notExistingSessionPhase1Id } = require("./helpers/sessionPhase1");
const { dbConnect, dbClose } = require("./helpers/db");
const { ROLES } = require("snu-lib/roles");

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  getSignedUrl: () => "",
}));

jest.mock("../htmlToPdf", () => jest.fn());

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Session Phase 1", () => {
  describe("POST /session-phase1", () => {
    it("should return 200", async () => {
      const res = await request(getAppHelper()).post("/session-phase1").send(getNewSessionPhase1Fixture());
      expect(res.status).toBe(200);
    });
    it("should only not be accessible by responsible", async () => {
      const passport = require("passport");
      passport.user.role = ROLES.RESPONSIBLE;

      const res = await request(getAppHelper()).post("/session-phase1").send(getNewSessionPhase1Fixture());
      expect(res.status).toBe(403);

      passport.user.role = ROLES.ADMIN;
    });
  });

  describe("GET /session-phase1/:id", () => {
    it("should return 404 when session-phase1 is not found", async () => {
      const res = await request(getAppHelper())
        .get("/session-phase1/" + notExistingSessionPhase1Id)
        .send();
      expect(res.status).toBe(404);
    });
    it("should return 200 when session-phase1 is found", async () => {
      const sessionPhase1 = await createSessionPhase1(getNewSessionPhase1Fixture());
      const res = await request(getAppHelper())
        .get("/session-phase1/" + sessionPhase1._id)
        .send();
      expect(res.status).toBe(200);
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
      const res = await request(getAppHelper()).put("/session-phase1/" + notExistingSessionPhase1Id).send({
        cohort: '2020'
      });
      expect(res.status).toBe(404);
    });
    it("should return 200 when session-phase1 is found", async () => {
      const sessionPhase1 = await createSessionPhase1(getNewSessionPhase1Fixture());
      const res = await request(getAppHelper()).put("/session-phase1/" + sessionPhase1._id).send({
        cohort: "2020",
      });
      expect(res.status).toBe(200);
      expect(res.body.data.cohort).toBe("2020");
    });
    it("should be only allowed to admin and referent", async () => {
      const passport = require("passport");
      passport.user.role = ROLES.RESPONSIBLE;
      const sessionPhase1 = await createSessionPhase1(getNewSessionPhase1Fixture());
      const res = await request(getAppHelper()).put("/session-phase1/" + sessionPhase1._id).send({
        cohort: "2020",
      });
      expect(res.status).toBe(403);
      passport.user.role = ROLES.ADMIN;
    });
  });

  describe("DELETE /session-phase1/:id", () => {
    it("should return 404 when session-phase1 is not found", async () => {
      const res = await request(getAppHelper())
        .delete("/session-phase1/" + notExistingSessionPhase1Id)
        .send();
      expect(res.status).toBe(404);
    });
    it("should return 200 when session-phase1 is found", async () => {
      const sessionPhase1 = await createSessionPhase1(getNewSessionPhase1Fixture());
      const res = await request(getAppHelper())
        .delete("/session-phase1/" + sessionPhase1._id)
        .send();
      expect(res.status).toBe(200);
    });
  });

  it("should be only allowed to admin and referents", async () => {
    const passport = require("passport");
    passport.user.role = ROLES.RESPONSIBLE;
    const sessionPhase1 = await createSessionPhase1(getNewSessionPhase1Fixture());
    const res = await request(getAppHelper())
      .delete("/session-phase1/" + sessionPhase1._id)
      .send();
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });
});
