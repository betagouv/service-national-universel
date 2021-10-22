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
const { createReferentHelper, getReferentByIdHelper } = require("./helpers/referent");
const { deleteStructureByIdHelper, createStructureHelper, expectStructureToEqual, notExistingStructureId } = require("./helpers/structure");
const getNewReferentFixture = require("./fixtures/referent");
const { ROLES } = require("snu-lib");
const { createYoungHelper } = require("./helpers/young");
const getNewYoungFixture = require("./fixtures/young");
const { createApplication, getApplicationByIdHelper } = require("./helpers/application");
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

  describe("DELETE /mission/:id", () => {
    it("should return 404 if mission does not exist", async () => {
      const res = await request(getAppHelper()).delete("/mission/" + notExisitingMissionId);
      expect(res.statusCode).toEqual(404);
    });
    it("should delete mission", async () => {
      const missionFixture = getNewMissionFixture();
      let mission = await createMissionHelper(missionFixture);
      const missionsBefore = await getMissionsHelper();
      const res = await request(getAppHelper()).delete(`/mission/${mission._id}`).send();
      expect(res.statusCode).toEqual(200);
      const missionsAfter = await getMissionsHelper();
      expect(missionsAfter.length).toEqual(missionsBefore.length - 1);
    });
    it("should return 409 when mission has applications", async () => {
      const mission = await createMissionHelper(getNewMissionFixture());
      await createApplication({ ...getNewApplicationFixture(), missionId: mission._id });
      const res = await request(getAppHelper()).delete(`/mission/${mission._id}`).send();
      expect(res.statusCode).toEqual(409);
      await deleteMissionByIdHelper(mission._id);
    });
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
      const structure = await createStructureHelper(getNewStructureFixture());
      const mission = await createMissionHelper({
        ...getNewMissionFixture(),
        structureId: structure._id,
        structureName: structure.name,
      });
      const newStructure = await createStructureHelper(getNewStructureFixture());
      const res = await request(getAppHelper()).put(`/mission/${mission._id}/structure/${newStructure._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.structureId).toEqual(newStructure._id.toString());
      expect(res.body.data.structureName).toEqual(newStructure.name);
    });
    it("should update referent", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const structure = await createStructureHelper(getNewStructureFixture());
      const mission = await createMissionHelper({
        ...getNewMissionFixture(),
        tutorId: referent._id,
        structureId: structure._id,
        structureName: structure.name,
      });
      const newStructure = await createStructureHelper(getNewStructureFixture());
      const res = await request(getAppHelper()).put(`/mission/${mission._id}/structure/${newStructure._id}`);
      expect(res.statusCode).toEqual(200);
      const updatedReferent = await getReferentByIdHelper(referent._id);
      expect(updatedReferent.structureId).toEqual(newStructure._id.toString());
    });
    it("should update applications", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const structure = await createStructureHelper(getNewStructureFixture());
      const mission = await createMissionHelper({
        ...getNewMissionFixture(),
        structureId: structure._id,
        structureName: structure.name,
      });
      const application = await createApplication({
        ...getNewApplicationFixture(),
        youngId: young._id,
        structureId: structure._id,
        missionId: mission._id,
      });
      const newStructure = await createStructureHelper(getNewStructureFixture());
      const res = await request(getAppHelper()).put(`/mission/${mission._id}/structure/${newStructure._id}`);
      expect(res.statusCode).toEqual(200);
      const updatedApplication = await getApplicationByIdHelper(application._id);
      expect(updatedApplication.structureId).toEqual(newStructure._id.toString());
    });
  });

  describe("GET /mission/:id/patches", () => {
    it("should return 404 if mission not found", async () => {
      const res = await request(getAppHelper()).get(`/mission/${notExisitingMissionId}/patches`).send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 401 if not admin", async () => {
      const mission = await createMissionHelper(getNewMissionFixture());
      mission.name = "MY NEW NAME";
      await mission.save();
      const passport = require("passport");
      passport.user.role = ROLES.RESPONSIBLE;
      const res = await request(getAppHelper()).get(`/mission/${mission._id}/patches`).send();
      expect(res.status).toBe(401);
      passport.user.role = ROLES.ADMIN;
    });
    it("should return 200 if mission found with patches", async () => {
      const mission = await createMissionHelper(getNewMissionFixture());
      mission.name = "MY NEW NAME";
      await mission.save();
      const res = await request(getAppHelper()).get(`/mission/${mission._id}/patches`).send();
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ops: expect.arrayContaining([expect.objectContaining({ op: "replace", path: "/name", value: "MY NEW NAME" })]),
          }),
        ])
      );
    });
  });

  describe("GET /mission/:id/application", () => {
    it("should return empty array when mission has no application", async () => {
      const res = await request(getAppHelper()).get("/mission/" + notExisitingMissionId + "/application");
      expect(res.body.data).toStrictEqual([]);
      expect(res.status).toBe(200);
    });
    it("should return applications", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const mission = await createMissionHelper(getNewMissionFixture());
      await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });
      const res = await request(getAppHelper()).get("/mission/" + mission._id + "/application");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].status).toBe("WAITING_VALIDATION");
    });
    it("should be only accessible by referent", async () => {
      const passport = require("passport");
      await request(getAppHelper()).get(`/mission/${notExisitingMissionId}/application`).send();
      expect(passport.lastTypeCalledOnAuthenticate).toEqual("referent");
    });
  });
});
