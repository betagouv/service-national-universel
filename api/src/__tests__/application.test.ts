import request from "supertest";
import { getNewApplicationFixture } from "./fixtures/application";
import getNewMissionFixture from "./fixtures/mission";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import getNewCohortFixture from "./fixtures/cohort";
import getAppHelper, { resetAppAuth } from "./helpers/app";
import { createApplication, notExistingApplicationId } from "./helpers/application";
import { dbConnect, dbClose } from "./helpers/db";
import { notExisitingMissionId, createMissionHelper, getMissionByIdHelper } from "./helpers/mission";
import { createReferentHelper } from "./helpers/referent";
import { notExistingYoungId, createYoungHelper, getYoungByIdHelper } from "./helpers/young";
import { createCohortHelper } from "./helpers/cohort";
import { SENDINBLUE_TEMPLATES, YOUNG_STATUS_PHASE1, ROLES } from "snu-lib";
import { Types } from "mongoose";
const { ObjectId } = Types;

jest.setTimeout(60_000);

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
}));

beforeAll(() => dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(dbClose);
afterEach(resetAppAuth);

describe("Application", () => {
  describe("POST /application", () => {
    beforeEach(resetAppAuth);
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
    it("should allow young to apply for themselves", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test" }));
      const young = await createYoungHelper(getNewYoungFixture({ cohort: cohort.name, cohortId: cohort._id, statusPhase1: YOUNG_STATUS_PHASE1.DONE }));

      const mission = await createMissionHelper(getNewMissionFixture());
      const application = getNewApplicationFixture();

      // Successful application
      let res = await request(getAppHelper(young))
        .post("/application")
        .send({ ...application, youngId: young._id, missionId: mission._id });
      expect(res.status).toBe(200);
      expect(res.body.data.youngId).toBe(young._id.toString());
    });
    it("should not allow young to apply for others", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test" }));
      const young = await createYoungHelper(getNewYoungFixture({ cohort: cohort.name, cohortId: cohort._id, statusPhase1: YOUNG_STATUS_PHASE1.DONE }));
      const secondYoung = await createYoungHelper(getNewYoungFixture({ cohort: cohort.name, cohortId: cohort._id, statusPhase1: YOUNG_STATUS_PHASE1.DONE }));

      const mission = await createMissionHelper(getNewMissionFixture());
      const application = getNewApplicationFixture();

      // Failed application
      const res = await request(getAppHelper(young))
        .post("/application")
        .send({ ...application, youngId: secondYoung._id, missionId: mission._id });
      expect(res.status).toBe(400);
    });
    it("should create an application when priority is given", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ cohort: "Test", statusPhase1: YOUNG_STATUS_PHASE1.DONE }));
      const mission = await createMissionHelper(getNewMissionFixture());
      const application = getNewApplicationFixture();
      const res = await request(getAppHelper())
        .post("/application")
        .send({ ...application, youngId: young._id, missionId: mission._id });
      expect(res.status).toBe(200);
      expect(res.body.data.youngId).toBe(young._id.toString());
    });
    it.skip("should create an application when no priority is given", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ cohort: "Test", statusPhase1: YOUNG_STATUS_PHASE1.DONE }));
      const mission1 = await createMissionHelper(getNewMissionFixture());
      await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission1._id });
      const mission2 = await createMissionHelper(getNewMissionFixture());
      const { ...application } = getNewApplicationFixture();
      const res = await request(getAppHelper())
        .post("/application")
        .send({ ...application, youngId: young._id, missionId: mission2._id });
      expect(res.status).toBe(200);
      expect(res.body.data.priority).toBe("2");
      expect(res.body.data.youngId).toBe(young._id.toString());
    });
    it("should update young status", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ cohort: "Test", statusPhase1: YOUNG_STATUS_PHASE1.DONE }));
      const mission = await createMissionHelper(getNewMissionFixture());
      const application = getNewApplicationFixture();
      const res = await request(getAppHelper())
        .post("/application")
        .send({ ...application, youngId: young._id, missionId: mission._id, status: "WAITING_VALIDATION" });
      expect(res.status).toBe(200);

      const updatedYoung = await getYoungByIdHelper(young._id);
      expect(updatedYoung?.statusPhase2).toBe("IN_PROGRESS");
      expect([...updatedYoung!.phase2ApplicationStatus]).toStrictEqual(["WAITING_VALIDATION"]);
    });
    it("should update mission places left status", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ cohort: "Test", statusPhase1: YOUNG_STATUS_PHASE1.DONE }));
      const mission = await createMissionHelper({ ...getNewMissionFixture(), placesLeft: 100, placesTotal: 100 });
      const application = getNewApplicationFixture();
      const res = await request(getAppHelper())
        .post("/application")
        .send({ ...application, youngId: young._id, missionId: mission._id, status: "DONE" });
      expect(res.status).toBe(200);

      const updatedMission = await getMissionByIdHelper(mission._id);
      expect(updatedMission?.placesLeft).toBe(99);
    });
    it("should return 403 when young is under 15 years old", async () => {
      const year = new Date().getFullYear();
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test" }));
      const young = await createYoungHelper(getNewYoungFixture({ cohort: cohort.name, cohortId: cohort._id, birthdateAt: new Date(`${year - 12}-01-01T00:00:00.000Z`) }));
      const mission = await createMissionHelper(getNewMissionFixture());
      const application = getNewApplicationFixture();
      const res = await request(getAppHelper(young))
        .post("/application")
        .send({ ...application, youngId: young._id, missionId: mission._id });
      expect(res.status).toBe(403);
    });
    it("should return 403 when cohort is too old", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "2019" }));
      const young = await createYoungHelper(getNewYoungFixture({ cohort: cohort.name, cohortId: cohort._id }));
      const mission = await createMissionHelper(getNewMissionFixture());
      const application = getNewApplicationFixture();
      const res = await request(getAppHelper(young))
        .post("/application")
        .send({ ...application, youngId: young._id, missionId: mission._id });
      expect(res.status).toBe(403);
    });
    it("should return 403 when young has not finished phase1", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test" }));
      const young = await createYoungHelper(getNewYoungFixture({ cohort: cohort.name, cohortId: cohort._id, statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION }));
      const mission = await createMissionHelper(getNewMissionFixture());
      const application = getNewApplicationFixture();
      const res = await request(getAppHelper(young))
        .post("/application")
        .send({ ...application, youngId: young._id, missionId: mission._id });
      expect(res.status).toBe(403);
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
      const mission = await createMissionHelper(getNewMissionFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });
      const secondApplication = await createApplication({ ...getNewApplicationFixture(), youngId: secondYoung._id, missionId: mission._id });

      // Successful update
      let res = await request(getAppHelper()).put("/application").send({ priority: "1", status: "DONE", _id: application._id.toString() });
      expect(res.status).toBe(200);

      // Failed update (not allowed)
      res = await request(getAppHelper(young)).put("/application").send({ priority: "1", status: "DONE", _id: secondApplication._id.toString() });
      expect(res.status).toBe(403);

      // Failed update (wrong young id)
      res = await request(getAppHelper(young)).put("/application").send({ priority: "1", status: "DONE", _id: application._id.toString(), youngId: secondYoung._id });
      expect(res.status).toBe(400);
    });

    it("should update young phase2NumberHoursEstimated and phase2NumberHoursDone", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      for (const status of ["IN_PROGRESS", "IN_PROGRESS", "IN_PROGRESS", "VALIDATED", "VALIDATED", "DONE"]) {
        const mission = await createMissionHelper(getNewMissionFixture());
        const application = await createApplication({
          ...getNewApplicationFixture(),
          youngId: young._id,
          missionId: mission._id,
          missionDuration: "1",
        });
        await request(getAppHelper()).put("/application").send({ priority: "1", status, _id: application._id.toString() });
      }
      const updatedYoung = await getYoungByIdHelper(young._id);
      expect(updatedYoung!.phase2NumberHoursEstimated).toBe("5");
      expect(updatedYoung!.phase2NumberHoursDone).toBe("1");
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
      await request(getAppHelper()).put(`/application/${notExistingApplicationId}`).send();
      expect(require("passport").lastTypeCalledOnAuthenticate).toEqual("referent");
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

      // Successful request
      let res = await request(getAppHelper(young)).post(`/application/${application._id}/notify/${SENDINBLUE_TEMPLATES.referent.NEW_APPLICATION}`).send({});
      expect(res.status).toBe(200);

      // Failed request (not allowed)
      res = await request(getAppHelper(young)).post(`/application/${secondApplication._id}/notify/${SENDINBLUE_TEMPLATES.referent.NEW_APPLICATION}`).send({});
      expect(res.status).toBe(403);
    });
  });
});

describe("GET /application/:id/patches", () => {
  it("should return 404 if application not found", async () => {
    const applicationId = new ObjectId();
    const res = await request(getAppHelper()).get(`/application/${applicationId}/patches`).send();
    expect(res.statusCode).toEqual(404);
  });
  it("should return 403 if not admin", async () => {
    const application = await createApplication(getNewApplicationFixture());
    application.missionName = "MY NEW NAME";
    await application.save();

    const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
      .get(`/application/${application._id}/patches`)
      .send();
    expect(res.status).toBe(403);
  });
  it("should return 200 if application found with patches", async () => {
    const application = await createApplication(getNewApplicationFixture());
    application.missionName = "MY NEW NAME";
    await application.save();
    const res = await request(getAppHelper()).get(`/application/${application._id}/patches`).send();
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ops: expect.arrayContaining([expect.objectContaining({ op: "replace", path: "/missionName", value: "MY NEW NAME" })]),
        }),
      ]),
    );
  });
  it("should be only accessible by referents", async () => {
    const passport = require("passport");
    const applicationId = new ObjectId();
    await request(getAppHelper()).get(`/application/${applicationId}/patches`).send();
    expect(passport.lastTypeCalledOnAuthenticate).toEqual("referent");
  });
});
