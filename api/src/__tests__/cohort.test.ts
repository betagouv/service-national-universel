import request from "supertest";
import getAppHelper from "./helpers/app";
import getNewCohortFixture from "./fixtures/cohort";
import { createCohortHelper } from "./helpers/cohort";
import { createClasse } from "./helpers/classe";
import { createFixtureClasse } from "./fixtures/classe";
import { COHORT_TYPE, ERRORS, ROLES, STATUS_CLASSE } from "snu-lib";
import { dbConnect, dbClose } from "./helpers/db";
import { ClasseModel } from "../models";

jest.mock("../emails", () => ({
  emit: jest.fn(),
}));

beforeAll(dbConnect);
afterAll(dbClose);

describe("Cohort", () => {
  describe("PUT /:cohort", () => {
    it("should return 400 if cohort name is invalid", async () => {
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put("/cohort/NonValidName")
        .send({ name: "New Cohort" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if request body is invalid", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${encodeURIComponent(cohort.name)}`)
        .send({ name: 2 });
      expect(res.status).toBe(400);
    });

    it("should return 403 if user is not an admin", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);
      const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
        .put(`/cohort/${encodeURIComponent(cohort.name)}`)
        .send({
          ...cohortFixture,
          inscriptionStartDate: new Date(),
        });
      expect(res.status).toBe(403);
    });

    it("should return 403 if user is not a super admin", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);

      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "NONgod" }))
        .put(`/cohort/${encodeURIComponent(cohort.name)}`)
        .send({
          ...cohortFixture,
          inscriptionStartDate: new Date(),
        });
      expect(res.status).toBe(403);
    });

    it("should return 404 if cohort is not found", async () => {
      const cohortFixture = getNewCohortFixture();
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${cohortFixture.name}`)
        .send({
          ...cohortFixture,
        });
      expect(res.status).toBe(404);
    });

    it("should return 200 when cohort is updated successfully", async () => {
      const now = new Date();
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${encodeURIComponent(cohort.name)}`)
        .send({
          ...cohortFixture,
          inscriptionStartDate: now,
        });

      expect(res.status).toBe(200);
      expect(new Date(res.body.data.inscriptionStartDate).toISOString()).toBe(now.toISOString());
    });

    it("should update classe.status to OPEN if type === CLE && inscriptionStartDate", async () => {
      const now = new Date();
      const oneMonthAfter = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      const cohortFixture = getNewCohortFixture({ type: COHORT_TYPE.CLE });
      const cohort = await createCohortHelper(cohortFixture);
      const classe = createFixtureClasse({ cohort: cohort.name, status: STATUS_CLASSE.ASSIGNED, cohortId: cohort._id });
      const classeId = (await createClasse(classe))._id;
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${encodeURIComponent(cohort.name)}`)
        .send({
          ...cohortFixture,
          inscriptionStartDate: now,
          inscriptionEndDate: oneMonthAfter,
        });

      expect(res.status).toBe(200);
      expect(new Date(res.body.data.inscriptionStartDate).toISOString()).toBe(now.toISOString());
      expect(new Date(res.body.data.inscriptionEndDate).toISOString()).toBe(oneMonthAfter.toISOString());

      const updatedClasse = await ClasseModel.findById(classeId);
      expect(updatedClasse?.status).toBe(STATUS_CLASSE.OPEN);
    });

    it("should update classe.status to Close if type === CLE && inscriptionEndDate", async () => {
      const now = new Date();
      const oneMonthBefore = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const cohortFixture = getNewCohortFixture({ type: COHORT_TYPE.CLE });
      const cohort = await createCohortHelper(cohortFixture);
      const classe = createFixtureClasse({ status: STATUS_CLASSE.OPEN, cohort: cohort.name, cohortId: cohort._id });
      const classeId = (await createClasse(classe))._id;
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${encodeURIComponent(cohort.name)}`)
        .send({
          ...cohortFixture,
          inscriptionStartDate: oneMonthBefore,
          inscriptionEndDate: now,
        });

      expect(res.status).toBe(200);
      expect(new Date(res.body.data.inscriptionStartDate).toISOString()).toBe(oneMonthBefore.toISOString());
      expect(new Date(res.body.data.inscriptionEndDate).toISOString()).toBe(now.toISOString());

      const updatedClasse = await ClasseModel.findById(classeId);
      expect(updatedClasse?.status).toBe(STATUS_CLASSE.CLOSED);
    });
  });
  describe("PUT /:id/eligibility", () => {
    it("should return 400 if cohort ID is invalid", async () => {
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put("/cohort/invalid_id/eligibility")
        .send({
          zones: ["zone1"],
          schoolLevels: ["level1"],
          bornAfter: "2000-01-01",
          bornBefore: "2010-01-01",
        });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe(ERRORS.INVALID_PARAMS);
    });

    it("should return 400 if request body is invalid", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      const res = await request(getAppHelper())
        .put(`/cohort/${encodeURIComponent(cohort._id)}/eligibility`)
        .send({ zones: "invalid_zone" });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe(ERRORS.INVALID_BODY);
    });

    it("should return 403 if user is not a super admin", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);

      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "nonGOD" }))
        .put(`/cohort/${encodeURIComponent(cohort._id)}/eligibility`)
        .send({
          zones: ["zone1"],
          schoolLevels: ["level1"],
          bornAfter: "2000-01-01",
          bornBefore: "2010-01-01",
        });
      expect(res.status).toBe(403);
      expect(res.body.code).toBe(ERRORS.OPERATION_NOT_ALLOWED);
    });

    it("should return 404 if cohort is not found", async () => {
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put("/cohort/507f1f77bcf86cd799439011/eligibility")
        .send({
          zones: ["zone1"],
          schoolLevels: ["level1"],
          bornAfter: "2000-01-01",
          bornBefore: "2010-01-01",
        });
      expect(res.status).toBe(404);
      expect(res.body.code).toBe(ERRORS.NOT_FOUND);
    });

    it("should return 200 when cohort is updated successfully", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${encodeURIComponent(cohort._id)}/eligibility`)
        .send({
          zones: ["Sarthe"],
          schoolLevels: ["3eme"],
          bornAfter: "2000-01-01",
          bornBefore: "2010-01-01",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.eligibility.zones).toEqual(["Sarthe"]);
      expect(res.body.data.eligibility.schoolLevels).toEqual(["3eme"]);
      expect(new Date(res.body.data.eligibility.bornAfter)).toEqual(new Date("2000-01-01"));
      expect(new Date(res.body.data.eligibility.bornBefore)).toEqual(new Date("2010-01-01"));
    });
  });
});
