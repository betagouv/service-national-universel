import { fakerFR as faker } from "@faker-js/faker";
import request from "supertest";
import getNewPointDeRassemblementFixture from "../fixtures/PlanDeTransport/pointDeRassemblement";
import { getNewCohesionCenterFixture } from "../fixtures/cohesionCenter";
import { getNewSessionPhase1Fixture } from "../fixtures/sessionPhase1";
import { createPointDeRassemblementHelper, createPointDeRassemblementWithBus } from "../helpers/PlanDeTransport/pointDeRassemblement";
import { createCohesionCenter } from "../helpers/cohesionCenter";
import { createSessionPhase1 } from "../helpers/sessionPhase1";
import getNewYoungFixture from "../fixtures/young";
import getAppHelper, { resetAppAuth } from "../helpers/app";
import { dbConnect, dbClose } from "../helpers/db";
import { createYoungHelper } from "../helpers/young";
import { SchemaDeRepartitionModel, PointDeRassemblementModel, LigneToPointModel } from "../../models";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
}));

beforeAll(() => dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(dbClose);
afterEach(resetAppAuth);

describe("Point de rassemblement", () => {
  beforeEach(async () => {
    await PointDeRassemblementModel.deleteMany({});
  });
  describe("GET /point-de-rassemblement/available", () => {
    it("should return 400 when young has no sessionPhase1Id", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture() });

      const res = await request(getAppHelper(young)).get("/point-de-rassemblement/available").send();
      expect(res.status).toBe(400);
    });
  });
  describe("GET /point-de-rassemblement/fullInfo/:pdrId/:busId", () => {
    it("should return 403 when young try to fetch another pdr than his", async () => {
      const pointDeRassemblemenYoung = await createPointDeRassemblementHelper({ ...getNewPointDeRassemblementFixture() });
      const young = await createYoungHelper({ ...getNewYoungFixture(), meetingPointId: pointDeRassemblemenYoung._id });

      const pointDeRassemblement = await createPointDeRassemblementHelper({ ...getNewPointDeRassemblementFixture() });

      const res = await request(getAppHelper(young))
        .get("/point-de-rassemblement/fullInfo/" + pointDeRassemblement._id + "/" + pointDeRassemblement._id)
        .send();
      expect(res.status).toBe(403);
    });
    it("should return 403 when young try to fetch another bus than his", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const sessionPhase1 = await createSessionPhase1({ ...getNewSessionPhase1Fixture(), cohesionCenterId: cohesionCenter._id });

      const resultYoung = await createPointDeRassemblementWithBus(getNewPointDeRassemblementFixture(), cohesionCenter._id, sessionPhase1._id);
      const young = await createYoungHelper({ ...getNewYoungFixture(), meetingPointId: resultYoung.pdr._id, ligneId: resultYoung.bus._id });

      const { pdr, bus } = await createPointDeRassemblementWithBus(getNewPointDeRassemblementFixture(), cohesionCenter._id, sessionPhase1._id);

      const res = await request(getAppHelper(young))
        .get("/point-de-rassemblement/fullInfo/" + pdr._id + "/" + bus._id)
        .send();
      expect(res.status).toBe(403);
    });
  });
  describe("GET /center/:centerId/cohort/:cohortId", () => {
    it("should return 200 and the meeting points and ligne bus for authorized user", async () => {
      const centerId = "123";
      const cohortId = "456";

      const res = await request(getAppHelper()).get(`/point-de-rassemblement/center/${centerId}/cohort/${cohortId}`).send();

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.meetingPoints).toEqual(expect.any(Array));
      expect(res.body.data.ligneBus).toEqual(expect.any(Array));
    });

    it("should return 500 if there's an internal server error", async () => {
      // Mock the function to throw an error
      jest.spyOn(PointDeRassemblementModel, "find").mockImplementation(() => {
        throw new Error("Test error");
      });

      const centerId = "123";
      const cohortId = "456";

      const res = await request(getAppHelper()).get(`/point-de-rassemblement/center/${centerId}/cohort/${cohortId}`).send();

      expect(res.status).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("SERVER_ERROR");
    });
  });
  describe("GET /point-de-rassemblement/:id/bus/:cohort", () => {
    it("should return 200 when meeting point and bus data are found", async () => {
      // Create a referent user with the necessary permissions
      const user = { _id: "123", role: "admin" };
      const code = Math.random().toString(36).substring(2, 8);
      // Create a meeting point and bus data
      const PointDeRassemblement = {
        code: code,
        cohorts: ["Février 2023 - C"],
        name: "Meeting Point",
        address: "123 Main St",
        city: "Paris",
        zip: "75001",
        department: "Paris",
        region: "Île-de-France",
        academie: "Academie",
        location: {
          lat: 48.8566,
          lon: 2.3522,
        },
      };
      const { pdr, bus } = await createPointDeRassemblementWithBus(PointDeRassemblement, "centerId", "sessionId");

      // Send a request to get the meeting point and bus data
      const res = await request(getAppHelper(user)).get(`/point-de-rassemblement/${pdr._id}/bus/${bus.cohort}`).send();

      // Expect the server to return a 200 status code and the expected data
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.bus).toBeDefined();
      expect(res.body.data.meetingPoint).toBeDefined();
      expect(res.body.data.meetingPointsDetail).toBeDefined();
    });

    it("should return 400 when invalid params are provided", async () => {
      // Create a referent user with the necessary permissions
      const user = { _id: "123", role: "referent" };

      // Send a request with invalid params
      const res = await request(getAppHelper(user)).get("/point-de-rassemblement/invalid-id/bus/invalid-cohort").send();

      // Expect the server to return a 400 status code and an error message
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("INVALID_PARAMS");
    });

    it("should return 403 when user is not authorized to view meeting points", async () => {
      // Create a user without the necessary permissions
      const user = { _id: "123", role: "user" };
      const code = Math.random().toString(36).substring(2, 8);

      // Create a meeting point and bus data with valid centerId and sessionId values
      const PointDeRassemblement = {
        code: code,
        cohorts: ["Février 2023 - C"],
        name: "Meeting Point",
        address: "123 Main St",
        city: "Paris",
        zip: "75001",
        department: "Paris",
        region: "Île-de-France",
        academie: "Academie",
        location: {
          lat: 48.8566,
          lon: 2.3522,
        },
        matricule: faker.lorem.words(),
      };
      const { pdr, bus } = await createPointDeRassemblementWithBus(PointDeRassemblement, "centerId", "sessionId");
      const cohort = bus.cohort;

      // Send a request to get the meeting point and bus data
      const res = await request(getAppHelper(user)).get(`/point-de-rassemblement/${pdr._id}/bus/${cohort}`).send();

      // Expect the server to return a 403 status code and an error message
      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("OPERATION_UNAUTHORIZED");
    });
  });
  describe("GET /ligneToPoint/:cohort/:centerId", () => {
    it("should return 500 with server error", async () => {
      jest.spyOn(LigneToPointModel, "find").mockImplementation(() => {
        throw new Error("test error");
      });
      const res = await request(getAppHelper()).get("/point-de-rassemblement/ligneToPoint/testCohort/testCenterId");
      expect(res.status).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("SERVER_ERROR");
      jest.spyOn(LigneToPointModel, "find").mockRestore();
    });
  });
  describe("GET /:id/in-schema", () => {
    it("should return 400 if id is not provided", async () => {
      const response = await request(getAppHelper()).get("/point-de-rassemblement/in-schema");
      expect(response.status).toBe(400);
    });

    it("should return true if schema exists for the given id", async () => {
      jest.spyOn(SchemaDeRepartitionModel, "findOne").mockResolvedValue({ gatheringPlaces: "id" });

      const response = await request(getAppHelper()).get("/point-de-rassemblement/id/in-schema").send();
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toBe(true);
    });

    it("should return false if schema does not exist for the given id", async () => {
      jest.spyOn(SchemaDeRepartitionModel, "findOne").mockResolvedValue(null);

      const response = await request(getAppHelper()).get("/point-de-rassemblement/id/in-schema").send();
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toBe(false);
    });
  });
  describe("GET /:id", () => {
    it("should return 200 and the meeting point data when the user is authorized and the meeting point exists", async () => {
      const code = Math.random().toString(36).substring(2, 8);
      const pointDeRassemblement = await PointDeRassemblementModel.create({
        name: "Test PDR",
        cohorts: [],
        complementAddress: [],
        region: "Test Region",
        department: "Test Department",
        academie: "Academie",
        zip: "12345",
        city: "Test City",
        address: "Test Address",
        code: code,
        matricule: code,
      });

      const res = await request(getAppHelper()).get(`/point-de-rassemblement/${pointDeRassemblement._id}`).send();

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data._id).toBe(pointDeRassemblement._id.toString());
      expect(res.body.data.name).toBe(pointDeRassemblement.name);
    });

    it("should return 400 when the ID parameter is invalid", async () => {
      const res = await request(getAppHelper()).get("/point-de-rassemblement/invalid_id").send();

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("INVALID_PARAMS");
    });

    it("should return 404 when the meeting point does not exist", async () => {
      const res = await request(getAppHelper()).get("/point-de-rassemblement/123456789012345678901234").send();

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("NOT_FOUND");
    });

    it("should return 500 when an error occurs", async () => {
      jest.spyOn(PointDeRassemblementModel, "findOne").mockImplementation(() => {
        throw new Error("Database error");
      });

      const res = await request(getAppHelper())
        .get("/point-de-rassemblement/123456789012345678901234") // replace with a valid ID
        .send();

      expect(res.status).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("SERVER_ERROR");
    });
  });
});
