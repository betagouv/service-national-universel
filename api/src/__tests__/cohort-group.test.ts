import request from "supertest";
import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbClose, dbConnect } from "./helpers/db";
import { CohortGroupModel, CohortModel } from "../models";
import { COHORT_TYPE } from "snu-lib";
import getNewCohortFixture from "./fixtures/cohort";

beforeAll(dbConnect);
afterAll(dbClose);
afterEach(resetAppAuth);

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
      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });
  });
});
