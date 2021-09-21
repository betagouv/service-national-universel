require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const { getNewApplicationFixture } = require("./fixtures/application");
const getNewMissionFixture = require("./fixtures/mission");
const getNewReferentFixture = require("./fixtures/referent");
const getNewYoungFixture = require("./fixtures/young");
const getAppHelper = require("./helpers/app");
const { createApplication, notExistingApplicationId } = require("./helpers/application");
const { dbConnect, dbClose } = require("./helpers/db");
const { notExisitingMissionId, createMissionHelper, getMissionByIdHelper } = require("./helpers/mission");
const { createReferentHelper } = require("./helpers/referent");
const { notExistingYoungId, createYoungHelper, getYoungByIdHelper } = require("./helpers/young");
const { SENDINBLUE_TEMPLATES } = require("snu-lib/constants");

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Application", () => {
  describe("POST /application", () => {
    it("should return 404 when young is not found", async () => {
      const application = getNewApplicationFixture();
      const res = await request(getAppHelper())
        .post("/application")
        .send({ ...application, youngId: notExistingYoungId, missionId: notExisitingMissionId });
      expect(res.status).toBe(404);
    });
    it("should return 404 when mission is not found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const application = getNewApplicationFixture();
      const res = await request(getAppHelper())
        .post("/application")
        .send({ ...application, youngId: young._id, missionId: notExisitingMissionId });
      expect(res.status).toBe(404);
    });
    it("should only allow young to apply for themselves", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const secondYoung = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      const mission = await createMissionHelper(getNewMissionFixture());
      const application = getNewApplicationFixture();

      // Successful application
      let res = await request(getAppHelper())
        .post("/application")
        .send({ ...application, youngId: young._id, missionId: mission._id });
      expect(res.status).toBe(200);
      expect(res.body.data.youngId).toBe(young._id.toString());

      // Failed application
      res = await request(getAppHelper())
        .post("/application")
        .send({ ...application, youngId: secondYoung._id, missionId: mission._id });
      expect(res.status).toBe(400);

      passport.user = previous;
    });
    it("should create an application when priority is given", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const mission = await createMissionHelper(getNewMissionFixture());
      const application = getNewApplicationFixture();
      const res = await request(getAppHelper())
        .post("/application")
        .send({ ...application, youngId: young._id, missionId: mission._id });
      expect(res.status).toBe(200);
      expect(res.body.data.youngId).toBe(young._id.toString());
    });
    it("should create an application when no priority is given", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const mission = await createMissionHelper(getNewMissionFixture());
      await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });
      const { priority, ...application } = getNewApplicationFixture();
      const res = await request(getAppHelper())
        .post("/application")
        .send({ ...application, youngId: young._id, missionId: mission._id });
      expect(res.status).toBe(200);
      expect(res.body.data.priority).toBe("2");
      expect(res.body.data.youngId).toBe(young._id.toString());
    });
    it("should update young status", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const mission = await createMissionHelper(getNewMissionFixture());
      const application = getNewApplicationFixture();
      const res = await request(getAppHelper())
        .post("/application")
        .send({ ...application, youngId: young._id, missionId: mission._id, status: "WAITING_VALIDATION" });
      expect(res.status).toBe(200);

      const updatedYoung = await getYoungByIdHelper(young._id);
      expect(updatedYoung.statusPhase2).toBe("IN_PROGRESS");
      expect([...updatedYoung.phase2ApplicationStatus]).toStrictEqual(["WAITING_VALIDATION"]);
    });
    it("should update mission places left status", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const mission = await createMissionHelper({ ...getNewMissionFixture(), placesLeft: 100, placesTotal: 100 });
      const application = getNewApplicationFixture();
      const res = await request(getAppHelper())
        .post("/application")
        .send({ ...application, youngId: young._id, missionId: mission._id, status: "DONE" });
      expect(res.status).toBe(200);

      const updatedMission = await getMissionByIdHelper(mission._id);
      expect(updatedMission.placesLeft).toBe(99);
    });
  });

  describe("PUT /application", () => {
    it("should update application", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const mission = await createMissionHelper(getNewMissionFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });
      const res = await request(getAppHelper()).put("/application").send({ priority: "1", status: "DONE", _id: application._id.toString() });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("DONE");
    });
    it("should only allow young to update for themselves", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const secondYoung = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      const mission = await createMissionHelper(getNewMissionFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });
      const secondApplication = await createApplication({ ...getNewApplicationFixture(), youngId: secondYoung._id, missionId: mission._id });

      // Successful update
      let res = await request(getAppHelper()).put("/application").send({ priority: "1", status: "DONE", _id: application._id.toString() });
      expect(res.status).toBe(200);

      // Failed update (not allowed)
      res = await request(getAppHelper()).put("/application").send({ priority: "1", status: "DONE", _id: secondApplication._id.toString() });
      expect(res.status).toBe(401);

      // Failed update (wrong young id)
      res = await request(getAppHelper())
        .put("/application")
        .send({ priority: "1", status: "DONE", _id: application._id.toString(), youngId: secondYoung._id });
      expect(res.status).toBe(400);

      passport.user = previous;
    });
  });

  describe("GET /application/:id", () => {
    it("should return 404 when application is not found", async () => {
      const res = await request(getAppHelper()).get(`/application/${notExistingApplicationId}`);
      expect(res.status).toBe(404);
    });
    it("should return application", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const mission = await createMissionHelper(getNewMissionFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });
      const res = await request(getAppHelper()).get("/application/" + application._id);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("WAITING_VALIDATION");
    });
    it("should be only accessible by referent", async () => {
      const passport = require("passport");
      await request(getAppHelper()).put(`/application/${notExistingApplicationId}`).send();
      expect(passport.lastTypeCalledOnAuthenticate).toEqual("referent");
    });
  });

  describe("POST /application/:id/notify/:template", () => {
    it("should return 404 when application is not found", async () => {
      const res = await request(getAppHelper()).post(`/application/${notExistingApplicationId}/notify/foo`).send({});
      expect(res.status).toBe(404);
    });
    it("should return 404 when young is not found", async () => {
      const application = await createApplication(getNewApplicationFixture());
      const res = await request(getAppHelper()).post(`/application/${application._id}/notify/foo`).send({});
      expect(res.status).toBe(404);
    });
    it("should return 404 when mission is not found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id });
      const res = await request(getAppHelper()).post(`/application/${application._id}/notify/foo`).send({});
      expect(res.status).toBe(404);
    });
    it("should return 404 when template is not found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const referent = await createReferentHelper(getNewReferentFixture());
      const mission = await createMissionHelper({ ...getNewMissionFixture(), tutorId: referent._id });
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });

      const res = await request(getAppHelper()).post(`/application/${application._id}/notify/foo`).send({});
      expect(res.status).toBe(404);
    });
    it("should return 200 when template is found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const referent = await createReferentHelper(getNewReferentFixture());
      const mission = await createMissionHelper({ ...getNewMissionFixture(), tutorId: referent._id });
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });
      for (const template of [
        SENDINBLUE_TEMPLATES.referent.NEW_APPLICATION,
        SENDINBLUE_TEMPLATES.referent.YOUNG_VALIDATED,
        SENDINBLUE_TEMPLATES.young.VALIDATE_APPLICATION,
        SENDINBLUE_TEMPLATES.referent.CANCEL_APPLICATION,
        SENDINBLUE_TEMPLATES.young.REFUSE_APPLICATION,
      ]) {
        const res = await request(getAppHelper()).post(`/application/${application._id}/notify/${template}`).send({});
        expect(res.status).toBe(200);
      }
    });
    it("should only allow young to send application for themselves", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const referent = await createReferentHelper(getNewReferentFixture());
      const mission = await createMissionHelper({ ...getNewMissionFixture(), tutorId: referent._id });
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });
      const secondYoung = await createYoungHelper(getNewYoungFixture());
      const secondApplication = await createApplication({ ...getNewApplicationFixture(), youngId: secondYoung._id, missionId: mission._id });

      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      // Successful request
      let res = await request(getAppHelper())
        .post(`/application/${application._id}/notify/${SENDINBLUE_TEMPLATES.referent.NEW_APPLICATION}`)
        .send({});
      expect(res.status).toBe(200);

      // Failed request (not allowed)
      res = await request(getAppHelper())
        .post(`/application/${secondApplication._id}/notify/${SENDINBLUE_TEMPLATES.referent.NEW_APPLICATION}`)
        .send({});
      expect(res.status).toBe(401);

      passport.user = previous;
    });
  });
});
