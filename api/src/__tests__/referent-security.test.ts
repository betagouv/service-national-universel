/**
 * Reproduction des constats de l'audit sécurité du 21/09/2026 sur le contrôleur référent.
 *
 * C20 POST /referent/signup_invite/:template : subRole non validé + périmètre (structure / géographie) non contrôlé
 * C21 PUT  /referent/:id                     : mass-assignment auth + absence de périmètre + document brut en réponse
 * C22 PUT  /referent/young/:id               : mass-assignment auth + canEditYoung sans périmètre + document brut
 * H72 PUT  /referent/                        : auto-attribution du sous-rôle `god`
 * M69 PUT  /referent/young/:id/phase1Status/:document : référents dép./rég. sans périmètre
 * H69 GET  /referent/:id                     : canViewReferent sans périmètre (profil complet de tout référent)
 * H68 GET  /referent/:id/patches             : USER_HISTORY ignorePolicy (historique de tout référent)
 * M68 GET  /referent?email=                  : annuaire par email ouvert à la famille chef de centre
 *
 * Audit des fronts du 23/09/2026 :
 * FM7 department libre : un tableau `[département, formule]` devenait une formule dans l'export Excel
 */
import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;

import { ROLES, SUB_ROLE_GOD, SUB_ROLES, PERMISSION_RESOURCES, PERMISSION_ACTIONS, YOUNG_SOURCE, SENDINBLUE_TEMPLATES, ReferentStatus } from "snu-lib";

import { PermissionModel } from "../models/permissions/permission";
import { RoleModel } from "../models/permissions/role";
import { ReferentModel, YoungModel, StructureModel, SessionPhase1Model, CohesionCenterModel, ClasseModel, EtablissementModel } from "../models";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { addPermissionHelper } from "./helpers/permissions";
import { getNewReferentFixture } from "./fixtures/referent";
import { FIXTURE_PASSWORD } from "./fixtures/password";
import getNewYoungFixture from "./fixtures/young";
import getNewStructureFixture from "./fixtures/structure";
import { getNewSessionPhase1Fixture } from "./fixtures/sessionPhase1";
import { getNewCohesionCenterFixture } from "./fixtures/cohesionCenter";
import { createFixtureClasse } from "./fixtures/classe";
import { createFixtureEtablissement } from "./fixtures/etablissement";
import { createReferentHelper, getReferentByIdHelper } from "./helpers/referent";
import { createYoungHelper, getYoungByIdHelper } from "./helpers/young";
import { createStructureHelper } from "./helpers/structure";

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  getFile: () => Promise.resolve({ Body: "" }),
  uploadFile: (path, file) => Promise.resolve({ path, file }),
}));

/** Rejoue les permissions de production utiles à ces routes (migration 20250624122150). */
async function seedPermissions() {
  await PermissionModel.deleteMany();
  await RoleModel.deleteMany();
  const ownStructurePolicy = { where: [{ field: "_id", source: "structureId" }] } as any;
  const networkPolicy = { where: [{ field: "networkId", source: "structureId" }] } as any;

  // REFERENT (utilisateurs)
  await addPermissionHelper([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION], PERMISSION_RESOURCES.REFERENT, PERMISSION_ACTIONS.FULL);
  await addPermissionHelper([ROLES.RESPONSIBLE, ROLES.SUPERVISOR], PERMISSION_RESOURCES.REFERENT, PERMISSION_ACTIONS.FULL, ownStructurePolicy);
  // STRUCTURE
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.STRUCTURE, PERMISSION_ACTIONS.FULL);
  await addPermissionHelper([ROLES.RESPONSIBLE, ROLES.SUPERVISOR], PERMISSION_RESOURCES.STRUCTURE, PERMISSION_ACTIONS.WRITE, ownStructurePolicy);
  await addPermissionHelper([ROLES.SUPERVISOR], PERMISSION_RESOURCES.STRUCTURE, PERMISSION_ACTIONS.WRITE, networkPolicy);
  await addPermissionHelper([ROLES.REFERENT_REGION], PERMISSION_RESOURCES.STRUCTURE, PERMISSION_ACTIONS.WRITE, {
    where: [{ field: "region", source: "region" }],
  } as any);
  await addPermissionHelper([ROLES.REFERENT_DEPARTMENT], PERMISSION_RESOURCES.STRUCTURE, PERMISSION_ACTIONS.WRITE, {
    where: [{ field: "department", source: "department" }],
  } as any);
  // USER_HISTORY est seedée sans policy en production (migrations 20250624122150 / 20250801060707).
  await addPermissionHelper(
    [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.RESPONSIBLE, ROLES.SUPERVISOR, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE],
    PERMISSION_RESOURCES.USER_HISTORY,
    PERMISSION_ACTIONS.READ,
  );
}

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await seedPermissions();
});
afterAll(dbClose);
beforeEach(async () => {
  await ReferentModel.deleteMany();
  await YoungModel.deleteMany();
  await StructureModel.deleteMany();
  await SessionPhase1Model.deleteMany();
  await CohesionCenterModel.deleteMany();
  await ClasseModel.deleteMany();
  await EtablissementModel.deleteMany();
});
afterEach(resetAppAuth);

const TEMPLATE = SENDINBLUE_TEMPLATES.invitationReferent[ROLES.RESPONSIBLE];

describe("Sécurité référent — audit 2026-09-21", () => {
  describe("C20 — POST /referent/signup_invite/:template", () => {
    it("refuse un subRole qui n'appartient pas au rôle invité (élévation via `roles`)", async () => {
      const actorStructure = await createStructureHelper(getNewStructureFixture());
      const actor = { role: ROLES.RESPONSIBLE, structureId: actorStructure._id.toString() };

      const res = await request(await getAppHelperWithAcl(actor))
        .post(`/referent/signup_invite/${TEMPLATE}`)
        .send({
          email: "attaquant-god@example.org",
          firstName: "A",
          lastName: "B",
          role: ROLES.RESPONSIBLE,
          subRole: SUB_ROLE_GOD,
          structureId: actorStructure._id.toString(),
        });

      expect(res.statusCode).toEqual(400);
      expect(await ReferentModel.findOne({ email: "attaquant-god@example.org" })).toBeNull();
    });

    it("refuse un subRole d'un autre rôle parent", async () => {
      const actorStructure = await createStructureHelper(getNewStructureFixture());
      const actor = { role: ROLES.RESPONSIBLE, structureId: actorStructure._id.toString() };

      const res = await request(await getAppHelperWithAcl(actor))
        .post(`/referent/signup_invite/${TEMPLATE}`)
        .send({
          email: "attaquant-subrole@example.org",
          firstName: "A",
          lastName: "B",
          role: ROLES.RESPONSIBLE,
          subRole: SUB_ROLES.manager_department,
          structureId: actorStructure._id.toString(),
        });

      expect(res.statusCode).toEqual(400);
    });

    it("refuse le rattachement à une structure hors périmètre", async () => {
      const actorStructure = await createStructureHelper(getNewStructureFixture());
      const otherStructure = await createStructureHelper(getNewStructureFixture());
      const actor = { role: ROLES.RESPONSIBLE, structureId: actorStructure._id.toString() };

      const res = await request(await getAppHelperWithAcl(actor))
        .post(`/referent/signup_invite/${TEMPLATE}`)
        .send({
          email: "attaquant-structure@example.org",
          firstName: "A",
          lastName: "B",
          role: ROLES.RESPONSIBLE,
          structureId: otherStructure._id.toString(),
        });

      expect(res.statusCode).toEqual(403);
      expect(await ReferentModel.findOne({ email: "attaquant-structure@example.org" })).toBeNull();
    });

    it("refuse un département hors périmètre pour un référent départemental", async () => {
      const actor = { role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" };

      const res = await request(await getAppHelperWithAcl(actor))
        .post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent[ROLES.REFERENT_DEPARTMENT]}`)
        .send({
          email: "attaquant-national@example.org",
          firstName: "A",
          lastName: "B",
          role: ROLES.REFERENT_DEPARTMENT,
          department: ["Sarthe", "Paris", "Nord"],
          region: "Pays de la Loire",
        });

      expect(res.statusCode).toEqual(403);
    });

    it("refuse un template Brevo arbitraire", async () => {
      const actorStructure = await createStructureHelper(getNewStructureFixture());
      const actor = { role: ROLES.RESPONSIBLE, structureId: actorStructure._id.toString() };

      const res = await request(await getAppHelperWithAcl(actor))
        .post("/referent/signup_invite/1283")
        .send({
          email: "attaquant-template@example.org",
          firstName: "A",
          lastName: "B",
          role: ROLES.RESPONSIBLE,
          structureId: actorStructure._id.toString(),
        });

      expect(res.statusCode).toEqual(400);
    });

    it("laisse passer une invitation légitime dans son périmètre", async () => {
      const actorStructure = await createStructureHelper(getNewStructureFixture());
      const actor = { role: ROLES.RESPONSIBLE, structureId: actorStructure._id.toString() };

      const res = await request(await getAppHelperWithAcl(actor))
        .post(`/referent/signup_invite/${TEMPLATE}`)
        .send({
          email: "collegue@example.org",
          firstName: "A",
          lastName: "B",
          role: ROLES.RESPONSIBLE,
          structureId: actorStructure._id.toString(),
        });

      expect(res.statusCode).toEqual(200);
      const created = await ReferentModel.findOne({ email: "collegue@example.org" });
      expect(created?.structureId).toEqual(actorStructure._id.toString());
    });
  });

  describe("C21 — PUT /referent/:id", () => {
    it("n'écrit pas le mot de passe d'un autre référent", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const victime = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), password: FIXTURE_PASSWORD }));
      const hashAvant = (await ReferentModel.findById(victime._id).select("+password"))!.password;
      const actor = { role: ROLES.RESPONSIBLE, structureId: structure._id.toString() };

      await request(await getAppHelperWithAcl(actor))
        .put(`/referent/${victime._id}`)
        .send({ password: "Nouveau1!" });

      expect((await ReferentModel.findById(victime._id).select("+password"))!.password).toEqual(hashAvant);
    });

    it("n'écrit pas invitationToken / forgotPasswordResetToken", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const victime = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), invitationToken: "ORIGINAL" } as any));
      const actor = { role: ROLES.RESPONSIBLE, structureId: structure._id.toString() };

      for (const body of [{ invitationToken: "XATTACKER" }, { forgotPasswordResetToken: "XATTACKER" }]) {
        await request(await getAppHelperWithAcl(actor))
          .put(`/referent/${victime._id}`)
          .send(body);
      }
      const apres = await getReferentByIdHelper(victime._id);
      expect(apres?.invitationToken).toEqual("ORIGINAL");
      expect(apres?.forgotPasswordResetToken).not.toEqual("XATTACKER");
    });

    it("refuse un responsable modifiant un responsable d'une autre structure", async () => {
      const actorStructure = await createStructureHelper(getNewStructureFixture());
      const otherStructure = await createStructureHelper(getNewStructureFixture());
      const victime = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: otherStructure._id.toString() }));
      const actor = { role: ROLES.RESPONSIBLE, structureId: actorStructure._id.toString() };

      const res = await request(await getAppHelperWithAcl(actor))
        .put(`/referent/${victime._id}`)
        .send({ email: "attaquant@example.org" });

      expect(res.statusCode).toEqual(403);
      expect((await getReferentByIdHelper(victime._id))?.email).toEqual(victime.email);
    });

    it("autorise un responsable modifiant un membre de sa propre structure", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const collegue = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }));
      const actor = { role: ROLES.RESPONSIBLE, structureId: structure._id.toString() };

      const res = await request(await getAppHelperWithAcl(actor))
        .put(`/referent/${collegue._id}`)
        .send({ firstName: "NOUVEAU" });

      expect(res.statusCode).toEqual(200);
    });

    it("refuse un référent départemental modifiant un chef de centre hors de son département", async () => {
      const centre = await CohesionCenterModel.create(getNewCohesionCenterFixture({ department: "Paris", region: "Ile-de-France" }));
      const chefDeCentre = await createReferentHelper(
        getNewReferentFixture({ role: ROLES.HEAD_CENTER, cohesionCenterId: centre._id.toString(), department: undefined, region: undefined }),
      );
      const actor = { role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" };

      const res = await request(await getAppHelperWithAcl(actor))
        .put(`/referent/${chefDeCentre._id}`)
        .send({ email: "attaquant@example.org" });

      expect(res.statusCode).toEqual(403);
    });

    it("autorise un référent départemental modifiant un chef de centre de son département", async () => {
      const centre = await CohesionCenterModel.create(getNewCohesionCenterFixture({ department: "Sarthe", region: "Pays de la Loire" }));
      const chefDeCentre = await createReferentHelper(
        getNewReferentFixture({ role: ROLES.HEAD_CENTER, cohesionCenterId: centre._id.toString(), department: undefined, region: undefined }),
      );
      const actor = { role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" };

      const res = await request(await getAppHelperWithAcl(actor))
        .put(`/referent/${chefDeCentre._id}`)
        .send({ firstName: "NOUVEAU" });

      expect(res.statusCode).toEqual(200);
    });

    it("refuse d'attribuer un sous-rôle étranger au rôle via PUT /referent/:id", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const cible = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), subRole: undefined }));

      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
        .put(`/referent/${cible._id}`)
        .send({ subRole: SUB_ROLES.manager_department });

      expect(res.statusCode).toEqual(400);
      expect((await getReferentByIdHelper(cible._id))?.roles).not.toContain(SUB_ROLES.manager_department);
    });

    it("ne renvoie jamais les jetons d'authentification de la cible", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const victime = await createReferentHelper(
        getNewReferentFixture({
          role: ROLES.RESPONSIBLE,
          structureId: structure._id.toString(),
          invitationToken: "SECRET_INVITATION",
          forgotPasswordResetToken: "SECRET_RESET",
          token2FA: "SECRET_2FA",
        } as any),
      );
      const actor = { role: ROLES.RESPONSIBLE, structureId: structure._id.toString() };

      const res = await request(await getAppHelperWithAcl(actor))
        .put(`/referent/${victime._id}`)
        .send({ firstName: "NOUVEAU" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).not.toHaveProperty("invitationToken");
      expect(res.body.data).not.toHaveProperty("forgotPasswordResetToken");
      expect(res.body.data).not.toHaveProperty("token2FA");
      expect(JSON.stringify(res.body)).not.toContain("SECRET_");
    });
  });

  describe("C21 — PUT /referent/:id/structure/:structureId", () => {
    it("refuse de rattacher un référent hors périmètre à sa propre structure", async () => {
      const actorStructure = await createStructureHelper(getNewStructureFixture());
      const otherStructure = await createStructureHelper(getNewStructureFixture());
      const victime = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: otherStructure._id.toString() }));
      const actor = { role: ROLES.RESPONSIBLE, structureId: actorStructure._id.toString() };

      const res = await request(await getAppHelperWithAcl(actor))
        .put(`/referent/${victime._id}/structure/${actorStructure._id}`)
        .send();

      expect(res.statusCode).toEqual(403);
      expect((await getReferentByIdHelper(victime._id))?.structureId).toEqual(otherStructure._id.toString());
    });

    it("ne renvoie jamais les jetons d'authentification de la cible", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const cible = await createReferentHelper(
        getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), invitationToken: "SECRET_INVITATION" } as any),
      );

      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
        .put(`/referent/${cible._id}/structure/${structure._id}`)
        .send();

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).not.toHaveProperty("invitationToken");
    });
  });

  describe("GOO-5 — valeurs demandées sur PUT /referent/:id", () => {
    const sarthe = { role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" };

    it("refuse à un référent départemental de s'attribuer d'autres départements (FH9)", async () => {
      const soi = await createReferentHelper(getNewReferentFixture(sarthe));

      const res = await request(await getAppHelperWithAcl(soi))
        .put(`/referent/${soi._id}`)
        .send({ department: ["Sarthe", "Paris"], region: "Pays de la Loire" });

      expect(res.statusCode).toEqual(403);
      expect((await getReferentByIdHelper(soi._id))?.department).toEqual(["Sarthe"]);
    });

    it("refuse à un référent régional de changer sa propre région", async () => {
      const soi = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_REGION, region: "Pays de la Loire", department: [] }));

      const res = await request(await getAppHelperWithAcl(soi))
        .put(`/referent/${soi._id}`)
        .send({ region: "Ile-de-France" });

      expect(res.statusCode).toEqual(403);
      expect((await getReferentByIdHelper(soi._id))?.region).toEqual("Pays de la Loire");
    });

    it("accepte le formulaire complet renvoyé sans changement de géographie", async () => {
      const soi = await createReferentHelper(getNewReferentFixture(sarthe));

      const res = await request(await getAppHelperWithAcl(soi))
        .put(`/referent/${soi._id}`)
        .send({ firstName: "NOUVEAU", email: soi.email, department: ["Sarthe"], region: "Pays de la Loire", status: soi.status });

      expect(res.statusCode).toEqual(200);
      expect((await getReferentByIdHelper(soi._id))?.firstName).toEqual("Nouveau");
    });

    it("refuse de placer un pair hors du territoire de l'acteur", async () => {
      const pair = await createReferentHelper(getNewReferentFixture(sarthe));

      const res = await request(await getAppHelperWithAcl(sarthe))
        .put(`/referent/${pair._id}`)
        .send({ department: ["Paris"], region: "Ile-de-France" });

      expect(res.statusCode).toEqual(403);
      expect((await getReferentByIdHelper(pair._id))?.department).toEqual(["Sarthe"]);
    });

    it("autorise un référent régional à répartir un pair entre les départements de sa région", async () => {
      const pair = await createReferentHelper(getNewReferentFixture(sarthe));

      const res = await request(await getAppHelperWithAcl({ role: ROLES.REFERENT_REGION, region: "Pays de la Loire", department: [] }))
        .put(`/referent/${pair._id}`)
        .send({ department: ["Mayenne"], region: "Pays de la Loire" });

      expect(res.statusCode).toEqual(200);
      expect((await getReferentByIdHelper(pair._id))?.department).toEqual(["Mayenne"]);
    });

    it("refuse de changer son propre sous-rôle", async () => {
      const soi = await createReferentHelper(getNewReferentFixture({ ...sarthe, subRole: SUB_ROLES.assistant_manager_department }));

      const res = await request(await getAppHelperWithAcl(soi))
        .put(`/referent/${soi._id}`)
        .send({ subRole: SUB_ROLES.manager_department });

      expect(res.statusCode).toEqual(403);
      expect((await getReferentByIdHelper(soi._id))?.subRole).toEqual(SUB_ROLES.assistant_manager_department);
    });

    it("refuse à un responsable de réactiver un coéquipier (FH5)", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const coequipier = await createReferentHelper(
        getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), status: ReferentStatus.INACTIVE } as any),
      );

      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }))
        .put(`/referent/${coequipier._id}`)
        .send({ status: ReferentStatus.ACTIVE });

      expect(res.statusCode).toEqual(403);
      expect((await getReferentByIdHelper(coequipier._id))?.status).toEqual(ReferentStatus.INACTIVE);
    });

    it("refuse à un titulaire de désactiver ou réactiver son propre compte", async () => {
      const soi = await createReferentHelper(getNewReferentFixture(sarthe));

      const res = await request(await getAppHelperWithAcl(soi))
        .put(`/referent/${soi._id}`)
        .send({ status: ReferentStatus.INACTIVE });

      expect(res.statusCode).toEqual(403);
    });

    it("refuse de changer l'email d'un collègue du périmètre", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const responsable = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }));
      const pair = await createReferentHelper(getNewReferentFixture(sarthe));

      const acteurs = [
        { actor: { role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }, cible: responsable },
        { actor: { role: ROLES.SUPERVISOR, structureId: structure._id.toString() }, cible: responsable },
        { actor: sarthe, cible: pair },
        { actor: { role: ROLES.REFERENT_REGION, region: "Pays de la Loire", department: [] }, cible: pair },
      ];
      for (const { actor, cible } of acteurs) {
        const res = await request(await getAppHelperWithAcl(actor))
          .put(`/referent/${cible._id}`)
          .send({ email: "attaquant@example.org" });

        expect(res.statusCode).toEqual(403);
        expect((await getReferentByIdHelper(cible._id))?.email).toEqual(cible.email);
      }
    });

    it("laisse l'admin changer l'email, le statut et la géographie", async () => {
      const cible = await createReferentHelper(getNewReferentFixture(sarthe));

      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
        .put(`/referent/${cible._id}`)
        .send({ email: "nouvel-email@example.org", status: ReferentStatus.INACTIVE, department: ["Paris"], region: "Ile-de-France" });

      expect(res.statusCode).toEqual(200);
      const apres = await getReferentByIdHelper(cible._id);
      expect(apres?.email).toEqual("nouvel-email@example.org");
      expect(apres?.status).toEqual(ReferentStatus.INACTIVE);
      expect(apres?.department).toEqual(["Paris"]);
    });
  });

  describe("GOO-5 — PUT /referent/:id/structure/:structureId", () => {
    it("refuse à un référent départemental de rétrograder un pair en responsable", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), department: "Sarthe", region: "Pays de la Loire" });
      const pair = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" }));

      const res = await request(await getAppHelperWithAcl({ role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" }))
        .put(`/referent/${pair._id}/structure/${structure._id}`)
        .send();

      expect(res.statusCode).toEqual(403);
      const apres = await getReferentByIdHelper(pair._id);
      expect(apres?.role).toEqual(ROLES.REFERENT_DEPARTMENT);
      expect(apres?.structureId).toBeFalsy();
    });

    it("laisse un référent départemental rattacher un responsable de son territoire", async () => {
      const origine = await createStructureHelper({ ...getNewStructureFixture(), department: "Sarthe", region: "Pays de la Loire" });
      const accueil = await createStructureHelper({ ...getNewStructureFixture(), department: "Sarthe", region: "Pays de la Loire" });
      const responsable = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: origine._id.toString(), department: [], region: "" }));

      const res = await request(await getAppHelperWithAcl({ role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" }))
        .put(`/referent/${responsable._id}/structure/${accueil._id}`)
        .send();

      expect(res.statusCode).toEqual(200);
      expect((await getReferentByIdHelper(responsable._id))?.structureId).toEqual(accueil._id.toString());
    });
  });

  describe("GOO-5 — PUT /structure/:id", () => {
    it("refuse à un responsable de déplacer sa structure dans un autre département", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), department: "Sarthe", region: "Pays de la Loire" });

      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }))
        .put(`/structure/${structure._id}`)
        .send({ department: "Paris", region: "Ile-de-France" });

      expect(res.statusCode).toEqual(403);
      expect((await StructureModel.findById(structure._id))?.department).toEqual("Sarthe");
    });

    it("laisse un responsable modifier sa structure sans en changer la géographie", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), department: "Sarthe", region: "Pays de la Loire" });

      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }))
        .put(`/structure/${structure._id}`)
        .send({ name: "Nouveau nom", department: "Sarthe", region: "Pays de la Loire" });

      expect(res.statusCode).toEqual(200);
      expect((await StructureModel.findById(structure._id))?.name).toEqual("Nouveau nom");
    });

    it("refuse à un référent départemental de sortir une structure de son département", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), department: "Sarthe", region: "Pays de la Loire" });

      const res = await request(await getAppHelperWithAcl({ role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" }))
        .put(`/structure/${structure._id}`)
        .send({ department: "Paris", region: "Ile-de-France" });

      expect(res.statusCode).toEqual(403);
      expect((await StructureModel.findById(structure._id))?.department).toEqual("Sarthe");
    });
  });

  describe("C22 — PUT /referent/young/:id", () => {
    it("n'écrit pas invitationToken sur un jeune", async () => {
      const young = await createYoungHelper(getNewYoungFixture());

      await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
        .put(`/referent/young/${young._id}`)
        .send({ invitationToken: "XATTACKER", invitationExpires: "2099-01-01T00:00:00.000Z" });

      expect((await getYoungByIdHelper(young._id))?.invitationToken).not.toEqual("XATTACKER");
    });

    it("n'écrit pas le mot de passe d'un jeune", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ password: FIXTURE_PASSWORD } as any));
      const hashAvant = (await YoungModel.findById(young._id).select("+password"))!.password;

      await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
        .put(`/referent/young/${young._id}`)
        .send({ password: "Nouveau1!" });

      expect((await YoungModel.findById(young._id).select("+password"))!.password).toEqual(hashAvant);
    });

    it("refuse un chef de centre modifiant un jeune d'une autre session", async () => {
      const centre = await CohesionCenterModel.create(getNewCohesionCenterFixture());
      const sessionDuChef = await SessionPhase1Model.create(getNewSessionPhase1Fixture({ cohesionCenterId: centre._id.toString(), headCenterId: new ObjectId().toString() }));
      const autreSession = await SessionPhase1Model.create(getNewSessionPhase1Fixture({ cohesionCenterId: centre._id.toString() }));
      const chefDeCentre = await createReferentHelper(getNewReferentFixture({ role: ROLES.HEAD_CENTER }));
      await SessionPhase1Model.updateOne({ _id: sessionDuChef._id }, { headCenterId: chefDeCentre._id.toString() });
      const young = await createYoungHelper(getNewYoungFixture({ sessionPhase1Id: autreSession._id.toString() }));

      const res = await request(await getAppHelperWithAcl(chefDeCentre))
        .put(`/referent/young/${young._id}`)
        .send({ email: "attaquant@example.org" });

      expect(res.statusCode).toEqual(403);
      expect((await getYoungByIdHelper(young._id))?.email).toEqual(young.email);
    });

    it("autorise un chef de centre modifiant un jeune de sa session", async () => {
      const centre = await CohesionCenterModel.create(getNewCohesionCenterFixture());
      const chefDeCentre = await createReferentHelper(getNewReferentFixture({ role: ROLES.HEAD_CENTER }));
      const session = await SessionPhase1Model.create(getNewSessionPhase1Fixture({ cohesionCenterId: centre._id.toString(), headCenterId: chefDeCentre._id.toString() }));
      const young = await createYoungHelper(getNewYoungFixture({ sessionPhase1Id: session._id.toString() }));

      const res = await request(await getAppHelperWithAcl(chefDeCentre))
        .put(`/referent/young/${young._id}`)
        .send({ firstName: "NOUVEAU" });

      expect(res.statusCode).toEqual(200);
    });

    it("refuse un référent de classe modifiant un jeune CLE d'un autre établissement", async () => {
      const referentClasse = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE }));
      const etablissement = await EtablissementModel.create(createFixtureEtablissement());
      const classe = await ClasseModel.create(createFixtureClasse({ etablissementId: etablissement._id.toString(), referentClasseIds: [] }));
      const young = await createYoungHelper(getNewYoungFixture({ source: YOUNG_SOURCE.CLE, classeId: classe._id.toString(), etablissementId: etablissement._id.toString() }));

      const res = await request(await getAppHelperWithAcl(referentClasse))
        .put(`/referent/young/${young._id}`)
        .send({ email: "attaquant@example.org" });

      expect(res.statusCode).toEqual(403);
    });

    it("autorise un référent de classe modifiant un jeune de sa classe", async () => {
      const referentClasse = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE }));
      const etablissement = await EtablissementModel.create(createFixtureEtablissement());
      const classe = await ClasseModel.create(createFixtureClasse({ etablissementId: etablissement._id.toString(), referentClasseIds: [referentClasse._id.toString()] }));
      const young = await createYoungHelper(getNewYoungFixture({ source: YOUNG_SOURCE.CLE, classeId: classe._id.toString(), etablissementId: etablissement._id.toString() }));

      const res = await request(await getAppHelperWithAcl(referentClasse))
        .put(`/referent/young/${young._id}`)
        .send({ firstName: "NOUVEAU" });

      expect(res.statusCode).toEqual(200);
    });

    it("ne renvoie jamais les jetons d'authentification du jeune", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ invitationToken: "SECRET_INVITATION", forgotPasswordResetToken: "SECRET_RESET" } as any));

      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
        .put(`/referent/young/${young._id}`)
        .send({ firstName: "NOUVEAU" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).not.toHaveProperty("invitationToken");
      expect(res.body.data).not.toHaveProperty("forgotPasswordResetToken");
      expect(JSON.stringify(res.body)).not.toContain("SECRET_");
    });
  });

  describe("H72 — PUT /referent/ (auto-mise à jour)", () => {
    it("refuse qu'un admin s'attribue le sous-rôle god", async () => {
      const admin = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN, subRole: undefined }));

      const res = await request(await getAppHelperWithAcl(admin))
        .put("/referent")
        .send({ subRole: SUB_ROLE_GOD });

      expect(res.statusCode).toEqual(403);
      expect((await getReferentByIdHelper(admin._id))?.subRole).not.toEqual(SUB_ROLE_GOD);
    });

    it("laisse un superadmin sauvegarder son profil sans perdre son sous-rôle", async () => {
      const god = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN, subRole: SUB_ROLE_GOD } as any));

      const res = await request(await getAppHelperWithAcl(god))
        .put("/referent")
        .send({ firstName: "NOUVEAU", subRole: SUB_ROLE_GOD });

      expect(res.statusCode).toEqual(200);
      expect((await getReferentByIdHelper(god._id))?.subRole).toEqual(SUB_ROLE_GOD);
    });

    it("refuse qu'un référent s'attribue un sous-rôle d'un autre rôle", async () => {
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, subRole: undefined }));

      const res = await request(await getAppHelperWithAcl(referent))
        .put("/referent")
        .send({ subRole: SUB_ROLES.coordinator });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe("H69 — GET /referent/:id", () => {
    it("refuse un responsable lisant un responsable d'une autre structure", async () => {
      const actorStructure = await createStructureHelper(getNewStructureFixture());
      const otherStructure = await createStructureHelper(getNewStructureFixture());
      const cible = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: otherStructure._id.toString() }));
      const actor = { role: ROLES.RESPONSIBLE, structureId: actorStructure._id.toString() };

      const res = await request(await getAppHelperWithAcl(actor)).get(`/referent/${cible._id}`);

      expect(res.statusCode).toEqual(403);
      expect(JSON.stringify(res.body)).not.toContain(cible.email);
    });

    it("autorise un responsable lisant un membre de sa propre structure", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const collegue = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }));
      const actor = { role: ROLES.RESPONSIBLE, structureId: structure._id.toString() };

      const res = await request(await getAppHelperWithAcl(actor)).get(`/referent/${collegue._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.email).toEqual(collegue.email);
    });

    it("autorise un superviseur lisant un responsable d'une structure de son réseau", async () => {
      const teteDeReseau = await createStructureHelper(getNewStructureFixture());
      const structureDuReseau = await createStructureHelper({ ...getNewStructureFixture(), networkId: teteDeReseau._id.toString() } as any);
      const cible = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structureDuReseau._id.toString() }));
      const actor = { role: ROLES.SUPERVISOR, structureId: teteDeReseau._id.toString() };

      const res = await request(await getAppHelperWithAcl(actor)).get(`/referent/${cible._id}`);

      expect(res.statusCode).toEqual(200);
    });

    it("refuse un superviseur lisant un responsable hors de son réseau", async () => {
      const teteDeReseau = await createStructureHelper(getNewStructureFixture());
      const structureEtrangere = await createStructureHelper(getNewStructureFixture());
      const cible = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structureEtrangere._id.toString() }));
      const actor = { role: ROLES.SUPERVISOR, structureId: teteDeReseau._id.toString() };

      const res = await request(await getAppHelperWithAcl(actor)).get(`/referent/${cible._id}`);

      expect(res.statusCode).toEqual(403);
    });

    it("refuse un référent départemental lisant un référent d'un autre département", async () => {
      const cible = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Paris"], region: "Ile-de-France" }));
      const actor = { role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" };

      const res = await request(await getAppHelperWithAcl(actor)).get(`/referent/${cible._id}`);

      expect(res.statusCode).toEqual(403);
    });

    it("autorise un référent départemental lisant un référent de son département", async () => {
      const cible = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" }));
      const actor = { role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" };

      const res = await request(await getAppHelperWithAcl(actor)).get(`/referent/${cible._id}`);

      expect(res.statusCode).toEqual(200);
    });

    // GOO-46 : l'annuaire d'un référent départemental liste les référents régionaux et visiteurs de sa région.
    it.each([ROLES.REFERENT_REGION, ROLES.VISITOR])("GOO-46 — autorise un référent départemental lisant un %s de sa région", async (role) => {
      const cible = await createReferentHelper(getNewReferentFixture({ role, department: [], region: "Île-de-France" }));
      const actor = { role: ROLES.REFERENT_DEPARTMENT, department: ["Hauts-de-Seine"], region: "Île-de-France" };

      const res = await request(await getAppHelperWithAcl(actor)).get(`/referent/${cible._id}`);

      expect(res.statusCode).toEqual(200);
    });

    it("GOO-46 — refuse un référent départemental lisant un référent régional d'une autre région", async () => {
      const cible = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_REGION, department: [], region: "Bretagne" }));
      const actor = { role: ROLES.REFERENT_DEPARTMENT, department: ["Hauts-de-Seine"], region: "Île-de-France" };

      const res = await request(await getAppHelperWithAcl(actor)).get(`/referent/${cible._id}`);

      expect(res.statusCode).toEqual(403);
    });

    it("GOO-46 — la lecture du référent régional n'ouvre pas sa modification au référent départemental", async () => {
      const cible = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_REGION, department: [], region: "Île-de-France" }));
      const actor = { role: ROLES.REFERENT_DEPARTMENT, department: ["Hauts-de-Seine"], region: "Île-de-France" };

      const res = await request(await getAppHelperWithAcl(actor))
        .put(`/referent/${cible._id}`)
        .send({ firstName: "Pirate" });

      expect(res.statusCode).toEqual(403);
      expect((await getReferentByIdHelper(cible._id.toString()))?.firstName).toEqual(cible.firstName);
    });

    it("GOO-46 — refuse un référent départemental lisant un responsable d'une structure du département voisin", async () => {
      const structureParis = await createStructureHelper({ ...getNewStructureFixture(), department: "Paris", region: "Île-de-France" } as any);
      const cible = await createReferentHelper(
        getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structureParis._id.toString(), department: undefined, region: undefined } as any),
      );
      const actor = { role: ROLES.REFERENT_DEPARTMENT, department: ["Hauts-de-Seine"], region: "Île-de-France" };

      const res = await request(await getAppHelperWithAcl(actor)).get(`/referent/${cible._id}`);

      expect(res.statusCode).toEqual(403);
    });

    it("autorise la lecture de son propre profil", async () => {
      const moi = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: new ObjectId().toString() }));

      const res = await request(await getAppHelperWithAcl(moi as any)).get(`/referent/${moi._id}`);

      expect(res.statusCode).toEqual(200);
    });

    it("autorise un chef de centre lisant un référent départemental de son département", async () => {
      const centre = await CohesionCenterModel.create(getNewCohesionCenterFixture({ department: "Sarthe", region: "Pays de la Loire" }));
      const cible = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" }));
      const actor = { role: ROLES.HEAD_CENTER, cohesionCenterId: centre._id.toString(), department: undefined, region: undefined };

      const res = await request(await getAppHelperWithAcl(actor as any)).get(`/referent/${cible._id}`);

      expect(res.statusCode).toEqual(200);
    });

    it("refuse un chef de centre lisant un chef de centre d'un autre département", async () => {
      const monCentre = await CohesionCenterModel.create(getNewCohesionCenterFixture({ department: "Sarthe", region: "Pays de la Loire" }));
      const autreCentre = await CohesionCenterModel.create(getNewCohesionCenterFixture({ department: "Paris", region: "Ile-de-France" }));
      const cible = await createReferentHelper(
        getNewReferentFixture({ role: ROLES.HEAD_CENTER, cohesionCenterId: autreCentre._id.toString(), department: undefined, region: undefined }),
      );
      const actor = { role: ROLES.HEAD_CENTER, cohesionCenterId: monCentre._id.toString(), department: undefined, region: undefined };

      const res = await request(await getAppHelperWithAcl(actor as any)).get(`/referent/${cible._id}`);

      expect(res.statusCode).toEqual(403);
    });

    it("autorise un administrateur CLE lisant un référent de classe de son établissement", async () => {
      const actorId = new ObjectId();
      const cible = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE, department: ["Sarthe"], region: "Pays de la Loire" }));
      const etablissement = await EtablissementModel.create(
        createFixtureEtablissement({ coordinateurIds: [actorId.toString()], referentEtablissementIds: [], department: "Sarthe" }),
      );
      await ClasseModel.create(createFixtureClasse({ etablissementId: etablissement._id.toString(), referentClasseIds: [cible._id.toString()] }));
      const actor = { _id: actorId, role: ROLES.ADMINISTRATEUR_CLE, department: undefined, region: undefined };

      const res = await request(await getAppHelperWithAcl(actor as any)).get(`/referent/${cible._id}`);

      expect(res.statusCode).toEqual(200);
    });

    it("refuse un administrateur CLE lisant un référent de classe d'un autre établissement", async () => {
      const actorId = new ObjectId();
      const cible = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE, department: ["Paris"], region: "Ile-de-France" }));
      const monEtablissement = await EtablissementModel.create(
        createFixtureEtablissement({ coordinateurIds: [actorId.toString()], referentEtablissementIds: [], department: "Sarthe" }),
      );
      const autreEtablissement = await EtablissementModel.create(createFixtureEtablissement({ department: "Paris" }));
      await ClasseModel.create(createFixtureClasse({ etablissementId: monEtablissement._id.toString(), referentClasseIds: [] }));
      await ClasseModel.create(createFixtureClasse({ etablissementId: autreEtablissement._id.toString(), referentClasseIds: [cible._id.toString()] }));
      const actor = { _id: actorId, role: ROLES.ADMINISTRATEUR_CLE, department: undefined, region: undefined };

      const res = await request(await getAppHelperWithAcl(actor as any)).get(`/referent/${cible._id}`);

      expect(res.statusCode).toEqual(403);
    });

    it("ne renvoie jamais les jetons d'authentification de la cible", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const collegue = await createReferentHelper(
        getNewReferentFixture({
          role: ROLES.RESPONSIBLE,
          structureId: structure._id.toString(),
          invitationToken: "SECRET_INVITATION",
          forgotPasswordResetToken: "SECRET_RESET",
          token2FA: "SECRET_2FA",
        } as any),
      );
      const actor = { role: ROLES.RESPONSIBLE, structureId: structure._id.toString() };

      const res = await request(await getAppHelperWithAcl(actor)).get(`/referent/${collegue._id}`);

      expect(res.statusCode).toEqual(200);
      expect(JSON.stringify(res.body)).not.toContain("SECRET_");
    });
  });

  describe("H68 — GET /referent/:id/patches", () => {
    it("refuse un responsable lisant l'historique d'un référent d'une autre structure", async () => {
      const actorStructure = await createStructureHelper(getNewStructureFixture());
      const otherStructure = await createStructureHelper(getNewStructureFixture());
      const cible = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: otherStructure._id.toString() }));
      const actor = { role: ROLES.RESPONSIBLE, structureId: actorStructure._id.toString() };

      const res = await request(await getAppHelperWithAcl(actor)).get(`/referent/${cible._id}/patches`);

      expect(res.statusCode).toEqual(403);
    });

    it("refuse un référent départemental lisant l'historique d'un référent d'un autre département", async () => {
      const cible = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Paris"], region: "Ile-de-France" }));
      const actor = { role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" };

      const res = await request(await getAppHelperWithAcl(actor)).get(`/referent/${cible._id}/patches`);

      expect(res.statusCode).toEqual(403);
    });

    it("autorise un responsable lisant l'historique d'un membre de sa structure", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const collegue = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }));
      const actor = { role: ROLES.RESPONSIBLE, structureId: structure._id.toString() };

      const res = await request(await getAppHelperWithAcl(actor)).get(`/referent/${collegue._id}/patches`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("ne renvoie aucun jeton dans l'historique", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const collegue = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }));
      const doc = await ReferentModel.findById(collegue._id);
      doc!.set({ invitationToken: "SECRET_INVITATION", firstName: "NOUVEAU" });
      await doc!.save();
      const actor = { role: ROLES.RESPONSIBLE, structureId: structure._id.toString() };

      const res = await request(await getAppHelperWithAcl(actor)).get(`/referent/${collegue._id}/patches`);

      expect(res.statusCode).toEqual(200);
      expect(JSON.stringify(res.body)).not.toContain("SECRET_");
      expect(JSON.stringify(res.body)).not.toContain("invitationToken");
    });
  });

  describe("M68 — GET /referent?email=", () => {
    it("refuse la famille chef de centre", async () => {
      const cible = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, email: "cible-m68@example.org" }));
      const centre = await CohesionCenterModel.create(getNewCohesionCenterFixture({ department: "Sarthe", region: "Pays de la Loire" }));

      for (const role of [ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE]) {
        const actor = { role, cohesionCenterId: centre._id.toString(), department: undefined, region: undefined };
        const res = await request(await getAppHelperWithAcl(actor as any)).get(`/referent?email=${encodeURIComponent(cible.email!)}`);
        expect(res.statusCode).toEqual(403);
      }
    });

    it("laisse passer un référent départemental (flux équipe de direction)", async () => {
      const cible = await createReferentHelper(getNewReferentFixture({ role: ROLES.HEAD_CENTER, email: "cible-m68-ok@example.org" }));
      const actor = { role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" };

      const res = await request(await getAppHelperWithAcl(actor)).get(`/referent?email=${encodeURIComponent(cible.email!)}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.email).toEqual("cible-m68-ok@example.org");
    });
  });

  describe("FM7 — département d'un référent (formule dans l'export « Utilisateurs »)", () => {
    const FORMULE = 'HYPERLINK("https://attaquant.example","Ouvrir")';

    it("POST /referent/signup_invite/:template refuse un département hors de la liste", async () => {
      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
        .post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent[ROLES.REFERENT_DEPARTMENT]}`)
        .send({
          email: "fm7-invite@example.org",
          firstName: "A",
          lastName: "B",
          role: ROLES.REFERENT_DEPARTMENT,
          region: "Auvergne-Rhône-Alpes",
          department: ["Ain", FORMULE],
        });

      expect(res.statusCode).toEqual(400);
      expect(await ReferentModel.findOne({ email: "fm7-invite@example.org" })).toBeNull();
    });

    it("PUT /referent/:id refuse un département hors de la liste", async () => {
      const cible = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Ain"], region: "Auvergne-Rhône-Alpes" }));

      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
        .put(`/referent/${cible._id}`)
        .send({ department: ["Ain", FORMULE] });

      expect(res.statusCode).toEqual(400);
      expect((await getReferentByIdHelper(cible._id))?.department).toEqual(["Ain"]);
    });

    it("PUT /referent/:id accepte un département de la liste", async () => {
      const cible = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Ain"], region: "Auvergne-Rhône-Alpes" }));

      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
        .put(`/referent/${cible._id}`)
        .send({ department: ["Allier"] });

      expect(res.statusCode).toEqual(200);
      expect((await getReferentByIdHelper(cible._id))?.department).toEqual(["Allier"]);
    });

    it("POST /referent/signup_invite/:template ne garde que les champs de périmètre du rôle invité", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());

      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
        .post(`/referent/signup_invite/${TEMPLATE}`)
        .send({
          email: "fm7-responsable@example.org",
          firstName: "A",
          lastName: "B",
          role: ROLES.RESPONSIBLE,
          structureId: structure._id.toString(),
          region: "Auvergne-Rhône-Alpes",
          department: ["Ain"],
        });

      expect(res.statusCode).toEqual(200);
      const cree = await ReferentModel.findOne({ email: "fm7-responsable@example.org" });
      expect(cree?.structureId).toEqual(structure._id.toString());
      expect(cree?.department ?? []).toEqual([]);
      expect(cree?.region ?? "").toEqual("");
    });
  });
});
