const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewYoungFixture = require("./fixtures/young");
const { createYoungHelper, notExistingYoungId } = require("./helpers/young");
const { dbConnect, dbClose } = require("./helpers/db");
const getNewDepartmentServiceFixture = require("./fixtures/departmentService");
const { createDepartmentServiceHelper } = require("./helpers/departmentService");
const { createCohesionCenter } = require("./helpers/cohesionCenter");
const { getNewCohesionCenterFixture } = require("./fixtures/cohesionCenter");
const { createCohortHelper } = require("./helpers/cohort");
const getNewCohortFixture = require("./fixtures/cohort");

const getNewPointDeRassemblementFixture = require("./fixtures/PlanDeTransport/pointDeRassemblement");
const { createPointDeRassemblementWithBus } = require("./helpers/PlanDeTransport/pointDeRassemblement");

const { createSessionPhase1 } = require("./helpers/sessionPhase1");
const { getNewSessionPhase1Fixture } = require("./fixtures/sessionPhase1");

// We mock node-fetch for PDF generation.
jest.mock("node-fetch", () =>
  jest.fn(() =>
    Promise.resolve({
      headers: {
        get: () => "",
      },
      body: {
        pipe: (res) => res.status(200).send({}),
        on: () => "",
      },
    }),
  ),
);

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
  sendTemplate: () => Promise.resolve(),
}));

beforeAll(dbConnect);
afterAll(dbClose);

describe("Young", () => {
  describe("POST young/:id/documents/certificate/:template", () => {
    it("should return 404 when young is not found", async () => {
      const res = await request(getAppHelper()).post("/young/" + notExistingYoungId + "/documents/certificate/1");
      expect(res.status).toEqual(404);
    });
    it("should return the certificate", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const sessionPhase1 = await createSessionPhase1({ ...getNewSessionPhase1Fixture(), cohesionCenterId: cohesionCenter._id });
      const young = await createYoungHelper({ ...getNewYoungFixture(), sessionPhase1Id: sessionPhase1._id });
      await createCohortHelper({ ...getNewCohortFixture(), name: young.cohort });
      const certificates = ["1", "2", "3", "snu"];
      for (const certificate of certificates) {
        const res = await request(getAppHelper()).post("/young/" + young._id + "/documents/certificate/" + certificate);
        expect(res.status).toBe(200);
      }
    });
  });
  // Todo
  describe("POST young/:id/documents/:key", () => {
    it.skip("should return 200 and new record should be sinserted into the db", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper()).post(`/young/${young._id}/documents/cniFiles`);
      expect(res.status).toEqual(200);
      const res2 = await request(getAppHelper()).get(`/young/${young._id}/documents/cniFiles`);
      expect(res2.body).toBe();
    });
  });
  describe("POST young/:id/documents/convocation/:template", () => {
    it("should return 404 when young is not found", async () => {
      const res = await request(getAppHelper()).post("/young/" + notExistingYoungId + "/documents/convocation/1");
      expect(res.status).toEqual(404);
    });
    it("should crash when no center", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper())
        .post("/young/" + young._id + "/documents/convocation/cohesion")
        .send();
      expect(res.status).toBe(500);
    });
    it("should crash when no session", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper())
        .post("/young/" + young._id + "/documents/convocation/cohesion")
        .send();
      expect(res.status).toBe(500);
    });
    it("should return the convocation", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const sessionPhase1 = await createSessionPhase1({ ...getNewSessionPhase1Fixture(), cohesionCenterId: cohesionCenter._id });
      const { pdr, bus } = await createPointDeRassemblementWithBus(getNewPointDeRassemblementFixture(), cohesionCenter._id, sessionPhase1._id);
      const departmentService = await createDepartmentServiceHelper({
        ...getNewDepartmentServiceFixture(),
        department: "lol",
      });
      const young = await createYoungHelper({
        ...getNewYoungFixture(),
        statusPhase1: "AFFECTED",
        sessionPhase1Id: sessionPhase1._id,
        meetingPointId: pdr._id,
        ligneId: bus._id,
        department: departmentService.department,
        cohort: bus.cohort,
      });

      const res = await request(getAppHelper())
        .post("/young/" + young._id + "/documents/convocation/cohesion")
        .send({ young });
      expect(res.status).toBe(200);
    });
    it.skip("should return the convocation for dom tom", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const departmentService = await createDepartmentServiceHelper({
        ...getNewDepartmentServiceFixture(),
        department: "Guadeloupe",
      });
      const young = await createYoungHelper({
        ...getNewYoungFixture(),
        cohesionCenterId: cohesionCenter._id,
        department: departmentService.department,
      });

      const res = await request(getAppHelper())
        .post("/young/" + young._id + "/documents/convocation/cohesion")
        .send({ young });
      expect(res.status).toBe(200);
    });
  });
  describe("POST /young/:id/documents/certificate/:template/send-email", () => {
    it("should return 404 when young is not found", async () => {
      const res = await request(getAppHelper()).post("/young/" + notExistingYoungId + "/documents/certificate/1/send-email");
      expect(res.status).toEqual(404);
    });

    // todo : `const content = buffer.toString("base64");` doesnt work in test environment
    it.skip("should return the certificate", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const certificates = ["1", "2", "3", "snu"];
      for (const certificate of certificates) {
        const res = await request(getAppHelper())
          .post("/young/" + young._id + "/documents/certificate/" + certificate + "/send-email")
          .send({ fileName: "test" });
        expect(res.status).toBe(200);
      }
    });
  });
});
