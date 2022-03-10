require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewYoungFixture = require("./fixtures/young");
const { createYoungHelper, notExistingYoungId } = require("./helpers/young");
const { dbConnect, dbClose } = require("./helpers/db");
const getNewDepartmentServiceFixture = require("./fixtures/departmentService");
const { createDepartmentServiceHelper } = require("./helpers/departmentService");
const { createMeetingPointHelper } = require("./helpers/meetingPoint");
const getNewMeetingPointFixture = require("./fixtures/meetingPoint");
const { createBusHelper } = require("./helpers/bus");
const getNewBusFixture = require("./fixtures/bus");
const { createCohesionCenter } = require("./helpers/cohesionCenter");
const { getNewCohesionCenterFixture } = require("./fixtures/cohesionCenter");
const { createSessionPhase1 } = require("./helpers/sessionPhase1");
const { getNewSessionPhase1Fixture } = require("./fixtures/sessionPhase1");

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
  sendTemplate: () => Promise.resolve(),
}));

jest.mock("../htmlToPdf", () => jest.fn());

jest.setTimeout(10_000);

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
      const certificates = ["1", "2", "3", "snu"];
      for (const certificate of certificates) {
        const res = await request(getAppHelper()).post("/young/" + young._id + "/documents/certificate/" + certificate);
        expect(res.status).toBe(200);
      }
    });
  });
  describe("POST young/:id/documents/form/:template", () => {
    it("should return 404 when young is not found", async () => {
      const res = await request(getAppHelper()).post("/young/" + notExistingYoungId + "/documents/form/1");
      expect(res.status).toEqual(404);
    });
    it("should return the form", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const forms = ["imageRight", "autotestPCR"];
      for (const form of forms) {
        const res = await request(getAppHelper())
          .post("/young/" + young._id + "/documents/form/" + form)
          .send({ young });
        expect(res.status).toBe(200);
      }
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
      const bus = await createBusHelper(getNewBusFixture());
      const meetingPoint = await createMeetingPointHelper({ ...getNewMeetingPointFixture(), busId: bus._id });
      const departmentService = await createDepartmentServiceHelper({
        ...getNewDepartmentServiceFixture(),
        department: "lol",
      });
      const young = await createYoungHelper({
        ...getNewYoungFixture(),
        statusPhase1: "AFFECTED",
        sessionPhase1Id: sessionPhase1._id,
        meetingPointId: meetingPoint._id,
        department: departmentService.department,
      });

      const res = await request(getAppHelper())
        .post("/young/" + young._id + "/documents/convocation/cohesion")
        .send({ young });
      expect(res.status).toBe(200);
    });
    // it("should return the convocation for dom tom", async () => {
    //   const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
    //   const departmentService = await createDepartmentServiceHelper({
    //     ...getNewDepartmentServiceFixture(),
    //     department: "Guadeloupe",
    //   });
    //   const young = await createYoungHelper({
    //     ...getNewYoungFixture(),
    //     cohesionCenterId: cohesionCenter._id,
    //     department: departmentService.department,
    //   });

    //   const res = await request(getAppHelper())
    //     .post("/young/" + young._id + "/documents/convocation/cohesion")
    //     .send({ young });
    //   expect(res.status).toBe(200);
    // });
  });
  describe("POST /young/:id/documents/certificate/:template/send-email", () => {
    it("should return 404 when young is not found", async () => {
      const res = await request(getAppHelper()).post("/young/" + notExistingYoungId + "/documents/certificate/1/send-email");
      expect(res.status).toEqual(404);
    });

    // todo : `const content = buffer.toString("base64");` doesnt work in test environment
    // it("should return the certificate", async () => {
    //   const young = await createYoungHelper(getNewYoungFixture());
    //   const certificates = ["1", "2", "3", "snu"];
    //   for (const certificate of certificates) {
    //     const res = await request(getAppHelper())
    //       .post("/young/" + young._id + "/documents/certificate/" + certificate + "/send-email")
    //       .send({ fileName: "test" });
    //     // expect(res.body.e).toBe();
    //     expect(res.status).toBe(200);
    //   }
    // });
  });
});
