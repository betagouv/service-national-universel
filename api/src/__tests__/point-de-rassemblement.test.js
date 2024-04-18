const request = require("supertest");

const getNewPointDeRassemblementFixture = require("./fixtures/PlanDeTransport/pointDeRassemblement");
const { getNewCohesionCenterFixture } = require("./fixtures/cohesionCenter");
const { getNewSessionPhase1Fixture } = require("./fixtures/sessionPhase1");

const { createPointDeRassemblementHelper, createPointDeRassemblementWithBus } = require("./helpers/PlanDeTransport/pointDeRassemblement");

const { createCohesionCenter } = require("./helpers/cohesionCenter");
const { createSessionPhase1 } = require("./helpers/sessionPhase1");

const getNewYoungFixture = require("./fixtures/young");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
const { createYoungHelper } = require("./helpers/young");

const SchemaDeRepartitionModel = require("../models/PlanDeTransport/schemaDeRepartition");
const PointDeRassemblementModel = require("../models/PlanDeTransport/pointDeRassemblement");
const LigneToPointModel = require("../models/PlanDeTransport/ligneToPoint");

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Meeting point", () => {
  describe("GET /point-de-rassemblement/available", () => {
    it("should return 400 when young has no sessionPhase1Id", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture() });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      const res = await request(getAppHelper()).get("/point-de-rassemblement/available").send();
      expect(res.status).toBe(400);
      passport.user = previous;
    });
  });
  describe("PUT /point-de-rassemblement/:id", () => {
    it("should return 404 when point-de-rassemblement does not exist", async () => {
      const notExistingPdrId = "5f9f1b9b9b9b9b9b9b9b9b9b";
      const res = await request(getAppHelper())
        .get("/point-de-rassemblement/" + notExistingPdrId)
        .send();
      expect(res.status).toBe(404);
    });

    it("should return 400 when request body is invalid", async () => {
      const pointDeRassemblement = await createPointDeRassemblementHelper({ ...getNewPointDeRassemblementFixture() });
      const res = await request(getAppHelper())
        .put("/point-de-rassemblement/" + pointDeRassemblement._id)
        .send({
          name: "New Name",
          address: "New Address",
          city: "New City",
          zip: "New Zip",
          department: "New Department",
          region: "New Region",
          location: {
            lat: "invalid_lat",
            lon: "invalid_lon",
          },
        });
      expect(res.status).toBe(400);
    });

    it("should update point-de-rassemblement and return 200", async () => {
      const pointDeRassemblement = await createPointDeRassemblementHelper({ ...getNewPointDeRassemblementFixture() });
      const res = await request(getAppHelper())
        .put("/point-de-rassemblement/" + pointDeRassemblement._id)
        .send({
          name: "New Name",
          address: "New Address",
          city: "New City",
          zip: "New Zip",
          department: "New Department",
          region: "New Region",
          location: {
            lat: 1.234567,
            lon: 2.345678,
          },
        });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.name).toBe("New Name");
      expect(res.body.data.address).toBe("New Address");
      expect(res.body.data.city).toBe("New City");
      expect(res.body.data.zip).toBe("New Zip");
      expect(res.body.data.department).toBe("New Department");
      expect(res.body.data.region).toBe("New Region");
      expect(res.body.data.location.lat).toBe(1.234567);
      expect(res.body.data.location.lon).toBe(2.345678);
    });
  });
  describe("PUT /point-de-rassemblement/delete/cohort/:id", () => {
    it("should return 404 when point-de-rassemblement does not exist", async () => {
      const notExistingPdrId = "5f9f1b9b9b9b9b9b9b9b9b9b";
      const res = await request(getAppHelper())
        .get("/point-de-rassemblement/detete/cohort/" + notExistingPdrId)
        .send();
      expect(res.status).toBe(404);
    });
    it("should return 403 when youngs are still linked to point-de-rassemblement", async () => {
      const pointDeRassemblement = await createPointDeRassemblementHelper({ ...getNewPointDeRassemblementFixture() });
      await createYoungHelper({ ...getNewYoungFixture(), meetingPointId: pointDeRassemblement._id, cohort: "Février 2023 - C" });
      const res = await request(getAppHelper())
        .put("/point-de-rassemblement/delete/cohort/" + pointDeRassemblement._id)
        .send({ cohort: "Février 2023 - C" });
      expect(res.status).toBe(403);
    });
    it("should return 200", async () => {
      const pointDeRassemblement = await createPointDeRassemblementHelper({ ...getNewPointDeRassemblementFixture() });
      const res = await request(getAppHelper())
        .put("/point-de-rassemblement/delete/cohort/" + pointDeRassemblement._id)
        .send({ cohort: "Février 2023 - C" });
      expect(res.status).toBe(200);
    });
  });
  describe("DELETE /point-de-rassemblement/:id", () => {
    it("should return 404 when point-de-rassemblement does not exist", async () => {
      const notExistingPdrId = "5f9f1b9b9b9b9b9b9b9b9b9b";
      const res = await request(getAppHelper())
        .delete("/point-de-rassemblement/" + notExistingPdrId)
        .send();
      expect(res.status).toBe(404);
    });
    it("should return 403 when youngs are still linked to point-de-rassemblement", async () => {
      const pointDeRassemblement = await createPointDeRassemblementHelper({ ...getNewPointDeRassemblementFixture() });
      await createYoungHelper({ ...getNewYoungFixture(), meetingPointId: pointDeRassemblement._id });
      const res = await request(getAppHelper())
        .delete("/point-de-rassemblement/" + pointDeRassemblement._id)
        .send();
      expect(res.status).toBe(403);
    });
    it("should return 200", async () => {
      const pointDeRassemblement = await createPointDeRassemblementHelper({ ...getNewPointDeRassemblementFixture() });
      const res = await request(getAppHelper())
        .delete("/point-de-rassemblement/" + pointDeRassemblement._id)
        .send();
      expect(res.status).toBe(200);
    });
  });
  describe("GET /point-de-rassemblement/fullInfo/:pdrId/:busId", () => {
    it("should return 403 when young try to fetch another pdr than his", async () => {
      const pointDeRassemblemenYoung = await createPointDeRassemblementHelper({ ...getNewPointDeRassemblementFixture() });
      const young = await createYoungHelper({ ...getNewYoungFixture(), meetingPointId: pointDeRassemblemenYoung._id });

      const pointDeRassemblement = await createPointDeRassemblementHelper({ ...getNewPointDeRassemblementFixture() });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const res = await request(getAppHelper())
        .get("/point-de-rassemblement/fullInfo/" + pointDeRassemblement._id + "/" + pointDeRassemblement._id)
        .send();
      expect(res.status).toBe(403);
      passport.user = previous;
    });
    it("should return 403 when young try to fetch another bus than his", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const sessionPhase1 = await createSessionPhase1({ ...getNewSessionPhase1Fixture(), cohesionCenterId: cohesionCenter._id });

      const resultYoung = await createPointDeRassemblementWithBus(getNewPointDeRassemblementFixture(), cohesionCenter._id, sessionPhase1._id);
      const young = await createYoungHelper({ ...getNewYoungFixture(), meetingPointId: resultYoung.pdr._id, ligneId: resultYoung.bus._id });

      const { pdr, bus } = await createPointDeRassemblementWithBus(getNewPointDeRassemblementFixture(), cohesionCenter._id, sessionPhase1._id);
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const res = await request(getAppHelper())
        .get("/point-de-rassemblement/fullInfo/" + pdr._id + "/" + bus._id)
        .send();
      expect(res.status).toBe(403);
      passport.user = previous;
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
  describe("POST /", () => {
    it("should return 400 when request body is invalid", async () => {
      const res = await request(getAppHelper())
        .post("/point-de-rassemblement/")
        .send({
          cohort: "Février 2023 - C",
          name: "Meeting Point",
          address: "123 Main St",
          complementAddress: "Apt 1",
          city: "Paris",
          zip: "75001",
          department: "Paris",
          region: "Île-de-France",
          location: {
            lat: 48.8566,
            lon: 2.3522,
          },
          invalidProperty: "invalid",
        });
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });

    it("should return 403 when user is not authorized to create meeting point", async () => {
      const user = { _id: "123", role: "user" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;

      const res = await request(getAppHelper())
        .post("/point-de-rassemblement/")
        .send({
          cohort: "Février 2023 - C",
          name: "Meeting Point",
          address: "123 Main St",
          city: "Paris",
          zip: "75001",
          department: "Paris",
          region: "Île-de-France",
          location: {
            lat: 48.8566,
            lon: 2.3522,
          },
        });
      expect(res.status).toBe(403);
      passport.user = previous;
    });

    it("should return 200 when meeting point is successfully created", async () => {
      const user = { _id: "123", role: "admin" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;
      const res = await request(getAppHelper())
        .post("/point-de-rassemblement/")
        .send({
          cohort: "Février 2023 - C",
          name: "Meeting Point",
          address: "123 Main St",
          city: "Paris",
          zip: "75001",
          department: "Paris",
          region: "Île-de-France",
          location: {
            lat: 48.8566,
            lon: 2.3522,
          },
        });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toBeDefined();
      passport.user = previous;
    });
  });
  describe("GET /point-de-rassemblement/:id/bus/:cohort", () => {
    it("should return 200 when meeting point and bus data are found", async () => {
      // Create a referent user with the necessary permissions
      const user = { _id: "123", role: "admin" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;
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
        location: {
          lat: 48.8566,
          lon: 2.3522,
        },
      };
      const { pdr, bus } = await createPointDeRassemblementWithBus(PointDeRassemblement, "centerId", "sessionId");

      // Send a request to get the meeting point and bus data
      const res = await request(getAppHelper()).get(`/point-de-rassemblement/${pdr._id}/bus/${bus.cohort}`).send();

      // Expect the server to return a 200 status code and the expected data
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.bus).toBeDefined();
      expect(res.body.data.meetingPoint).toBeDefined();
      expect(res.body.data.meetingPointsDetail).toBeDefined();

      // Restore the previous user object to avoid affecting other tests
      passport.user = previous;
    });

    it("should return 400 when invalid params are provided", async () => {
      // Create a referent user with the necessary permissions
      const user = { _id: "123", role: "referent" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;

      // Send a request with invalid params
      const res = await request(getAppHelper()).get("/point-de-rassemblement/invalid-id/bus/invalid-cohort").send();

      // Expect the server to return a 400 status code and an error message
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("INVALID_PARAMS");

      // Restore the previous user object to avoid affecting other tests
      passport.user = previous;
    });

    it("should return 403 when user is not authorized to view meeting points", async () => {
      // Create a user without the necessary permissions
      const user = { _id: "123", role: "user" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;
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
        location: {
          lat: 48.8566,
          lon: 2.3522,
        },
      };
      const { pdr, bus } = await createPointDeRassemblementWithBus(PointDeRassemblement, "centerId", "sessionId");
      const cohort = bus.cohort;

      // Send a request to get the meeting point and bus data
      const res = await request(getAppHelper()).get(`/point-de-rassemblement/${pdr._id}/bus/${cohort}`).send();

      // Expect the server to return a 403 status code and an error message
      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("OPERATION_UNAUTHORIZED");

      // Restore the previous user object to avoid affecting other tests
      passport.user = previous;
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
  describe("PUT /cohort/:id", () => {
    it("should return 404 when point-de-rassemblement does not exist", async () => {
      const notExistingPdrId = "5f9f1b9b9b9b9b9b9b9b9b9b";
      const res = await request(getAppHelper())
        .put("/point-de-rassemblement/cohort/" + notExistingPdrId)
        .send({
          id: notExistingPdrId,
          cohort: "Test Cohort",
          complementAddress: "",
        });
      expect(res.status).toBe(404);
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
        zip: "12345",
        city: "Test City",
        address: "Test Address",
        code: code,
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
