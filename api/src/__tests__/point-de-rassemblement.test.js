require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");

const getNewPointDeRassemblementFixture = require("./fixtures/PlanDeTransport/pointDeRassemblement");
const { createPointDeRassemblementHelper } = require("./helpers/PlanDeTransport/pointDeRassemblement");

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
      const young = await createYoungHelper({ ...getNewYoungFixture(), meetingPointId: pointDeRassemblement._id });
      const res = await request(getAppHelper())
        .put("/point-de-rassemblement/delete/cohort/" + pointDeRassemblement._id, { cohort: "Février 2023 - C" })
        .send();
      console.log(res.code);
      expect(res.status).toBe(403);
    });
  });
});
