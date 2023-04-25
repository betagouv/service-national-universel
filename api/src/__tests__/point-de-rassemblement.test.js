require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");

const getNewPointDeRassemblementFixture = require("./fixtures/PlanDeTransport/pointDeRassemblement");
const { getNewCohesionCenterFixture } = require("./fixtures/cohesionCenter");
const { getNewSessionPhase1Fixture } = require("./fixtures/sessionPhase1");

const { createPointDeRassemblementHelper, createPointDeRassemblementWithBus } = require("./helpers/PlanDeTransport/pointDeRassemblement");

const { createCohesionCenter } = require("./helpers/cohesionCenter");
const { createSessionPhase1 } = require("./helpers/sessionPhase1");

const getNewYoungFixture = require("./fixtures/young");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
const { createYoungHelper } = require("./helpers/young");

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Meeting point", () => {
  describe("GET /point-de-rassemblement/available", () => {
    it("should return 400 when young has no sessionPhase1Id", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture() });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      const res = await request(getAppHelper()).get("/point-de-rassemblement/available").send();
      expect(res.status).toBe(400);
      passport.user = previous;
    });
  });

  describe("PUT /point-de-rassemblement/:id", () => {
    it("should return 404 when point-de-rassemblement does not exist", async () => {
      const notExistingPdrId = "5f9f1b9b9b9b9b9b9b9b9b9b";
      const res = await request(getAppHelper())
        .get("/point-de-rassemblement/" + notExistingPdrId)
        .send();
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /point-de-rassemblement/delete/cohort/:id", () => {
    it("should return 404 when point-de-rassemblement does not exist", async () => {
      const notExistingPdrId = "5f9f1b9b9b9b9b9b9b9b9b9b";
      const res = await request(getAppHelper())
        .get("/point-de-rassemblement/detete/cohort/" + notExistingPdrId)
        .send();
      expect(res.status).toBe(404);
    });
    it("should return 403 when youngs are still linked to point-de-rassemblement", async () => {
      const pointDeRassemblement = await createPointDeRassemblementHelper({ ...getNewPointDeRassemblementFixture() });
      await createYoungHelper({ ...getNewYoungFixture(), meetingPointId: pointDeRassemblement._id, cohort: "Février 2023 - C" });
      const res = await request(getAppHelper())
        .put("/point-de-rassemblement/delete/cohort/" + pointDeRassemblement._id)
        .send({ cohort: "Février 2023 - C" });
      expect(res.status).toBe(403);
    });
    it("should return 200 ", async () => {
      const pointDeRassemblement = await createPointDeRassemblementHelper({ ...getNewPointDeRassemblementFixture() });
      const res = await request(getAppHelper())
        .put("/point-de-rassemblement/delete/cohort/" + pointDeRassemblement._id)
        .send({ cohort: "Février 2023 - C" });
      expect(res.status).toBe(200);
    });
  });
  describe("DELETE /point-de-rassemblement/:id", () => {
    it("should return 404 when point-de-rassemblement does not exist", async () => {
      const notExistingPdrId = "5f9f1b9b9b9b9b9b9b9b9b9b";
      const res = await request(getAppHelper())
        .delete("/point-de-rassemblement/" + notExistingPdrId)
        .send();
      expect(res.status).toBe(404);
    });
    it("should return 403 when youngs are still linked to point-de-rassemblement", async () => {
      const pointDeRassemblement = await createPointDeRassemblementHelper({ ...getNewPointDeRassemblementFixture() });
      await createYoungHelper({ ...getNewYoungFixture(), meetingPointId: pointDeRassemblement._id });
      const res = await request(getAppHelper())
        .delete("/point-de-rassemblement/" + pointDeRassemblement._id)
        .send();
      expect(res.status).toBe(403);
    });
    it("should return 200 ", async () => {
      const pointDeRassemblement = await createPointDeRassemblementHelper({ ...getNewPointDeRassemblementFixture() });
      const res = await request(getAppHelper())
        .delete("/point-de-rassemblement/" + pointDeRassemblement._id)
        .send();
      expect(res.status).toBe(200);
    });
  });
  describe("GET /point-de-rassemblement/fullInfo/:pdrId/:busId", () => {
    it("should return 403 when young try to fetch another pdr than his", async () => {
      const pointDeRassemblemenYoung = await createPointDeRassemblementHelper({ ...getNewPointDeRassemblementFixture() });
      const young = await createYoungHelper({ ...getNewYoungFixture(), meetingPointId: pointDeRassemblemenYoung._id });

      const pointDeRassemblement = await createPointDeRassemblementHelper({ ...getNewPointDeRassemblementFixture() });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const res = await request(getAppHelper())
        .get("/point-de-rassemblement/fullInfo/" + pointDeRassemblement._id + "/" + pointDeRassemblement._id)
        .send();
      expect(res.status).toBe(403);
      passport.user = previous;
    });
    it("should return 403 when young try to fetch another bus than his", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const sessionPhase1 = await createSessionPhase1({ ...getNewSessionPhase1Fixture(), cohesionCenterId: cohesionCenter._id });

      const resultYoung = await createPointDeRassemblementWithBus(getNewPointDeRassemblementFixture(), cohesionCenter._id, sessionPhase1._id);
      const young = await createYoungHelper({ ...getNewYoungFixture(), meetingPointId: resultYoung.pdr._id, ligneId: resultYoung.bus._id });

      const { pdr, bus } = await createPointDeRassemblementWithBus(getNewPointDeRassemblementFixture(), cohesionCenter._id, sessionPhase1._id);
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const res = await request(getAppHelper())
        .get("/point-de-rassemblement/fullInfo/" + pdr._id + "/" + bus._id)
        .send();
      expect(res.status).toBe(403);
      passport.user = previous;
    });
  });
});
