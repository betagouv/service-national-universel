import request from "supertest";
import getAppHelper, { resetAppAuth } from "./helpers/app";
import { clearDatabase, dbClose, dbConnect } from "./helpers/db";
import { CohortGroupModel, CohortModel, YoungModel } from "../models";
import { COHORT_TYPE } from "snu-lib";
import getNewCohortFixture from "./fixtures/cohort";
import getNewYoungFixture from "./fixtures/young";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(async () => {
  await dbClose();
});
afterEach(async () => {
  await resetAppAuth();
});
afterEach(async () => {
  await clearDatabase();
  resetAppAuth();
});

jest.mock("passport");

describe("CohortGroup Routes", () => {
  describe("GET /cohort-group", () => {
    it("should return a list of cohort groups sorted by year and name", async () => {
      await CohortGroupModel.create([
        { name: "Group A", type: COHORT_TYPE.VOLONTAIRE, year: 2021 },
        { name: "Group B", type: COHORT_TYPE.CLE, year: 2020 },
      ]);

      const response = await request(getAppHelper()).get("/cohort-group");
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].year).toBe(2020);
      expect(response.body.data[1].year).toBe(2021);
    });
  });

  describe("GET /cohort-group/open", () => {
    it("should return a list of open cohort groups", async () => {
      const cohortGroupA = await CohortGroupModel.create({ name: "Group A", type: COHORT_TYPE.VOLONTAIRE, year: 2021 });
      const cohortGroupB = await CohortGroupModel.create({ name: "Group B", type: COHORT_TYPE.VOLONTAIRE, year: 2022 });
      const cohortGroupC = await CohortGroupModel.create({ name: "Group C", type: COHORT_TYPE.VOLONTAIRE, year: 2023 });
      const cohortGroupD = await CohortGroupModel.create({ name: "Group D", type: COHORT_TYPE.VOLONTAIRE, year: 2024 });
      const cohortGroupE = await CohortGroupModel.create({ name: "Group E", type: COHORT_TYPE.VOLONTAIRE, year: 2025 });

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const cohortA = await CohortModel.create(getNewCohortFixture({ cohortGroupId: cohortGroupA._id, inscriptionStartDate: yesterday, inscriptionEndDate: tomorrow }));
      await CohortModel.create(getNewCohortFixture({ cohortGroupId: cohortGroupB._id, inscriptionStartDate: yesterday, inscriptionEndDate: tomorrow }));
      await CohortModel.create(getNewCohortFixture({ cohortGroupId: cohortGroupC._id, inscriptionStartDate: yesterday, inscriptionEndDate: tomorrow }));
      await CohortModel.create(getNewCohortFixture({ cohortGroupId: cohortGroupD._id, inscriptionStartDate: yesterday, inscriptionEndDate: tomorrow }));
      await CohortModel.create(getNewCohortFixture({ cohortGroupId: cohortGroupE._id, inscriptionStartDate: yesterday, inscriptionEndDate: tomorrow }));

      const young = await YoungModel.create(getNewYoungFixture({ cohortId: cohortA._id }));

      const response = await request(getAppHelper(young)).get("/cohort-group/open");
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveLength(4);
      expect(response.body.data[0].year).toBe(2022);
      expect(response.body.data[1].year).toBe(2023);
      expect(response.body.data[2].year).toBe(2024);
    });
  });

  describe("POST /cohort-group", () => {
    it("should create a new cohort group", async () => {
      const response = await request(getAppHelper()).post("/cohort-group").send({ name: "Group C", type: COHORT_TYPE.VOLONTAIRE, year: 2022 });
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data.name).toBe("Group C");
    });
  });

  describe("PUT /cohort-group/:id", () => {
    it("should update an existing cohort group", async () => {
      const cohortGroup = await CohortGroupModel.create({ name: "Group D", type: COHORT_TYPE.VOLONTAIRE, year: 2023 });
      const response = await request(getAppHelper()).put(`/cohort-group/${cohortGroup._id}`).send({ name: "Group D Updated", type: COHORT_TYPE.CLE, year: 2024 });
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data.name).toBe("Group D Updated");
    });
  });

  describe("DELETE /cohort-group/:id", () => {
    it("should delete an existing cohort group", async () => {
      const cohortGroup = await CohortGroupModel.create({ name: "Group E", type: COHORT_TYPE.VOLONTAIRE, year: 2025 });
      const response = await request(getAppHelper()).delete(`/cohort-group/${cohortGroup._id}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      const deletedGroup = await CohortGroupModel.findById(cohortGroup._id);
      expect(deletedGroup).toBeNull();
    });

    it("should return 400 if the cohort group has linked cohorts", async () => {
      const cohortGroup = await CohortGroupModel.create({ name: "Group F", type: COHORT_TYPE.VOLONTAIRE, year: 2026 });
      await CohortModel.create(getNewCohortFixture({ cohortGroupId: cohortGroup._id }));
      const response = await request(getAppHelper()).delete(`/cohort-group/${cohortGroup._id}`);
      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });
  });
});
