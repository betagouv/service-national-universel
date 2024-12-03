import { fakerFR as faker } from "@faker-js/faker";
import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;

import { ROLES, SENDINBLUE_TEMPLATES, YOUNG_STATUS, STATUS_CLASSE, FUNCTIONAL_ERRORS, YoungType, UserDto, SUB_ROLE_GOD, YOUNG_SOURCE, INSCRIPTION_GOAL_LEVELS } from "snu-lib";

import { CohortModel, InscriptionGoalModel, YoungModel } from "../models";
import { getCompletionObjectifs } from "../services/inscription-goal";

import getAppHelper, { resetAppAuth } from "./helpers/app";
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
import { createInscriptionGoal } from "./helpers/inscriptionGoal";
import getNewInscriptionGoalFixture from "./fixtures/inscriptionGoal";

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

beforeAll(() => dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(dbClose);
beforeEach(async () => {
  await YoungModel.deleteMany();
  await CohortModel.deleteMany();
  await InscriptionGoalModel.deleteMany();
});
afterEach(resetAppAuth);

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
      const referentFixture = { ...getNewReferentFixture(), role: ROLES.ADMIN };
      const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
        .post("/referent/signup_invite/001")
        .send(referentFixture);
      expect(res.statusCode).toEqual(403);
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
    async function createYoungThenUpdate(
      updateYoungFields: Partial<YoungType>,
      newYoungFields?: Partial<YoungType>,
      { keepYoung, queryParam }: { keepYoung?: boolean; queryParam?: string } = {},
      user?: Partial<UserDto>,
    ) {
      const youngFixture = getNewYoungFixture();
      const originalYoung = await createYoungHelper({ ...youngFixture, ...newYoungFields });
      const modifiedYoung = { ...youngFixture, ...newYoungFields, ...updateYoungFields };
      const response = await request(getAppHelper(user))
        .put(`/referent/young/${originalYoung._id}${queryParam || ""}`)
        .send(modifiedYoung);
      const young = await getYoungByIdHelper(originalYoung._id);
      if (!keepYoung) {
        await deleteYoungByIdHelper(originalYoung._id);
      }
      return { young, modifiedYoung, response, id: originalYoung._id };
    }
    it("should not update young if goal not defined (null)", async () => {
      const testName = "Juillet 2023";
      const cohort = await createCohortHelper(getNewCohortFixture({ name: testName }));
      // ajout d'un objectif non définie
      const inscriptionGoal = await createInscriptionGoal(getNewInscriptionGoalFixture({ cohort: cohort.name, max: null as any }));

      // ajout d'un jeune au departement
      const { response, id: youngId } = await createYoungThenUpdate(
        {
          status: YOUNG_STATUS.VALIDATED,
        },
        { region: inscriptionGoal.region, department: inscriptionGoal.department, schoolDepartment: inscriptionGoal.department, cohort: cohort.name, cohortId: cohort.id },
        { keepYoung: true },
        { role: ROLES.ADMIN },
      );
      expect(response.statusCode).not.toEqual(200);
      expect(response.body.code).toBe(FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_NOT_DEFINED);
      await deleteYoungByIdHelper(youngId);
    });
    it("should not update young if department goal reached", async () => {
      const testName = "Juillet 2023";
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const cohort = await createCohortHelper(getNewCohortFixture({ name: testName, instructionEndDate: tomorrow }));

      // ajout d'un objectif à 1
      const inscriptionGoal = await createInscriptionGoal(getNewInscriptionGoalFixture({ cohort: testName, max: 1 }));

      let completionObjectif = await getCompletionObjectifs(inscriptionGoal.department!, cohort);
      expect(completionObjectif.department.objectif).toBe(1);
      expect(completionObjectif.isAtteint).toBe(false);

      // ajout d'un jeune au departement sans depassement
      const { response: responseSuccessed, id: youngId } = await createYoungThenUpdate(
        {
          status: YOUNG_STATUS.VALIDATED,
        },
        { region: inscriptionGoal.region, department: inscriptionGoal.department, schoolDepartment: inscriptionGoal.department, cohort: cohort.name, cohortId: cohort._id },
        { keepYoung: true },
        { role: ROLES.HEAD_CENTER },
      );
      expect(responseSuccessed.statusCode).toEqual(200);

      // ajout d'un jeune au departement avec depassement
      let response = (
        await createYoungThenUpdate(
          {
            status: YOUNG_STATUS.VALIDATED,
          },
          { region: inscriptionGoal.region, department: inscriptionGoal.department, schoolDepartment: inscriptionGoal.department, cohort: cohort.name, cohortId: cohort._id },
        )
      ).response;
      expect(response.statusCode).not.toEqual(200);
      expect(response.body.code).toBe(FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_REGION_REACHED);
      // admin: ajout d'un jeune au departement avec depassement
      response = (
        await createYoungThenUpdate(
          {
            status: YOUNG_STATUS.VALIDATED,
          },
          { region: inscriptionGoal.region, department: inscriptionGoal.department, schoolDepartment: inscriptionGoal.department, cohortId: cohort._id },
          undefined,
          { role: ROLES.ADMIN },
        )
      ).response;
      expect(response.statusCode).not.toEqual(200);
      expect(response.body.code).toBe(FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_REGION_REACHED);
      // ajout d'un jeune HZR sur un autre departement sans dépassement
      response = (
        await createYoungThenUpdate(
          {
            status: YOUNG_STATUS.VALIDATED,
          },
          { cohortId: cohort._id },
        )
      ).response;
      expect(response.statusCode).not.toEqual(200);
      expect(response.body.code).toBe(FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_NOT_DEFINED);
      // admin: force l'ajout d'un jeune au departement meme si depassement
      response = (
        await createYoungThenUpdate(
          {
            status: YOUNG_STATUS.VALIDATED,
          },
          { region: inscriptionGoal.region, department: inscriptionGoal.department, cohort: cohort.name, cohortId: cohort._id },
          { queryParam: "?forceGoal=1" },
        )
      ).response;
      expect(response.statusCode).toEqual(200);
      await deleteYoungByIdHelper(youngId);
    });
    it("should not update young if region goal reached (not department)", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      const inscriptionGoal = await createInscriptionGoal(getNewInscriptionGoalFixture({ cohort: cohort.name, cohortId: cohort._id, max: 1 }));
      // jeune dans la region mais pas dans le departement
      await createYoungHelper(getNewYoungFixture({ status: YOUNG_STATUS.VALIDATED, region: inscriptionGoal.region, cohort: cohort.name, cohortId: cohort._id }));

      let completionObjectif = await getCompletionObjectifs(inscriptionGoal.department!, cohort);
      expect(completionObjectif.department.isAtteint).toBe(false);
      expect(completionObjectif.region.isAtteint).toBe(true);
      expect(completionObjectif.isAtteint).toBe(true);

      const response = (
        await createYoungThenUpdate(
          {
            status: YOUNG_STATUS.VALIDATED,
          },
          { department: inscriptionGoal.department, schoolDepartment: inscriptionGoal.department, region: inscriptionGoal.region, cohort: cohort.name, cohortId: cohort._id },
        )
      ).response;
      expect(response.statusCode).toEqual(400);
      expect(response.body.code).toBe(FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_REGION_REACHED);
    });
    it("should return 404 if young not found", async () => {
      const res = await request(getAppHelper()).put(`/referent/young/${notExistingYoungId}`).send();
      expect(res.statusCode).toEqual(404);
    });
    it("should update young name", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      // @ts-ignore: FIXME: young.name does not exist
      const { young, modifiedYoung, response } = await createYoungThenUpdate({ name: faker.company.name() }, { cohortId: cohort._id });
      expect(response.statusCode).toEqual(200);
      expectYoungToEqual(young, modifiedYoung);
    });
    it("should cascade young statuses when sending status WITHDRAWN", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      const { young, response } = await createYoungThenUpdate(
        {
          status: "WITHDRAWN",
        },
        {
          statusPhase1: "AFFECTED",
          statusPhase2: "WAITING_REALISATION",
          statusPhase3: "WAITING_REALISATION",
          cohortId: cohort._id,
        },
      );
      expect(response.statusCode).toEqual(200);
      expect(young?.status).toEqual("WITHDRAWN");
      expect(young?.statusPhase1).toEqual("AFFECTED");
      expect(young?.statusPhase2).toEqual("WAITING_REALISATION");
      expect(young?.statusPhase3).toEqual("WAITING_REALISATION");
    });
    it("should not cascade status to WITHDRAWN if validated", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      const { young, response } = await createYoungThenUpdate(
        {
          status: "WITHDRAWN",
        },
        {
          statusPhase1: "DONE",
          statusPhase2: "WAITING_REALISATION",
          statusPhase3: "VALIDATED",
          cohortId: cohort._id,
        },
      );
      expect(response.statusCode).toEqual(200);
      expect(young?.status).toEqual("WITHDRAWN");
      expect(young?.statusPhase1).toEqual("DONE");
      expect(young?.statusPhase2).toEqual("WAITING_REALISATION");
      expect(young?.statusPhase3).toEqual("VALIDATED");
    });
    it("should update young statuses when sending cohection stay presence true", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      const { young, response } = await createYoungThenUpdate({ cohesionStayPresence: "true" }, { cohesionStayPresence: undefined, cohortId: cohort._id });
      expect(response.statusCode).toEqual(200);
      expect(young?.statusPhase1).toEqual("DONE");
      expect(young?.cohesionStayPresence).toEqual("true");
    });
    it("should update young statuses when sending cohection stay presence false", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      const { young, response } = await createYoungThenUpdate({ cohesionStayPresence: "false" }, { cohortId: cohort._id });
      expect(response.statusCode).toEqual(200);
      expect(young?.statusPhase1).toEqual("NOT_DONE");
      expect(young?.cohesionStayPresence).toEqual("false");
    });
    it("should remove places when sending to cohesion center", async () => {
      const sessionPhase1: any = await createSessionPhase1(getNewSessionPhase1Fixture());
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Juillet 2023", instructionEndDate: tomorrow }));
      const placesLeft = sessionPhase1.placesLeft;
      const { young, response } = await createYoungThenUpdate(
        {},
        {
          sessionPhase1Id: sessionPhase1._id,
          status: "VALIDATED",
          statusPhase1: "AFFECTED",
          cohortId: cohort._id,
        },
      );
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

    it("should return 403 if user cannot validate youngs", async () => {
      const youngIds = [new ObjectId().toString()];
      const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
        .put(`/referent/youngs`)
        .send({ youngIds, status: YOUNG_STATUS.VALIDATED });
      expect(res.statusCode).toEqual(403);
    });
    it("should return 403 if payload is VALIDATED and if classe is not found", async () => {
      const youngIds = [new ObjectId().toString()];
      const res = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE }))
        .put(`/referent/youngs`)
        .send({ youngIds, status: YOUNG_STATUS.VALIDATED });
      expect(res.statusCode).toEqual(404);
    });

    it("should return 403 if payload is VALIDATED if classe is closed", async () => {
      const userId = "123";
      const etablissement = await createEtablissement(createFixtureEtablissement());
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Juillet 2023", instructionEndDate: yesterday }));
      const classe: any = await createClasse(
        createFixtureClasse({ etablissementId: etablissement._id, referentClasseIds: [userId], cohort: cohort.name, cohortId: cohort._id, status: STATUS_CLASSE.CLOSED }),
      );
      const young: any = await createYoungHelper(getNewYoungFixture({ source: "CLE", classeId: classe._id, cohort: classe.cohort, cohortId: cohort._id }));

      const youngIds = [young._id.toString()];
      const res = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE }))
        .put(`/referent/youngs`)
        .send({ youngIds, status: YOUNG_STATUS.VALIDATED });
      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual(`Classe ${classe._id} is closed`);
    });

    it("should return 403 if payload is VALIDATED if classe is full", async () => {
      const userId = "123";
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const etablissement = await createEtablissement(createFixtureEtablissement());
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Juillet 2023", instructionEndDate: tomorrow }));
      const classe: any = await createClasse(
        createFixtureClasse({
          etablissementId: etablissement._id,
          referentClasseIds: [userId],
          cohort: cohort.name,
          cohortId: cohort._id,
          status: STATUS_CLASSE.OPEN,
          totalSeats: 1,
          seatsTaken: 1,
        }),
      );
      const young: any = await createYoungHelper(getNewYoungFixture({ source: "CLE", classeId: classe._id, cohort: classe.cohort, cohortId: cohort._id }));

      const youngIds = [young._id.toString()];
      const res = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE }))
        .put(`/referent/youngs`)
        .send({ youngIds, status: YOUNG_STATUS.VALIDATED });
      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual(`No seats left in classe ${classe._id}`);
    });

    it("should return 200 if payload is VALIDATED and if youngs updated", async () => {
      const userId = "123";
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const etablissement = await createEtablissement(createFixtureEtablissement());
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Juillet 2023", instructionEndDate: tomorrow }));
      const classe: any = await createClasse(
        createFixtureClasse({
          etablissementId: etablissement._id,
          referentClasseIds: [userId],
          cohort: cohort.name,
          cohortId: cohort._id,
          status: STATUS_CLASSE.OPEN,
          seatsTaken: 0,
          totalSeats: 1,
        }),
      );
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

    it("should return 200 if payload is REFUSED and if youngs updated event if classe is full or closed", async () => {
      const userId = "123";
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const etablissement = await createEtablissement(createFixtureEtablissement());
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Juillet 2023", instructionEndDate: yesterday }));
      const classe: any = await createClasse(
        createFixtureClasse({
          etablissementId: etablissement._id,
          referentClasseIds: [userId],
          cohort: cohort.name,
          cohortId: cohort._id,
          status: STATUS_CLASSE.CLOSED,
          seatsTaken: 1,
          totalSeats: 1,
        }),
      );
      const young: any = await createYoungHelper(getNewYoungFixture({ source: "CLE", classeId: classe._id, cohort: classe.cohort, cohortId: cohort._id }));

      const youngIds = [young._id.toString()];
      const res = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE }))
        .put(`/referent/youngs`)
        .send({ youngIds, status: YOUNG_STATUS.REFUSED });
      expect(res.statusCode).toEqual(200);
      for (const updatedYoungId of res.body.data) {
        expect(youngIds.includes(updatedYoungId)).toBe(true);
        const updatedYoung = await YoungModel.findById(updatedYoungId);
        expect(updatedYoung?.status).toEqual(YOUNG_STATUS.REFUSED);
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
          ...JSON.parse(JSON.stringify(application.toObject())),
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

      const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
        .get(`/referent/${referent._id}/patches`)
        .send();
      expect(res.status).toBe(403);
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
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
        .get(`/referent/${referent._id}`)
        .send();
      expect(res.statusCode).toEqual(403);
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
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
        .put(`/referent/${referent._id}`)
        .send();
      expect(res.statusCode).toEqual(403);
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
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
        .delete(`/referent/${referent._id}`)
        .send();
      expect(res.statusCode).toEqual(403);
    });
  });

  describe("POST /referent/signin_as/:type/:id", () => {
    it("should return 403 if role is not admin", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());

      const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
        .post("/referent/signin_as/referent/" + referent._id)
        .send();
      expect(res.statusCode).toEqual(403);
    });
    it("should return 404 if referent not found", async () => {
      const res = await request(getAppHelper())
        .post("/referent/signin_as/referent/" + notExistingReferentId)
        .send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 400 if type param is not found", async () => {
      const res = await request(getAppHelper()).post("/referent/signin_as/foo/bar").send();
      expect(res.statusCode).toEqual(400);
    });
    it("should return 403 when impersonate user has subrole god", async () => {
      const referent = await createReferentHelper(getNewReferentFixture({ subRole: SUB_ROLE_GOD }));

      const res = await request(getAppHelper({ role: ROLES.ADMIN }))
        .post("/referent/signin_as/referent/" + referent._id)
        .send();
      expect(res.statusCode).toEqual(403);
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
      const res = await request(getAppHelper({ role: ROLES.VISITOR }))
        .put(`/referent/young/${young._id}/change-cohort`)
        .send({
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

    it("should change the cohort of the young from HTS to HTS while keeping school data unchanged", async () => {
      const cohort1 = await createCohortHelper(getNewCohortFixture({ name: "Février 2024" }));
      const cohort2 = await createCohortHelper(getNewCohortFixture({ name: "Juin 2024" }));

      const etablissement = createFixtureEtablissement();
      const school = await createEtablissement(etablissement);

      const young = await createYoungHelper({
        ...getNewYoungFixture(),
        cohort: cohort1.name,
        cohortId: cohort1._id,
        source: YOUNG_SOURCE.VOLONTAIRE,
        schoolId: school._id,
        schoolName: school.name,
        schoolType: school.type[0],
        schoolAddress: school.address,
        schoolZip: school.zip,
        schoolCity: school.city,
        schoolDepartment: school.department,
        schoolRegion: school.region,
        schoolCountry: school.country,
      });

      const res = await request(getAppHelper()).put(`/referent/young/${young._id}/change-cohort`).send({
        source: YOUNG_SOURCE.VOLONTAIRE,
        cohort: cohort2.name,
        message: "Changing cohort for testing purposes",
        cohortChangeReason: "Testing HTS to HTS",
      });

      expect(res.status).toBe(200);
      expect(res.body.data.cohort).toBe(cohort2.name);
      expect(res.body.data.cohortId).toBe(cohort2._id.toString());
      expect(res.body.data.cohortChangeReason).toBe("Testing HTS to HTS");
      expect(res.body.data.originalCohort).toBe(cohort1.name);

      // Vérifier que les données de l'école sont inchangées
      expect(res.body.data.schoolId).toBe(school._id.toString());
      expect(res.body.data.schoolName).toBe(school.name);
      expect(res.body.data.schoolType).toBe(school.type[0]);
      expect(res.body.data.schoolAddress).toBe(school.address);
      expect(res.body.data.schoolZip).toBe(school.zip);
      expect(res.body.data.schoolCity).toBe(school.city);
      expect(res.body.data.schoolDepartment).toBe(school.department);
      expect(res.body.data.schoolRegion).toBe(school.region);
      expect(res.body.data.schoolCountry).toBe(school.country);

      // Vérifier que la source reste VOLONTAIRE
      expect(res.body.data.source).toBe(YOUNG_SOURCE.VOLONTAIRE);
    });
  });
});
