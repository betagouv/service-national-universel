require("dotenv").config({ path: "./.env-testing" });
const mongoose = require("mongoose");
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const CohesionCenterModel = require("../models/cohesionCenter");
const LigneBusModel = require("../models/PlanDeTransport/ligneBus");
const PointDeRassemblementModel = require("../models/PlanDeTransport/pointDeRassemblement");
const LigneToPointModel = require("../models/PlanDeTransport/ligneToPoint");
const { dbConnect, dbClose } = require("./helpers/db");
const { createYoungHelper } = require("./helpers/young");
const getNewYoungFixture = require("./fixtures/young");
const { createPointDeRassemblementHelper, createPointDeRassemblementWithBus } = require("./helpers/PlanDeTransport/pointDeRassemblement");

jest.setTimeout(100000);
beforeAll(dbConnect);
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
      const { ligneToPoint } = await createPointDeRassemblementWithBus(PointDeRassemblement, "centerId", "sessionId");

      const res = await request(getAppHelper()).get("/ligne-de-bus/all");
      //   console.log("BUS", res.body.data.ligneBus);
      // check the response
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
      expect(res.body.data.ligneToPoints.length).toBe(1);
      expect(res.body.data.ligneToPoints[0]._id).toBe(ligneToPoint._id.toString());
    });

    it("should return 500 when there's an error", async () => {
      jest.spyOn(LigneBusModel, "find").mockImplementation(() => {
        throw new Error("test error");
      });

      let res;
      try {
        res = await request(getAppHelper()).get("/ligne-de-bus/all").send();
      } catch (error) {
        console.error(error);
      }

      // check the response
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
  describe("GET /ligne-de-bus/:id", () => {
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
        centerDepartureTime: new Date(), // set a new Date object
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
      const res = await request(getAppHelper()).get(`/ligne-de-bus/123456789012345678901234`).set("Authorization", "Bearer <valid_referent_token>");

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

      const res = await request(getAppHelper()).get(`/ligne-de-bus/${ligneBus._id}`).set("Authorization", "Bearer <invalid_token>");

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

      const res = await request(getAppHelper()).get(`/ligne-de-bus/${ligneBus._id}`).set("Authorization", "Bearer <valid_referent_token>");

      expect(res.status).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("SERVER_ERROR");

      jest.spyOn(LigneBusModel, "findById").mockRestore();
    });
  });
});
