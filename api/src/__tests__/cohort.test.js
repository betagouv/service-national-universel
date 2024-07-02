const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewCohortFixture = require("./fixtures/cohort");
const { createCohortHelper } = require("./helpers/cohort");
const { createClasse } = require("./helpers/classe");
const { createFixtureClasse } = require("./fixtures/classe");
const { COHORT_TYPE, ROLES, STATUS_CLASSE } = require("snu-lib");
const passport = require("passport");
const { dbConnect, dbClose } = require("./helpers/db");
const ClasseModel = require("../models/cle/classe");

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
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper())
      .put(`/cohort/${encodeURIComponent(cohort.name)}`)
      .send({
        inscriptionStartDate: new Date(),
        ...cohortFixture,
      });
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 403 if user is not a super admin", async () => {
    const previous = passport.user.subRole;
    const cohortFixture = getNewCohortFixture();
    const cohort = await createCohortHelper(cohortFixture);
    passport.user.subRole = "nonGOD";
    const res = await request(getAppHelper())
      .put(`/cohort/${encodeURIComponent(cohort.name)}`)
      .send({
        inscriptionStartDate: new Date(),
        ...cohortFixture,
      });
    expect(res.status).toBe(403);
    passport.user.subRole = previous;
  });

  it("should return 404 if cohort is not found", async () => {
    const previous = passport.user.subRole;
    passport.user.subRole = "god";
    const cohortFixture = getNewCohortFixture();
    const res = await request(getAppHelper())
      .put(`/cohort/${cohortFixture.name}`)
      .send({
        ...cohortFixture,
      });
    expect(res.status).toBe(404);
    passport.user.subRole = previous;
  });

  it("should return 200 when cohort is updated successfully", async () => {
    const previous = passport.user.subRole;
    passport.user.subRole = "god";
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
    passport.user.subRole = previous;
  });

  it("should update classe.status to OPEN if type === CLE && inscriptionStartDate", async () => {
    const previous = passport.user.subRole;
    passport.user.subRole = "god";
    const now = new Date();
    const oneMonthAfter = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const cohortFixture = getNewCohortFixture({ type: COHORT_TYPE.CLE });
    const cohort = await createCohortHelper(cohortFixture);
    const classe = createFixtureClasse({ cohort: cohort.name });
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
    expect(updatedClasse.status).toBe(STATUS_CLASSE.OPEN);

    passport.user.subRole = previous;
  });

  it("should update classe.status to Close if type === CLE && inscriptionEndDate", async () => {
    const previous = passport.user.subRole;
    passport.user.subRole = "god";
    const now = new Date();
    const oneMonthBefore = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const cohortFixture = getNewCohortFixture({ type: COHORT_TYPE.CLE });
    const cohort = await createCohortHelper(cohortFixture);
    const classe = createFixtureClasse({ status: STATUS_CLASSE.OPEN, cohort: cohort.name });
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
    expect(updatedClasse.status).toBe(STATUS_CLASSE.CLOSED);

    passport.user.subRole = previous;
  });
});
