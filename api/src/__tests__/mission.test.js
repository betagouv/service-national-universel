require("dotenv").config({ path: "./.env-testing" });
const faker = require("faker");
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewMissionFixture = require("./fixtures/mission");
const getNewStructureFixture = require("./fixtures/structure");
const { dbConnect, dbClose } = require("./helpers/db");
const { getMissionsHelper, getMissionByIdHelper, deleteMissionByIdHelper, createMissionHelper, expectMissionToEqual } = require("./helpers/mission");
const { deleteStructureByIdHelper, createStructureHelper, expectStructureToEqual } = require("./helpers/structure");

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

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
