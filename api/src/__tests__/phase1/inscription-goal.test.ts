import { fakerFR as faker } from "@faker-js/faker";
import request from "supertest";
import getAppHelper from "../helpers/app";
import { dbConnect, dbClose } from "../helpers/db";
import getNewInscriptionGoalFixture from "../fixtures/inscriptionGoal";
import { createInscriptionGoal } from "../helpers/inscriptionGoal";
import { department2region, ERRORS, FUNCTIONAL_ERRORS, INSCRIPTION_GOAL_LEVELS, region2department, YOUNG_STATUS } from "snu-lib";
import { createYoungHelper } from "../helpers/young";
import getNewYoungFixture from "../fixtures/young";
import { getCompletionObjectifs } from "../../services/inscription-goal";
import { createCohortHelper } from "../helpers/cohort";
import getNewCohortFixture from "../fixtures/cohort";

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
      const inscriptionGoal = await createInscriptionGoal(getNewInscriptionGoalFixture({ cohort: undefined, cohortId: undefined }));
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
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test Inscription Goal 1" }));
      const inscriptionGoal = await createInscriptionGoal(getNewInscriptionGoalFixture({ cohort: cohort.name }));
      const res = await request(getAppHelper()).get(`/inscription-goal/${inscriptionGoal.cohort}/department/${inscriptionGoal.department}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBe(0);
    });
    it("should return corresponding filling rate when young exists", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test Inscription Goal 2" }));
      const inscriptionGoal = await createInscriptionGoal(getNewInscriptionGoalFixture({ cohort: cohort.name }));
      await createYoungHelper(
        getNewYoungFixture({
          status: YOUNG_STATUS.VALIDATED,
          department: inscriptionGoal.department,
          region: inscriptionGoal.region,
          cohort: inscriptionGoal.cohort,
          cohortId: inscriptionGoal.cohortId,
        }),
      );
      const res = await request(getAppHelper()).get(`/inscription-goal/${inscriptionGoal.cohort}/department/${inscriptionGoal.department}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeGreaterThan(0);
      expect(res.body.data).toBeLessThan(1);
    });
    it("should return filling at 1 when department goal is reached (not region)", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test Inscription Goal 3", objectifLevel: INSCRIPTION_GOAL_LEVELS.DEPARTEMENTAL }));
      const inscriptionGoal = await createInscriptionGoal(getNewInscriptionGoalFixture({ cohort: cohort.name, max: 1 }));
      await createInscriptionGoal(
        getNewInscriptionGoalFixture({
          max: 1,
          cohort: inscriptionGoal.cohort,
          department: faker.helpers.arrayElement(region2department[inscriptionGoal.region!]),
          region: inscriptionGoal.region,
        }),
      );
      await createYoungHelper(
        getNewYoungFixture({
          status: YOUNG_STATUS.VALIDATED,
          department: inscriptionGoal.department,
          region: inscriptionGoal.region,
          cohort: inscriptionGoal.cohort,
          cohortId: inscriptionGoal.cohortId,
        }),
      );
      let completionObjectif = await getCompletionObjectifs(inscriptionGoal.department!, cohort);
      expect(completionObjectif.department.objectif).toBe(1);
      expect(completionObjectif.region.objectif).toBe(2);
      const res = await request(getAppHelper()).get(`/inscription-goal/${inscriptionGoal.cohort}/department/${inscriptionGoal.department}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBe(1);
    });
    it("should return filling at 1 when region goal is reached (not department)", async () => {
      const department = "Loire-Atlantique";
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test Inscription Goal 4", objectifLevel: INSCRIPTION_GOAL_LEVELS.REGIONAL }));
      const inscriptionGoal = await createInscriptionGoal(getNewInscriptionGoalFixture({ cohort: cohort.name, department, region: department2region[department], max: 1 }));
      // jeune dans la region mais pas dans le departement
      await createYoungHelper(
        getNewYoungFixture({ status: YOUNG_STATUS.VALIDATED, region: inscriptionGoal.region, cohort: inscriptionGoal.cohort, cohortId: inscriptionGoal.cohortId }),
      );
      const res = await request(getAppHelper()).get(`/inscription-goal/${inscriptionGoal.cohort}/department/${inscriptionGoal.department}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBe(1);
    });
    it("should return 404 when cohort does not exist", async () => {
      const res = await request(getAppHelper()).get(`/inscription-goal/Unknown/department/Loire-Atlantique`);
      expect(res.status).toBe(404);
      expect(res.body.code).toBe(ERRORS.NOT_FOUND);
    });

    it("should return 400 when department does not exist for valid cohort", async () => {
      await createCohortHelper(getNewCohortFixture({ name: "Test Inscription Goal 5" }));
      const res = await request(getAppHelper()).get(`/inscription-goal/Test Inscription Goal/department/Unknown`);
      expect(res.status).toBe(404);
      expect(res.body.code).toBe(ERRORS.NOT_FOUND);
    });
    it("should return 400 when goal has max null", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test Inscription Goal 6" }));
      const inscriptionGoal = await createInscriptionGoal(getNewInscriptionGoalFixture({ cohort: cohort.name, max: 0 }));
      const res = await request(getAppHelper()).get(`/inscription-goal/${inscriptionGoal.cohort}/department/${inscriptionGoal.department}`);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe(FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_NOT_DEFINED);
    });
  });
});
