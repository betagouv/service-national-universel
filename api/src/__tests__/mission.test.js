require("dotenv").config({ path: "./.env-testing" });
const faker = require("faker");
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewMissionFixture = require("./fixtures/mission");
const getNewStructureFixture = require("./fixtures/structure");
const { dbConnect, dbClose } = require("./helpers/db");
const {
  getMissionsHelper,
  getMissionByIdHelper,
  deleteMissionByIdHelper,
  createMissionHelper,
  expectMissionToEqual,
  notExisitingMissionId,
} = require("./helpers/mission");
const { createReferentHelper } = require("./helpers/referent");
const { deleteStructureByIdHelper, createStructureHelper, expectStructureToEqual, notExistingStructureId } = require("./helpers/structure");
const getNewReferentFixture = require("./fixtures/referent");
const { ROLES } = require("snu-lib/roles");
const { createYoungHelper } = require("./helpers/young");
const getNewYoungFixture = require("./fixtures/young");
const { createApplication } = require("./helpers/application");
const { getNewApplicationFixture } = require("./fixtures/application");

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Mission", () => {
  describe("POST /mission", () => {
    it("should create a new mission", async () => {
      const missionFixture = getNewMissionFixture();
      const missionsBefore = await getMissionsHelper();
      const res = await request(getAppHelper()).post("/mission").send(missionFixture);
      expect(res.statusCode).toEqual(200);
      expectMissionToEqual(missionFixture, res.body.data);
      const missionsAfter = await getMissionsHelper();
      expect(missionsAfter.length).toEqual(missionsBefore.length + 1);
      await deleteMissionByIdHelper(res.body.data._id);
    });
  });
  describe("PUT /mission/:id", () => {
    it("should update a mission", async () => {
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
    it("should return 404 if mission does not exist", async () => {
      const res = await request(getAppHelper()).put("/mission/" + notExisitingMissionId);
      expect(res.statusCode).toEqual(404);
    });
    it("should return 401 if user can not update mission", async () => {
      const mission = await createMissionHelper({ ...getNewMissionFixture(), department: "hop", region: "hop" });
      const passport = require("passport");
      passport.user.role = ROLES.REFERENT_DEPARTMENT;
      let res = await request(getAppHelper()).put("/mission/" + mission._id);
      expect(res.statusCode).toEqual(401);

      passport.user.role = ROLES.REFERENT_REGION;
      res = await request(getAppHelper()).put("/mission/" + mission._id);
      expect(res.statusCode).toEqual(401);

      passport.user.role = ROLES.ADMIN;
    });
  });
  describe("GET /mission/:id", () => {
    it("should get a mission", async () => {
      const missionFixture = getNewMissionFixture();
      const mission = await createMissionHelper(missionFixture);
      const res = await request(getAppHelper()).get(`/mission/${mission._id}`);
      expect(res.statusCode).toEqual(200);
      expectMissionToEqual(missionFixture, res.body.data);
      expect(res.body.data.tutor).toBeFalsy();
      await deleteMissionByIdHelper(mission._id);
    });
    it("should return 404 if mission does not exist", async () => {
      const res = await request(getAppHelper()).get("/mission/" + notExisitingMissionId);
      expect(res.statusCode).toEqual(404);
    });
    it("should return mission tutor if it exists", async () => {
      const tutor = await createReferentHelper({ ...getNewReferentFixture(), firstName: "Hello" });
      const mission = await createMissionHelper({ ...getNewMissionFixture(), tutorId: tutor.id });
      const res = await request(getAppHelper()).get(`/mission/${mission._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.tutor.firstName).toEqual(tutor.firstName);
    });
    it("should return application if user is a young", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const mission = await createMissionHelper({ ...getNewMissionFixture() });
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });
      const res = await request(getAppHelper()).get(`/mission/${mission._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.application.youngId).toEqual(application.youngId);

      passport.user = previous;
    });
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

  it("DELETE /mission/:id", async () => {
    const missionFixture = getNewMissionFixture();
    let mission = await createMissionHelper(missionFixture);
    const missionsBefore = await getMissionsHelper();
    const res = await request(getAppHelper()).delete(`/mission/${mission._id}`).send();
    expect(res.statusCode).toEqual(200);
    const missionsAfter = await getMissionsHelper();
    expect(missionsAfter.length).toEqual(missionsBefore.length - 1);
  });

  describe("PUT mission/:id/structure/:structureId", () => {
    it("should return 404 when mission does not exist", async () => {
      const res = await request(getAppHelper()).put(`/mission/${notExisitingMissionId}/structure/${notExistingStructureId}`);
      expect(res.statusCode).toEqual(404);
    });
    it("should return 404 when structure does not exist", async () => {
      const mission = await createMissionHelper(getNewMissionFixture());
      const res = await request(getAppHelper()).put(`/mission/${mission._id}/structure/${notExistingStructureId}`);
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 when mission and structure exist", async () => {
      const mission = await createMissionHelper(getNewMissionFixture());
      const structure = await createStructureHelper(getNewStructureFixture());
      const res = await request(getAppHelper()).put(`/mission/${mission._id}/structure/${structure._id}`);
      expect(res.statusCode).toEqual(200);
    });
    it("should update referent", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const mission = await createMissionHelper({ ...getNewMissionFixture(), tutorId: referent._id });
      const structure = await createStructureHelper(getNewStructureFixture());
      const res = await request(getAppHelper()).put(`/mission/${mission._id}/structure/${structure._id}`);
      expect(res.statusCode).toEqual(200);
    });
  });
});
