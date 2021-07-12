require("dotenv").config({ path: "./.env-testing" });
const faker = require("faker");
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const passport = require("./__mocks__/passport");
const getNewProgramFixture = require("./fixtures/program");
const { getProgramsHelper, getProgramByIdHelper, deleteProgramByIdHelper, createProgramHelper, expectProgramToEqual } = require("./helpers/program");
const { dbConnect, dbClose } = require("./helpers/db");

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Program", () => {
  it("POST /program", async () => {
    const programFixture = getNewProgramFixture();
    const programsBefore = await getProgramsHelper();
    const res = await request(getAppHelper()).post("/program").send(programFixture);
    expect(res.statusCode).toEqual(200);
    expectProgramToEqual(programFixture, res.body.data);
    const programsAfter = await getProgramsHelper();
    expect(programsAfter.length).toEqual(programsBefore.length + 1);
    await deleteProgramByIdHelper(res.body.data._id);
  });

  it("PUT /program", async () => {
    const programFixture = getNewProgramFixture();
    let program = await createProgramHelper(programFixture);
    const modifiedProgram = { ...programFixture };
    modifiedProgram.url = faker.internet.url();
    modifiedProgram._id = program._id;
    const res = await request(getAppHelper()).put("/program").send(modifiedProgram);
    expect(res.statusCode).toEqual(200);
    program = await getProgramByIdHelper(program._id);
    expectProgramToEqual(program, modifiedProgram);
    await deleteProgramByIdHelper(program._id);
  });

  it("GET /program/:id", async () => {
    const programFixture = getNewProgramFixture();
    const program = await createProgramHelper(programFixture);
    const res = await request(getAppHelper()).get(`/program/${program._id}`);
    expect(res.statusCode).toEqual(200);
    expectProgramToEqual(programFixture, res.body.data);
    await deleteProgramByIdHelper(program._id);
  });

  it("GET /program/ AS ADMIN", async () => {
    const programFixture = getNewProgramFixture();
    const program = await createProgramHelper(programFixture);
    const res = await request(getAppHelper()).get(`/program/`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(1);
    expectProgramToEqual(programFixture, res.body.data[0]);
    await deleteProgramByIdHelper(program._id);
  });

  it("GET /program/ AS HEAD_CENTER", async () => {
    let programFixtureHeadCenter = getNewProgramFixture();
    programFixtureHeadCenter.visibility = "HEAD_CENTER";
    const programHeadCenter = await createProgramHelper(programFixtureHeadCenter);
    const programFixture = getNewProgramFixture();
    const program = await createProgramHelper(programFixture);
    passport.user.role = "head_center";
    const res = await request(getAppHelper()).get(`/program/`);
    passport.user.role = "admin";
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(1);
    expectProgramToEqual(programFixtureHeadCenter, res.body.data[0]);
    await deleteProgramByIdHelper(programHeadCenter._id);
    await deleteProgramByIdHelper(program._id);
  });

  it("GET /program/ AS STRUCTURE_MEMBER", async () => {
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
    passport.user.role = "admin";
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(1);
    expectProgramToEqual(programFixtureRegionDepartment, res.body.data[0]);
    await deleteProgramByIdHelper(programRegionDepartment._id);
    await deleteProgramByIdHelper(programNoRegionAndDepartment._id);
  });

  it("DELETE /program/:id", async () => {
    const programFixture = getNewProgramFixture();
    const program = await createProgramHelper(programFixture);
    const programsBefore = await getProgramsHelper();
    const res = await request(getAppHelper()).delete(`/program/${program._id}`);
    expect(res.statusCode).toEqual(200);
    const programsAfter = await getProgramsHelper();
    expect(programsAfter.length).toEqual(programsBefore.length - 1);
  });
});
