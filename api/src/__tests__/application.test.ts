import request from "supertest";
import { getNewApplicationFixture } from "./fixtures/application";
import getNewMissionFixture from "./fixtures/mission";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import getNewCohortFixture from "./fixtures/cohort";
import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { createApplication, notExistingApplicationId } from "./helpers/application";
import { dbConnect, dbClose } from "./helpers/db";
import { notExisitingMissionId, createMissionHelper, getMissionByIdHelper } from "./helpers/mission";
import { createReferentHelper } from "./helpers/referent";
import { notExistingYoungId, createYoungHelper, getYoungByIdHelper } from "./helpers/young";
import { createCohortHelper } from "./helpers/cohort";
import { Types } from "mongoose";
const { ObjectId } = Types;
import { APPLICATION_STATUS, COHORT_STATUS, SENDINBLUE_TEMPLATES, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, ROLES, ROLE_JEUNE, PERMISSION_RESOURCES, PERMISSION_ACTIONS } from "snu-lib";
import { PermissionModel } from "../models/permissions/permission";
import { addPermissionHelper } from "./helpers/permissions";
import { getAuthorizationToApply } from "../application/applicationService";

jest.setTimeout(60_000);

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
}));

beforeAll(async () => {
  await dbConnect();
  await PermissionModel.deleteMany({ roles: { $in: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.RESPONSIBLE, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLE_JEUNE] } });
  await addPermissionHelper([ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.RESPONSIBLE, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT], PERMISSION_RESOURCES.APPLICATION, PERMISSION_ACTIONS.FULL);
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.PATCH, PERMISSION_ACTIONS.READ);
  await addPermissionHelper([ROLE_JEUNE], PERMISSION_RESOURCES.APPLICATION, PERMISSION_ACTIONS.FULL, [
    {
      where: [
        { source: "_id", field: "youngId" },
        { source: "_id", resource: "young", field: "_id" },
      ],
      blacklist: [],
      whitelist: [],
    },
  ]);
});
afterAll(dbClose);
afterEach(resetAppAuth);

describe("Application", () => {
  describe("POST /application", () => {
    beforeEach(resetAppAuth);
    it("should return 404 when young is not found", async () => {
      const application = getNewApplicationFixture();
      const res = await request(await getAppHelperWithAcl())
        .post("/application")
        .send({ ...application, youngId: notExistingYoungId, missionId: notExisitingMissionId });
      expect(res.status).toBe(404);
    });
    it("should return 404 when mission is not found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const application = getNewApplicationFixture();
      const res = await request(await getAppHelperWithAcl())
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
      let res = await request(await getAppHelperWithAcl(young, "young"))
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
      const res = await request(await getAppHelperWithAcl(young, "young"))
        .post("/application")
        .send({ ...application, youngId: secondYoung._id, missionId: mission._id });
      expect(res.status).toBe(400);
    });
    it("should create an application when priority is given", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      const young = await createYoungHelper(getNewYoungFixture({ cohortId: cohort._id, statusPhase1: YOUNG_STATUS_PHASE1.DONE }));
      const mission = await createMissionHelper(getNewMissionFixture());
      const application = getNewApplicationFixture();
      const res = await request(await getAppHelperWithAcl())
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
      const res = await request(await getAppHelperWithAcl())
        .post("/application")
        .send({ ...application, youngId: young._id, missionId: mission2._id });
      expect(res.status).toBe(200);
      expect(res.body.data.priority).toBe("2");
      expect(res.body.data.youngId).toBe(young._id.toString());
    });
    it("should update young status", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      const young = await createYoungHelper(getNewYoungFixture({ cohortId: cohort._id, statusPhase1: YOUNG_STATUS_PHASE1.DONE }));
      const mission = await createMissionHelper(getNewMissionFixture());
      const application = getNewApplicationFixture();
      const res = await request(await getAppHelperWithAcl())
        .post("/application")
        .send({ ...application, youngId: young._id, missionId: mission._id, status: "WAITING_VALIDATION" });
      expect(res.status).toBe(200);

      const updatedYoung = await getYoungByIdHelper(young._id);
      expect(updatedYoung?.statusPhase2).toBe("IN_PROGRESS");
      expect([...updatedYoung!.phase2ApplicationStatus]).toStrictEqual(["WAITING_VALIDATION"]);
    });
    it("should update mission places left status", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      const young = await createYoungHelper(getNewYoungFixture({ cohortId: cohort._id, statusPhase1: YOUNG_STATUS_PHASE1.DONE }));
      const mission = await createMissionHelper({ ...getNewMissionFixture(), placesLeft: 100, placesTotal: 100 });
      const application = getNewApplicationFixture();
      const res = await request(await getAppHelperWithAcl())
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
      const res = await request(await getAppHelperWithAcl(young))
        .post("/application")
        .send({ ...application, youngId: young._id, missionId: mission._id });
      expect(res.status).toBe(403);
    });
    it("should return 403 when cohort is archived", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ status: COHORT_STATUS.ARCHIVED }));
      const young = await createYoungHelper(getNewYoungFixture({ cohort: cohort.name, cohortId: cohort._id }));
      const mission = await createMissionHelper(getNewMissionFixture());
      const application = getNewApplicationFixture();
      const res = await request(await getAppHelperWithAcl(young))
        .post("/application")
        .send({ ...application, youngId: young._id, missionId: mission._id });
      expect(res.status).toBe(403);
    });
    it("should return 403 when young has not finished phase1", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test" }));
      const young = await createYoungHelper(getNewYoungFixture({ cohort: cohort.name, cohortId: cohort._id, statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION }));
      const mission = await createMissionHelper(getNewMissionFixture());
      const application = getNewApplicationFixture();
      const res = await request(await getAppHelperWithAcl(young))
        .post("/application")
        .send({ ...application, youngId: young._id, missionId: mission._id });
      expect(res.status).toBe(403);
    });

    describe("Admin creating applications", () => {
      it("should allow admin to create application for young with phase1 DONE and phase2 WAITING_REALISATION", async () => {
        const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test" }));
        const young = await createYoungHelper(
          getNewYoungFixture({
            cohort: cohort.name,
            cohortId: cohort._id,
            statusPhase1: YOUNG_STATUS_PHASE1.DONE,
            statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
          }),
        );
        const mission = await createMissionHelper(getNewMissionFixture());
        const application = getNewApplicationFixture();
        const admin = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));

        const res = await request(await getAppHelperWithAcl(admin))
          .post("/application")
          .send({ ...application, youngId: young._id, missionId: mission._id });
        expect(res.status).toBe(200);
        expect(res.body.data.youngId).toBe(young._id.toString());
      });

      it("should allow admin to create application for young with phase1 EXEMPTED and phase2 IN_PROGRESS", async () => {
        const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test" }));
        const young = await createYoungHelper(
          getNewYoungFixture({
            cohort: cohort.name,
            cohortId: cohort._id,
            statusPhase1: YOUNG_STATUS_PHASE1.EXEMPTED,
            statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
          }),
        );
        const mission = await createMissionHelper(getNewMissionFixture());
        const application = getNewApplicationFixture();
        const admin = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));

        const res = await request(await getAppHelperWithAcl(admin))
          .post("/application")
          .send({ ...application, youngId: young._id, missionId: mission._id });
        expect(res.status).toBe(200);
        expect(res.body.data.youngId).toBe(young._id.toString());
      });
      
      it("should allow admin to create application even if cohort is archived", async () => {
        const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test", status: COHORT_STATUS.ARCHIVED }));
        const young = await createYoungHelper(
          getNewYoungFixture({
            cohort: cohort.name,
            cohortId: cohort._id,
            statusPhase1: YOUNG_STATUS_PHASE1.DONE,
            statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
          }),
        );
        const mission = await createMissionHelper(getNewMissionFixture());
        const application = getNewApplicationFixture();
        const admin = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));

        const res = await request(await getAppHelperWithAcl(admin))
          .post("/application")
          .send({ ...application, youngId: young._id, missionId: mission._id });
        expect(res.status).toBe(200);
        expect(res.body.data.youngId).toBe(young._id.toString());
      });

      it("should return 403 when admin tries to create application for young with phase2 VALIDATED", async () => {
        const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test" }));
        const young = await createYoungHelper(
          getNewYoungFixture({
            cohort: cohort.name,
            cohortId: cohort._id,
            statusPhase1: YOUNG_STATUS_PHASE1.DONE,
            statusPhase2: YOUNG_STATUS_PHASE2.VALIDATED,
          }),
        );
        const mission = await createMissionHelper(getNewMissionFixture());
        const application = getNewApplicationFixture();
        const admin = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));

        const res = await request(await getAppHelperWithAcl(admin))
          .post("/application")
          .send({ ...application, youngId: young._id, missionId: mission._id });
        expect(res.status).toBe(403);
      });

      it("should return 403 when admin tries to create application for young with phase1 not validated", async () => {
        const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test" }));
        const young = await createYoungHelper(
          getNewYoungFixture({
            cohort: cohort.name,
            cohortId: cohort._id,
            statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
            statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
          }),
        );
        const mission = await createMissionHelper(getNewMissionFixture());
        const application = getNewApplicationFixture();
        const admin = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));

        const res = await request(await getAppHelperWithAcl(admin))
          .post("/application")
          .send({ ...application, youngId: young._id, missionId: mission._id });
        expect(res.status).toBe(403);
      });
    });
  });

  describe("PUT /application", () => {
    it("should update application", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const mission = await createMissionHelper(getNewMissionFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });
      const res = await request(await getAppHelperWithAcl())
        .put("/application")
        .send({ priority: "1", status: "DONE", _id: application._id.toString() });
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
      let res = await request(await getAppHelperWithAcl())
        .put("/application")
        .send({ priority: "1", status: "DONE", _id: application._id.toString() });
      expect(res.status).toBe(200);

      // Failed update (not allowed)
      res = await request(await getAppHelperWithAcl(young, "young"))
        .put("/application")
        .send({ priority: "1", status: "DONE", _id: secondApplication._id.toString() });
      expect(res.status).toBe(403);

      // Failed update (wrong young id)
      res = await request(await getAppHelperWithAcl(young, "young"))
        .put("/application")
        .send({ priority: "1", status: "DONE", _id: application._id.toString(), youngId: secondYoung._id });
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
        await request(await getAppHelperWithAcl())
          .put("/application")
          .send({ priority: "1", status, _id: application._id.toString() });
      }
      const updatedYoung = await getYoungByIdHelper(young._id);
      expect(updatedYoung!.phase2NumberHoursEstimated).toBe("5");
      expect(updatedYoung!.phase2NumberHoursDone).toBe("1");
    });
  });

  describe("GET /application/:id", () => {
    it("should return 404 when application is not found", async () => {
      const res = await request(await getAppHelperWithAcl()).get(`/application/${notExistingApplicationId}`);
      expect(res.status).toBe(404);
    });
    it("should return application", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const mission = await createMissionHelper(getNewMissionFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });
      const res = await request(await getAppHelperWithAcl()).get("/application/" + application._id);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("WAITING_VALIDATION");
    });
    it("should be only accessible by referent", async () => {
      await request(await getAppHelperWithAcl())
        .put(`/application/${notExistingApplicationId}`)
        .send();
      expect(require("passport").lastTypeCalledOnAuthenticate).toEqual("referent");
    });
  });

  describe("POST /application/:id/notify/:template", () => {
    it("should return 404 when application is not found", async () => {
      const res = await request(await getAppHelperWithAcl())
        .post(`/application/${notExistingApplicationId}/notify/foo`)
        .send({});
      expect(res.status).toBe(404);
    });
    it("should return 404 when young is not found", async () => {
      const application = await createApplication(getNewApplicationFixture());
      const res = await request(await getAppHelperWithAcl())
        .post(`/application/${application._id}/notify/foo`)
        .send({});
      expect(res.status).toBe(404);
    });
    it("should return 404 when mission is not found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id });
      const res = await request(await getAppHelperWithAcl())
        .post(`/application/${application._id}/notify/foo`)
        .send({});
      expect(res.status).toBe(404);
    });
    it("should return 404 when template is not found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const referent = await createReferentHelper(getNewReferentFixture());
      const mission = await createMissionHelper({ ...getNewMissionFixture(), tutorId: referent._id });
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });

      const res = await request(await getAppHelperWithAcl())
        .post(`/application/${application._id}/notify/foo`)
        .send({});
      expect(res.status).toBe(404);
    });
    it("should return 200 when template is found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const referent = await createReferentHelper(getNewReferentFixture());
      const mission = await createMissionHelper({ ...getNewMissionFixture(), tutorId: referent._id });
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });
      for (const template of [
        SENDINBLUE_TEMPLATES.referent.YOUNG_VALIDATED,
        SENDINBLUE_TEMPLATES.young.VALIDATE_APPLICATION,
        SENDINBLUE_TEMPLATES.referent.CANCEL_APPLICATION,
        SENDINBLUE_TEMPLATES.young.REFUSE_APPLICATION,
      ]) {
        const res = await request(await getAppHelperWithAcl())
          .post(`/application/${application._id}/notify/${template}`)
          .send({});
        expect(res.status).toBe(200);
      }
    });

    it("should contain parent1 and parent2 in emailTo", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const referent = await createReferentHelper(getNewReferentFixture());
      const mission = await createMissionHelper({ ...getNewMissionFixture(), tutorId: referent._id });
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });

      const sendTemplateSpy = jest.spyOn(require("../brevo"), "sendTemplate");
      for (const template of [SENDINBLUE_TEMPLATES.young.VALIDATE_APPLICATION, SENDINBLUE_TEMPLATES.young.REFUSE_APPLICATION]) {
        await request(await getAppHelperWithAcl())
          .post(`/application/${application._id}/notify/${template}`)
          .send({});
        expect(sendTemplateSpy).toHaveBeenCalledWith(
          template,
          expect.objectContaining({
            emailTo: [
              { name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail },
              { name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email },
              { name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email },
            ],
          }),
        );
        const lastCall = sendTemplateSpy.mock.calls[sendTemplateSpy.mock.calls.length - 1];
        expect((lastCall[1] as any).emailTo).toHaveLength(3);
      }
    });

    it("should not send email to parent2 if parent2 is not defined", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ parent2FirstName: "", parent2LastName: "", parent2Email: "" }));
      const referent = await createReferentHelper(getNewReferentFixture());
      const mission = await createMissionHelper({ ...getNewMissionFixture(), tutorId: referent._id });
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });
      const sendTemplateSpy = jest.spyOn(require("../brevo"), "sendTemplate");
      await request(await getAppHelperWithAcl())
        .post(`/application/${application._id}/notify/${SENDINBLUE_TEMPLATES.young.VALIDATE_APPLICATION}`)
        .send({});
      expect(sendTemplateSpy).toHaveBeenCalledWith(
        SENDINBLUE_TEMPLATES.young.VALIDATE_APPLICATION,
        expect.not.objectContaining({ emailTo: [{ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email }] }),
      );
      expect(sendTemplateSpy).toHaveBeenCalledWith(
        SENDINBLUE_TEMPLATES.young.VALIDATE_APPLICATION,
        expect.objectContaining({
          emailTo: expect.arrayContaining([
            { name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail },
            { name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email },
          ]),
        }),
      );
      const lastCall = sendTemplateSpy.mock.calls[sendTemplateSpy.mock.calls.length - 1];
      expect((lastCall[1] as any).emailTo).toHaveLength(2);
    });
  });
});

describe("GET /application/:id/patches", () => {
  it("should return 404 if application not found", async () => {
    const applicationId = new ObjectId();
    const res = await request(await getAppHelperWithAcl())
      .get(`/application/${applicationId}/patches`)
      .send();
    expect(res.statusCode).toEqual(404);
  });
  it("should return 403 if not admin", async () => {
    const application = await createApplication(getNewApplicationFixture());
    application.missionName = "MY NEW NAME";
    await application.save();

    const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE }))
      .get(`/application/${application._id}/patches`)
      .send();
    expect(res.status).toBe(403);
  });
  it("should return 200 if application found with patches", async () => {
    const application = await createApplication(getNewApplicationFixture());
    application.missionName = "MY NEW NAME";
    await application.save();
    const res = await request(await getAppHelperWithAcl())
      .get(`/application/${application._id}/patches`)
      .send();
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
    await request(await getAppHelperWithAcl())
      .get(`/application/${applicationId}/patches`)
      .send();
    expect(passport.lastTypeCalledOnAuthenticate).toEqual("referent");
  });
});

describe("Referent regional/departmental creating applications", () => {
  it("should allow REFERENT_REGION to create application for young with phase1 DONE, phase2 IN_PROGRESS and 1 application DONE", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test" }));
    const young = await createYoungHelper(
      getNewYoungFixture({
        cohort: cohort.name,
        cohortId: cohort._id,
        statusPhase1: YOUNG_STATUS_PHASE1.DONE,
        statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
      }),
    );
    const mission = await createMissionHelper(getNewMissionFixture());
    const existingApplication = await createApplication({
      ...getNewApplicationFixture(),
      youngId: young._id,
      missionId: mission._id,
      status: APPLICATION_STATUS.DONE,
    });

    const newMission = await createMissionHelper(getNewMissionFixture());
    const application = getNewApplicationFixture();
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_REGION, region: young.region as string }));

    const res = await request(await getAppHelperWithAcl(referent))
      .post("/application")
      .send({ ...application, youngId: young._id, missionId: newMission._id });
    expect(res.status).toBe(200);
    expect(res.body.data.youngId).toBe(young._id.toString());
  });

  it("should allow REFERENT_DEPARTMENT to create application for young with phase1 EXEMPTED, phase2 WAITING_REALISATION and 1 application DONE", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test" }));
    const young = await createYoungHelper(
      getNewYoungFixture({
        cohort: cohort.name,
        cohortId: cohort._id,
        statusPhase1: YOUNG_STATUS_PHASE1.EXEMPTED,
        statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      }),
    );
    const mission = await createMissionHelper(getNewMissionFixture());
    const existingApplication = await createApplication({
      ...getNewApplicationFixture(),
      youngId: young._id,
      missionId: mission._id,
      status: APPLICATION_STATUS.DONE,
    });

    const newMission = await createMissionHelper(getNewMissionFixture());
    const application = getNewApplicationFixture();
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: young.department ? [young.department as string] : [] }));

    const res = await request(await getAppHelperWithAcl(referent))
      .post("/application")
      .send({ ...application, youngId: young._id, missionId: newMission._id });
    expect(res.status).toBe(200);
    expect(res.body.data.youngId).toBe(young._id.toString());
  });

  it("should return 403 when REFERENT_REGION tries to create application for young in archived cohort without application DONE", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test", status: COHORT_STATUS.ARCHIVED }));
    const young = await createYoungHelper(
      getNewYoungFixture({
        cohort: cohort.name,
        cohortId: cohort._id,
        statusPhase1: YOUNG_STATUS_PHASE1.DONE,
        statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
      }),
    );
    const mission = await createMissionHelper(getNewMissionFixture());
    const application = getNewApplicationFixture();
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_REGION, region: young.region as string }));

    const res = await request(await getAppHelperWithAcl(referent))
      .post("/application")
      .send({ ...application, youngId: young._id, missionId: mission._id });
    expect(res.status).toBe(403);
  });

  it("should allow REFERENT_REGION to create application for young in non-archived cohort without completed mission", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test", status: COHORT_STATUS.PUBLISHED }));
    const young = await createYoungHelper(
      getNewYoungFixture({
        cohort: cohort.name,
        cohortId: cohort._id,
        statusPhase1: YOUNG_STATUS_PHASE1.DONE,
        statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
      }),
    );
    const mission = await createMissionHelper(getNewMissionFixture());
    const application = getNewApplicationFixture();
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_REGION, region: young.region as string }));

    const res = await request(await getAppHelperWithAcl(referent))
      .post("/application")
      .send({ ...application, youngId: young._id, missionId: mission._id });
    expect(res.status).toBe(200);
    expect(res.body.data.youngId).toBe(young._id.toString());
  });

  it("should return 403 when REFERENT_DEPARTMENT tries to create application for young in archived cohort without completed mission", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test", status: COHORT_STATUS.ARCHIVED }));
    const young = await createYoungHelper(
      getNewYoungFixture({
        cohort: cohort.name,
        cohortId: cohort._id,
        statusPhase1: YOUNG_STATUS_PHASE1.DONE,
        statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
      }),
    );
    const mission = await createMissionHelper(getNewMissionFixture());
    const application = getNewApplicationFixture();
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: young.department ? [young.department as string] : [] }));

    const res = await request(await getAppHelperWithAcl(referent))
      .post("/application")
      .send({ ...application, youngId: young._id, missionId: mission._id });
    expect(res.status).toBe(403);
  });

  it("should return 403 when REFERENT_DEPARTMENT tries to create application for young with phase2 VALIDATED", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test" }));
    const young = await createYoungHelper(
      getNewYoungFixture({
        cohort: cohort.name,
        cohortId: cohort._id,
        statusPhase1: YOUNG_STATUS_PHASE1.DONE,
        statusPhase2: YOUNG_STATUS_PHASE2.VALIDATED,
      }),
    );
    const mission = await createMissionHelper(getNewMissionFixture());
    const existingApplication = await createApplication({
      ...getNewApplicationFixture(),
      youngId: young._id,
      missionId: mission._id,
      status: APPLICATION_STATUS.DONE,
    });

    const newMission = await createMissionHelper(getNewMissionFixture());
    const application = getNewApplicationFixture();
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: young.department ? [young.department as string] : [] }));

    const res = await request(await getAppHelperWithAcl(referent))
      .post("/application")
      .send({ ...application, youngId: young._id, missionId: newMission._id });
    expect(res.status).toBe(403);
  });

  it("should return 403 when REFERENT_REGION tries to create application for young with phase1 not validated", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test" }));
    const young = await createYoungHelper(
      getNewYoungFixture({
        cohort: cohort.name,
        cohortId: cohort._id,
        statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
        statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
      }),
    );
    const mission = await createMissionHelper(getNewMissionFixture());
    const existingApplication = await createApplication({
      ...getNewApplicationFixture(),
      youngId: young._id,
      missionId: mission._id,
      status: APPLICATION_STATUS.DONE,
    });

    const newMission = await createMissionHelper(getNewMissionFixture());
    const application = getNewApplicationFixture();
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_REGION, region: young.region as string }));

    const res = await request(await getAppHelperWithAcl(referent))
      .post("/application")
      .send({ ...application, youngId: young._id, missionId: newMission._id });
    expect(res.status).toBe(403);
  });

  it("should update young.phase2ApplicationStatus when changing application status via multiaction", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture({ status: COHORT_STATUS.ARCHIVED }));
    const young = await createYoungHelper({
      ...getNewYoungFixture(),
      cohort: cohort.name,
      cohortId: cohort._id,
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
      phase2ApplicationStatus: [APPLICATION_STATUS.VALIDATED],
    });

    const mission = await createMissionHelper(getNewMissionFixture());
    const application = await createApplication({
      ...getNewApplicationFixture(),
      youngId: young._id,
      missionId: mission._id,
      status: APPLICATION_STATUS.VALIDATED,
    });

    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));

    const res = await request(await getAppHelperWithAcl(referent))
      .post(`/application/multiaction/change-status/${APPLICATION_STATUS.DONE}`)
      .send({ ids: [application._id.toString()] });

    expect(res.status).toBe(200);

    const updatedYoung = await getYoungByIdHelper(young._id.toString());
    expect(updatedYoung).toBeTruthy();
    expect(updatedYoung!.phase2ApplicationStatus).toContain(APPLICATION_STATUS.DONE);
  });
});

describe("getAuthorizationToApply", () => {
  it("should return specific message when phase1 is not validated", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture({ status: COHORT_STATUS.PUBLISHED }));
    const young = await createYoungHelper({
      ...getNewYoungFixture(),
      statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [],
    });
    const mission = await createMissionHelper({ ...getNewMissionFixture(), placesLeft: 10 });

    const result = await getAuthorizationToApply(mission, young, cohort);

    expect(result.canApply).toBe(false);
    expect(result.message).toContain("Vous devez avoir validé votre phase 1 pour candidater");
  });

  it("should return specific message when phase2 is already validated", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture({ status: COHORT_STATUS.PUBLISHED }));
    const young = await createYoungHelper({
      ...getNewYoungFixture(),
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.VALIDATED,
      phase2ApplicationStatus: [APPLICATION_STATUS.DONE],
    });
    const mission = await createMissionHelper({ ...getNewMissionFixture(), placesLeft: 10 });

    const result = await getAuthorizationToApply(mission, young, cohort);

    expect(result.canApply).toBe(false);
    expect(result.message).toContain("Votre phase 2 est déjà validée");
  });

  it("should return specific message when cohort is archived and no mission DONE", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture({ status: COHORT_STATUS.ARCHIVED }));
    const young = await createYoungHelper({
      ...getNewYoungFixture(),
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
      phase2ApplicationStatus: [APPLICATION_STATUS.VALIDATED],
    });
    const mission = await createMissionHelper({ ...getNewMissionFixture(), placesLeft: 10 });

    const result = await getAuthorizationToApply(mission, young, cohort);

    expect(result.canApply).toBe(false);
    expect(result.message).toContain("Votre cohorte est archivée");
    expect(result.message).toContain("vous devez d'abord avoir effectué au moins une mission");
  });

  it("should allow application when cohort is archived but has mission DONE", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture({ status: COHORT_STATUS.ARCHIVED }));
    const young = await createYoungHelper({
      ...getNewYoungFixture(),
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
      phase2ApplicationStatus: [APPLICATION_STATUS.DONE],
    });
    const mission = await createMissionHelper({ ...getNewMissionFixture(), placesLeft: 10 });

    const result = await getAuthorizationToApply(mission, young, cohort);

    expect(result.canApply).toBe(true);
    expect(result.message).toBe("");
  });

  it("should allow application when cohort is not archived", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture({ status: COHORT_STATUS.PUBLISHED }));
    const young = await createYoungHelper({
      ...getNewYoungFixture(),
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [],
    });
    const mission = await createMissionHelper({ ...getNewMissionFixture(), placesLeft: 10 });

    const result = await getAuthorizationToApply(mission, young, cohort);

    expect(result.canApply).toBe(true);
    expect(result.message).toBe("");
  });

  it("should return specific message when cohort is FULLY_ARCHIVED", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture({ status: COHORT_STATUS.FULLY_ARCHIVED }));
    const young = await createYoungHelper({
      ...getNewYoungFixture(),
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
      phase2ApplicationStatus: [APPLICATION_STATUS.DONE],
    });
    const mission = await createMissionHelper({ ...getNewMissionFixture(), placesLeft: 10 });

    const result = await getAuthorizationToApply(mission, young, cohort);

    expect(result.canApply).toBe(false);
    expect(result.message).toContain("Vous ne pouvez plus postuler à des missions d'engagements car la date de réalisation est dépassée");
  });

  it("should return specific message when cohort is FULLY_ARCHIVED even with mission DONE", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture({ status: COHORT_STATUS.FULLY_ARCHIVED }));
    const young = await createYoungHelper({
      ...getNewYoungFixture(),
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [APPLICATION_STATUS.DONE],
      cohesionStayPresence: "true",
    });
    const mission = await createMissionHelper({ ...getNewMissionFixture(), placesLeft: 10 });

    const result = await getAuthorizationToApply(mission, young, cohort);

    expect(result.canApply).toBe(false);
    expect(result.message).toContain("Vous ne pouvez plus postuler à des missions d'engagements car la date de réalisation est dépassée");
  });
});
