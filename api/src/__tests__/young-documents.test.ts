import request from "supertest";
import getAppHelper from "./helpers/app";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper, notExistingYoungId } from "./helpers/young";
import { dbConnect, dbClose } from "./helpers/db";
import getNewDepartmentServiceFixture from "./fixtures/departmentService";
import { createDepartmentServiceHelper } from "./helpers/departmentService";
import { createCohesionCenter } from "./helpers/cohesionCenter";
import { getNewCohesionCenterFixture } from "./fixtures/cohesionCenter";
import { createCohortHelper } from "./helpers/cohort";
import getNewCohortFixture from "./fixtures/cohort";
import getNewPointDeRassemblementFixture from "./fixtures/PlanDeTransport/pointDeRassemblement";
import { createPointDeRassemblementWithBus } from "./helpers/PlanDeTransport/pointDeRassemblement";
import { createSessionPhase1 } from "./helpers/sessionPhase1";
import { getNewSessionPhase1Fixture } from "./fixtures/sessionPhase1";

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

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
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
      // expect(res2.body).toBe();
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
