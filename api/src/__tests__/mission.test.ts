import request from "supertest";
import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import getNewMissionFixture from "./fixtures/mission";
import getNewStructureFixture from "./fixtures/structure";
import { dbConnect, dbClose } from "./helpers/db";
import { getMissionsHelper, getMissionByIdHelper, deleteMissionByIdHelper, createMissionHelper, expectMissionToEqual, notExisitingMissionId } from "./helpers/mission";
import { createReferentHelper, getReferentByIdHelper } from "./helpers/referent";
import { createStructureHelper, notExistingStructureId } from "./helpers/structure";
import getNewReferentFixture from "./fixtures/referent";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLE_JEUNE, ROLES } from "snu-lib";
import { createYoungHelper } from "./helpers/young";
import getNewYoungFixture from "./fixtures/young";
import { createApplication, getApplicationByIdHelper } from "./helpers/application";
import { getNewApplicationFixture } from "./fixtures/application";
import { createCohortHelper } from "./helpers/cohort";
import getNewCohortFixture from "./fixtures/cohort";
import { PermissionModel } from "../models/permissions/permission";
import { addPermissionHelper } from "./helpers/permissions";

beforeAll(async () => {
  await dbConnect();
  await PermissionModel.deleteMany({ roles: { $in: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.RESPONSIBLE, ROLE_JEUNE] } });
  await addPermissionHelper([ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.RESPONSIBLE], PERMISSION_RESOURCES.MISSION, PERMISSION_ACTIONS.FULL);
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.PATCH, PERMISSION_ACTIONS.READ);
  await addPermissionHelper([ROLE_JEUNE], PERMISSION_RESOURCES.MISSION, PERMISSION_ACTIONS.READ);
});
afterAll(dbClose);
afterEach(resetAppAuth);

describe("Mission", () => {
  describe("POST /mission", () => {
    it.skip("should create a new mission", async () => {
      const missionFixture = getNewMissionFixture();
      const missionsBefore = await getMissionsHelper();
      const res = await request(await getAppHelperWithAcl())
        .post("/mission")
        .send(missionFixture);
      expect(res.statusCode).toEqual(200);
      expectMissionToEqual(missionFixture, res.body.data);
      const missionsAfter = await getMissionsHelper();
      expect(missionsAfter.length).toEqual(missionsBefore.length + 1);
      await deleteMissionByIdHelper(res.body.data._id);
    });
  });
  describe("PUT /mission/:id", () => {
    it.skip("should update a mission", async () => {
      const missionFixture = getNewMissionFixture();
      let mission = await createMissionHelper(missionFixture);
      const modifiedMission = { ...missionFixture };
      modifiedMission.startAt = new Date("2022-12-17T00:00:00Z");
      const res = await request(await getAppHelperWithAcl())
        .put(`/mission/${mission._id}`)
        .send(modifiedMission);
      expect(res.statusCode).toEqual(200);
      mission = (await getMissionByIdHelper(mission._id))!;
      expectMissionToEqual(modifiedMission, mission);
      await deleteMissionByIdHelper(mission._id);
    });
    it("should return 404 if mission does not exist", async () => {
      const res = await request(await getAppHelperWithAcl()).put("/mission/" + notExisitingMissionId);
      expect(res.statusCode).toEqual(404);
    });
    it("should return 403 if user can not update mission", async () => {
      const mission = await createMissionHelper({ ...getNewMissionFixture() });
      let res = await request(await getAppHelperWithAcl({ role: ROLES.VISITOR })).put("/mission/" + mission._id);
      expect(res.statusCode).toEqual(403);

      res = await request(await getAppHelperWithAcl({ role: ROLES.HEAD_CENTER })).put("/mission/" + mission._id);
      expect(res.statusCode).toEqual(403);
    });
  });
  describe("GET /mission/:id", () => {
    it("should get a mission", async () => {
      const missionFixture = getNewMissionFixture();
      const mission = await createMissionHelper(missionFixture);
      const res = await request(await getAppHelperWithAcl()).get(`/mission/${mission._id}`);
      expect(res.statusCode).toEqual(200);
      expectMissionToEqual(missionFixture, res.body.data);
      expect(res.body.data.tutor).toBeFalsy();
      await deleteMissionByIdHelper(mission._id);
    });
    it("should return 404 if mission does not exist", async () => {
      const res = await request(await getAppHelperWithAcl()).get("/mission/" + notExisitingMissionId);
      expect(res.statusCode).toEqual(404);
    });
    it("should return mission tutor if it exists", async () => {
      const tutor = await createReferentHelper({ ...getNewReferentFixture(), firstName: "Hello" });
      const mission = await createMissionHelper({ ...getNewMissionFixture(), tutorId: tutor.id });
      const res = await request(await getAppHelperWithAcl()).get(`/mission/${mission._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.tutor.firstName).toEqual(tutor.firstName);
    });
    it("should return application if user is a young", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      const young = await createYoungHelper({ ...getNewYoungFixture(), cohort: cohort.name, cohortId: cohort._id });

      const mission = await createMissionHelper({ ...getNewMissionFixture() });
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });
      const res = await request(await getAppHelperWithAcl(young, "young")).get(`/mission/${mission._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.application?.youngId).toEqual(application?.youngId);
    });
  });

  describe("DELETE /mission/:id", () => {
    it("should return 404 if mission does not exist", async () => {
      const res = await request(await getAppHelperWithAcl()).delete("/mission/" + notExisitingMissionId);
      expect(res.statusCode).toEqual(404);
    });
    it("should delete mission", async () => {
      const missionFixture = getNewMissionFixture();
      let mission = await createMissionHelper(missionFixture);
      const missionsBefore = await getMissionsHelper();
      const res = await request(await getAppHelperWithAcl())
        .delete(`/mission/${mission._id}`)
        .send();
      expect(res.statusCode).toEqual(200);
      const missionsAfter = await getMissionsHelper();
      expect(missionsAfter.length).toEqual(missionsBefore.length - 1);
    });
    it("should return 409 when mission has applications", async () => {
      const mission = await createMissionHelper(getNewMissionFixture());
      await createApplication({ ...getNewApplicationFixture(), missionId: mission._id });
      const res = await request(await getAppHelperWithAcl())
        .delete(`/mission/${mission._id}`)
        .send();
      expect(res.statusCode).toEqual(409);
      await deleteMissionByIdHelper(mission._id);
    });
  });

  describe("PUT mission/:id/structure/:structureId", () => {
    it("should return 404 when mission does not exist", async () => {
      const res = await request(await getAppHelperWithAcl()).put(`/mission/${notExisitingMissionId}/structure/${notExistingStructureId}`);
      expect(res.statusCode).toEqual(404);
    });
    it("should return 404 when structure does not exist", async () => {
      const mission = await createMissionHelper(getNewMissionFixture());
      const res = await request(await getAppHelperWithAcl()).put(`/mission/${mission._id}/structure/${notExistingStructureId}`);
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
      const res = await request(await getAppHelperWithAcl()).put(`/mission/${mission._id}/structure/${newStructure._id}`);
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
      const res = await request(await getAppHelperWithAcl()).put(`/mission/${mission._id}/structure/${newStructure._id}`);
      expect(res.statusCode).toEqual(200);
      const updatedReferent = await getReferentByIdHelper(referent._id);
      expect(updatedReferent?.structureId).toEqual(newStructure._id.toString());
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
      const res = await request(await getAppHelperWithAcl()).put(`/mission/${mission._id}/structure/${newStructure._id}`);
      expect(res.statusCode).toEqual(200);
      const updatedApplication = await getApplicationByIdHelper(application._id);
      expect(updatedApplication?.structureId).toEqual(newStructure._id.toString());
    });
  });

  describe("GET /mission/:id/patches", () => {
    it("should return 404 if mission not found", async () => {
      const res = await request(await getAppHelperWithAcl())
        .get(`/mission/${notExisitingMissionId}/patches`)
        .send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 403 if not admin", async () => {
      const mission = await createMissionHelper(getNewMissionFixture());
      mission.name = "MY NEW NAME";
      await mission.save();
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE }))
        .get(`/mission/${mission._id}/patches`)
        .send();
      expect(res.status).toBe(403);
    });
    it("should return 200 if mission found with patches", async () => {
      const mission = await createMissionHelper(getNewMissionFixture());
      mission.name = "MY NEW NAME";
      await mission.save();
      const res = await request(await getAppHelperWithAcl())
        .get(`/mission/${mission._id}/patches`)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ops: expect.arrayContaining([expect.objectContaining({ op: "replace", path: "/name", value: "MY NEW NAME" })]),
          }),
        ]),
      );
    });
  });

  describe("GET /mission/:id/application", () => {
    it("should return empty array when mission has no application", async () => {
      const res = await request(await getAppHelperWithAcl()).get("/mission/" + notExisitingMissionId + "/application");
      expect(res.body.data).toStrictEqual([]);
      expect(res.status).toBe(200);
    });
    it("should return applications", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const mission = await createMissionHelper(getNewMissionFixture());
      await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });
      const res = await request(await getAppHelperWithAcl()).get("/mission/" + mission._id + "/application");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].status).toBe("WAITING_VALIDATION");
    });
    it("should be only accessible by referent", async () => {
      const passport = require("passport");
      await request(await getAppHelperWithAcl())
        .get(`/mission/${notExisitingMissionId}/application`)
        .send();
      expect(passport.lastTypeCalledOnAuthenticate).toEqual("referent");
    });
  });
});
