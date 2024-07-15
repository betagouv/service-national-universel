const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
const { createPointDeRassemblementWithBus, notExistingMeetingPointId } = require("./helpers/PlanDeTransport/pointDeRassemblement");
const { createSessionPhase1 } = require("./helpers/sessionPhase1");
const { createCohesionCenter } = require("./helpers/cohesionCenter");
const getNewPointDeRassemblementFixture = require("./fixtures/PlanDeTransport/pointDeRassemblement");
const { getNewCohesionCenterFixture } = require("./fixtures/cohesionCenter");
const { getNewSessionPhase1Fixture } = require("./fixtures/sessionPhase1");
const { PointDeRassemblementModel, LigneToPointModel } = require("../models");

beforeAll(dbConnect);
afterAll(dbClose);

describe("Ligne To Point", () => {
  let res;
  let ligneToPoint;

  beforeEach(async () => {
    const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
    const sessionPhase1 = await createSessionPhase1({ ...getNewSessionPhase1Fixture(), cohesionCenterId: cohesionCenter._id });
    const result = await createPointDeRassemblementWithBus(getNewPointDeRassemblementFixture(), cohesionCenter._id, sessionPhase1._id);
    ligneToPoint = result.ligneToPoint;
  });

  afterEach(async () => {
    await LigneToPointModel.deleteMany();
    await PointDeRassemblementModel.deleteMany();
  });

  describe("GET meeting-point/:meetingPointId", () => {
    it("should return 404 and NOT_FOUND code if meetingPointId is not existing", async () => {
      res = await request(getAppHelper()).get(`/ligne-to-point/meeting-point/${notExistingMeetingPointId}`).send();
      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({ ok: false, code: "NOT_FOUND" });
    });

    it("should return 404 if meetingPoint is not found", async () => {
      await PointDeRassemblementModel.deleteMany();
      res = await request(getAppHelper()).get(`/ligne-to-point/meeting-point/${ligneToPoint.meetingPointId}`).send();
      expect(res.status).toBe(404);
    });

    it("should return the ligneToPoint and meetingPoint data if everything is valid", async () => {
      res = await request(getAppHelper()).get(`/ligne-to-point/meeting-point/${ligneToPoint.meetingPointId}`).send();
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          meetingPoint: expect.objectContaining({
            _id: expect.any(String),
          }),
        }),
      );
    });
    it("should return 400 and INVALID_PARAMS code if meetingPointId is not the good format", async () => {
      res = await request(getAppHelper()).get("/ligne-to-point/meeting-point/123").send();
      expect(res.status).toBe(400);
      expect(res.body).toStrictEqual({ ok: false, code: "INVALID_PARAMS" });
    });

    it("should return 500 and SERVER_ERROR code on server error", async () => {
      // Force a server error here e.g. by using a mock to throw an error when a model method is called
      jest.spyOn(LigneToPointModel, "findOne").mockRejectedValue(new Error("Mock server error"));

      res = await request(getAppHelper()).get(`/ligne-to-point/meeting-point/${ligneToPoint.meetingPointId}`).send();
      expect(res.status).toBe(500);
      expect(res.body).toStrictEqual({ ok: false, code: "SERVER_ERROR" });

      // Restore the original behavior after test
      jest.restoreAllMocks();
    });
  });
  describe("DELETE /:id", () => {
    // Modifier la route pour valider id: Joi.string().length(24).hex().required() et mettre un id trop cour en param ????
    it("should return 400 and INVALID_PARAMS code if id is not provided", async () => {
      res = await request(getAppHelper()).delete("/ligne-to-point/123").send();
      expect(res.status).toBe(400);
      expect(res.body).toStrictEqual({ ok: false, code: "INVALID_PARAMS" });
    });

    it("should return 404 and NOT_FOUND code if id does not exist", async () => {
      res = await request(getAppHelper()).delete(`/ligne-to-point/${notExistingMeetingPointId}`).send();
      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({ ok: false, code: "NOT_FOUND" });
    });

    it("should return 500 and SERVER_ERROR code on server error", async () => {
      jest.spyOn(LigneToPointModel, "findById").mockRejectedValue(new Error("Mock server error"));
      res = await request(getAppHelper()).delete(`/ligne-to-point/${ligneToPoint._id}`).send();
      expect(res.status).toBe(500);
      expect(res.body).toStrictEqual({ ok: false, code: "SERVER_ERROR" });

      jest.restoreAllMocks();
    });
  });
});
