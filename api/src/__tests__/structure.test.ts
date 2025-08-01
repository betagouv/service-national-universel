import request from "supertest";
import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import getNewStructureFixture from "./fixtures/structure";
import { createStructureHelper, getStructureByIdHelper, notExistingStructureId, expectStructureToEqual, deleteStructureByIdHelper } from "./helpers/structure";
import { createMissionHelper, getMissionByIdHelper, deleteMissionByIdHelper } from "./helpers/mission";
import getNewMissionFixture from "./fixtures/mission";
import { getNewReferentFixture } from "./fixtures/referent";
import { createReferentHelper, getReferentByIdHelper } from "./helpers/referent";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLES } from "snu-lib";
import { addPermissionHelper } from "./helpers/permissions";
import { PermissionModel } from "../models/permissions/permission";
import { getAcl } from "../services/iam/Permission.service";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
}));

beforeAll(async () => {
  await dbConnect();
  await PermissionModel.deleteMany({ roles: { $in: [ROLES.SUPERVISOR, ROLES.RESPONSIBLE] } });
  await addPermissionHelper([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION], PERMISSION_RESOURCES.STRUCTURE, PERMISSION_ACTIONS.FULL);
  await addPermissionHelper([ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.RESPONSIBLE], PERMISSION_RESOURCES.MISSION, PERMISSION_ACTIONS.FULL);
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.PATCH, PERMISSION_ACTIONS.READ);
});
afterAll(dbClose);
afterEach(resetAppAuth);

describe("Structure", () => {
  describe("POST /structure", () => {
    it("should create structure", async () => {
      const structure = getNewStructureFixture();
      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
        .post("/structure")
        .send(structure);
      expect(res.status).toBe(200);
    });
    it("should create structure with network ID", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const structure = { ...getNewStructureFixture(), networkId: network._id, name: "child" };
      const res = await request(await getAppHelperWithAcl())
        .post("/structure")
        .send(structure);
      expect(res.status).toBe(200);
      const updatedStructure = await getStructureByIdHelper(res.body.data._id);
      expect(updatedStructure?.networkName).toBe("network");
    });
    it("RESPONSIBLE cannot create structure", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE }))
        .post("/structure")
        .send(structure);
      expect(res.status).toBe(403);
    });
    it("SUPERVISOR cannot create structure", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.SUPERVISOR }))
        .post("/structure")
        .send(structure);
      expect(res.status).toBe(403);
    });
  });

  describe("PUT /structure/:id", () => {
    it("should update structure", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "struct" });
      structure.name = "changed";
      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
        .put("/structure/" + structure._id)
        .send(structure);
      expect(res.status).toBe(200);
    });

    it("should update networkName", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const structure = await createStructureHelper({ ...getNewStructureFixture(), networkId: network._id, name: "child" });
      structure.name = "changed";
      const res = await request(await getAppHelperWithAcl())
        .put("/structure/" + structure._id)
        .send(structure);
      expect(res.status).toBe(200);
      const updatedStructure = await getStructureByIdHelper(res.body.data._id);
      expect(updatedStructure?.networkName).toBe("network");
    });

    it("should update children", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const child = await createStructureHelper({ ...getNewStructureFixture(), networkId: network._id, name: "child", isNetwork: "false" });
      const res = await request(await getAppHelperWithAcl())
        .put("/structure/" + network._id)
        .send({ name: "changed" });
      expect(res.status).toBe(200);
      const updatedChild = await getStructureByIdHelper(child._id);
      expect(updatedChild?.networkName).toBe("changed");
      const updatedNetwork = await getStructureByIdHelper(network._id);
      expect(updatedNetwork?.networkName).toBe("changed");
      expect(updatedNetwork?.name).toBe("changed");
    });

    it("should update mission structure name", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "s" });
      const mission = await createMissionHelper({ ...getNewMissionFixture(), structureId: structure._id });
      const res = await request(await getAppHelperWithAcl())
        .put("/structure/" + structure._id)
        .send({ name: "changed" });
      expect(res.status).toBe(200);
      const updatedMission = await getMissionByIdHelper(mission._id);
      expect(updatedMission?.structureName).toBe("changed");
    });

    it("should update responsible structure name", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "s", isNetwork: "false" });
      const responsible = await createReferentHelper({ ...getNewReferentFixture(), structureId: structure._id, role: ROLES.RESPONSIBLE });
      const res = await request(await getAppHelperWithAcl())
        .put("/structure/" + structure._id)
        .send({ isNetwork: "true" });
      expect(res.status).toBe(200);
      const updatedResponsible = await getReferentByIdHelper(responsible._id);
      expect(updatedResponsible?.role).toBe(ROLES.SUPERVISOR);
    });

    it("should not update isNetwork when responsible", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "s", isNetwork: "false" });
      const responsible = await createReferentHelper({ ...getNewReferentFixture(), structureId: structure._id, role: ROLES.RESPONSIBLE });
      const res = await request(await getAppHelperWithAcl(responsible.toJSON()))
        .put("/structure/" + structure._id)
        .send({ isNetwork: "true" });
      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /structure/:id", () => {
    it("should delete structure", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "struct" });
      const res = await request(await getAppHelperWithAcl()).delete("/structure/" + structure._id);
      expect(res.status).toBe(200);
      const structure2 = await getStructureByIdHelper(structure._id);
      expect(structure2).toBe(null);
    });
  });

  describe("GET /structure/:id", () => {
    it("should return 404 if no structure", async () => {
      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN, acl: await getAcl({ role: ROLES.ADMIN }) })).get("/structure/" + notExistingStructureId);
      expect(res.status).toBe(404);
    });
    it("should return structure", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "struct" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN })).get("/structure/" + structure._id);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /structure/:id/patches", () => {
    it("should return 404 if structure not found", async () => {
      const res = await request(await getAppHelperWithAcl())
        .get(`/structure/${notExistingStructureId}/patches`)
        .send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 403 if not admin", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      structure.name = "MY NEW NAME";
      await structure.save();
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE }))
        .get(`/structure/${structure._id}/patches`)
        .send();
      expect(res.status).toBe(403);
    });
    it("should return 200 if structure found with patches", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      structure.name = "MY NEW NAME";
      await structure.save();
      const res = await request(await getAppHelperWithAcl())
        .get(`/structure/${structure._id}/patches`)
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

  describe("GET /structure", () => {
    it("should return all structures", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN })).get("/structure");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ _id: structure._id.toString() })]));
    });
  });

  describe("GET /structure/networks", () => {
    it("should return all networks", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      await createStructureHelper({ ...getNewStructureFixture(), networkId: network._id, name: "child" });

      const res = await request(await getAppHelperWithAcl()).get("/structure/networks");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ _id: network._id.toString() })]));
    });
  });

  describe("GET /structure/:id/children", () => {
    it("should return children of network", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const structure = await createStructureHelper({ ...getNewStructureFixture(), networkId: network._id, name: "child" });

      const res = await request(await getAppHelperWithAcl()).get(`/structure/${network._id}/children`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ _id: structure._id.toString() })]));
    });
  });

  describe("GET /structure/:id/mission", () => {
    it("should return the missions of the structure", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const missionFixture = getNewMissionFixture();
      const mission = await createMissionHelper({ ...missionFixture, structureId: structure._id });
      const res = await request(await getAppHelperWithAcl()).get(`/structure/${structure._id}/mission`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toEqual(1);
      expectStructureToEqual(res.body.data[0], missionFixture);
      await deleteMissionByIdHelper(mission._id);
      await deleteStructureByIdHelper(structure._id);
    });
  });
});
