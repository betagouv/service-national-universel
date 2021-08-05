require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
const getNewStructureFixture = require("./fixtures/structure");
const { createStructureHelper, getStructureByIdHelper, notExistingStructureId } = require("./helpers/structure");
const { createMissionHelper, getMissionByIdHelper } = require("./helpers/mission");
const getNewMissionFixture = require("./fixtures/mission");
const getNewReferentFixture = require("./fixtures/referent");
const { createReferentHelper, getReferentByIdHelper } = require("./helpers/referent");
const { ROLES } = require("snu-lib/roles");

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Structure", () => {
  describe("POST /structure", () => {
    it("should create structure", async () => {
      const structure = getNewStructureFixture();
      const res = await request(getAppHelper()).post("/structure").send(structure);
      expect(res.status).toBe(200);
    });
    it("should create structure with network ID", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const structure = { ...getNewStructureFixture(), networkId: network._id, name: "child" };
      const res = await request(getAppHelper()).post("/structure").send(structure);
      expect(res.status).toBe(200);
      const updatedStructure = await getStructureByIdHelper(res.body.data._id);
      expect(updatedStructure.networkName).toBe("network");
    });
  });

  describe("PUT /structure/:id", () => {
    it("should update structure", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "struct" });
      structure.name = "changed";
      const res = await request(getAppHelper())
        .put("/structure/" + structure._id)
        .send(structure);
      expect(res.status).toBe(200);
    });

    it("should update networkName", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const structure = await createStructureHelper({ ...getNewStructureFixture(), networkId: network._id, name: "child" });
      structure.name = "changed";
      const res = await request(getAppHelper())
        .put("/structure/" + structure._id)
        .send(structure);
      expect(res.status).toBe(200);
      const updatedStructure = await getStructureByIdHelper(res.body.data._id);
      expect(updatedStructure.networkName).toBe("network");
    });

    it("should update children", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const child = await createStructureHelper({ ...getNewStructureFixture(), networkId: network._id, name: "child", isNetwork: "false" });
      const res = await request(getAppHelper())
        .put("/structure/" + network._id)
        .send({ name: "changed" });
      expect(res.status).toBe(200);
      const updatedChild = await getStructureByIdHelper(child._id);
      expect(updatedChild.networkName).toBe("changed");
      const updatedNetwork = await getStructureByIdHelper(network._id);
      expect(updatedNetwork.networkName).toBe("changed");
      expect(updatedNetwork.name).toBe("changed");
    });

    it("should update mission structure name", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "s" });
      const mission = await createMissionHelper({ ...getNewMissionFixture(), structureId: structure._id });
      const res = await request(getAppHelper())
        .put("/structure/" + structure._id)
        .send({ name: "changed" });
      expect(res.status).toBe(200);
      const updatedMission = await getMissionByIdHelper(mission._id);
      expect(updatedMission.structureName).toBe("changed");
    });

    it("should update responsible structure name", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "s", isNetwork: "false" });
      const responsible = await createReferentHelper({ ...getNewReferentFixture(), structureId: structure._id, role: ROLES.RESPONSIBLE });
      const res = await request(getAppHelper())
        .put("/structure/" + structure._id)
        .send({ isNetwork: "true" });
      expect(res.status).toBe(200);
      const updatedResponsible = await getReferentByIdHelper(responsible._id);
      expect(updatedResponsible.role).toBe(ROLES.SUPERVISOR);
    });
  });

  describe("DELETE /structure/:id", () => {
    it("should delete structure", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "struct" });
      const res = await request(getAppHelper()).delete("/structure/" + structure._id);
      expect(res.status).toBe(200);
      const structure2 = await getStructureByIdHelper(structure._id);
      expect(structure2).toBe(null);
    });
  });

  describe("GET /structure/:id", () => {
    it("should return 404 if no structure", async () => {
      const res = await request(getAppHelper()).get("/structure/" + notExistingStructureId);
      expect(res.status).toBe(404);
    });
    it("should return structure", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "struct" });
      const res = await request(getAppHelper()).get("/structure/" + structure._id);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /structure/:id/patches", () => {
    it("should return 404 if structure not found", async () => {
      const res = await request(getAppHelper()).get(`/structure/${notExistingStructureId}/patches`).send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if structure found with patches", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      structure.name = "MY NEW NAME";
      await structure.save();
      const res = await request(getAppHelper()).get(`/structure/${structure._id}/patches`).send();
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

  describe("GET /structure", () => {
    it("should return all structures", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const res = await request(getAppHelper()).get("/structure");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ _id: structure._id.toString() })]));
    });
  });

  describe("GET /structure/networks", () => {
    it("should return all networks", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      await createStructureHelper({ ...getNewStructureFixture(), networkId: network._id, name: "child" });

      const res = await request(getAppHelper()).get("/structure/networks");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ _id: network._id.toString() })]));
    });
  });

  describe("GET /structure/:id/children", () => {
    it("should return children of network", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const structure = await createStructureHelper({ ...getNewStructureFixture(), networkId: network._id, name: "child" });

      const res = await request(getAppHelper()).get(`/structure/${network._id}/children`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ _id: structure._id.toString() })]));
    });
  });
});
