import { fakerFR as faker } from "@faker-js/faker";
import request from "supertest";
import {
  ROLES,
  SENDINBLUE_TEMPLATES,
  YOUNG_STATUS,
  YoungType,
  UserDto,
  SUB_ROLE_GOD,
  INSCRIPTION_GOAL_LEVELS,
  ROLES_LIST,
  DECOMMISSIONED_ROLES,
  PERMISSION_RESOURCES,
  PERMISSION_ACTIONS,
  ReferentStatus,
} from "snu-lib";

import { CohortModel, InscriptionGoalModel, YoungModel } from "../models";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
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
import { createCohortHelper } from "./helpers/cohort";
import getNewCohortFixture from "./fixtures/cohort";
import { createInscriptionGoal } from "./helpers/inscriptionGoal";
import getNewInscriptionGoalFixture from "./fixtures/inscriptionGoal";
import { PermissionModel } from "../models/permissions/permission";
import { addPermissionHelper } from "./helpers/permissions";

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

beforeAll(async () => {
  dbConnect(__filename.slice(__dirname.length + 1, -3));
  await PermissionModel.deleteMany({ roles: { $in: [ROLES.ADMIN] } });
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.REFERENT, PERMISSION_ACTIONS.FULL);
  await addPermissionHelper([ROLES.RESPONSIBLE, ROLES.SUPERVISOR], PERMISSION_RESOURCES.REFERENT, PERMISSION_ACTIONS.CREATE);
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.STRUCTURE, PERMISSION_ACTIONS.FULL);
  await addPermissionHelper([ROLES.RESPONSIBLE, ROLES.SUPERVISOR], PERMISSION_RESOURCES.STRUCTURE, PERMISSION_ACTIONS.WRITE, {
    where: [{ field: "_id", source: "structureId" }],
  } as any);
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.PATCH, PERMISSION_ACTIONS.READ);
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.USER_HISTORY, PERMISSION_ACTIONS.READ);
});
afterAll(dbClose);
beforeEach(async () => {
  await YoungModel.deleteMany();
  await CohortModel.deleteMany();
  await InscriptionGoalModel.deleteMany();
});
afterEach(resetAppAuth);

describe("Referent", () => {
  describe("POST /referent/signup_invite/:template", () => {
    // La fixture tire un département fictif (faker) : la route n'accepte que ceux de `departmentList`.
    const getInvitationFixture = () => ({ ...getNewReferentFixture(), department: ["Ain"] });
    it("should invite and add referent (admin)", async () => {
      const referentFixture = getInvitationFixture();
      const referentsBefore = await getReferentsHelper();
      const res = await request(await getAppHelperWithAcl())
        .post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent.NEW_STRUCTURE_MEMBER}`)
        .send(referentFixture);
      expect(res.statusCode).toEqual(200);
      const referentsAfter = await getReferentsHelper();
      expect(referentsAfter.length).toEqual(referentsBefore.length + 1);
      await deleteReferentByIdHelper(res.body.data._id);
    });
    it("should invite and add referent (responsible)", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const referentFixture = { ...getInvitationFixture(), role: ROLES.RESPONSIBLE, structureId: structure._id.toString() };
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }))
        .post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent.NEW_STRUCTURE_MEMBER}`)
        .send(referentFixture);
      expect(res.statusCode).toEqual(200);
    });
    it("should return 400 if no templates given", async () => {
      const referentFixture = getInvitationFixture();
      const res = await request(await getAppHelperWithAcl())
        .post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent.NEW_STRUCTURE_MEMBER}`)
        .send({ ...referentFixture, structureId: 1 });
      expect(res.statusCode).toEqual(400);
    });
    it("should return 403 when responsible can not invite (all role except responsible)", async () => {
      const referentFixture = { ...getInvitationFixture(), role: ROLES.ADMIN };
      for (const role of ROLES_LIST) {
        if (role !== ROLES.RESPONSIBLE) {
          const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE }))
            .post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent.NEW_STRUCTURE_MEMBER}`)
            .send({ ...referentFixture, role });
          expect(res.statusCode).toEqual(403);
        }
      }
    });
    it("should return 409 when user already exists", async () => {
      const fixture = getInvitationFixture();
      const email = fixture.email?.toLowerCase();
      await createReferentHelper({ ...fixture, email });
      let res = await request(await getAppHelperWithAcl())
        .post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent.NEW_STRUCTURE_MEMBER}`)
        .send(fixture);
      expect(res.status).toBe(409);
    });
    // Rôles décommissionnés (GOO-56, lot P24, audit du 25/09/2026) : ce parcours générique ne doit
    // plus permettre de créer de compte sur l'un de ces rôles, y compris pour un admin qui peut
    // inviter tout rôle par ailleurs. Couvre notamment PH2/PH8 (famille chef de centre) et PH6/PM8
    // (transporteur), en plus du blocage CLE déjà en place (H17).
    it("should return 403 when inviting a decommissioned role", async () => {
      const referentCountBefore = await getReferentsHelper();
      for (const role of DECOMMISSIONED_ROLES) {
        const referentFixture = { ...getInvitationFixture(), role };
        const res = await request(await getAppHelperWithAcl())
          .post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent.NEW_STRUCTURE_MEMBER}`)
          .send(referentFixture);
        expect(res.statusCode).toEqual(403);
        expect(res.body).toEqual({ ok: false, code: "OPERATION_NOT_ALLOWED" });
      }
      expect(await getReferentsHelper()).toHaveLength(referentCountBefore.length);
    });

    it("should return 403 when a referent_department or referent_region invites a decommissioned role", async () => {
      // En production, referent_department/region ont un accès FULL sur la ressource REFERENT
      // (cf. api/src/__tests__/referent-security.test.ts) : ce test reproduit cet accès, absent du
      // beforeAll de ce fichier, pour exercer réellement canInviteUser plutôt que d'être arrêté plus
      // tôt par permissionAccessControlMiddleware.
      await addPermissionHelper([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION], PERMISSION_RESOURCES.REFERENT, PERMISSION_ACTIONS.FULL);
      for (const actorRole of [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION]) {
        for (const role of [ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE, ROLES.TRANSPORTER, ROLES.VISITOR]) {
          const referentFixture = { ...getInvitationFixture(), role };
          const res = await request(await getAppHelperWithAcl({ role: actorRole, department: ["Ain"], region: "Auvergne-Rhône-Alpes" }))
            .post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent.NEW_STRUCTURE_MEMBER}`)
            .send(referentFixture);
          expect(res.statusCode).toEqual(403);
          expect(res.body).toEqual({ ok: false, code: "OPERATION_NOT_ALLOWED" });
        }
      }
    });

    // PM27 : les textes libres fournis par l'appelant (structureName, prénom/nom de l'invité) ne
    // doivent plus se retrouver tels quels dans l'email officiel envoyé au nom du SNU.
    it("should read structureName from database and sanitize free-text fields of the official email", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), name: "Structure légitime" });
      const sendTemplateSpy = jest.spyOn(require("../brevo"), "sendTemplate");
      const referentFixture = {
        ...getInvitationFixture(),
        role: ROLES.RESPONSIBLE,
        structureId: structure._id.toString(),
        structureName: "<script>alert(1)</script>Structure usurpée",
        firstName: "<img src=x onerror=alert(1)>",
      };
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }))
        .post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent.NEW_STRUCTURE_MEMBER}`)
        .send(referentFixture);
      expect(res.statusCode).toEqual(200);

      const lastCall = sendTemplateSpy.mock.calls[sendTemplateSpy.mock.calls.length - 1] as any;
      expect(lastCall[1].params.structureName).toEqual(structure.name);
      expect(lastCall[1].params.toName).not.toContain("<");

      await deleteReferentByIdHelper(res.body.data._id);
      sendTemplateSpy.mockRestore();
    });
  });

  describe("POST /referent/signup_invite", () => {
    // CLE décommissionné (H17) : cette route non authentifiée ne doit plus pouvoir activer un compte
    // ADMINISTRATEUR_CLE ou REFERENT_CLASSE, même avec un jeton d'invitation valide.
    it("should return 403 when activating an ADMINISTRATEUR_CLE or REFERENT_CLASSE", async () => {
      for (const role of [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE]) {
        const invitationToken = `${Date.now()}-${role}`;
        const referentFixture = getNewReferentFixture({
          role,
          invitationToken,
          invitationExpires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        });
        const referent = await createReferentHelper(referentFixture);
        const res = await request(await getAppHelperWithAcl())
          .post("/referent/signup_invite")
          .send({
            email: referent.email,
            invitationToken,
            password: "Test1234567!",
            acceptCGU: "true",
          });
        expect(res.statusCode).toEqual(403);
        expect(res.body).toEqual({ ok: false, code: "OPERATION_NOT_ALLOWED" });
        const referentAfter = await getReferentByIdHelper(referent._id);
        expect(referentAfter?.registredAt).toBeFalsy();
        await deleteReferentByIdHelper(referent._id);
      }
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
      const response = await request(await getAppHelperWithAcl(user))
        .put(`/referent/young/${originalYoung._id}${queryParam || ""}`)
        .send(modifiedYoung);
      const young = await getYoungByIdHelper(originalYoung._id);
      if (!keepYoung) {
        await deleteYoungByIdHelper(originalYoung._id);
      }
      return { young, modifiedYoung, response, id: originalYoung._id };
    }
    it("valide un dossier sans contrôler l'objectif d'inscription (GOO-65, PL9)", async () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const cohort = await createCohortHelper(getNewCohortFixture({ instructionEndDate: tomorrow, objectifLevel: INSCRIPTION_GOAL_LEVELS.DEPARTEMENTAL }));
      // Objectif déjà atteint dans le département : la validation était refusée avant le décommissionnement.
      const inscriptionGoal = await createInscriptionGoal(getNewInscriptionGoalFixture({ cohort: cohort.name, cohortId: cohort._id, max: 1 }));
      await createYoungHelper(
        getNewYoungFixture({ status: YOUNG_STATUS.VALIDATED, region: inscriptionGoal.region, department: inscriptionGoal.department, cohort: cohort.name, cohortId: cohort._id }),
      );

      const { young, response } = await createYoungThenUpdate(
        { status: YOUNG_STATUS.VALIDATED },
        {
          status: YOUNG_STATUS.WAITING_VALIDATION,
          region: inscriptionGoal.region,
          department: inscriptionGoal.department,
          schoolDepartment: inscriptionGoal.department,
          cohort: cohort.name,
          cohortId: cohort._id,
        },
        undefined,
        { role: ROLES.REFERENT_DEPARTMENT, department: [inscriptionGoal.department!], region: inscriptionGoal.region },
      );
      expect(response.statusCode).toEqual(200);
      expect(young?.status).toEqual(YOUNG_STATUS.VALIDATED);
    });
    it("should return 404 if young not found", async () => {
      const res = await request(await getAppHelperWithAcl())
        .put(`/referent/young/${notExistingYoungId}`)
        .send();
      expect(res.statusCode).toEqual(404);
    });
    it("should update young name", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      // @ts-ignore: FIXME: young.name does not exist
      const { young, modifiedYoung, response } = await createYoungThenUpdate({ name: faker.company.name() }, { cohortId: cohort._id });
      expect(response.statusCode).toEqual(200);
      expectYoungToEqual(young, modifiedYoung);
    });
    it("ne touche ni au statut de phase 1 ni à l'affectation au désistement (GOO-65)", async () => {
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
    it("ignore la présence au séjour et n'en dérive plus le statut de phase 1 (GOO-65, PM28)", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      for (const cohesionStayPresence of ["true", "false"]) {
        const { young, response } = await createYoungThenUpdate({ cohesionStayPresence }, { cohesionStayPresence: undefined, statusPhase1: "AFFECTED", cohortId: cohort._id });
        expect(response.statusCode).toEqual(200);
        expect(young?.statusPhase1).toEqual("AFFECTED");
        expect(young?.cohesionStayPresence).toBeUndefined();
      }
    });
    it("ne recalcule plus les places de la session (GOO-65)", async () => {
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
      expect(updatedSessionPhase1?.placesLeft).toEqual(placesLeft);
    });
  });

  describe("POST /referent/:tutorId/email/:template", () => {
    it("should return 404 if tutor not found", async () => {
      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
        .post(`/referent/${notExistingReferentId}/email/test`)
        .send({ message: "hello", subject: "hi" });
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if tutor found", async () => {
      const tutor = await createReferentHelper(getNewReferentFixture());
      const res = await request(await getAppHelperWithAcl())
        .post(`/referent/${tutor._id}/email/${SENDINBLUE_TEMPLATES.referent.MISSION_WAITING_CORRECTION}`)
        .send({ message: "hello", subject: "hi" });
      expect(res.statusCode).toEqual(200);
    });
    it("should return 400 if wrong template", async () => {
      const tutor = await createReferentHelper(getNewReferentFixture());
      const res = await request(await getAppHelperWithAcl())
        .post(`/referent/${tutor._id}/email/001`)
        .send({ message: "hello", subject: "hi" });
      expect(res.statusCode).toEqual(400);
    });
    it("should return 400 if wrong template params", async () => {
      const tutor = await createReferentHelper(getNewReferentFixture());
      const res = await request(await getAppHelperWithAcl())
        .post(`/referent/${tutor._id}/email/001`)
        .send({ app: "is a string but must be object" });
      expect(res.statusCode).toEqual(400);
    });
  });

  describe("GET /referent/youngFile/:youngId/:key/:fileName", () => {
    it("should return 200 if file is found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(await getAppHelperWithAcl())
        .get("/referent/youngFile/" + young._id + "/equivalenceFiles/test.pdf")
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body.fileName).toEqual("test.pdf");
      expect(res.body.mimeType).toEqual("application/pdf");
    });
  });

  describe("POST /referent/file/:key", () => {
    it("should return 404 if young not found", async () => {
      const res = await request(await getAppHelperWithAcl())
        .get("/referent/file/cniFiles")
        .send({ body: JSON.stringify({ youngId: notExistingYoungId, names: ["e"] }) });
      expect(res.statusCode).toEqual(404);
    });
    it("should send file for the young", async () => {
      // This test should be improved to check the file is sent (currently no file is sent)
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(await getAppHelperWithAcl())
        .post("/referent/file/cniFiles")
        .send({ body: JSON.stringify({ youngId: young._id, names: ["e"] }) });
      expect(res.body).toEqual({ data: ["e"], ok: true });
    });
  });

  describe("GET /referent/young/:youngId", () => {
    it("should return 404 if young not found", async () => {
      const res = await request(await getAppHelperWithAcl())
        .get("/referent/young/" + notExistingYoungId)
        .send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if young found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(await getAppHelperWithAcl())
        .get("/referent/young/" + young._id)
        .send();
      expect(res.statusCode).toEqual(200);
      expectYoungToEqual(young, res.body.data);
    });
    it("should contain applications", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const structure: any = await createStructureHelper({ ...getNewStructureFixture() });
      const application: any = await createApplication({ ...getNewApplicationFixture(), youngId: young._id, structureId: structure._id });
      const res = await request(await getAppHelperWithAcl())
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
      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
        .get(`/referent/${notExistingReferentId}/patches`)
        .send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 403 if not admin", async () => {
      const referent: any = await createReferentHelper(getNewReferentFixture());
      referent.firstName = "MY NEW NAME";
      await referent.save();

      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE }))
        .get(`/referent/${referent._id}/patches`)
        .send();
      expect(res.status).toBe(403);
    });
    it("should return 200 if referent found with patches", async () => {
      const referent: any = await createReferentHelper(getNewReferentFixture());
      referent.firstName = "MY NEW NAME";
      await referent.save();
      const res = await request(await getAppHelperWithAcl())
        .get(`/referent/${referent._id}/patches`)
        .send();
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
      const res = await request(await getAppHelperWithAcl())
        .get(`/referent/${notExistingReferentId}`)
        .send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if referent found", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(await getAppHelperWithAcl())
        .get(`/referent/${referent._id}`)
        .send();
      expect(res.statusCode).toEqual(200);
      expectReferentToEqual(referent, res.body.data);
    });
    it("should return 403 if role is not admin", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE }))
        .get(`/referent/${referent._id}`)
        .send();
      expect(res.statusCode).toEqual(403);
    });
  });

  describe("PUT /referent", () => {
    it("should return 200 when valid params are given", async () => {
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: "123" }));
      const res = await request(await getAppHelperWithAcl(referent))
        .put(`/referent`)
        .send({ firstName: "MY NEW NAME" });
      expect(res.statusCode).toEqual(200);
    });
    it("should not update structureId if referent is responsible", async () => {
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: "123" }));
      const structure = await createStructureHelper(getNewStructureFixture());
      const res = await request(await getAppHelperWithAcl(referent))
        .put(`/referent`)
        .send({ structureId: structure._id });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.structureId).toEqual(referent.structureId);
    });
  });

  describe("PUT /referent/:id", () => {
    it("should return 400 when a role is given", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(await getAppHelperWithAcl())
        .put(`/referent/${referent._id}`)
        .send({ role: "referent" });
      expect(res.statusCode).toEqual(400);
    });
    it("should return 200 when firstName is given", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(await getAppHelperWithAcl())
        .put(`/referent/${referent._id}`)
        .send({ firstName: "MY NEW NAME" });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data?.firstName).toEqual("My New Name");
    });
    it("should return 404 if referent not found", async () => {
      const res = await request(await getAppHelperWithAcl())
        .put(`/referent/${notExistingReferentId}`)
        .send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if referent found", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(await getAppHelperWithAcl())
        .put(`/referent/${referent._id}`)
        .send({ firstName: "MY NEW NAME", lastName: "my neW last Name" });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(
        expect.objectContaining({
          firstName: "My New Name",
          lastName: "MY NEW LAST NAME",
        }),
      );
    });
    it("should return 403 if role is not admin", async () => {
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.SUPERVISOR }));
      for (const role of ROLES_LIST) {
        if (role !== ROLES.ADMIN) {
          const res = await request(await getAppHelperWithAcl({ role }))
            .put(`/referent/${referent._id}`)
            .send({ role: ROLES.ADMIN });
          expect(res.statusCode).toEqual(403);
        }
      }
    });

    // Rôle décommissionné (GOO-56, lot P24) : ni attribution ni réactivation, ADMIN compris
    // (canUpdateReferent, snu-lib).
    it("should return 403 when an admin attributes a decommissioned role", async () => {
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Ain"] }));
      const res = await request(await getAppHelperWithAcl())
        .put(`/referent/${referent._id}`)
        .send({ role: ROLES.HEAD_CENTER });
      expect(res.statusCode).toEqual(403);
      const referentAfter = await getReferentByIdHelper(referent._id);
      expect(referentAfter?.role).toEqual(ROLES.REFERENT_DEPARTMENT);
    });

    it("should return 403 when an admin reactivates a referent whose role is decommissioned", async () => {
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.TRANSPORTER, status: ReferentStatus.INACTIVE }));
      const res = await request(await getAppHelperWithAcl())
        .put(`/referent/${referent._id}`)
        .send({ status: ReferentStatus.ACTIVE });
      expect(res.statusCode).toEqual(403);
      const referentAfter = await getReferentByIdHelper(referent._id);
      expect(referentAfter?.status).toEqual(ReferentStatus.INACTIVE);
    });

    it("should return 403 if responsible try to change structure", async () => {
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: "123" }));
      const structure = await createStructureHelper(getNewStructureFixture());
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE }))
        .put(`/referent/${referent._id}`)
        .send({ structureId: structure._id });
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
      const res = await request(await getAppHelperWithAcl())
        .put(`/referent/${referent._id}`)
        .send({ firstName, lastName });
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
      const res = await request(await getAppHelperWithAcl())
        .delete(`/referent/${notExistingReferentId}`)
        .send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if referent found", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN, subRole: SUB_ROLE_GOD }))
        .delete(`/referent/${referent._id}`)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(await getReferentByIdHelper(referent._id)).toBeNull();
    });
    it("should return 403 if not super admin", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
        .delete(`/referent/${referent._id}`)
        .send();
      expect(res.statusCode).toEqual(403);
    });
    it("should return 403 if role is not admin", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE }))
        .delete(`/referent/${referent._id}`)
        .send();
      expect(res.statusCode).toEqual(403);
    });
  });

  describe("POST /referent/signin_as/:type/:id", () => {
    it("should return 403 if role is not admin", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());

      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE }))
        .post("/referent/signin_as/referent/" + referent._id)
        .send();
      expect(res.statusCode).toEqual(403);
    });
    it("should return 404 if referent not found", async () => {
      const res = await request(await getAppHelperWithAcl())
        .post("/referent/signin_as/referent/" + notExistingReferentId)
        .send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 400 if type param is not found", async () => {
      const res = await request(await getAppHelperWithAcl())
        .post("/referent/signin_as/foo/bar")
        .send();
      expect(res.statusCode).toEqual(400);
    });
    it("should return 403 when impersonate user has subrole god", async () => {
      const referent = await createReferentHelper(getNewReferentFixture({ subRole: SUB_ROLE_GOD }));

      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
        .post("/referent/signin_as/referent/" + referent._id)
        .send();
      expect(res.statusCode).toEqual(403);
    });
    it("should return 200 if referent found", async () => {
      const referent: any = await createReferentHelper(getNewReferentFixture());
      const res = await request(await getAppHelperWithAcl())
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
      const res = await request(await getAppHelperWithAcl())
        .post("/referent/signin_as/young/" + young._id)
        .send();
      expect(res.statusCode).toEqual(200);
    });
    it("should return a jwt token", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(await getAppHelperWithAcl())
        .post("/referent/signin_as/referent/" + referent._id)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.headers["set-cookie"][0]).toContain("jwt_ref=");
    });
  });
});
