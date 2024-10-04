import request from "supertest";
import getAppHelper from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import getNewInscriptionGoalFixture from "./fixtures/inscriptionGoal";
import { createInscriptionGoal } from "./helpers/inscriptionGoal";
import { FUNCTIONAL_ERRORS } from "snu-lib";

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
  describe("GET /inscription-goal/:cohort/department/:department", () => {
    it("should return 200 when goal defined", async () => {
      const inscriptionGoal = await createInscriptionGoal(getNewInscriptionGoalFixture());
      const res = await request(getAppHelper()).get(`/inscription-goal/${inscriptionGoal.cohort}/department/${inscriptionGoal.department}`);
      expect(res.status).toBe(200);
    });
    it("should return 400 when goal does not exist", async () => {
      const res = await request(getAppHelper()).get(`/inscription-goal/Unknow/department/Unknow`);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe(FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_NOT_DEFINED);
    });
    it("should return 400 when goal has max null", async () => {
      const inscriptionGoal = await createInscriptionGoal(getNewInscriptionGoalFixture({ max: 0 }));
      const res = await request(getAppHelper()).get(`/inscription-goal/${inscriptionGoal.cohort}/department/${inscriptionGoal.department}`);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe(FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_NOT_DEFINED);
    });
  });
});
