require("dotenv").config({ path: "./.env-testing" });
const fetch = require("node-fetch");
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewYoungFixture = require("./fixtures/young");
const { getYoungsHelper, createYoungHelper, notExistingYoungId, deleteYoungByEmailHelper } = require("./helpers/young");
const { dbConnect, dbClose } = require("./helpers/db");
const getNewDepartmentServiceFixture = require("./fixtures/departmentService");
const { createDepartmentServiceHelper, deleteAllDepartmentServicesHelper } = require("./helpers/departmentService");
const { createMeetingPointHelper } = require("./helpers/meetingPoint");
const getNewMeetingPointFixture = require("./fixtures/meetingPoint");
const { createBusHelper } = require("./helpers/bus");
const getNewBusFixture = require("./fixtures/bus");
const { createCohesionCenter, getCohesionCenterById } = require("./helpers/cohesionCenter");
const { getNewCohesionCenterFixture } = require("./fixtures/cohesionCenter");
const getNewStructureFixture = require("./fixtures/structure");
const { createStructureHelper, getStructureByIdHelper } = require("./helpers/structure");
const { createMissionHelper, getMissionByIdHelper } = require("./helpers/mission");
const getNewMissionFixture = require("./fixtures/mission");
const getNewReferentFixture = require("./fixtures/referent");
const { createReferentHelper, getReferentByIdHelper } = require("./helpers/referent");

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

  describe("PUT /structure", () => {
    it("should create structure", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "struct" });
      const passport = require("passport");
      passport.user.structureId = structure._id;
      structure.name = "changed";
      const res = await request(getAppHelper()).put("/structure").send(structure);
      expect(res.status).toBe(200);
      passport.user.structureId = "";
    });

    it("should update networkName", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const structure = await createStructureHelper({ ...getNewStructureFixture(), networkId: network._id, name: "child" });
      const passport = require("passport");
      passport.user.structureId = structure._id;
      structure.name = "changed";
      const res = await request(getAppHelper()).put("/structure").send(structure);
      expect(res.status).toBe(200);
      const updatedStructure = await getStructureByIdHelper(res.body.data._id);
      expect(updatedStructure.networkName).toBe("network");
      passport.user.structureId = "";
    });

    it("should update children", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const structure = await createStructureHelper({ ...getNewStructureFixture(), networkId: network._id, name: "child" });
      const passport = require("passport");
      passport.user.structureId = network._id;
      network.name = "changed";
      const res = await request(getAppHelper()).put("/structure").send(network);
      expect(res.status).toBe(200);
      const updatedStructure = await getStructureByIdHelper(structure._id);
      expect(updatedStructure.networkName).toBe("changed");
      const updatedNetwork = await getStructureByIdHelper(network._id);
      expect(updatedNetwork.networkName).toBe("changed");
      expect(updatedNetwork.name).toBe("changed");
      passport.user.structureId = "";
    });

    it("should update mission structure name", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "s" });
      const mission = await createMissionHelper({ ...getNewMissionFixture(), structureId: structure._id });
      const passport = require("passport");
      passport.user.structureId = structure._id;
      structure.name = "changed";
      const res = await request(getAppHelper()).put("/structure").send(structure);
      expect(res.status).toBe(200);
      const updatedMission = await getMissionByIdHelper(mission._id);
      expect(updatedMission.structureName).toBe("changed");
      passport.user.structureId = "";
    });

    it("should update responsible structure name", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "s", isNetwork: "false" });
      const responsible = await createReferentHelper({ ...getNewReferentFixture(), structureId: structure._id, role: "responsible" });
      const passport = require("passport");
      passport.user.structureId = structure._id;
      structure.isNetwork = "true";
      const res = await request(getAppHelper()).put("/structure").send(structure);
      expect(res.status).toBe(200);
      const updatedResponsible = await getReferentByIdHelper(responsible._id);
      expect(updatedResponsible.role).toBe("supervisor");
      passport.user.structureId = "";
    });
  });

  describe("PUT /structure/:id", () => {
    it("should create structure", async () => {
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
      const structure = await createStructureHelper({ ...getNewStructureFixture(), networkId: network._id, name: "child" });
      network.name = "changed";
      const res = await request(getAppHelper())
        .put("/structure/" + network._id)
        .send(network);
      expect(res.status).toBe(200);
      const updatedStructure = await getStructureByIdHelper(structure._id);
      expect(updatedStructure.networkName).toBe("changed");
      const updatedNetwork = await getStructureByIdHelper(network._id);
      expect(updatedNetwork.networkName).toBe("changed");
      expect(updatedNetwork.name).toBe("changed");
    });

    it("should update mission structure name", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "s" });
      const mission = await createMissionHelper({ ...getNewMissionFixture(), structureId: structure._id });
      structure.name = "changed";
      const res = await request(getAppHelper())
        .put("/structure/" + structure._id)
        .send(structure);
      expect(res.status).toBe(200);
      const updatedMission = await getMissionByIdHelper(mission._id);
      expect(updatedMission.structureName).toBe("changed");
    });

    it("should update responsible structure name", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "s", isNetwork: "false" });
      const responsible = await createReferentHelper({ ...getNewReferentFixture(), structureId: structure._id, role: "responsible" });
      structure.isNetwork = "true";
      const res = await request(getAppHelper())
        .put("/structure/" + structure._id)
        .send(structure);
      expect(res.status).toBe(200);
      const updatedResponsible = await getReferentByIdHelper(responsible._id);
      expect(updatedResponsible.role).toBe("supervisor");
    });
  });
});
