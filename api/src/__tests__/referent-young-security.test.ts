/**
 * Reproduction des constats de l'audit sécurité du 21/09/2026 — lot A1
 * « Dossier volontaire côté référent ».
 *
 * H63 PUT /referent/youngs                                     : validation/refus en masse sans contrôle de classe
 * H64 POST /referent/young/:id/refuse-military-preparation-files : tout RESPONSIBLE et tout REFERENT_REGION,
 *     sans lien avec le volontaire, peuvent refuser (et supprimer) ses pièces de préparation militaire
 * H67 GET /referent/young/:id                                  : périmètre limité au rôle, document brut (tokens)
 * L23 PUT /young/update_phase3/:young                          : `canEditYoung` seul, sans rattachement réel
 * FM13 PUT /referent/young/:id                                 : historique des statuts accepté tel quel du client (GOO-12)
 *      puis statuts, cohorte et affectation écrits sans borne de rôle (GOO-12 : FM13, FL2)
 */
import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;

import { ROLES, YOUNG_SOURCE, YOUNG_STATUS } from "snu-lib";

import { ApplicationModel, ClasseModel, EtablissementModel, ReferentModel, StructureModel, YoungModel } from "../models";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import getNewStructureFixture from "./fixtures/structure";
import { createFixtureClasse } from "./fixtures/classe";
import { createFixtureEtablissement } from "./fixtures/etablissement";
import { createReferentHelper } from "./helpers/referent";
import { createYoungHelper } from "./helpers/young";
import { createStructureHelper } from "./helpers/structure";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sync: jest.fn().mockResolvedValue(true),
  unsync: jest.fn().mockResolvedValue(true),
  syncContact: jest.fn().mockResolvedValue(true),
  sendTemplate: jest.fn().mockResolvedValue(true),
  sendEmail: jest.fn().mockResolvedValue(true),
  sendSMS: jest.fn().mockResolvedValue(true),
}));

const SECRET_FIELDS = [
  "password",
  "token2FA",
  "token2FAExpires",
  "forgotPasswordResetToken",
  "forgotPasswordResetExpires",
  "invitationToken",
  "invitationExpires",
  "phase3Token",
  "tokenEmailValidation",
  "parent1Inscription2023Token",
  "parent2Inscription2023Token",
];

/** Valeurs de secrets posées sur la fixture pour rendre une fuite visible. */
const youngSecrets = {
  token2FA: "2fa-young", // gitleaks:allow
  forgotPasswordResetToken: "reset-young", // gitleaks:allow
  invitationToken: "invite-young", // gitleaks:allow
  phase3Token: "phase3-young", // gitleaks:allow
  tokenEmailValidation: "email-young", // gitleaks:allow
  parent1Inscription2023Token: "parent1-young", // gitleaks:allow
  parent2Inscription2023Token: "parent2-young", // gitleaks:allow
};

/** Vérifie qu'aucun secret de session / réinitialisation / invitation ne sort dans la réponse. */
function expectNoSecret(payload: any) {
  const leaked = SECRET_FIELDS.filter((field) => payload?.[field] !== undefined && payload?.[field] !== null);
  expect(leaked).toEqual([]);
}

const TERRITOIRE = { department: "Ain", region: "Auvergne-Rhône-Alpes" };
const AUTRE_TERRITOIRE = { department: "Doubs", region: "Bourgogne-Franche-Comté" };

/** Volontaire CLE rattaché à une classe dont `referentClasseIds` est fourni. */
async function createYoungInClasse(referentClasseIds: string[], fields: Record<string, any> = {}) {
  const etablissement = await EtablissementModel.create(createFixtureEtablissement());
  const classe = await ClasseModel.create(createFixtureClasse({ etablissementId: etablissement._id.toString(), referentClasseIds }));
  const young = await createYoungHelper(
    getNewYoungFixture({
      ...TERRITOIRE,
      source: YOUNG_SOURCE.CLE,
      classeId: classe._id.toString(),
      etablissementId: etablissement._id.toString(),
      status: YOUNG_STATUS.WAITING_VALIDATION,
      ...fields,
    } as any),
  );
  return { young, classe, etablissement };
}

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
beforeEach(async () => {
  await Promise.all([
    ReferentModel.deleteMany(),
    YoungModel.deleteMany(),
    StructureModel.deleteMany(),
    ApplicationModel.deleteMany(),
    ClasseModel.deleteMany(),
    EtablissementModel.deleteMany(),
  ]);
  jest.clearAllMocks();
});
afterEach(resetAppAuth);

describe("Sécurité dossier volontaire côté référent — audit 2026-09-21 (lot A1)", () => {
  describe("FM13 — PUT /referent/young/:id : historique des statuts", () => {
    const historiqueInitial = [{ phase: "INSCRIPTION", userName: "Référent d'origine", userId: "origine", status: YOUNG_STATUS.WAITING_VALIDATION, note: "" }];

    it("ignore l'historique envoyé par le client et trace le changement de statut au nom de l'utilisateur authentifié", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ ...TERRITOIRE, status: YOUNG_STATUS.WAITING_VALIDATION, historic: historiqueInitial } as any));
      const admin = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN, firstName: "Alice", lastName: "Admin" }));

      const res = await request(await getAppHelperWithAcl(admin, "referent"))
        .put(`/referent/young/${young._id}`)
        .send({
          status: YOUNG_STATUS.WAITING_CORRECTION,
          historic: [{ phase: "INSCRIPTION", userName: "Quelqu'un d'autre", userId: "usurpe", status: YOUNG_STATUS.VALIDATED, note: "" }],
        });

      expect(res.status).toBe(200);
      const updated = await YoungModel.findById(young._id);
      const historic = (updated?.historic || []).map(({ userName, userId, status }) => ({ userName, userId, status }));
      expect(historic).toEqual([
        { userName: "Référent d'origine", userId: "origine", status: YOUNG_STATUS.WAITING_VALIDATION },
        { userName: "Alice Admin", userId: admin._id.toString(), status: YOUNG_STATUS.WAITING_CORRECTION },
      ]);
    }, 30000);

    it("ne permet pas d'effacer l'historique", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ ...TERRITOIRE, status: YOUNG_STATUS.WAITING_VALIDATION, historic: historiqueInitial } as any));
      const admin = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));

      const res = await request(await getAppHelperWithAcl(admin, "referent"))
        .put(`/referent/young/${young._id}`)
        .send({ historic: [] });

      expect(res.status).toBe(200);
      const updated = await YoungModel.findById(young._id);
      expect(updated?.historic).toHaveLength(1);
    }, 30000);
  });

  describe("FM13 / FL2 — PUT /referent/young/:id : statuts, cohorte et affectation bornés par rôle", () => {
    async function createReferentDuTerritoire() {
      return createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: [TERRITOIRE.department], region: TERRITOIRE.region }));
    }

    it("refuse à un référent départemental un statut hors parcours (ABANDONED)", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ ...TERRITOIRE, status: YOUNG_STATUS.VALIDATED } as any));
      const referent = await createReferentDuTerritoire();

      const res = await request(await getAppHelperWithAcl(referent, "referent"))
        .put(`/referent/young/${young._id}`)
        .send({ status: YOUNG_STATUS.ABANDONED });

      expect(res.status).toBe(403);
      expect((await YoungModel.findById(young._id))?.status).toBe(YOUNG_STATUS.VALIDATED);
    }, 30000);

    it("refuse à un référent départemental la réactivation d'un volontaire désisté", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ ...TERRITOIRE, status: YOUNG_STATUS.WITHDRAWN } as any));
      const referent = await createReferentDuTerritoire();

      const res = await request(await getAppHelperWithAcl(referent, "referent"))
        .put(`/referent/young/${young._id}`)
        .send({ status: YOUNG_STATUS.VALIDATED });

      expect(res.status).toBe(403);
      expect((await YoungModel.findById(young._id))?.status).toBe(YOUNG_STATUS.WITHDRAWN);
    }, 30000);

    it("refuse à un référent départemental un changement de cohorte hors /change-cohort", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ ...TERRITOIRE, status: YOUNG_STATUS.VALIDATED, cohortId: new ObjectId().toString() } as any));
      const referent = await createReferentDuTerritoire();

      const res = await request(await getAppHelperWithAcl(referent, "referent"))
        .put(`/referent/young/${young._id}`)
        .send({ cohort: "Autre cohorte", cohortId: new ObjectId().toString() });

      expect(res.status).toBe(403);
      expect((await YoungModel.findById(young._id))?.cohortId).toBe(young.cohortId);
    }, 30000);

    it("refuse à un référent départemental une affectation directe à une session", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ ...TERRITOIRE, status: YOUNG_STATUS.VALIDATED } as any));
      const referent = await createReferentDuTerritoire();
      const sessionPhase1Id = new ObjectId().toString();

      const res = await request(await getAppHelperWithAcl(referent, "referent"))
        .put(`/referent/young/${young._id}`)
        .send({ sessionPhase1Id, cohesionCenterId: new ObjectId().toString() });

      expect(res.status).toBe(403);
      expect((await YoungModel.findById(young._id))?.sessionPhase1Id).not.toBe(sessionPhase1Id);
    }, 30000);

    it("refuse à un référent départemental un statut de phase 1 posé à la main", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ ...TERRITOIRE, status: YOUNG_STATUS.VALIDATED, statusPhase1: "AFFECTED" } as any));
      const referent = await createReferentDuTerritoire();

      const res = await request(await getAppHelperWithAcl(referent, "referent"))
        .put(`/referent/young/${young._id}`)
        .send({ statusPhase1: "DONE" });

      expect(res.status).toBe(403);
      expect((await YoungModel.findById(young._id))?.statusPhase1).toBe("AFFECTED");
    }, 30000);

    it("autorise la demande de correction et accepte le renvoi à l'identique de la cohorte et de l'affectation", async () => {
      const cohortId = new ObjectId().toString();
      const sessionPhase1Id = new ObjectId().toString();
      const young = await createYoungHelper(
        getNewYoungFixture({ ...TERRITOIRE, status: YOUNG_STATUS.WAITING_VALIDATION, cohort: "Juillet 2023", cohortId, sessionPhase1Id } as any),
      );
      const referent = await createReferentDuTerritoire();

      const res = await request(await getAppHelperWithAcl(referent, "referent"))
        .put(`/referent/young/${young._id}`)
        .send({ status: YOUNG_STATUS.WAITING_CORRECTION, cohort: "Juillet 2023", cohortId, sessionPhase1Id, cohesionCenterId: "" });

      expect(res.status).toBe(200);
      expect((await YoungModel.findById(young._id))?.status).toBe(YOUNG_STATUS.WAITING_CORRECTION);
    }, 30000);
  });

  describe("H67 — GET /referent/young/:id", () => {
    it("refuse le dossier d'un volontaire qui n'a pas candidaté à une mission de la structure", async () => {
      const victime = await createYoungHelper(getNewYoungFixture({ ...youngSecrets, ...TERRITOIRE } as any));
      const structure = await createStructureHelper(getNewStructureFixture());
      const attaquant = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }));

      const res = await request(await getAppHelperWithAcl(attaquant, "referent")).get(`/referent/young/${victime._id}`);

      expect(res.status).toBe(403);
    }, 30000);

    it("refuse le dossier d'un volontaire hors du territoire d'un référent départemental", async () => {
      const victime = await createYoungHelper(getNewYoungFixture({ ...youngSecrets, ...TERRITOIRE } as any));
      const attaquant = await createReferentHelper(
        getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: [AUTRE_TERRITOIRE.department], region: AUTRE_TERRITOIRE.region }),
      );

      const res = await request(await getAppHelperWithAcl(attaquant, "referent")).get(`/referent/young/${victime._id}`);

      expect(res.status).toBe(403);
    }, 30000);

    it("refuse le dossier d'un volontaire d'une autre classe à un référent de classe", async () => {
      const { young: victime } = await createYoungInClasse([new ObjectId().toString()], youngSecrets);
      const attaquant = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE }));

      const res = await request(await getAppHelperWithAcl(attaquant, "referent")).get(`/referent/young/${victime._id}`);

      expect(res.status).toBe(403);
    }, 30000);

    it("autorise le responsable dont la structure porte une candidature du volontaire, sans renvoyer de secret", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ ...youngSecrets, ...TERRITOIRE } as any));
      const structure = await createStructureHelper(getNewStructureFixture());
      const responsable = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }));
      await ApplicationModel.create({ youngId: young._id.toString(), structureId: structure._id.toString(), missionId: new ObjectId().toString() });

      const res = await request(await getAppHelperWithAcl(responsable, "referent")).get(`/referent/young/${young._id}`);

      expect(res.status).toBe(200);
      expectNoSecret(res.body.data);
    }, 30000);

    it("ne renvoie aucun secret au référent départemental du territoire", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ ...youngSecrets, ...TERRITOIRE } as any));
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: [TERRITOIRE.department], region: TERRITOIRE.region }));

      const res = await request(await getAppHelperWithAcl(referent, "referent")).get(`/referent/young/${young._id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.firstName).toBe(young.firstName);
      expectNoSecret(res.body.data);
    }, 30000);
  });

  describe("H64 — POST /referent/young/:id/refuse-military-preparation-files", () => {
    it("refuse à un responsable de structure le rejet des pièces de préparation militaire", async () => {
      const victime = await createYoungHelper(getNewYoungFixture({ ...TERRITOIRE, statusMilitaryPreparationFiles: "WAITING_VERIFICATION" } as any));
      const structure = await createStructureHelper(getNewStructureFixture());
      const attaquant = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }));

      const res = await request(await getAppHelperWithAcl(attaquant, "referent")).post(`/referent/young/${victime._id}/refuse-military-preparation-files`);

      expect(res.status).toBe(403);
      expect((await YoungModel.findById(victime._id))?.statusMilitaryPreparationFiles).toBe("WAITING_VERIFICATION");
    }, 30000);

    it("refuse à un référent régional d'une autre région le rejet des pièces", async () => {
      const victime = await createYoungHelper(getNewYoungFixture({ ...TERRITOIRE, statusMilitaryPreparationFiles: "WAITING_VERIFICATION" } as any));
      const attaquant = await createReferentHelper(
        getNewReferentFixture({ role: ROLES.REFERENT_REGION, region: AUTRE_TERRITOIRE.region, department: [AUTRE_TERRITOIRE.department] }),
      );

      const res = await request(await getAppHelperWithAcl(attaquant, "referent")).post(`/referent/young/${victime._id}/refuse-military-preparation-files`);

      expect(res.status).toBe(403);
      expect((await YoungModel.findById(victime._id))?.statusMilitaryPreparationFiles).toBe("WAITING_VERIFICATION");
    }, 30000);

    it("autorise le référent régional de la région du volontaire", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ ...TERRITOIRE, statusMilitaryPreparationFiles: "WAITING_VERIFICATION" } as any));
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_REGION, region: TERRITOIRE.region, department: [TERRITOIRE.department] }));

      const res = await request(await getAppHelperWithAcl(referent, "referent")).post(`/referent/young/${young._id}/refuse-military-preparation-files`);

      expect(res.status).toBe(200);
      expect((await YoungModel.findById(young._id))?.statusMilitaryPreparationFiles).toBe("REFUSED");
    }, 30000);
  });

  describe("H63 — PUT /referent/youngs", () => {
    it("refuse à un référent de classe le refus en masse de volontaires d'une autre classe", async () => {
      const { young: victime } = await createYoungInClasse([new ObjectId().toString()]);
      const attaquant = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE }));

      const res = await request(await getAppHelperWithAcl(attaquant, "referent"))
        .put("/referent/youngs")
        .send({ youngIds: [victime._id.toString()], status: YOUNG_STATUS.REFUSED });

      expect(res.status).toBe(403);
      expect((await YoungModel.findById(victime._id))?.status).toBe(YOUNG_STATUS.WAITING_VALIDATION);
    }, 30000);

    it("autorise le référent de la classe du volontaire", async () => {
      const attaquant = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE }));
      const { young } = await createYoungInClasse([attaquant._id.toString()]);

      const res = await request(await getAppHelperWithAcl(attaquant, "referent"))
        .put("/referent/youngs")
        .send({ youngIds: [young._id.toString()], status: YOUNG_STATUS.REFUSED });

      expect(res.status).toBe(200);
      expect((await YoungModel.findById(young._id))?.status).toBe(YOUNG_STATUS.REFUSED);
    }, 30000);
  });

  describe("L23 — PUT /young/update_phase3/:young", () => {
    const payload = {
      phase3StructureName: "Structure",
      phase3MissionDescription: "Mission",
      phase3TutorFirstName: "Jean",
      phase3TutorLastName: "Valjean",
      phase3TutorEmail: "tuteur@example.org",
      phase3TutorPhone: "0102030405",
    };

    it("refuse à un référent de classe la mise à jour de la phase 3 d'un volontaire d'une autre classe", async () => {
      const { young: victime } = await createYoungInClasse([new ObjectId().toString()]);
      const attaquant = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE }));

      const res = await request(await getAppHelperWithAcl(attaquant, "referent"))
        .put(`/young/update_phase3/${victime._id}`)
        .send(payload);

      expect(res.status).toBe(403);
      expect((await YoungModel.findById(victime._id))?.phase3TutorEmail).not.toBe(payload.phase3TutorEmail);
    }, 30000);

    it("autorise le référent de la classe du volontaire", async () => {
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE }));
      const { young } = await createYoungInClasse([referent._id.toString()]);

      const res = await request(await getAppHelperWithAcl(referent, "referent"))
        .put(`/young/update_phase3/${young._id}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect((await YoungModel.findById(young._id))?.phase3TutorEmail).toBe(payload.phase3TutorEmail);
    }, 30000);
  });
});
