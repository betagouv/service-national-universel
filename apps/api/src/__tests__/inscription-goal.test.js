require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
const getNewInscriptionGoalFixture = require("./fixtures/inscriptionGoal");
const { createInscriptionGoal } = require("./helpers/inscriptionGoal");

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Inscription Goal", () => {
  describe("POST /inscription-goal/:cohort", () => {
    it("should post a new entry in inscription-goal", async () => {
      const res = await request(getAppHelper())
        .post("/inscription-goal/2021")
        .send([{ department: "test", region: "test", max: 10 }]);
      expect(res.statusCode).toEqual(200);
    });
    it("should return 400 if wrong body", async () => {
      const res = await request(getAppHelper())
        .post("/inscription-goal/2021")
        .send([{ department: 1, region: "test", max: "must be int" }]);
      expect(res.statusCode).toEqual(400);
    });
  });
  describe("GET /inscription-goal/:cohort", () => {
    it("should return all inscription-goal", async () => {
      const inscriptionGoal = await createInscriptionGoal(getNewInscriptionGoalFixture());
      const res = await request(getAppHelper()).get("/inscription-goal/2021");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ _id: inscriptionGoal._id.toString() })]));
    });
  });
  describe("GET /inscription-goal/:department/current", () => {
    it("should return 200", async () => {
      const res = await request(getAppHelper()).get(`/inscription-goal/Ain/current`);
      expect(res.status).toBe(200);
    });
  });
});
