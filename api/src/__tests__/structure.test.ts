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
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  // Base de test persistante en local : repartir d'un jeu de permissions vierge (un ancien seed sans policy
  // donnerait un accès sans restriction aux référents et ferait échouer les tests de périmètre).
  await PermissionModel.deleteMany({});

  // Structure : même jeu que la migration 20250624122150 (policies incluses)
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.STRUCTURE, PERMISSION_ACTIONS.FULL);
  for (const action of [PERMISSION_ACTIONS.READ, PERMISSION_ACTIONS.WRITE]) {
    await addPermissionHelper([ROLES.REFERENT_REGION], PERMISSION_RESOURCES.STRUCTURE, action, [
      { where: [{ field: "region", source: "region" }], blacklist: [], whitelist: [] },
    ]);
    await addPermissionHelper([ROLES.REFERENT_DEPARTMENT], PERMISSION_RESOURCES.STRUCTURE, action, [
      { where: [{ field: "department", source: "department" }], blacklist: [], whitelist: [] },
    ]);
    await addPermissionHelper([ROLES.SUPERVISOR], PERMISSION_RESOURCES.STRUCTURE, action, [
      { where: [{ field: "networkId", source: "structureId" }], blacklist: [], whitelist: [] },
    ]);
    await addPermissionHelper([ROLES.RESPONSIBLE, ROLES.SUPERVISOR], PERMISSION_RESOURCES.STRUCTURE, action, [
      { where: [{ field: "_id", source: "structureId" }], blacklist: [], whitelist: [] },
    ]);
  }

  await addPermissionHelper([ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.RESPONSIBLE], PERMISSION_RESOURCES.MISSION, PERMISSION_ACTIONS.FULL);
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.PATCH, PERMISSION_ACTIONS.READ);
  await addPermissionHelper([ROLES.SUPERVISOR], PERMISSION_RESOURCES.USER_HISTORY, PERMISSION_ACTIONS.READ);
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

    it("assainit la description à l'écriture (GOO-14, FH1)", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "struct" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
        .put("/structure/" + structure._id)
        .send({ ...structure.toJSON(), description: `<b>Asso</b><img src=x onerror="alert(1)"><a href="javascript:alert(1)">lien</a> & sport` });
      expect(res.status).toBe(200);
      const updated = await getStructureByIdHelper(structure._id);
      expect(updated?.description).toBe("<b>Asso</b><a rel=\"noopener noreferrer\">lien</a> &amp; sport");
    });

    it("laisse intacte une description sans balise", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "struct" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
        .put("/structure/" + structure._id)
        .send({ ...structure.toJSON(), description: "Sport & culture, âge > 16 ans" });
      expect(res.status).toBe(200);
      const updated = await getStructureByIdHelper(structure._id);
      expect(updated?.description).toBe("Sport & culture, âge > 16 ans");
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

    it("should not change referent roles when isNetwork changes", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "s", isNetwork: "false" });
      const responsible = await createReferentHelper({ ...getNewReferentFixture(), structureId: structure._id, role: ROLES.RESPONSIBLE });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
        .put("/structure/" + structure._id)
        .send({ isNetwork: "true" });
      expect(res.status).toBe(200);
      const updatedResponsible = await getReferentByIdHelper(responsible._id);
      expect(updatedResponsible?.role).toBe(ROLES.RESPONSIBLE);
    });

    it("should not update isNetwork when responsible", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "s", isNetwork: "false" });
      const responsible = await createReferentHelper({ ...getNewReferentFixture(), structureId: structure._id, role: ROLES.RESPONSIBLE });
      const res = await request(await getAppHelperWithAcl(responsible.toJSON()))
        .put("/structure/" + structure._id)
        .send({ isNetwork: "true" });
      expect(res.status).toBe(403);
    });

    it("SUPERVISOR should not flag a child structure as network head", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const child = await createStructureHelper({ ...getNewStructureFixture(), name: "child", isNetwork: "false", networkId: network._id });
      const responsible = await createReferentHelper({ ...getNewReferentFixture(), structureId: child._id, role: ROLES.RESPONSIBLE });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.SUPERVISOR, structureId: network._id.toString() }))
        .put("/structure/" + child._id)
        .send({ isNetwork: "true" });
      expect(res.status).toBe(403);
      const updatedChild = await getStructureByIdHelper(child._id);
      expect(updatedChild?.isNetwork).toBe("false");
      const updatedResponsible = await getReferentByIdHelper(responsible._id);
      expect(updatedResponsible?.role).toBe(ROLES.RESPONSIBLE);
    });

    it("REFERENT_DEPARTMENT should not flag a structure as network head", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "s", isNetwork: "false", department: "Loire-Atlantique" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.REFERENT_DEPARTMENT, department: ["Loire-Atlantique"] }))
        .put("/structure/" + structure._id)
        .send({ isNetwork: "true" });
      expect(res.status).toBe(403);
      const updatedStructure = await getStructureByIdHelper(structure._id);
      expect(updatedStructure?.isNetwork).toBe("false");
    });

    it("SUPERVISOR should still update a child structure sending an unchanged isNetwork", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const child = await createStructureHelper({ ...getNewStructureFixture(), name: "child", isNetwork: "false", networkId: network._id });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.SUPERVISOR, structureId: network._id.toString() }))
        .put("/structure/" + child._id)
        .send({ name: "changed", isNetwork: "false" });
      expect(res.status).toBe(200);
      const updatedChild = await getStructureByIdHelper(child._id);
      expect(updatedChild?.name).toBe("changed");
    });

    it("RESPONSIBLE should still update a structure whose isNetwork is unset in database", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "s", isNetwork: undefined });
      const responsible = await createReferentHelper({ ...getNewReferentFixture(), structureId: structure._id, role: ROLES.RESPONSIBLE });
      const res = await request(await getAppHelperWithAcl(responsible.toJSON()))
        .put("/structure/" + structure._id)
        .send({ name: "changed", isNetwork: "false" });
      expect(res.status).toBe(200);
      const updatedStructure = await getStructureByIdHelper(structure._id);
      expect(updatedStructure?.name).toBe("changed");
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
    it("RESPONSIBLE should get 403 on another structure", async () => {
      const own = await createStructureHelper({ ...getNewStructureFixture(), name: "own" });
      const other = await createStructureHelper({ ...getNewStructureFixture(), name: "other" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: own._id.toString() })).get("/structure/" + other._id);
      expect(res.status).toBe(403);
    });
    it("RESPONSIBLE should read their own structure", async () => {
      const own = await createStructureHelper({ ...getNewStructureFixture(), name: "own" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: own._id.toString() })).get("/structure/" + own._id);
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
    it("should return 403 (not 404) to a RESPONSIBLE for an unknown structure", async () => {
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: "000000000000000000000001" }))
        .get(`/structure/${notExistingStructureId}/patches`)
        .send();
      expect(res.status).toBe(403);
    });
    it("SUPERVISOR should get 403 on the history of a structure outside their network", async () => {
      const mine = await createStructureHelper({ ...getNewStructureFixture(), name: "mine", isNetwork: "true" });
      const other = await createStructureHelper({ ...getNewStructureFixture(), name: "other" });
      other.name = "OTHER RENAMED";
      await other.save();
      const res = await request(await getAppHelperWithAcl({ role: ROLES.SUPERVISOR, structureId: mine._id.toString() })).get(`/structure/${other._id}/patches`);
      expect(res.status).toBe(403);
    });
    it("SUPERVISOR should read the history of their own network structure", async () => {
      const mine = await createStructureHelper({ ...getNewStructureFixture(), name: "mine", isNetwork: "true" });
      mine.name = "MINE RENAMED";
      await mine.save();
      const res = await request(await getAppHelperWithAcl({ role: ROLES.SUPERVISOR, structureId: mine._id.toString() })).get(`/structure/${mine._id}/patches`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ ops: expect.arrayContaining([expect.objectContaining({ op: "replace", path: "/name", value: "MINE RENAMED" })]) })]));
    });
  });

  describe("GET /structure", () => {
    it("ADMIN should return all structures", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN })).get("/structure");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ _id: structure._id.toString() })]));
    });

    it("RESPONSIBLE should only see their own structure", async () => {
      const own = await createStructureHelper({ ...getNewStructureFixture(), name: "own" });
      const other = await createStructureHelper({ ...getNewStructureFixture(), name: "other" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: own._id.toString() })).get("/structure");
      expect(res.status).toBe(200);
      const ids = res.body.data.map((s) => s._id);
      expect(ids).toContain(own._id.toString());
      expect(ids).not.toContain(other._id.toString());
    });

    it("SUPERVISOR should see their network and its children only", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const child = await createStructureHelper({ ...getNewStructureFixture(), name: "child", networkId: network._id.toString() });
      const other = await createStructureHelper({ ...getNewStructureFixture(), name: "other" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.SUPERVISOR, structureId: network._id.toString() })).get("/structure");
      expect(res.status).toBe(200);
      const ids = res.body.data.map((s) => s._id);
      expect(ids).toEqual(expect.arrayContaining([network._id.toString(), child._id.toString()]));
      expect(ids).not.toContain(other._id.toString());
    });

    it("REFERENT_DEPARTMENT should only see structures of their departments", async () => {
      const inDep = await createStructureHelper({ ...getNewStructureFixture(), department: "Loire-Atlantique" });
      const outDep = await createStructureHelper({ ...getNewStructureFixture(), department: "Vendée" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.REFERENT_DEPARTMENT, department: ["Loire-Atlantique"] })).get("/structure");
      expect(res.status).toBe(200);
      const ids = res.body.data.map((s) => s._id);
      expect(ids).toContain(inDep._id.toString());
      expect(ids).not.toContain(outDep._id.toString());
    });

    it("REFERENT_REGION should only see structures of their region", async () => {
      const inRegion = await createStructureHelper({ ...getNewStructureFixture(), region: "Bretagne" });
      const outRegion = await createStructureHelper({ ...getNewStructureFixture(), region: "Occitanie" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.REFERENT_REGION, region: "Bretagne" })).get("/structure");
      expect(res.status).toBe(200);
      const ids = res.body.data.map((s) => s._id);
      expect(ids).toContain(inRegion._id.toString());
      expect(ids).not.toContain(outRegion._id.toString());
    });

    it("RESPONSIBLE without structureId should get 403 (fail-closed)", async () => {
      await createStructureHelper(getNewStructureFixture());
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE })).get("/structure");
      expect(res.status).toBe(403);
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
    it("should not expose structureManager nor address on networks", async () => {
      const created = await createStructureHelper({
        ...getNewStructureFixture(),
        name: "network",
        isNetwork: "true",
        structureManager: { firstName: "Jean", lastName: "Dupont", mobile: "0600000000", email: "jean@example.org", role: "Président" },
      });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: "000000000000000000000001" })).get("/structure/networks");
      expect(res.status).toBe(200);
      // repérer la structure créée par ce test (d'autres tests créent des structures nommées "network")
      const network = res.body.data.find((s) => s._id === created._id.toString());
      expect(network).toBeDefined();
      expect(network.structureManager).toBeUndefined();
      expect(network.address).toBeUndefined();
      expect(network.siret).toBeUndefined();
    });
  });

  describe("GET /structure/:id/children", () => {
    it("REFERENT_DEPARTMENT should only see children of their department", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true", department: "Loire-Atlantique" });
      const inDep = await createStructureHelper({ ...getNewStructureFixture(), name: "child-in", networkId: network._id.toString(), department: "Loire-Atlantique" });
      const outDep = await createStructureHelper({ ...getNewStructureFixture(), name: "child-out", networkId: network._id.toString(), department: "Vendée" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.REFERENT_DEPARTMENT, department: ["Loire-Atlantique"] })).get(`/structure/${network._id}/children`);
      expect(res.status).toBe(200);
      const ids = res.body.data.map((s) => s._id);
      expect(ids).toContain(inDep._id.toString());
      expect(ids).not.toContain(outDep._id.toString());
    });
    it("should return children of network", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const structure = await createStructureHelper({ ...getNewStructureFixture(), networkId: network._id, name: "child" });

      const res = await request(await getAppHelperWithAcl()).get(`/structure/${network._id}/children`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ _id: structure._id.toString() })]));
    });
    it("SUPERVISOR should list children of their own network", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const child = await createStructureHelper({ ...getNewStructureFixture(), networkId: network._id.toString(), name: "child" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.SUPERVISOR, structureId: network._id.toString() })).get(`/structure/${network._id}/children`);
      expect(res.status).toBe(200);
      expect(res.body.data.map((s) => s._id)).toContain(child._id.toString());
    });
    it("RESPONSIBLE should get 403 on children of another network", async () => {
      const own = await createStructureHelper({ ...getNewStructureFixture(), name: "own" });
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      await createStructureHelper({ ...getNewStructureFixture(), networkId: network._id.toString(), name: "child" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: own._id.toString() })).get(`/structure/${network._id}/children`);
      expect(res.status).toBe(403);
    });
    it("SUPERVISOR should get 403 on children of another network", async () => {
      const mine = await createStructureHelper({ ...getNewStructureFixture(), name: "mine", isNetwork: "true" });
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      await createStructureHelper({ ...getNewStructureFixture(), networkId: network._id.toString(), name: "child" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.SUPERVISOR, structureId: mine._id.toString() })).get(`/structure/${network._id}/children`);
      expect(res.status).toBe(403);
    });
    it("should not expose structureManager, address nor siret on children", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const child = await createStructureHelper({
        ...getNewStructureFixture(),
        networkId: network._id.toString(),
        name: "child",
        structureManager: { firstName: "Jean", lastName: "Dupont", mobile: "0600000000", email: "jean@example.org", role: "Président" },
      });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.SUPERVISOR, structureId: network._id.toString() })).get(`/structure/${network._id}/children`);
      expect(res.status).toBe(200);
      const returnedChild = res.body.data.find((s) => s._id === child._id.toString());
      expect(returnedChild).toBeDefined();
      expect(returnedChild.structureManager).toBeUndefined();
      expect(returnedChild.address).toBeUndefined();
      expect(returnedChild.siret).toBeUndefined();
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
    it("RESPONSIBLE should get 403 for missions of another structure", async () => {
      const own = await createStructureHelper({ ...getNewStructureFixture(), name: "own" });
      const other = await createStructureHelper({ ...getNewStructureFixture(), name: "other" });
      const mission = await createMissionHelper({ ...getNewMissionFixture(), structureId: other._id });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: own._id.toString() })).get(`/structure/${other._id}/mission`);
      expect(res.status).toBe(403);
      await deleteMissionByIdHelper(mission._id);
    });
    it("RESPONSIBLE should list missions of their own structure", async () => {
      const own = await createStructureHelper({ ...getNewStructureFixture(), name: "own" });
      const mission = await createMissionHelper({ ...getNewMissionFixture(), structureId: own._id });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: own._id.toString() })).get(`/structure/${own._id}/mission`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toEqual(1);
      await deleteMissionByIdHelper(mission._id);
    });
    it("should return 404 when structure does not exist", async () => {
      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN })).get(`/structure/${notExistingStructureId}/mission`);
      expect(res.status).toBe(404);
    });
  });
});
