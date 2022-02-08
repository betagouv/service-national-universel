require("dotenv").config({ path: "./.env-testing" });
const faker = require("faker");
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const passport = require("./__mocks__/passport");
const getNewProgramFixture = require("./fixtures/program");
const {
  getProgramsHelper,
  getProgramByIdHelper,
  deleteProgramByIdHelper,
  createProgramHelper,
  expectProgramToEqual,
  deleteAllProgram,
  notExisitingProgramId,
} = require("./helpers/program");
const { dbConnect, dbClose } = require("./helpers/db");
const { ROLES } = require("snu-lib/roles");
const getNewReferentFixture = require("./fixtures/referent");
const { createReferentHelper } = require("./helpers/referent");

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Program", () => {
  describe("POST /program", () => {
    it("should create a new program", async () => {
      const programFixture = { ...getNewProgramFixture(), department: "Ain" };
      const programsBefore = await getProgramsHelper();
      const res = await request(getAppHelper()).post("/program").send(programFixture);
      expect(res.statusCode).toEqual(200);
      expectProgramToEqual(programFixture, res.body.data);
      const programsAfter = await getProgramsHelper();
      expect(programsAfter.length).toEqual(programsBefore.length + 1);
      await deleteProgramByIdHelper(res.body.data._id);
    });
    it("should return 400 if program not validated", async () => {
      const programFixture = { ...getNewProgramFixture(), department: 1 };
      const res = await request(getAppHelper()).post("/program").send(programFixture);
      expect(res.statusCode).toEqual(400);
    });
    it("should return 403 if user is referent department and create a program for another department ", async () => {
      const referent = await createReferentHelper({ ...getNewReferentFixture(), role: ROLES.REFERENT_DEPARTMENT, department: "foo" });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = referent;
      const programFixture = { ...getNewProgramFixture(), department: "bar" };
      const res = await request(getAppHelper()).post("/program").send(programFixture);
      expect(res.statusCode).toEqual(403);
      passport.user = previous;
    });
    it("should return 403 if user is referent region and create a program for another region ", async () => {
      const referent = await createReferentHelper({ ...getNewReferentFixture(), role: ROLES.REFERENT_REGION, region: "foo" });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = referent;
      const programFixture = { ...getNewProgramFixture(), region: "bar" };
      const res = await request(getAppHelper()).post("/program").send(programFixture);
      expect(res.statusCode).toEqual(403);
      passport.user = previous;
    });
  });
  describe("PUT /program/:id", () => {
    it("should update a program", async () => {
      const programFixture = getNewProgramFixture();
      let program = await createProgramHelper(programFixture);
      const modifiedProgram = { ...programFixture };
      modifiedProgram.url = faker.internet.url();
      modifiedProgram._id = program._id;
      const res = await request(getAppHelper()).put(`/program/${program._id}`).send(modifiedProgram);
      expect(res.statusCode).toEqual(200);
      program = await getProgramByIdHelper(program._id);
      expectProgramToEqual(program, modifiedProgram);
      await deleteProgramByIdHelper(program._id);
    });
    it("should return 404 if program does not exist", async () => {
      const res = await request(getAppHelper()).put("/program/" + notExisitingProgramId);
      expect(res.statusCode).toEqual(404);
    });
    it("should return 403 if user can not update program", async () => {
      const program = await createProgramHelper({ ...getNewProgramFixture(), department: "hip", region: "hop" });
      const passport = require("passport");
      passport.user.role = ROLES.REFERENT_DEPARTMENT;
      let res = await request(getAppHelper()).put("/program/" + program._id);
      expect(res.statusCode).toEqual(403);

      passport.user.role = ROLES.REFERENT_REGION;
      res = await request(getAppHelper()).put("/program/" + program._id);
      expect(res.statusCode).toEqual(403);

      passport.user.role = ROLES.ADMIN;
    });
  });

  describe("GET /program/:id", () => {
    it("should return the program", async () => {
      const programFixture = getNewProgramFixture();
      const program = await createProgramHelper(programFixture);
      const res = await request(getAppHelper()).get(`/program/${program._id}`);
      expect(res.statusCode).toEqual(200);
      expectProgramToEqual(programFixture, res.body.data);
      await deleteProgramByIdHelper(program._id);
    });
    it("should return 404 if program not found", async () => {
      const res = await request(getAppHelper()).get(`/program/${notExisitingProgramId}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  it("GET /program/ AS ADMIN", async () => {
    await deleteAllProgram();
    const programFixture = getNewProgramFixture();
    const program = await createProgramHelper(programFixture);
    const res = await request(getAppHelper()).get(`/program/`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(1);
    expectProgramToEqual(programFixture, res.body.data[0]);
    await deleteProgramByIdHelper(program._id);
  });

  it("GET /program/ AS HEAD_CENTER", async () => {
    await deleteAllProgram();
    let programFixtureHeadCenter = getNewProgramFixture();
    programFixtureHeadCenter.visibility = "HEAD_CENTER";
    const programHeadCenter = await createProgramHelper(programFixtureHeadCenter);
    const programFixture = getNewProgramFixture();
    const program = await createProgramHelper(programFixture);
    passport.user.role = ROLES.HEAD_CENTER;
    const res = await request(getAppHelper()).get(`/program/`);
    passport.user.role = ROLES.ADMIN;
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(1);
    expectProgramToEqual(programFixtureHeadCenter, res.body.data[0]);
    await deleteProgramByIdHelper(programHeadCenter._id);
    await deleteProgramByIdHelper(program._id);
  });

  it("GET /program/ AS STRUCTURE_MEMBER", async () => {
    await deleteAllProgram();
    let programFixtureRegionDepartment = getNewProgramFixture();
    programFixtureRegionDepartment.region = passport.user.region;
    programFixtureRegionDepartment.department = passport.user.department;
    const programRegionDepartment = await createProgramHelper(programFixtureRegionDepartment);
    let programFixtureNoRegionAndDepartment = getNewProgramFixture();
    programFixtureNoRegionAndDepartment.region = "";
    programFixtureNoRegionAndDepartment.department = "";
    const programNoRegionAndDepartment = await createProgramHelper(programFixtureNoRegionAndDepartment);
    passport.user.role = "structure_member";
    const res = await request(getAppHelper()).get(`/program/`);
    passport.user.role = ROLES.ADMIN;
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(1);
    expectProgramToEqual(programFixtureRegionDepartment, res.body.data[0]);
    await deleteProgramByIdHelper(programRegionDepartment._id);
    await deleteProgramByIdHelper(programNoRegionAndDepartment._id);
  });

  it("DELETE /program/:id", async () => {
    await deleteAllProgram();
    const programFixture = getNewProgramFixture();
    const program = await createProgramHelper(programFixture);
    const programsBefore = await getProgramsHelper();
    const res = await request(getAppHelper()).delete(`/program/${program._id}`);
    expect(res.statusCode).toEqual(200);
    const programsAfter = await getProgramsHelper();
    expect(programsAfter.length).toEqual(programsBefore.length - 1);
  });
});
