import request from "supertest";
import getAppHelper from "./helpers/app";
import getNewCohortFixture from "./fixtures/cohort";
import { createCohortHelper } from "./helpers/cohort";
import { createClasse } from "./helpers/classe";
import { createFixtureClasse } from "./fixtures/classe";
import { COHORT_TYPE, ROLES, STATUS_CLASSE, SUB_ROLE_GOD } from "snu-lib";
import passport from "passport";
import { dbConnect, dbClose } from "./helpers/db";
import { ClasseModel } from "../models";

jest.mock("../emails", () => ({
  emit: jest.fn(),
}));

beforeAll(dbConnect);
afterAll(dbClose);

describe("PUT /:cohort", () => {
  it("should return 400 if cohort name is invalid", async () => {
    const res = await request(getAppHelper()).put("/cohort/NonValidName").send({ name: "New Cohort" });
    expect(res.status).toBe(400);
  });

  it("should return 400 if request body is invalid", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture());
    const res = await request(getAppHelper())
      .put(`/cohort/${encodeURIComponent(cohort.name)}`)
      .send({ name: 2 });
    expect(res.status).toBe(400);
  });

  it("should return 403 if user is not an admin", async () => {
    const cohortFixture = getNewCohortFixture();
    const cohort = await createCohortHelper(cohortFixture);
    // @ts-ignore
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper())
      .put(`/cohort/${encodeURIComponent(cohort.name)}`)
      .send({
        ...cohortFixture,
        inscriptionStartDate: new Date(),
      });
    expect(res.status).toBe(403);
    // @ts-ignore
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 403 if user is not a super admin", async () => {
    // @ts-ignore
    const previous = passport.user.subRole;
    const cohortFixture = getNewCohortFixture();
    const cohort = await createCohortHelper(cohortFixture);
    // @ts-ignore
    passport.user.subRole = "nonGOD";
    const res = await request(getAppHelper())
      .put(`/cohort/${encodeURIComponent(cohort.name)}`)
      .send({
        ...cohortFixture,
        inscriptionStartDate: new Date(),
      });
    expect(res.status).toBe(403);
    // @ts-ignore
    passport.user.subRole = previous;
  });

  it("should return 404 if cohort is not found", async () => {
    // @ts-ignore
    const previous = passport.user.subRole;
    // @ts-ignore
    passport.user.subRole = SUB_ROLE_GOD;
    const cohortFixture = getNewCohortFixture();
    const res = await request(getAppHelper())
      .put(`/cohort/${cohortFixture.name}`)
      .send({
        ...cohortFixture,
      });
    expect(res.status).toBe(404);
    // @ts-ignore
    passport.user.subRole = previous;
  });

  it("should return 200 when cohort is updated successfully", async () => {
    // @ts-ignore
    const previous = passport.user.subRole;
    // @ts-ignore
    passport.user.subRole = SUB_ROLE_GOD;
    const now = new Date();
    const cohortFixture = getNewCohortFixture();
    const cohort = await createCohortHelper(cohortFixture);
    const res = await request(getAppHelper())
      .put(`/cohort/${encodeURIComponent(cohort.name)}`)
      .send({
        ...cohortFixture,
        inscriptionStartDate: now,
      });

    expect(res.status).toBe(200);
    expect(new Date(res.body.data.inscriptionStartDate).toISOString()).toBe(now.toISOString());
    // @ts-ignore
    passport.user.subRole = previous;
  });

  it("should update classe.status to OPEN if type === CLE && inscriptionStartDate", async () => {
    // @ts-ignore
    const previous = passport.user.subRole;
    // @ts-ignore
    passport.user.subRole = SUB_ROLE_GOD;
    const now = new Date();
    const oneMonthAfter = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const cohortFixture = getNewCohortFixture({ type: COHORT_TYPE.CLE });
    const cohort = await createCohortHelper(cohortFixture);
    const classe = createFixtureClasse({ cohort: cohort.name, status: STATUS_CLASSE.ASSIGNED, cohortId: cohort._id });
    const classeId = (await createClasse(classe))._id;
    const res = await request(getAppHelper())
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
    // @ts-ignore
    passport.user.subRole = previous;
  });

  it("should update classe.status to Close if type === CLE && inscriptionEndDate", async () => {
    // @ts-ignore
    const previous = passport.user.subRole;
    // @ts-ignore
    passport.user.subRole = SUB_ROLE_GOD;
    const now = new Date();
    const oneMonthBefore = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const cohortFixture = getNewCohortFixture({ type: COHORT_TYPE.CLE });
    const cohort = await createCohortHelper(cohortFixture);
    const classe = createFixtureClasse({ status: STATUS_CLASSE.OPEN, cohort: cohort.name, cohortId: cohort._id });
    const classeId = (await createClasse(classe))._id;
    const res = await request(getAppHelper())
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

    // @ts-ignore
    passport.user.subRole = previous;
  });
});
