import { fakerFR as faker } from "@faker-js/faker";
import request from "supertest";

import { ROLES, SENDINBLUE_TEMPLATES, YOUNG_STATUS } from "snu-lib";

import { CohortModel, ReferentModel, YoungModel } from "../models";

import getAppHelper from "./helpers/app";
import getNewYoungFixture from "./fixtures/young";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewStructureFixture from "./fixtures/structure";
import { getYoungByIdHelper, deleteYoungByIdHelper, createYoungHelper, expectYoungToEqual, notExistingYoungId } from "./helpers/young";
import { getReferentsHelper, deleteReferentByIdHelper, notExistingReferentId, createReferentHelper, expectReferentToEqual, getReferentByIdHelper } from "./helpers/referent";
import { dbConnect, dbClose } from "./helpers/db";
import { createSessionPhase1, getSessionPhase1ById } from "./helpers/sessionPhase1";
import { createStructureHelper } from "./helpers/structure";
import { getNewSessionPhase1Fixture } from "./fixtures/sessionPhase1";
import { getNewApplicationFixture } from "./fixtures/application";
import { createApplication, getApplicationsHelper } from "./helpers/application";
import { createMissionHelper, getMissionsHelper } from "./helpers/mission";
import getNewMissionFixture from "./fixtures/mission";
import { createClasse } from "./helpers/classe";
import { createEtablissement } from "./helpers/etablissement";
import { createFixtureClasse } from "./fixtures/classe";
import { createFixtureEtablissement } from "./fixtures/etablissement";
import { createCohortHelper } from "./helpers/cohort";
import getNewCohortFixture from "./fixtures/cohort";
import { ObjectId } from "bson";

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  getFile: () => Promise.resolve({ Body: "" }),
  uploadFile: (path, file) => Promise.resolve({ path, file }),
}));

jest.mock("../cryptoUtils", () => ({
  ...jest.requireActual("../cryptoUtils"),
  decrypt: () => Buffer.from("test"),
  encrypt: () => Buffer.from("test"),
}));

beforeAll(dbConnect);
afterAll(dbClose);

describe("Referent", () => {
  describe("POST /referent/signup_invite/:template", () => {
    it("should invite and add referent", async () => {
      const referentFixture = getNewReferentFixture();
      const referentsBefore = await getReferentsHelper();
      const res = await request(getAppHelper()).post("/referent/signup_invite/001").send(referentFixture);
      expect(res.statusCode).toEqual(200);
      const referentsAfter = await getReferentsHelper();
      expect(referentsAfter.length).toEqual(referentsBefore.length + 1);
      await deleteReferentByIdHelper(res.body.data._id);
    });
    it("should return 400 if no templates given", async () => {
      const referentFixture = getNewReferentFixture();
      const res = await request(getAppHelper())
        .post("/referent/signup_invite/001")
        .send({ ...referentFixture, structureId: 1 });
      expect(res.statusCode).toEqual(400);
    });
    it("should return 403 if user can not invite", async () => {
      const passport = require("passport");
      passport.user.role = ROLES.RESPONSIBLE;
      const referentFixture = { ...getNewReferentFixture(), role: ROLES.ADMIN };
      const res = await request(getAppHelper()).post("/referent/signup_invite/001").send(referentFixture);
      expect(res.statusCode).toEqual(403);
      passport.user.role = ROLES.ADMIN;
    });
    it("should return 409 when user already exists", async () => {
      const fixture = getNewReferentFixture();
      const email = fixture.email?.toLowerCase();
      await createReferentHelper({ ...fixture, email });
      let res = await request(getAppHelper()).post("/referent/signup_invite/001").send(fixture);
      expect(res.status).toBe(409);
    });
  });

  describe("PUT /referent/young/:id", () => {
    async function createYoungThenUpdate(params, fields = {}) {
      const youngFixture = getNewYoungFixture();
      const originalYoung = await createYoungHelper({ ...youngFixture, ...fields });
      const modifiedYoung = { ...youngFixture, ...fields, ...params };
      const response = await request(getAppHelper()).put(`/referent/young/${originalYoung._id}`).send(modifiedYoung);
      const young = await getYoungByIdHelper(originalYoung._id);
      await deleteYoungByIdHelper(originalYoung._id);
      return { young, modifiedYoung, response };
    }
    it("should return 404 if young not found", async () => {
      const res = await request(getAppHelper()).put(`/referent/young/${notExistingYoungId}`).send();
      expect(res.statusCode).toEqual(404);
    });
    it("should update young name", async () => {
      const { young, modifiedYoung, response } = await createYoungThenUpdate({ name: faker.company.name() });
      expect(response.statusCode).toEqual(200);
      expectYoungToEqual(young, modifiedYoung);
    });
    it("should cascade young statuses when sending status WITHDRAWN", async () => {
      const { young, response } = await createYoungThenUpdate(
        {
          status: "WITHDRAWN",
        },
        {
          statusPhase1: "AFFECTED",
          statusPhase2: "WAITING_REALISATION",
          statusPhase3: "WAITING_REALISATION",
        },
      );
      expect(response.statusCode).toEqual(200);
      expect(young?.status).toEqual("WITHDRAWN");
      expect(young?.statusPhase1).toEqual("AFFECTED");
      expect(young?.statusPhase2).toEqual("WAITING_REALISATION");
      expect(young?.statusPhase3).toEqual("WAITING_REALISATION");
    });
    it("should not cascade status to WITHDRAWN if validated", async () => {
      const { young, response } = await createYoungThenUpdate(
        {
          status: "WITHDRAWN",
        },
        {
          statusPhase1: "DONE",
          statusPhase2: "WAITING_REALISATION",
          statusPhase3: "VALIDATED",
        },
      );
      expect(response.statusCode).toEqual(200);
      expect(young?.status).toEqual("WITHDRAWN");
      expect(young?.statusPhase1).toEqual("DONE");
      expect(young?.statusPhase2).toEqual("WAITING_REALISATION");
      expect(young?.statusPhase3).toEqual("VALIDATED");
    });
    it("should update young statuses when sending cohection stay presence true", async () => {
      const { young, response } = await createYoungThenUpdate({ cohesionStayPresence: "true" }, { cohesionStayPresence: undefined });
      expect(response.statusCode).toEqual(200);
      expect(young?.statusPhase1).toEqual("DONE");
      expect(young?.cohesionStayPresence).toEqual("true");
    });
    it("should update young statuses when sending cohection stay presence false", async () => {
      const { young, response } = await createYoungThenUpdate({ cohesionStayPresence: "false" });
      expect(response.statusCode).toEqual(200);
      expect(young?.statusPhase1).toEqual("NOT_DONE");
      expect(young?.cohesionStayPresence).toEqual("false");
    });
    it("should remove places when sending to cohesion center", async () => {
      const sessionPhase1: any = await createSessionPhase1(getNewSessionPhase1Fixture());
      const placesLeft = sessionPhase1.placesLeft;
      const { young, response } = await createYoungThenUpdate({
        sessionPhase1Id: sessionPhase1._id,
        status: "VALIDATED",
        statusPhase1: "AFFECTED",
      });
      expect(response.statusCode).toEqual(200);
      const updatedSessionPhase1 = await getSessionPhase1ById(young?.sessionPhase1Id);
      expect(updatedSessionPhase1?.placesLeft).toEqual(placesLeft - 1);
    });
  });
  describe("PUT /referent/youngs", () => {
    it("should return 400 if body is not valid", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ status: YOUNG_STATUS.VALIDATED as any }));
      const youngIds = [young._id];
      let res = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE }))
        .put(`/referent/youngs`)
        .send({ youngIds });
      expect(res.statusCode).toEqual(400);
      res = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE }))
        .put(`/referent/youngs`)
        .send({ youngIds, status: "NOT_VALID" });
      expect(res.statusCode).toEqual(400);
      res = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE }))
        .put(`/referent/youngs`)
        .send({ youngIds, status: YOUNG_STATUS.WITHDRAWN });
      expect(res.statusCode).toEqual(400);
      res = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE }))
        .put(`/referent/youngs`)
        .send({ youngIds: [], status: YOUNG_STATUS.VALIDATED });
      expect(res.statusCode).toEqual(400);
    });
    it("should return 404 if young not found", async () => {
      const youngIds = [notExistingYoungId];
      const res = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE }))
        .put(`/referent/youngs`)
        .send({ youngIds, status: YOUNG_STATUS.VALIDATED });
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if youngs updated", async () => {
      const userId = "123";
      const etablissement = await createEtablissement(createFixtureEtablissement());
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Juillet 2023" }));
      const classe: any = await createClasse(createFixtureClasse({ etablissementId: etablissement._id, referentClasseIds: [userId], cohort: cohort.name, cohortId: cohort._id }));
      const young: any = await createYoungHelper(getNewYoungFixture({ source: "CLE", classeId: classe._id, cohort: classe.cohort, cohortId: cohort._id }));

      const youngIds = [young._id.toString()];
      const res = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE }))
        .put(`/referent/youngs`)
        .send({ youngIds, status: YOUNG_STATUS.VALIDATED });
      expect(res.statusCode).toEqual(200);
      for (const updatedYoungId of res.body.data) {
        expect(youngIds.includes(updatedYoungId)).toBe(true);
        const updatedYoung = await YoungModel.findById(updatedYoungId);
        expect(updatedYoung?.status).toEqual(YOUNG_STATUS.VALIDATED);
      }
    });
  });

  describe("POST /referent/:tutorId/email/:template", () => {
    it("should return 404 if tutor not found", async () => {
      const res = await request(getAppHelper({ role: ROLES.ADMIN }))
        .post(`/referent/${notExistingReferentId}/email/test`)
        .send({ message: "hello", subject: "hi" });
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if tutor found", async () => {
      const tutor = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper())
        .post(`/referent/${tutor._id}/email/${SENDINBLUE_TEMPLATES.referent.MISSION_WAITING_CORRECTION}`)
        .send({ message: "hello", subject: "hi" });
      expect(res.statusCode).toEqual(200);
    });
    it("should return 400 if wrong template", async () => {
      const tutor = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper()).post(`/referent/${tutor._id}/email/001`).send({ message: "hello", subject: "hi" });
      expect(res.statusCode).toEqual(400);
    });
    it("should return 400 if wrong template params", async () => {
      const tutor = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper()).post(`/referent/${tutor._id}/email/001`).send({ app: "is a string but must be object" });
      expect(res.statusCode).toEqual(400);
    });
  });

  describe("GET /referent/youngFile/:youngId/:key/:fileName", () => {
    it("should return 200 if file is found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper())
        .get("/referent/youngFile/" + young._id + "/key/test.pdf")
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body.fileName).toEqual("test.pdf");
      expect(res.body.mimeType).toEqual("application/pdf");
    });
  });

  describe("POST /referent/file/:key", () => {
    it("should return 404 if young not found", async () => {
      const res = await request(getAppHelper())
        .get("/referent/file/cniFiles")
        .send({ body: JSON.stringify({ youngId: notExistingYoungId, names: ["e"] }) });
      expect(res.statusCode).toEqual(404);
    });
    it("should send file for the young", async () => {
      // This test should be improved to check the file is sent (currently no file is sent)
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper())
        .post("/referent/file/cniFiles")
        .send({ body: JSON.stringify({ youngId: young._id, names: ["e"] }) });
      expect(res.body).toEqual({ data: ["e"], ok: true });
    });
  });

  describe("GET /referent/young/:youngId", () => {
    it("should return 404 if young not found", async () => {
      const res = await request(getAppHelper())
        .get("/referent/young/" + notExistingYoungId)
        .send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if young found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper())
        .get("/referent/young/" + young._id)
        .send();
      expect(res.statusCode).toEqual(200);
      expectYoungToEqual(young, res.body.data);
    });
    it("should contain applications", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const structure: any = await createStructureHelper({ ...getNewStructureFixture() });
      const application: any = await createApplication({ ...getNewApplicationFixture(), youngId: young._id, structureId: structure._id });
      const res = await request(getAppHelper())
        .get("/referent/young/" + young._id)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.applications).toEqual([
        {
          ...application.toObject(),
          structure: {
            ...structure.toObject(),
            _id: structure._id.toString(),
            createdAt: structure.createdAt.toISOString(),
            updatedAt: structure.updatedAt.toISOString(),
          },
          _id: application._id.toString(),
          createdAt: application.createdAt.toISOString(),
          updatedAt: application.updatedAt.toISOString(),
        },
      ]);
    });
  });

  describe("GET /referent/:id/patches", () => {
    it("should return 404 if referent not found", async () => {
      const res = await request(getAppHelper()).get(`/referent/${notExistingReferentId}/patches`).send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 403 if not admin", async () => {
      const referent: any = await createReferentHelper(getNewReferentFixture());
      referent.firstName = "MY NEW NAME";
      await referent.save();
      const passport = require("passport");
      passport.user.role = ROLES.RESPONSIBLE;
      const res = await request(getAppHelper()).get(`/referent/${referent._id}/patches`).send();
      expect(res.status).toBe(403);
      passport.user.role = ROLES.ADMIN;
    });
    it("should return 200 if referent found with patches", async () => {
      const referent: any = await createReferentHelper(getNewReferentFixture());
      referent.firstName = "MY NEW NAME";
      await referent.save();
      const res = await request(getAppHelper()).get(`/referent/${referent._id}/patches`).send();
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ops: expect.arrayContaining([expect.objectContaining({ op: "replace", path: "/firstName", value: "MY NEW NAME" })]),
          }),
        ]),
      );
    });
  });

  describe("GET /referent/:id", () => {
    it("should return 404 if referent not found", async () => {
      const res = await request(getAppHelper()).get(`/referent/${notExistingReferentId}`).send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if referent found", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper()).get(`/referent/${referent._id}`).send();
      expect(res.statusCode).toEqual(200);
      expectReferentToEqual(referent, res.body.data);
    });
    it("should return 403 if role is not admin", async () => {
      const passport = require("passport");
      passport.user.role = ROLES.RESPONSIBLE;
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper()).get(`/referent/${referent._id}`).send();
      expect(res.statusCode).toEqual(403);
      passport.user.role = ROLES.ADMIN;
    });
  });

  describe("PUT /referent", () => {
    it("should return 400 when a role is given", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper()).put(`/referent/${referent._id}`).send({ role: "referent" });
      expect(res.statusCode).toEqual(400);
    });
    it("should return 200 when firstName is given", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper()).put(`/referent/${referent._id}`).send({ firstName: "MY NEW NAME" });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data?.firstName).toEqual("My New Name");
    });
  });

  describe("PUT /referent/:id", () => {
    it("should return 404 if referent not found", async () => {
      const res = await request(getAppHelper()).put(`/referent/${notExistingReferentId}`).send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if referent found", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper()).put(`/referent/${referent._id}`).send({ firstName: "MY NEW NAME", lastName: "my neW last Name" });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(
        expect.objectContaining({
          firstName: "My New Name",
          lastName: "MY NEW LAST NAME",
        }),
      );
    });
    it("should return 403 if role is not admin", async () => {
      const passport = require("passport");
      passport.user.role = ROLES.RESPONSIBLE;
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper()).put(`/referent/${referent._id}`).send();
      expect(res.statusCode).toEqual(403);
      passport.user.role = ROLES.ADMIN;
    });

    it("should update tutor name in missions and applications", async () => {
      const firstName = "MY NEW NAME";
      const lastName = "MY NEW LAST NAME";
      const fullName = `My New Name MY NEW LAST NAME`;
      const referent: any = await createReferentHelper(getNewReferentFixture());
      const mission: any = await createMissionHelper(getNewMissionFixture());
      const application: any = await createApplication(getNewApplicationFixture());
      mission.tutorId = referent._id;
      application.tutorId = referent._id;
      application.missionId = mission._id;
      await mission.save();
      await application.save();
      const res = await request(getAppHelper()).put(`/referent/${referent._id}`).send({ firstName, lastName });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(expect.objectContaining({ lastName: lastName }));
      const missions = await getMissionsHelper({ tutorId: referent._id.toString() });
      const applications = await getApplicationsHelper({ tutorId: referent._id });
      expect(missions).toHaveLength(1);
      expect(applications).toHaveLength(1);
      expect(missions.map((mission) => mission.tutorName)).toEqual([fullName]);
      expect(applications.map((application) => application.tutorName)).toEqual([fullName]);
    });
  });

  describe("DELETE /referent/:id", () => {
    it("should return 404 if referent not found", async () => {
      const res = await request(getAppHelper()).delete(`/referent/${notExistingReferentId}`).send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if referent found", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper()).delete(`/referent/${referent._id}`).send();
      expect(res.statusCode).toEqual(200);
      expect(await getReferentByIdHelper(referent._id)).toBeNull();
    });
    it("should return 403 if role is not admin", async () => {
      const passport = require("passport");
      passport.user.role = ROLES.RESPONSIBLE;
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper()).delete(`/referent/${referent._id}`).send();
      expect(res.statusCode).toEqual(403);
      passport.user.role = ROLES.ADMIN;
    });
  });

  describe("POST /referent/signin_as/:type/:id", () => {
    it("should return 403 if role is not admin", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const passport = require("passport");
      passport.user.role = ROLES.RESPONSIBLE;
      const res = await request(getAppHelper())
        .post("/referent/signin_as/referent/" + referent._id)
        .send();
      expect(res.statusCode).toEqual(403);
      passport.user.role = ROLES.ADMIN;
    });
    it("should return 404 if referent not found", async () => {
      const res = await request(getAppHelper())
        .post("/referent/signin_as/referent/" + notExistingReferentId)
        .send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 404 if type param is not found", async () => {
      const res = await request(getAppHelper()).post("/referent/signin_as/foo/bar").send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if referent found", async () => {
      const referent: any = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper())
        .post("/referent/signin_as/referent/" + referent._id)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(
        expect.objectContaining({
          _id: referent._id.toString(),
          firstName: referent.firstName,
          lastName: referent.lastName,
        }),
      );
    });
    it("should return 200 if young found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper())
        .post("/referent/signin_as/young/" + young._id)
        .send();
      expect(res.statusCode).toEqual(200);
    });
    it("should return a jwt token", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper())
        .post("/referent/signin_as/referent/" + referent._id)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.headers["set-cookie"][0]).toContain("jwt_ref=");
    });
  });
  describe("PUT /referent/young/:id/change-cohort", () => {
    const passport = require("passport");
    passport.user.role = ROLES.ADMIN;
    beforeEach(async () => {});

    afterEach(async () => {
      await YoungModel.deleteMany();
      await CohortModel.deleteMany();
      passport.user.role = ROLES.ADMIN;
    });

    it("should change the cohort of the young and cohortId", async () => {
      const cohort1 = await CohortModel.create({ ...getNewCohortFixture(), name: "CLE mars 2024 1" });
      const cohort2 = await CohortModel.create({ ...getNewCohortFixture(), name: "à venir" });
      const young = await YoungModel.create({ ...getNewYoungFixture(), cohort: cohort1.name, cohortId: cohort1._id });

      expect(young.cohortId).toEqual(cohort1._id.toString());

      const newCohortName = "à venir";
      const res = await request(getAppHelper()).put(`/referent/young/${young._id}/change-cohort`).send({
        source: "VOLONTAIRE",
        cohort: newCohortName,
        message: "Changing cohort for testing purposes",
        cohortChangeReason: "Testing",
      });

      expect(res.status).toEqual(200);
      expect(res.body.data.cohort).toEqual(newCohortName);
      expect(res.body.data.cohortChangeReason).toEqual("Testing");
      expect(res.body.data.originalCohort).toEqual(young.cohort);
      expect(res.body.data.cohortId).toEqual(cohort2._id.toString());
    });

    it("should change the cohort of the young and cohortId to undefined", async () => {
      const cohort1 = await CohortModel.create({ ...getNewCohortFixture(), name: "CLE mars 2024 1" });
      const young = await YoungModel.create({ ...getNewYoungFixture(), cohort: cohort1.name, cohortId: cohort1._id });

      const notPersistedCohortName = "à venir";
      const res = await request(getAppHelper()).put(`/referent/young/${young._id}/change-cohort`).send({
        source: "VOLONTAIRE",
        cohort: notPersistedCohortName,
        message: "Changing cohort for testing",
        cohortChangeReason: "Testing",
      });

      expect(res.status).toEqual(200);
      expect(res.body.data.cohort).toEqual(notPersistedCohortName);
      expect(res.body.data.cohortId).toBeUndefined();
    });

    it("should return 403 if the referent is not authorized to change the cohort", async () => {
      const cohort1 = await CohortModel.create({ ...getNewCohortFixture(), name: "CLE mars 2024 1" });
      const young = await YoungModel.create({ ...getNewYoungFixture(), cohort: cohort1.name, cohortId: cohort1._id });
      passport.user.role = ROLES.VISITOR;
      const res = await request(getAppHelper()).put(`/referent/young/${young._id}/change-cohort`).send({
        source: "VOLONTAIRE",
        cohort: cohort1.name,
        message: "Changing cohort for testing purposes",
        cohortChangeReason: "Testing",
      });

      expect(res.status).toEqual(403);
    });

    it("should return 409 if the cohort is not valid", async () => {
      const cohort1 = await CohortModel.create({ ...getNewCohortFixture(), name: "CLE mars 2024 1" });
      const young = await YoungModel.create({ ...getNewYoungFixture(), cohort: cohort1.name, cohortId: cohort1._id });
      const res = await request(getAppHelper()).put(`/referent/young/${young._id}/change-cohort`).send({
        source: "VOLONTAIRE",
        cohort: "invalid cohort",
        message: "Changing cohort for testing purposes",
        cohortChangeReason: "Testing",
      });

      expect(res.status).toEqual(409);
    });
  });
});
