require("dotenv").config({ path: "./.env-testing" });
const mongoose = require("mongoose");
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const CohesionCenterModel = require("../models/cohesionCenter");
const CohortModel = require("../models/cohort");
const YoungModel = require("../models/young");
const LigneBusModel = require("../models/PlanDeTransport/ligneBus");
const PlanTransportModel = require("../models/PlanDeTransport/planTransport");
const PointDeRassemblementModel = require("../models/PlanDeTransport/pointDeRassemblement");
const LigneToPointModel = require("../models/PlanDeTransport/ligneToPoint");
const SchemaRepartitionModel = require("../models/PlanDeTransport/schemaDeRepartition");
const { dbConnect, dbClose } = require("./helpers/db");
const { createYoungHelper } = require("./helpers/young");
const getNewYoungFixture = require("./fixtures/young");
const { createPointDeRassemblementWithBus } = require("./helpers/PlanDeTransport/pointDeRassemblement");

jest.setTimeout(100000);
beforeAll(dbConnect);

const mockModelMethodWithError = (model, method) => {
  jest.spyOn(model, method).mockImplementation(() => {
    throw new Error("test error");
  });
};
afterAll(dbClose);

describe("Meeting point", () => {
  describe("GET /all", () => {
    afterEach(async () => {
      await Promise.all([LigneBusModel.deleteMany(), PointDeRassemblementModel.deleteMany(), LigneToPointModel.deleteMany()]);
    });
    it("should return all ligneBus, meetingPoints, and ligneToPoints", async () => {
      const ligneBus = await LigneBusModel.create({
        name: "Ligne 1",
        centerDepartureTime: new Date(),
        centerArrivalTime: new Date(),
        centerId: "center_id",
        sessionId: "session_id",
        travelTime: 60,
        followerCapacity: 20,
        totalCapacity: 30,
        youngCapacity: 10,
        returnDate: new Date(),
        departuredDate: new Date(),
        busId: "bus_id",
        cohort: "Février 2023 - C",
      });
      const code = Math.random().toString(36).substring(2, 8);
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
      const { ligneToPoint } = await createPointDeRassemblementWithBus(PointDeRassemblement, ligneBus.centerId, ligneBus.sessionId);

      const res = await request(getAppHelper()).get("/ligne-de-bus/all");

      expect(res.body.data.meetingPoints.length).toBe(1);
      expect(res.body.data.meetingPoints[0].code).toBe(PointDeRassemblement.code);
      expect(res.body.data.meetingPoints[0].cohorts).toEqual(PointDeRassemblement.cohorts);
      expect(res.body.data.meetingPoints[0].name).toBe(PointDeRassemblement.name);
      expect(res.body.data.meetingPoints[0].address).toBe(PointDeRassemblement.address);
      expect(res.body.data.meetingPoints[0].city).toBe(PointDeRassemblement.city);
      expect(res.body.data.meetingPoints[0].zip).toBe(PointDeRassemblement.zip);
      expect(res.body.data.meetingPoints[0].department).toBe(PointDeRassemblement.department);
      expect(res.body.data.meetingPoints[0].region).toBe(PointDeRassemblement.region);
      expect(res.body.data.meetingPoints[0].location).toEqual(PointDeRassemblement.location);
      expect(res.body.data.ligneBus[0]._id).toBe(ligneBus._id.toString());
      expect(res.body.data.ligneToPoints.length).toBeGreaterThan(0);
      expect(res.body.data.ligneToPoints[0]._id).toBe(ligneToPoint._id.toString());
    });

    it("should return 500 when there's an error", async () => {
      mockModelMethodWithError(LigneBusModel, "find");
      let res;
      try {
        res = await request(getAppHelper()).get("/ligne-de-bus/all").send();
      } catch (error) {
        console.error(error);
      }

      expect(res.status).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("SERVER_ERROR");

      jest.spyOn(LigneBusModel, "find").mockRestore();
    });
  });
  describe("GET /cohort/:cohort", () => {
    afterEach(async () => {
      await LigneBusModel.deleteMany();
      await CohesionCenterModel.deleteMany();
    });

    it("should return all ligneBus and centers for the given cohort", async () => {
      const cohort = "Février 2023 - C";
      const center = await CohesionCenterModel.create({
        name: "Center 1",
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
      const ligneBus = await LigneBusModel.create({
        name: "Ligne 1",
        centerDepartureTime: new Date(),
        centerArrivalTime: new Date(),
        centerId: center._id,
        sessionId: "session_id",
        travelTime: 60,
        followerCapacity: 20,
        totalCapacity: 30,
        youngCapacity: 10,
        returnDate: new Date(),
        departuredDate: new Date(),
        busId: "bus_id",
        cohort,
      });
      await LigneBusModel.create({
        name: "Ligne 2",
        centerDepartureTime: new Date(),
        centerArrivalTime: new Date(),
        centerId: center._id,
        sessionId: "session_id",
        travelTime: 60,
        followerCapacity: 20,
        totalCapacity: 30,
        youngCapacity: 10,
        returnDate: new Date(),
        departuredDate: new Date(),
        busId: "bus_id",
        cohort,
      });

      const res = await request(getAppHelper()).get(`/ligne-de-bus/cohort/${cohort}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.ligneBus.length).toBe(2);
      expect(res.body.data.ligneBus[0]._id).toBe(ligneBus._id.toString());
    });

    it("should return 403 when user is not authorized", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture() });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      const res = await request(getAppHelper()).get("/ligne-de-bus/cohort/Février 2023 - C");

      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("OPERATION_UNAUTHORIZED");
      passport.user = previous;
    });

    it("should return 500 when there's an error", async () => {
      const passport = require("passport");
      const previous = passport.user;
      passport.user = null;
      jest.spyOn(LigneBusModel, "find").mockImplementation(() => {
        throw new Error("test error");
      });

      const res = await request(getAppHelper()).get("/ligne-de-bus/cohort/Février 2023 - C");

      expect(res.status).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("SERVER_ERROR");

      jest.spyOn(LigneBusModel, "find").mockRestore();
    });
  });
  describe("GET /:id", () => {
    afterEach(async () => {
      await Promise.all([LigneBusModel.deleteMany(), PointDeRassemblementModel.deleteMany(), LigneToPointModel.deleteMany()]);
    });
    it("should return the ligneBus with the given id", async () => {
      const user = { _id: "123", role: "admin" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;
      const ligneBus = await LigneBusModel.create({
        name: "Ligne 1",
        centerDepartureTime: new Date(),
        centerArrivalTime: new Date(),
        centerId: mongoose.Types.ObjectId(),
        sessionId: "session_id",
        travelTime: 60,
        followerCapacity: 20,
        totalCapacity: 30,
        youngCapacity: 10,
        returnDate: new Date(),
        departuredDate: new Date(),
        busId: "bus_id",
        cohort: "Février 2023 - C",
      });

      const res = await request(getAppHelper()).get(`/ligne-de-bus/${ligneBus._id}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.name).toBe(ligneBus.name);
      expect(res.body.data.centerDepartureTime).toBe(ligneBus.centerDepartureTime);
      expect(res.body.data.centerArrivalTime).toBe(ligneBus.centerArrivalTime);
      expect(res.body.data.centerId).toBe(ligneBus.centerId);
      expect(res.body.data.sessionId).toBe(ligneBus.sessionId);
      expect(res.body.data.travelTime).toBe(ligneBus.travelTime);
      expect(res.body.data.followerCapacity).toBe(ligneBus.followerCapacity);
      expect(res.body.data.totalCapacity).toBe(ligneBus.totalCapacity);
      expect(res.body.data.youngCapacity).toBe(ligneBus.youngCapacity);
      expect(res.body.data.returnDate).toBe(ligneBus.returnDate.toISOString());
      expect(res.body.data.departuredDate).toBe(ligneBus.departuredDate.toISOString());
      expect(res.body.data.busId).toBe(ligneBus.busId);
      expect(res.body.data.cohort).toBe(ligneBus.cohort);
      passport.user = previous;
    });

    it("should return 404 when ligneBus with the given id is not found", async () => {
      const user = { _id: "123", role: "admin" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;
      const res = await request(getAppHelper()).get(`/ligne-de-bus/123456789012345678901234`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("NOT_FOUND");
      passport.user = previous;
    });

    it("should return 403 when user is not authorized", async () => {
      const user = { _id: "123", role: "fake" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;
      const ligneBus = await LigneBusModel.create({
        name: "Ligne 1",
        centerDepartureTime: new Date(),
        centerArrivalTime: new Date(),
        centerId: "center_id",
        sessionId: "session_id",
        travelTime: 60,
        followerCapacity: 20,
        totalCapacity: 30,
        youngCapacity: 10,
        returnDate: new Date(),
        departuredDate: new Date(),
        busId: "bus_id",
        cohort: "Février 2023 - C",
      });

      const res = await request(getAppHelper()).get(`/ligne-de-bus/${ligneBus._id}`);

      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("OPERATION_UNAUTHORIZED");
      passport.user = previous;
    });

    it("should return 500 when there's an error", async () => {
      jest.spyOn(LigneBusModel, "findById").mockImplementation(() => {
        throw new Error("test error");
      });

      const ligneBus = await LigneBusModel.create({
        name: "Ligne 1",
        centerDepartureTime: new Date(),
        centerArrivalTime: new Date(),
        centerId: "center_id",
        sessionId: "session_id",
        travelTime: 60,
        followerCapacity: 20,
        totalCapacity: 30,
        youngCapacity: 10,
        returnDate: new Date(),
        departuredDate: new Date(),
        busId: "bus_id",
        cohort: "Février 2023 - C",
      });

      const res = await request(getAppHelper()).get(`/ligne-de-bus/${ligneBus._id}`);

      expect(res.status).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("SERVER_ERROR");

      jest.spyOn(LigneBusModel, "findById").mockRestore();
    });
  });
  describe("GET /:id/availablePDR", () => {
    afterEach(async () => {
      await LigneBusModel.deleteMany();
      await CohesionCenterModel.deleteMany();
      await SchemaRepartitionModel.deleteMany();
      await PointDeRassemblementModel.deleteMany();
      await YoungModel.deleteMany();
    });

    it("should return all available PDR for the given ligneBus", async () => {
      const user = { _id: "123", role: "admin" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;
      const center = await CohesionCenterModel.create({
        name: "Center 1",
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
      const ligneBus = await LigneBusModel.create({
        name: "Ligne 1",
        centerDepartureTime: new Date(),
        centerArrivalTime: new Date(),
        centerId: center._id,
        sessionId: "session_id",
        travelTime: 60,
        followerCapacity: 20,
        totalCapacity: 30,
        youngCapacity: 10,
        returnDate: new Date(),
        departuredDate: new Date(),
        busId: "bus_id",
        cohort: "Février 2023 - C",
      });
      const pdr1 = await PointDeRassemblementModel.create({
        _id: mongoose.Types.ObjectId(),
        name: "PDR 1",
        region: "Île-de-France",
        department: "Paris",
        zip: "75001",
        city: "Paris",
        address: "123 Main St",
        code: "PDR1",
        location: {
          lat: 48.8566,
          lon: 2.3522,
        },
      });

      const pdr2 = await PointDeRassemblementModel.create({
        _id: mongoose.Types.ObjectId(),
        name: "PDR 2",
        region: "Île-de-France",
        department: "Paris",
        zip: "75002",
        city: "Paris",
        address: "456 Main St",
        code: "PDR2",
        location: {
          lat: 48.8566,
          lon: 2.3522,
        },
      });

      const schemaRepartition = await SchemaRepartitionModel.create({
        centerId: center._id,
        name: "Schema 1",
        fromRegion: "Île-de-France",
        intradepartmental: true,
        cohort: "Février 2023 - C",
        gatheringPlaces: [pdr1._id, pdr2._id],
      });

      const young = await YoungModel.create({
        firstName: "John",
        lastName: "Doe",
        email: "john.doea@example.com",
        password: "password",
        cohesionCenterId: center._id,
        busId: ligneBus._id,
      });

      const res = await request(getAppHelper()).get(`/ligne-de-bus/${ligneBus._id}/availablePDR`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].code).toBe("PDR1");
      expect(res.body.data[1].code).toBe("PDR2");
      passport.user = previous;
    });

    it("should return 404 when ligneBus is not found", async () => {
      const user = { _id: "123", role: "admin" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;
      const res = await request(getAppHelper()).get(`/ligne-de-bus/${mongoose.Types.ObjectId()}/availablePDR`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("NOT_FOUND");
      passport.user = previous;
    });

    it("should return 403 when user is not authorized", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture() });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      const center = await CohesionCenterModel.create({
        name: "Center 1",
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
      const ligneBus = await LigneBusModel.create({
        name: "Ligne 1",
        centerDepartureTime: new Date(),
        centerArrivalTime: new Date(),
        centerId: center._id,
        sessionId: "session_id",
        travelTime: 60,
        followerCapacity: 20,
        totalCapacity: 30,
        youngCapacity: 10,
        returnDate: new Date(),
        departuredDate: new Date(),
        busId: "bus_id",
        cohort: "Février 2023 - C",
      });

      const res = await request(getAppHelper()).get(`/ligne-de-bus/${ligneBus._id}/availablePDR`);

      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("OPERATION_UNAUTHORIZED");
    });

    it("should return 500 when there's an error", async () => {
      const passport = require("passport");
      const previous = passport.user;
      passport.user = null;
      jest.spyOn(LigneBusModel, "findById").mockImplementation(() => {
        throw new Error("test error");
      });

      const res = await request(getAppHelper()).get(`/ligne-de-bus/${mongoose.Types.ObjectId()}/availablePDR`);

      expect(res.status).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("SERVER_ERROR");

      jest.spyOn(LigneBusModel, "findById").mockRestore();
    });
  });
  describe("GET /:id/ligne-to-points", () => {
    afterEach(async () => {
      await LigneBusModel.deleteMany();
      await CohesionCenterModel.deleteMany();
      await SchemaRepartitionModel.deleteMany();
      await PointDeRassemblementModel.deleteMany();
      await YoungModel.deleteMany();
    });

    it("should return 403 when user is not authorized", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture() });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      const center = await CohesionCenterModel.create({
        name: "Center 1",
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
      const ligneBus = await LigneBusModel.create({
        name: "Ligne 1",
        centerDepartureTime: new Date(),
        centerArrivalTime: new Date(),
        centerId: center._id,
        sessionId: "session_id",
        travelTime: 60,
        followerCapacity: 20,
        totalCapacity: 30,
        youngCapacity: 10,
        returnDate: new Date(),
        departuredDate: new Date(),
        busId: "bus_id",
        cohort: "Février 2023 - C",
      });

      const res = await request(getAppHelper()).get(`/ligne-de-bus/${ligneBus._id}/ligne-to-points`);

      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("OPERATION_UNAUTHORIZED");
      passport.user = previous;
    });

    it("should return 500 when there's an error", async () => {
      const passport = require("passport");
      const previous = passport.user;
      passport.user = null;
      jest.spyOn(LigneBusModel, "findById").mockImplementation(() => {
        throw new Error("test error");
      });

      const res = await request(getAppHelper()).get(`/ligne-de-bus/${mongoose.Types.ObjectId()}/ligne-to-points`);

      expect(res.status).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("SERVER_ERROR");

      jest.spyOn(LigneBusModel, "findById").mockRestore();
    });
  });
  describe("GET /:id/data-for-check", () => {
    afterEach(async () => {
      await Promise.all([LigneBusModel.deleteMany(), PointDeRassemblementModel.deleteMany(), LigneToPointModel.deleteMany()]);
    });

    it("should return the data for check for the ligneBus with the given id", async () => {
      const user = { _id: "123", role: "admin" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;

      const ligneBus = await LigneBusModel.create({
        name: "Ligne 1",
        centerDepartureTime: new Date(),
        centerArrivalTime: new Date(),
        centerId: mongoose.Types.ObjectId(),
        sessionId: "session_id",
        travelTime: 60,
        followerCapacity: 20,
        totalCapacity: 30,
        youngCapacity: 10,
        returnDate: new Date(),
        departuredDate: new Date(),
        busId: "bus_id",
        cohort: "Février 2023 - C",
      });

      const res = await request(getAppHelper()).get(`/ligne-de-bus/${ligneBus._id}/data-for-check`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toHaveProperty("meetingPoints");
      expect(res.body.data).toHaveProperty("youngsCountBus");
      expect(res.body.data).toHaveProperty("busVolume");

      passport.user = previous;
    });

    it("should return 403 when user is not authorized to view the ligne bus", async () => {
      const user = { _id: "123", role: "other" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;

      const ligneBus = await LigneBusModel.create({
        name: "Ligne 1",
        centerDepartureTime: new Date(),
        centerArrivalTime: new Date(),
        centerId: mongoose.Types.ObjectId(),
        sessionId: "session_id",
        travelTime: 60,
        followerCapacity: 20,
        totalCapacity: 30,
        youngCapacity: 10,
        returnDate: new Date(),
        departuredDate: new Date(),
        busId: "bus_id",
        cohort: "Février 2023 - C",
      });

      const res = await request(getAppHelper()).get(`/ligne-de-bus/${ligneBus._id}/data-for-check`);

      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("OPERATION_UNAUTHORIZED");

      passport.user = previous;
    });

    it("should return 404 when ligneBus is not found", async () => {
      const user = { _id: "123", role: "admin" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;
      const res = await request(getAppHelper()).get(`/ligne-de-bus/${mongoose.Types.ObjectId()}/data-for-check`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("NOT_FOUND");
      passport.user = previous;
    });
    it("should return 500 when there's an error", async () => {
      mockModelMethodWithError(LigneBusModel, "find");
      let res;
      try {
        res = await request(getAppHelper()).get(`/ligne-de-bus/${mongoose.Types.ObjectId()}/data-for-check`).send();
      } catch (error) {
        console.error(error);
      }

      expect(res.status).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("SERVER_ERROR");

      jest.spyOn(LigneBusModel, "find").mockRestore();
    });
  });
  describe("GET /cohort/:cohort/hasValue", () => {
    afterEach(async () => {
      await LigneBusModel.deleteMany();
    });

    it("should return true when a ligne bus with the given cohort exists", async () => {
      const user = { _id: "123", role: "admin" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;

      const ligneBus = await LigneBusModel.create({
        name: "Ligne 1",
        centerDepartureTime: new Date(),
        centerArrivalTime: new Date(),
        centerId: mongoose.Types.ObjectId(),
        sessionId: "session_id",
        travelTime: 60,
        followerCapacity: 20,
        totalCapacity: 30,
        youngCapacity: 10,
        returnDate: new Date(),
        departuredDate: new Date(),
        busId: "bus_id",
        cohort: "Février 2023 - C",
      });

      const res = await request(getAppHelper()).get(`/ligne-de-bus/cohort/${ligneBus.cohort}/hasValue`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toBe(true);

      passport.user = previous;
    });

    it("should return false when a ligne bus with the given cohort does not exist", async () => {
      const user = { _id: "123", role: "admin" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;

      const res = await request(getAppHelper()).get(`/ligne-de-bus/cohort/Février 2023 - C/hasValue`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toBe(false);

      passport.user = previous;
    });

    it("should return 403 when user is not authorized to view the ligne bus", async () => {
      const user = { _id: "123", role: "other" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;

      const res = await request(getAppHelper()).get(`/ligne-de-bus/cohort/Février 2023 - C/hasValue`);

      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("OPERATION_UNAUTHORIZED");

      passport.user = previous;
    });

    it("should return 500 when there's an error", async () => {
      jest.spyOn(LigneBusModel, "findOne").mockImplementation(() => {
        throw new Error("test error");
      });

      const user = { _id: "123", role: "admin" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;

      const res = await request(getAppHelper()).get(`/ligne-de-bus/cohort/Février 2023 - C/hasValue`);

      expect(res.status).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("SERVER_ERROR");

      passport.user = previous;
      jest.spyOn(LigneBusModel, "findOne").mockRestore();
    });
  });
  describe("PUT /:id/info", () => {
    afterEach(async () => {
      await Promise.all([LigneBusModel.deleteMany(), CohortModel.deleteMany(), PlanTransportModel.deleteMany()]);
    });
    it("should return 403 when the user is not authorized", async () => {
      const user = { _id: "123", role: "transporter" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;

      const ligneBus = await LigneBusModel.create({
        name: "Ligne 1",
        centerDepartureTime: new Date(),
        centerArrivalTime: new Date(),
        centerId: mongoose.Types.ObjectId(),
        sessionId: "session_id",
        travelTime: 60,
        followerCapacity: 20,
        totalCapacity: 30,
        youngCapacity: 10,
        returnDate: new Date(),
        departuredDate: new Date(),
        busId: "bus_id",
        cohort: "Février 2023 - C",
      });

      await ligneBus.save();

      const res = await request(getAppHelper()).put(`/ligne-de-bus/${ligneBus._id}/info`).send({
        busId: "new_bus_id",
        departuredDate: new Date(),
        returnDate: new Date(),
        youngCapacity: 15,
        totalCapacity: 25,
        followerCapacity: 5,
        travelTime: "02:00",
        lunchBreak: false,
        lunchBreakReturn: false,
        delayedForth: "00:10",
        delayedBack: "00:15",
      });

      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("OPERATION_UNAUTHORIZED");

      passport.user = previous;
    });

    it("should return 404 when the ligneBus with the given id is not found", async () => {
      const user = { _id: "1234", role: "admin" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;

      const res = await request(getAppHelper()).put(`/ligne-de-bus/123456789012345678901234/info`).send({
        busId: "new_bus_id",
        departuredDate: new Date(),
        returnDate: new Date(),
        youngCapacity: 15,
        totalCapacity: 25,
        followerCapacity: 5,
        travelTime: "02:00",
        lunchBreak: false,
        lunchBreakReturn: false,
        delayedForth: "00:10",
        delayedBack: "00:15",
      });

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("NOT_FOUND");

      passport.user = previous;
    });

    it("should return 500 when there's an error", async () => {
      const user = { _id: "123", role: "admin" };
      const passport = require("passport");
      const previous = passport.user;
      passport.user = user;

      const ligneBus = await LigneBusModel.create({
        name: "Ligne 1",
        centerDepartureTime: new Date(),
        centerArrivalTime: new Date(),
        centerId: mongoose.Types.ObjectId(),
        sessionId: "session_id",
        travelTime: 60,
        followerCapacity: 20,
        totalCapacity: 30,
        youngCapacity: 10,
        returnDate: new Date(),
        departuredDate: new Date(),
        busId: "bus_id",
        cohort: "Février 2023 - C",
      });

      await ligneBus.save();

      jest.spyOn(LigneBusModel, "findById").mockImplementation(() => {
        throw new Error("test error");
      });

      const res = await request(getAppHelper()).put(`/ligne-de-bus/${ligneBus._id}/info`).send({
        busId: "new_bus_id",
        departuredDate: new Date(),
        returnDate: new Date(),
        youngCapacity: 15,
        totalCapacity: 25,
        followerCapacity: 5,
        travelTime: "02:00",
        lunchBreak: false,
        lunchBreakReturn: false,
        delayedForth: "00:10",
        delayedBack: "00:15",
      });

      expect(res.status).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("SERVER_ERROR");

      jest.spyOn(LigneBusModel, "findById").mockRestore();

      passport.user = previous;
    });
  });
});
