import { Types } from "mongoose";
import request from "supertest";
import getAppHelper, { resetAppAuth } from "./helpers/app";
import { mockEsClient } from "./helpers/es";
import {
  SchemaDeRepartitionModel,
  LigneToPointModel,
  CohesionCenterModel,
  YoungModel,
  CohortModel,
  LigneBusModel,
  PlanTransportModel,
  PointDeRassemblementModel,
  SessionPhase1Model,
} from "../models";
import { dbConnect, dbClose, mockTransaction } from "./helpers/db";
import { createYoungHelper } from "./helpers/young";
import getNewYoungFixture from "./fixtures/young";
import { createPointDeRassemblementWithBus } from "./helpers/PlanDeTransport/pointDeRassemblement";
import getNewPointDeRassemblementFixture from "./fixtures/PlanDeTransport/pointDeRassemblement";
import getNewLigneBusFixture from "./fixtures/PlanDeTransport/ligneBus";
import getBusTeamFixture from "./fixtures/busTeam";
import { ERRORS, ROLES } from "snu-lib";
import { sendTemplate } from "../brevo";
import getNewLigneToPointFixture from "./fixtures/PlanDeTransport/ligneToPoint";
import { getNewSessionPhase1Fixture } from "./fixtures/sessionPhase1";
import { getNewCohesionCenterFixture } from "./fixtures/cohesionCenter";
import getNewCohortFixture from "./fixtures/cohort";
import getPlanDeTransportFixture from "./fixtures/PlanDeTransport/planDeTransport";
import * as ligneDeBusService from "../planDeTransport/ligneDeBus/ligneDeBusService";

const ObjectId = Types.ObjectId;

mockEsClient({
  lignebus: [{ _id: "ligneId" }],
});
// disable transaction for this test
mockTransaction();

const mockModelMethodWithError = (model, method) => {
  jest.spyOn(model, method).mockImplementation(() => {
    throw new Error("test error");
  });
};

// jest.mock("../planDeTransport/ligneDeBus/ligneDeBusService", () => ({
//   updatePDRForLine: jest.fn(),
// }));

jest.mock("../brevo", () => ({
  sendTemplate: jest.fn(),
}));

const userSuperAdmin = {
  role: ROLES.ADMIN,
  subRole: "god",
};

beforeAll(() => dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(dbClose);
afterEach(resetAppAuth);

describe("LigneDeBus", () => {
  describe("GET /all", () => {
    afterEach(async () => {
      await Promise.all([LigneBusModel.deleteMany(), PointDeRassemblementModel.deleteMany(), LigneToPointModel.deleteMany()]);
    });
    it("should return all ligneBus, meetingPoints, and ligneToPoints", async () => {
      const ligneBus = await LigneBusModel.create(getNewLigneBusFixture());
      const code = Math.random().toString(36).substring(2, 8);
      const PointDeRassemblement = getNewPointDeRassemblementFixture({ code });
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
      expect(res.body.data.ligneBus.find(({ _id }) => _id === ligneBus._id.toString())).toBeDefined();
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
      const ligneBus = await LigneBusModel.create(getNewLigneBusFixture({ centerId: center._id, cohort, busId: "bus_id_1" }));
      await LigneBusModel.create(getNewLigneBusFixture({ centerId: center._id, cohort, busId: "bus_id_2" }));

      const res = await request(getAppHelper()).get(`/ligne-de-bus/cohort/${cohort}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.ligneBus.length).toBe(2);
      expect(res.body.data.ligneBus.map(({ _id }) => _id).includes(ligneBus._id.toString())).toBe(true);
    });

    it("should return 403 when user is not authorized", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture() });

      const res = await request(getAppHelper(young)).get("/ligne-de-bus/cohort/Février 2023 - C");

      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("OPERATION_UNAUTHORIZED");
    });

    it("should return 500 when there's an error", async () => {
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

      const ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({
          cohort: "Février 2023 - C",
        }),
      );
      ligneBus.team.push(getBusTeamFixture());
      await ligneBus.save();

      const res = await request(getAppHelper(user)).get(`/ligne-de-bus/${ligneBus._id}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toBeDefined();
      // expect(res.body.data.name).toBe(ligneBus.name);
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
      expect(res.body.data.team[0]._id).toBeDefined();
    });

    it("should return 404 when ligneBus with the given id is not found", async () => {
      const user = { _id: "123", role: "admin" };

      const res = await request(getAppHelper(user)).get(`/ligne-de-bus/123456789012345678901234`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("NOT_FOUND");
    });

    it("should return 403 when user is not authorized", async () => {
      const user = { _id: "123", role: "fake" };

      const ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({
          cohort: "Février 2023 - C",
        }),
      );

      const res = await request(getAppHelper(user)).get(`/ligne-de-bus/${ligneBus._id}`);

      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("OPERATION_UNAUTHORIZED");
    });

    it("should return 500 when there's an error", async () => {
      jest.spyOn(LigneBusModel, "findById").mockImplementation(() => {
        throw new Error("test error");
      });

      const ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({
          cohort: "Février 2023 - C",
        }),
      );

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
      await SchemaDeRepartitionModel.deleteMany();
      await PointDeRassemblementModel.deleteMany();
      await YoungModel.deleteMany();
    });

    it("should return all available PDR for the given ligneBus", async () => {
      const user = { _id: "123", role: "admin" };

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
      const ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({
          centerId: center._id,
          cohort: "Février 2023 - C",
        }),
      );
      const pdr1 = await PointDeRassemblementModel.create({
        _id: new ObjectId(),
        name: "PDR 1",
        region: "Île-de-France",
        department: "Paris",
        academie: "Académie de Paris",
        zip: "75001",
        city: "Paris",
        address: "123 Main St",
        code: "PDR1",
        matricule: "PDR1",
        location: {
          lat: 48.8566,
          lon: 2.3522,
        },
      });

      const pdr2 = await PointDeRassemblementModel.create({
        _id: new ObjectId(),
        name: "PDR 2",
        region: "Île-de-France",
        department: "Paris",
        academie: "Académie de Paris",
        zip: "75002",
        city: "Paris",
        address: "456 Main St",
        code: "PDR2",
        matricule: "PDR2",
        location: {
          lat: 48.8566,
          lon: 2.3522,
        },
      });

      await SchemaDeRepartitionModel.create({
        centerId: center._id,
        name: "Schema 1",
        fromRegion: "Île-de-France",
        intradepartmental: true,
        cohort: "Février 2023 - C",
        gatheringPlaces: [pdr1._id, pdr2._id],
      });

      await YoungModel.create({
        firstName: "John",
        lastName: "Doe",
        email: "john.doea@example.com",
        password: "password",
        cohesionCenterId: center._id,
        busId: ligneBus._id,
      });

      const res = await request(getAppHelper(user)).get(`/ligne-de-bus/${ligneBus._id}/availablePDR`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].code).toBe("PDR1");
      expect(res.body.data[1].code).toBe("PDR2");
    });

    it("should return 404 when ligneBus is not found", async () => {
      const user = { _id: "123", role: "admin" };

      const res = await request(getAppHelper(user)).get(`/ligne-de-bus/${new ObjectId()}/availablePDR`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("NOT_FOUND");
    });

    it("should return 403 when user is not authorized", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture() });

      await CohesionCenterModel.create({
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
      const ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({
          cohort: "Février 2023 - C",
        }),
      );

      const res = await request(getAppHelper(young)).get(`/ligne-de-bus/${ligneBus._id}/availablePDR`);

      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("OPERATION_UNAUTHORIZED");
    });

    it("should return 500 when there's an error", async () => {
      jest.spyOn(LigneBusModel, "findById").mockImplementation(() => {
        throw new Error("test error");
      });

      const res = await request(getAppHelper()).get(`/ligne-de-bus/${new ObjectId()}/availablePDR`);

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
      await SchemaDeRepartitionModel.deleteMany();
      await PointDeRassemblementModel.deleteMany();
      await YoungModel.deleteMany();
    });

    it("should return 403 when user is not authorized", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture() });

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
      const ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({
          centerId: center._id,
          cohort: "Février 2023 - C",
        }),
      );

      const res = await request(getAppHelper(young)).get(`/ligne-de-bus/${ligneBus._id}/ligne-to-points`);

      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("OPERATION_UNAUTHORIZED");
    });

    it("should return 500 when there's an error", async () => {
      jest.spyOn(LigneBusModel, "findById").mockImplementation(() => {
        throw new Error("test error");
      });

      const res = await request(getAppHelper()).get(`/ligne-de-bus/${new ObjectId()}/ligne-to-points`);

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

      const ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({
          cohort: "Février 2023 - C",
        }),
      );

      const res = await request(getAppHelper(user)).get(`/ligne-de-bus/${ligneBus._id}/data-for-check`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toHaveProperty("meetingPoints");
      expect(res.body.data).toHaveProperty("youngsCountBus");
      expect(res.body.data).toHaveProperty("busVolume");
    });

    it("should return 403 when user is not authorized to view the ligne bus", async () => {
      const user = { _id: "123", role: "other" };

      const ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({
          cohort: "Février 2023 - C",
        }),
      );

      const res = await request(getAppHelper(user)).get(`/ligne-de-bus/${ligneBus._id}/data-for-check`);

      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("OPERATION_UNAUTHORIZED");
    });

    it("should return 404 when ligneBus is not found", async () => {
      const user = { _id: "123", role: "admin" };

      const res = await request(getAppHelper(user)).get(`/ligne-de-bus/${new ObjectId()}/data-for-check`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("NOT_FOUND");
    });

    it.skip("should return 500 when there's an error", async () => {
      mockModelMethodWithError(LigneBusModel, "find");
      let res;
      try {
        res = await request(getAppHelper()).get(`/ligne-de-bus/${new ObjectId().toString()}/data-for-check`).send();
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

      const ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({
          cohort: "Février 2023 - C",
        }),
      );

      const res = await request(getAppHelper(user)).get(`/ligne-de-bus/cohort/${ligneBus.cohort}/hasValue`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toBe(true);
    });

    it("should return false when a ligne bus with the given cohort does not exist", async () => {
      const user = { _id: "123", role: "admin" };

      const res = await request(getAppHelper(user)).get(`/ligne-de-bus/cohort/Février 2023 - C/hasValue`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toBe(false);
    });

    it("should return 403 when user is not authorized to view the ligne bus", async () => {
      const user = { _id: "123", role: "other" };

      const res = await request(getAppHelper(user)).get(`/ligne-de-bus/cohort/Février 2023 - C/hasValue`);

      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("OPERATION_UNAUTHORIZED");
    });

    it("should return 500 when there's an error", async () => {
      jest.spyOn(LigneBusModel, "findOne").mockImplementation(() => {
        throw new Error("test error");
      });

      const user = { _id: "123", role: "admin" };

      const res = await request(getAppHelper(user)).get(`/ligne-de-bus/cohort/Février 2023 - C/hasValue`);

      expect(res.status).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("SERVER_ERROR");

      jest.spyOn(LigneBusModel, "findOne").mockRestore();
    });
  });
  describe("PUT /:id/info", () => {
    afterEach(async () => {
      await Promise.all([LigneBusModel.deleteMany(), CohortModel.deleteMany(), PlanTransportModel.deleteMany()]);
    });
    it("should return 403 when the user is not authorized", async () => {
      const user = { _id: "123", role: "transporter" };

      const ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({
          cohort: "Février 2023 - C",
        }),
      );

      await ligneBus.save();

      const res = await request(getAppHelper(user)).put(`/ligne-de-bus/${ligneBus._id}/info`).send({
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
    });

    it("should return 404 when the ligneBus with the given id is not found", async () => {
      const user = { _id: "1234", role: "admin" };

      const res = await request(getAppHelper(user)).put(`/ligne-de-bus/123456789012345678901234/info`).send({
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
    });

    it("should return 500 when there's an error", async () => {
      const user = { _id: "123", role: "admin" };

      const ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({
          cohort: "Février 2023 - C",
        }),
      );

      await ligneBus.save();

      jest.spyOn(LigneBusModel, "findById").mockImplementation(() => {
        throw new Error("test error");
      });

      const res = await request(getAppHelper(user)).put(`/ligne-de-bus/${ligneBus._id}/info`).send({
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
    });
  });

  describe("POST /elasticsearch/lignebus/export", () => {
    it("should return 200 when export is successful", async () => {
      const user = { _id: "123", role: "admin" };

      const res = await request(getAppHelper(user))
        .post("/elasticsearch/lignebus/export")
        .send({ filters: {}, exportFields: ["busId"] });
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("PUT /:id/updatePDRForLine", () => {
    let cohort;
    let center;
    let sessionPhase1;
    let meetingPoint1;
    let meetingPoint2;
    let ligneBus;
    let ligneToPoint;
    let planDeTransport;
    let payload;

    beforeAll(async () => {
      cohort = await CohortModel.create(getNewCohortFixture());
      center = await CohesionCenterModel.create(getNewCohesionCenterFixture());
      sessionPhase1 = await SessionPhase1Model.create(getNewSessionPhase1Fixture({ cohortId: cohort._id, cohesionCenterId: center._id }));
      meetingPoint1 = await PointDeRassemblementModel.create(getNewPointDeRassemblementFixture());
      meetingPoint2 = await PointDeRassemblementModel.create(getNewPointDeRassemblementFixture());
      ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({ cohort: cohort.name, cohortId: cohort._id, centerId: center._id, sessionId: sessionPhase1._id, meetingPointsIds: [meetingPoint1._id] }),
      );
      ligneToPoint = await LigneToPointModel.create({ ...getNewLigneToPointFixture(), lineId: ligneBus._id, meetingPointId: meetingPoint1._id });
      planDeTransport = await PlanTransportModel.create({
        ...getPlanDeTransportFixture({
          busId: ligneBus._id,
          centerId: center._id,
          cohortId: cohort._id,
          cohort: cohort.name,
        }),
        _id: new ObjectId(ligneBus._id),
      });
      planDeTransport.pointDeRassemblements.push({
        meetingPointId: meetingPoint1._id,
        ...meetingPoint1._doc,
        busArrivalHour: ligneToPoint.busArrivalHour,
        meetingHour: ligneToPoint.meetingHour,
        departureHour: ligneToPoint.departureHour,
        returnHour: ligneToPoint.returnHour,
        transportType: ligneToPoint.transportType,
      });
      await planDeTransport.save();
      payload = {
        transportType: "bus",
        meetingHour: "08:00",
        busArrivalHour: "07:30",
        departureHour: "08:30",
        returnHour: "18:00",
        meetingPointId: meetingPoint1._id,
        newMeetingPointId: meetingPoint2._id,
        sendEmailCampaign: false,
      };
    });

    it("should return 403 if user is not an admin or a transporter", async () => {
      const res = await request(getAppHelper({ role: ROLES.REFERENT_DEPARTMENT }))
        .put(`/ligne-de-bus/${ligneBus._id}/updatePDRForLine`)
        .send(payload);

      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe(ERRORS.OPERATION_UNAUTHORIZED);
    });

    it("should return 404 if ligne bus is not found", async () => {
      const fakeLigneBus = new LigneBusModel(getNewLigneBusFixture());
      const res = await request(getAppHelper(userSuperAdmin)).put(`/ligne-de-bus/${fakeLigneBus._id}/updatePDRForLine`).send(payload);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("NOT_FOUND");
    });

    it("should return 400 if meeting hour is after departure hour", async () => {
      const res = await request(getAppHelper(userSuperAdmin))
        .put(`/ligne-de-bus/${ligneBus._id}/updatePDRForLine`)
        .send({ ...payload, meetingHour: "09:00", departureHour: "08:30" });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("INVALID_BODY");
    });

    it("should return 400 if bus arrival hour is after departure hour", async () => {
      const res = await request(getAppHelper(userSuperAdmin))
        .put(`/ligne-de-bus/${ligneBus._id}/updatePDRForLine`)
        .send({ ...payload, busArrivalHour: "09:00", departureHour: "08:30" });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("INVALID_BODY");
    });

    it("should update PDR for line successfully", async () => {
      const res = await request(getAppHelper(userSuperAdmin)).put(`/ligne-de-bus/${ligneBus._id}/updatePDRForLine`).send(payload);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.meetingPointsIds).toStrictEqual([meetingPoint2._id.toString()]);
    });

    it("should send email campaign when sendEmailCampaign is true", async () => {
      const updatePDRForLineSpy = jest.spyOn(ligneDeBusService, "updatePDRForLine").mockResolvedValue(ligneBus);
      (sendTemplate as jest.Mock).mockResolvedValue({});
      const res = await request(getAppHelper(userSuperAdmin))
        .put(`/ligne-de-bus/${ligneBus._id}/updatePDRForLine`)
        .send({ ...payload, sendEmailCampaign: true });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(updatePDRForLineSpy).toHaveBeenCalledWith(ligneBus._id.toString(), expect.objectContaining({ sendEmailCampaign: true }), expect.objectContaining(userSuperAdmin));
      updatePDRForLineSpy.mockRestore();
    });
  });
});
