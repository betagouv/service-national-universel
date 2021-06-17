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

const { getMissionsHelper, getMissionByIdHelper, deleteMissionByIdHelper, createMissionHelper, expectMissionToEqual } = require("./helpers/mission");

const { getYoungsHelper, getYoungByIdHelper, deleteYoungByIdHelper, createYoungHelper, expectYoungToEqual } = require("./helpers/young");

const { getReferentsHelper, deleteReferentByIdHelper } = require("./helpers/referent");

const { deleteStructureByIdHelper, createStructureHelper, expectStructureToEqual } = require("./helpers/structure");

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
    await deleteReferentByIdHelper(res.body.data._id);
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
    expectYoungToEqual(youngFixture, res.body.young);
    const youngsAfter = await getYoungsHelper();
    expect(youngsAfter.length).toEqual(youngsBefore.length + 1);
    await deleteYoungByIdHelper(res.body.young._id);
  });

  it("PUT /referent/young/:id", async () => {
    const youngFixture = getNewYoungFixture();
    let young = await createYoungHelper(youngFixture);
    const modifiedYoung = { ...youngFixture };
    modifiedYoung.firstName = faker.name.firstName();
    const put = await request(getAppHelper()).put(`/referent/young/${young._id}`).send(modifiedYoung);
    expect(put.statusCode).toEqual(200);
    young = await getYoungByIdHelper(young._id);
    expectYoungToEqual(young, modifiedYoung);
    await deleteYoungByIdHelper(young._id);
  });
});

describe("Young", () => {
  it("DELETE /young/:id", async () => {
    const youngFixture = getNewYoungFixture();
    const young = await createYoungHelper(youngFixture);
    const youngsBefore = await getYoungsHelper();
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
    await deleteMissionByIdHelper(res.body.data._id);
  });

  it("GET /mission/:id", async () => {
    const missionFixture = getNewMissionFixture();
    const mission = await createMissionHelper(missionFixture);
    const res = await request(getAppHelper()).get(`/mission/${mission._id}`);
    expect(res.statusCode).toEqual(200);
    expectMissionToEqual(missionFixture, res.body.data);
    await deleteMissionByIdHelper(mission._id);
  });

  it("GET /mission/structure/:structureid", async () => {
    const structureFixture = getNewStructureFixture();
    const structure = await createStructureHelper(structureFixture);
    let missionFixture = getNewMissionFixture();
    missionFixture.structureId = structure._id;
    const mission = await createMissionHelper(missionFixture);
    const res = await request(getAppHelper()).get(`/mission/structure/${structure._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(1);
    expectStructureToEqual(res.body.data[0], missionFixture);
    await deleteMissionByIdHelper(mission._id);
    await deleteStructureByIdHelper(structure._id);
  });

  it("PUT /mission/:id", async () => {
    const missionFixture = getNewMissionFixture();
    let mission = await createMissionHelper(missionFixture);
    const modifiedMission = { ...missionFixture };
    modifiedMission.startAt = faker.date.past();
    const res = await request(getAppHelper()).put(`/mission/${mission._id}`).send(modifiedMission);
    expect(res.statusCode).toEqual(200);
    mission = await getMissionByIdHelper(mission._id);
    expectMissionToEqual(modifiedMission, mission);
    await deleteMissionByIdHelper(mission._id);
  });

  it("PUT /mission/", async () => {
    const missionFixture = getNewMissionFixture();
    let mission = await createMissionHelper(missionFixture);
    let modifiedMission = { ...missionFixture };
    modifiedMission._id = mission._id;
    modifiedMission.startAt = faker.date.past();
    const res = await request(getAppHelper()).put("/mission/").send(modifiedMission);
    expect(res.statusCode).toEqual(200);
    mission = await getMissionByIdHelper(mission._id);
    expectMissionToEqual(modifiedMission, mission);
    await deleteMissionByIdHelper(mission._id);
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
