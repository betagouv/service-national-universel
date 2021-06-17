require("dotenv").config({ path: "./.env-testing" });
const regeneratorRuntime = require("regenerator-runtime");
const faker = require("faker");
const request = require("supertest");
const mongoose = require("mongoose");
const { MONGO_URL } = require("../config");

const getAppHelper = require("./helpers/app");
jest.setTimeout(5_000);

const getNewYoungFixture = require("./fixtures/young");
const getNewReferentFixture = require("./fixtures/referent");
const getNewMissionFixture = require("./fixtures/mission");
const getNewStructureFixture = require("./fixtures/structure");
const getNewProgramFixture = require("./fixtures/program");
const passport = require("./__mocks__/passport");

const {
  getMissionsHelper,
  getMissionByNameHelper,
  deleteMissionByNameHelper,
  createMissionHelper,
  expectMissionToEqual,
} = require("./helpers/mission");

const { getYoungsHelper, getYoungByEmailHelper, deleteYoungByEmailHelper, createYoungHelper, expectYoungToEqual } = require("./helpers/young");

const {
  getReferentsHelper,
  getReferentByEmailHelper,
  deleteReferentByEmailHelper,
  createReferentHelper,
  expectReferentToEqual,
} = require("./helpers/referent");

const {
  getStructuresHelper,
  getStructureByNameHelper,
  deleteStructureByNameHelper,
  createStructureHelper,
  expectStructureToEqual,
} = require("./helpers/structure");

const {
  getProgramsHelper,
  getProgramByNameHelper,
  deleteProgramByNameHelper,
  createProgramHelper,
  expectProgramToEqual,
} = require("./helpers/program");

let db;

beforeAll(async () => {
  await mongoose.connect(MONGO_URL, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true });
  mongoose.Promise = global.Promise; //Get the default connection
  db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  db.once("open", () => console.log("CONNECTED OK"));
});

afterAll(async () => {
  db.close();
});

describe("Referent", () => {
  it("POST /referent/signup_invite/admin", async () => {
    const referentFixture = getNewReferentFixture();
    const referentsBefore = await getReferentsHelper();
    const res = await request(getAppHelper()).post("/referent/signup_invite/admin").send(referentFixture);
    expect(res.statusCode).toEqual(200);
    const referentsAfter = await getReferentsHelper();
    expect(referentsAfter.length).toEqual(referentsBefore.length + 1);
    await deleteReferentByEmailHelper(referentFixture.email);
  });

  it("GET /referent", async () => {
    const res = await request(getAppHelper()).get("/referent").send();
    expect(res.statusCode).toEqual(200);
  });

  it("POST /referent/young", async () => {
    const youngFixture = getNewYoungFixture();
    const youngsBefore = await getYoungsHelper();
    const res = await request(getAppHelper()).post("/referent/young/").send(youngFixture);
    expect(res.statusCode).toEqual(200);
    const young = await getYoungByEmailHelper(youngFixture.email);
    expect(young.firstName).toEqual(youngFixture.firstName);
    const youngsAfter = await getYoungsHelper();
    expect(youngsAfter.length).toEqual(youngsBefore.length + 1);
    await deleteYoungByEmailHelper(youngFixture.email);
  });

  it("PUT /referent/young/:id", async () => {
    const youngFixture = getNewYoungFixture();
    await createYoungHelper(youngFixture);
    let young = await getYoungByEmailHelper(youngFixture.email);
    const modifiedYoung = { ...youngFixture };
    modifiedYoung.firstName = faker.name.firstName();
    const put = await request(getAppHelper()).put(`/referent/young/${young._id}`).send(modifiedYoung);
    expect(put.statusCode).toEqual(200);
    young = await getYoungByEmailHelper(youngFixture.email);
    expectYoungToEqual(young, modifiedYoung);
    await deleteYoungByEmailHelper(youngFixture.email);
  });
});

describe("Young", () => {
  it("DELETE /young/:id", async () => {
    const youngFixture = getNewYoungFixture();
    await createYoungHelper(youngFixture);
    const youngsBefore = await getYoungsHelper();
    const young = await getYoungByEmailHelper(youngFixture.email);
    const res = await request(getAppHelper()).delete(`/young/${young._id}`);
    expect(res.statusCode).toEqual(200);
    const youngsAfter = await getYoungsHelper();
    expect(youngsAfter.length).toEqual(youngsBefore.length - 1);
  });
});

describe("Mission", () => {
  it("POST /mission", async () => {
    const missionFixture = getNewMissionFixture();
    const missionsBefore = await getMissionsHelper();
    const res = await request(getAppHelper()).post("/mission").send(missionFixture);
    expect(res.statusCode).toEqual(200);
    expectMissionToEqual(missionFixture, res.body.data);
    const missionsAfter = await getMissionsHelper();
    expect(missionsAfter.length).toEqual(missionsBefore.length + 1);
    await deleteMissionByNameHelper(missionFixture.name);
  });

  it("GET /mission/:id", async () => {
    const missionFixture = getNewMissionFixture();
    const mission = await createMissionHelper(missionFixture);
    const res = await request(getAppHelper()).get(`/mission/${mission._id}`);
    expect(res.statusCode).toEqual(200);
    expectMissionToEqual(missionFixture, res.body.data);
    await deleteMissionByNameHelper(missionFixture.name);
  });

  it("GET /mission/structure/:structureid", async () => {
    const structureFixture = getNewStructureFixture();
    const structure = await createStructureHelper(structureFixture);
    let missionFixture = getNewMissionFixture();
    missionFixture.structureId = structure._id;
    await createMissionHelper(missionFixture);
    const res = await request(getAppHelper()).get(`/mission/structure/${structure._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(1);
    expectStructureToEqual(res.body.data[0], missionFixture);
    await deleteMissionByNameHelper(missionFixture.name);
    await deleteStructureByNameHelper(structureFixture.name);
  });

  it("PUT /mission/:id", async () => {
    const missionFixture = getNewMissionFixture();
    let mission = await createMissionHelper(missionFixture);
    const modifiedMission = { ...missionFixture };
    modifiedMission.startAt = faker.date.past();
    const res = await request(getAppHelper()).put(`/mission/${mission._id}`).send(modifiedMission);
    expect(res.statusCode).toEqual(200);
    mission = await getMissionByNameHelper(missionFixture.name);
    expectMissionToEqual(modifiedMission, mission);
    await deleteMissionByNameHelper(missionFixture.name);
  });

  it("PUT /mission/", async () => {
    const missionFixture = getNewMissionFixture();
    let mission = await createMissionHelper(missionFixture);
    let modifiedMission = { ...missionFixture };
    modifiedMission._id = mission._id;
    modifiedMission.startAt = faker.date.past();
    const res = await request(getAppHelper()).put("/mission/").send(modifiedMission);
    expect(res.statusCode).toEqual(200);
    mission = await getMissionByNameHelper(missionFixture.name);
    expectMissionToEqual(modifiedMission, mission);
    await deleteMissionByNameHelper(missionFixture.name);
  });

  it("DELETE /mission/:id", async () => {
    const missionFixture = getNewMissionFixture();
    let mission = await createMissionHelper(missionFixture);
    const missionsBefore = await getMissionsHelper();
    const res = await request(getAppHelper()).delete(`/mission/${mission._id}`).send();
    expect(res.statusCode).toEqual(200);
    const missionsAfter = await getMissionsHelper();
    expect(missionsAfter.length).toEqual(missionsBefore.length - 1);
  });
});

describe("Program", () => {
  it("POST /program", async () => {
    const programFixture = getNewProgramFixture();
    const programsBefore = await getProgramsHelper();
    const res = await request(getAppHelper()).post("/program").send(programFixture);
    expect(res.statusCode).toEqual(200);
    expectProgramToEqual(programFixture, res.body.data);
    const programsAfter = await getProgramsHelper();
    expect(programsAfter.length).toEqual(programsBefore.length + 1);
    await deleteProgramByNameHelper(programFixture.name);
  });

  it("PUT /program", async () => {
    const programFixture = getNewProgramFixture();
    let program = await createProgramHelper(programFixture);
    const modifiedProgram = { ...programFixture };
    modifiedProgram.url = faker.internet.url();
    modifiedProgram._id = program._id;
    const res = await request(getAppHelper()).put("/program").send(modifiedProgram);
    expect(res.statusCode).toEqual(200);
    program = await getProgramByNameHelper(programFixture.name);
    expectProgramToEqual(program, modifiedProgram);
    await deleteProgramByNameHelper(programFixture.name);
  });

  it("GET /program/:id", async () => {
    const programFixture = getNewProgramFixture();
    const program = await createProgramHelper(programFixture);
    const res = await request(getAppHelper()).get(`/program/${program._id}`);
    expect(res.statusCode).toEqual(200);
    expectProgramToEqual(programFixture, res.body.data);
    await deleteProgramByNameHelper(programFixture.name);
  });

  it("GET /program/ AS ADMIN", async () => {
    const programFixture = getNewProgramFixture();
    await createProgramHelper(programFixture);
    const res = await request(getAppHelper()).get(`/program/`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(1);
    expectProgramToEqual(programFixture, res.body.data[0]);
    await deleteProgramByNameHelper(programFixture.name);
  });

  it("GET /program/ AS HEAD_CENTER", async () => {
    let programFixtureHeadCenter = getNewProgramFixture();
    programFixtureHeadCenter.visibility = "HEAD_CENTER";
    await createProgramHelper(programFixtureHeadCenter);
    const programFixture = getNewProgramFixture();
    await createProgramHelper(programFixture);
    passport.user.role = "head_center";
    const res = await request(getAppHelper()).get(`/program/`);
    passport.user.role = "admin";
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(1);
    expectProgramToEqual(programFixtureHeadCenter, res.body.data[0]);
    await deleteProgramByNameHelper(programFixture.name);
    await deleteProgramByNameHelper(programFixtureHeadCenter.name);
  });

  it("GET /program/ AS STRUCTURE_MEMBER", async () => {
    let programFixtureRegionDepartment = getNewProgramFixture();
    programFixtureRegionDepartment.region = passport.user.region;
    programFixtureRegionDepartment.department = passport.user.department;
    await createProgramHelper(programFixtureRegionDepartment);
    let programFixtureNoRegionAndDepartment = getNewProgramFixture();
    programFixtureNoRegionAndDepartment.region = "";
    programFixtureNoRegionAndDepartment.department = "";
    await createProgramHelper(programFixtureNoRegionAndDepartment);
    passport.user.role = "structure_member";
    const res = await request(getAppHelper()).get(`/program/`);
    passport.user.role = "admin";
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(1);
    expectProgramToEqual(programFixtureRegionDepartment, res.body.data[0]);
    await deleteProgramByNameHelper(programFixtureRegionDepartment.name);
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
