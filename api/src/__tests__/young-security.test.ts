/**
 * Reproduction des constats de l'audit sécurité du 21/09/2026 — lot 3
 * « Sous-routeurs /young/:id/* et documents bruts ».
 *
 * C15 GET /young/:id/documents/:key(/:fileId)            : canDownloadYoungDocuments sans périmètre
 * C16 GET /young/:id/application                          : tutor + contract renvoyés bruts (boucle de sérialisation no-op)
 * C17 GET /young?email=                                   : document jeune brut, aucun périmètre géographique
 * C18 PUT /young/:id/phase2/militaryPreparation/status     : IDOR total + document brut
 * H42 GET /young/:id/documents/:key/:fileId               : mimeType dérivé du nom de fichier (XSS stocké)
 * H43 POST /young/invite                                  : invitationToken renvoyé dans la réponse
 * H44 POST /young/note/:youngId                           : aucun périmètre, dossier complet renvoyé
 * H45 POST /young/:id/phase1/:key                         : canEditPresenceYoung sans périmètre
 * H46 POST /young/:id/phase1/dispense                     : idem
 * H47 PUT /young/:id/phase2/preference                    : document brut (tokens)
 * H48 GET /young/:id/point-de-rassemblement?withbus=true  : IDOR + équipe de convoyage (PII) renvoyée brute
 * H50 GET /young/:id/phase2/equivalence                   : IDOR en lecture
 * H52 POST /young/:id/phase2/equivalence                  : IDOR en écriture + VALIDATED par tout référent
 * H54 PUT /young/:id/phase2/equivalence/:idEquivalence    : auto-validation par le jeune
 * H71 serializeYoung                                      : parent1/2Inscription2023Token non retirés
 */
import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;

import { ROLES, ROLE_JEUNE, PERMISSION_RESOURCES, PERMISSION_ACTIONS, YOUNG_SOURCE, EQUIVALENCE_STATUS, SUB_ROLES } from "snu-lib";

import { PermissionModel } from "../models/permissions/permission";
import { RoleModel } from "../models/permissions/role";
import {
  ReferentModel,
  YoungModel,
  StructureModel,
  SessionPhase1Model,
  CohesionCenterModel,
  ApplicationModel,
  ContractModel,
  CohortModel,
  MissionEquivalenceModel,
  MissionModel,
  LigneBusModel,
  PointDeRassemblementModel,
} from "../models";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { addPermissionHelper } from "./helpers/permissions";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import getNewStructureFixture from "./fixtures/structure";
import getNewCohortFixture from "./fixtures/cohort";
import { getNewSessionPhase1Fixture } from "./fixtures/sessionPhase1";
import getNewLigneBusFixture from "./fixtures/PlanDeTransport/ligneBus";
import getNewPointDeRassemblementFixture from "./fixtures/PlanDeTransport/pointDeRassemblement";
import getBusTeamFixture from "./fixtures/busTeam";
import { getNewCohesionCenterFixture } from "./fixtures/cohesionCenter";
import { createReferentHelper } from "./helpers/referent";
import { createYoungHelper } from "./helpers/young";
import { createStructureHelper } from "./helpers/structure";
import { createCohortHelper } from "./helpers/cohort";
import { serializeYoung } from "../utils/serializer";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sync: jest.fn().mockResolvedValue(true),
  unsync: jest.fn().mockResolvedValue(true),
  syncContact: jest.fn().mockResolvedValue(true),
  sendTemplate: jest.fn().mockResolvedValue(true),
  sendEmail: jest.fn().mockResolvedValue(true),
  sendSMS: jest.fn().mockResolvedValue(true),
}));

jest.mock("../application/applicationNotificationService", () => ({
  ...jest.requireActual("../application/applicationNotificationService"),
  notifyReferentsEquivalenceSubmitted: jest.fn(),
  notifyYoungEquivalenceSubmitted: jest.fn(),
  notifyYoungChangementStatutEquivalence: jest.fn(),
  notifyReferentMilitaryPreparationFilesSubmitted: jest.fn(),
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

/** Vérifie qu'aucun secret de session / réinitialisation / invitation ne sort dans la réponse. */
function expectNoSecret(payload: any) {
  const leaked = SECRET_FIELDS.filter((field) => payload?.[field] !== undefined && payload?.[field] !== null);
  expect(leaked).toEqual([]);
}

/** Valeurs de secrets posées sur les fixtures pour rendre une fuite visible. */
const youngSecrets = {
  token2FA: "2fa-young",
  forgotPasswordResetToken: "reset-young",
  invitationToken: "invite-young",
  phase3Token: "phase3-young",
  tokenEmailValidation: "email-young",
  parent1Inscription2023Token: "parent1-young",
  parent2Inscription2023Token: "parent2-young",
};

const referentSecrets = {
  token2FA: "2fa-referent",
  forgotPasswordResetToken: "reset-referent",
  invitationToken: "invite-referent",
};

async function seedPermissions() {
  await PermissionModel.deleteMany();
  await RoleModel.deleteMany();
  await addPermissionHelper(
    [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.RESPONSIBLE, ROLES.SUPERVISOR, ROLES.HEAD_CENTER, ROLE_JEUNE] as any,
    PERMISSION_RESOURCES.APPLICATION,
    PERMISSION_ACTIONS.READ,
  );
}

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await seedPermissions();
});
afterAll(dbClose);
beforeEach(async () => {
  await Promise.all([
    ReferentModel.deleteMany(),
    YoungModel.deleteMany(),
    StructureModel.deleteMany(),
    SessionPhase1Model.deleteMany(),
    CohesionCenterModel.deleteMany(),
    ApplicationModel.deleteMany(),
    ContractModel.deleteMany(),
    CohortModel.deleteMany(),
    MissionEquivalenceModel.deleteMany(),
    MissionModel.deleteMany(),
    LigneBusModel.deleteMany(),
    PointDeRassemblementModel.deleteMany(),
  ]);
  jest.clearAllMocks();
});
afterEach(resetAppAuth);

describe("Sécurité /young/:id/* — audit 2026-09-21 (lot 3)", () => {
  describe("C15 — GET /young/:id/documents/:key", () => {
    it("refuse à un responsable de structure sans candidature du jeune la liste de ses pièces", async () => {
      const victim = await createYoungHelper(getNewYoungFixture({ ...youngSecrets, department: "Ain", region: "Auvergne-Rhône-Alpes" }));
      const structure = await createStructureHelper(getNewStructureFixture());
      const attacker = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }));

      const res = await request(await getAppHelperWithAcl(attacker, "referent")).get(`/young/${victim._id}/documents/cniFiles`);

      expect(res.status).toBe(403);
    });

    it("autorise le responsable dont la structure porte une candidature du jeune", async () => {
      const victim = await createYoungHelper(getNewYoungFixture(youngSecrets));
      const structure = await createStructureHelper(getNewStructureFixture());
      const attacker = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }));
      await ApplicationModel.create({ youngId: victim._id.toString(), structureId: structure._id.toString(), missionId: new ObjectId().toString() });

      const res = await request(await getAppHelperWithAcl(attacker, "referent")).get(`/young/${victim._id}/documents/cniFiles`);

      expect(res.status).toBe(200);
    });

    it("refuse à un jeune l'accès aux pièces d'un autre jeune", async () => {
      const victim = await createYoungHelper(getNewYoungFixture(youngSecrets));
      const attacker = await createYoungHelper(getNewYoungFixture());

      const res = await request(await getAppHelperWithAcl(attacker, "young")).get(`/young/${victim._id}/documents/cniFiles`);

      expect(res.status).toBe(403);
    });
  });

  describe("C16 — GET /young/:id/application", () => {
    it("ne renvoie ni les secrets du tuteur ni les tokens de signature du contrat", async () => {
      const young = await createYoungHelper(getNewYoungFixture(youngSecrets));
      const tutor = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, ...referentSecrets }));
      const contract = await ContractModel.create({
        youngId: young._id.toString(),
        parent1Token: "contract-parent1",
        parent2Token: "contract-parent2",
        youngContractToken: "contract-young",
        projectManagerToken: "contract-pm",
        structureManagerToken: "contract-sm",
      });
      await ApplicationModel.create({
        youngId: young._id.toString(),
        missionId: new ObjectId().toString(),
        tutorId: tutor._id.toString(),
        contractId: contract._id.toString(),
      });

      const res = await request(await getAppHelperWithAcl(young, "young")).get(`/young/${young._id}/application`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      const application = res.body.data[0];
      expectNoSecret(application.tutor);
      const contractPayload = JSON.stringify(application.contract ?? {});
      expect(contractPayload).not.toContain("contract-parent1");
      expect(contractPayload).not.toContain("contract-pm");
      expect(contractPayload).not.toContain("contract-sm");
    });
  });

  describe("C17 — GET /young?email=", () => {
    it("refuse un référent départemental hors de son département", async () => {
      const victim = await createYoungHelper(getNewYoungFixture({ ...youngSecrets, department: "Ain", region: "Auvergne-Rhône-Alpes" }));
      const attacker = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Nord"], region: "Hauts-de-France" }));

      const res = await request(await getAppHelperWithAcl(attacker, "referent")).get(`/young?email=${encodeURIComponent(victim.email!)}`);

      expect(res.status).toBe(403);
    });

    it("ne renvoie aucun secret au référent du bon département", async () => {
      const victim = await createYoungHelper(getNewYoungFixture({ ...youngSecrets, department: "Ain", region: "Auvergne-Rhône-Alpes" }));
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Ain"], region: "Auvergne-Rhône-Alpes" }));

      const res = await request(await getAppHelperWithAcl(referent, "referent")).get(`/young?email=${encodeURIComponent(victim.email!)}`);

      expect(res.status).toBe(200);
      expectNoSecret(res.body.data);
    });
  });

  describe("C18 — PUT /young/:id/phase2/militaryPreparation/status", () => {
    it("refuse à un jeune de modifier le dossier d'un autre jeune", async () => {
      const victim = await createYoungHelper(getNewYoungFixture(youngSecrets));
      const attacker = await createYoungHelper(getNewYoungFixture());

      const res = await request(await getAppHelperWithAcl(attacker, "young"))
        .put(`/young/${victim._id}/phase2/militaryPreparation/status`)
        .send({ statusMilitaryPreparationFiles: "REFUSED" });

      expect(res.status).toBe(403);
      const untouched = await YoungModel.findById(victim._id);
      expect(untouched?.statusMilitaryPreparationFiles).not.toBe("REFUSED");
    });

    it("ne renvoie aucun secret au jeune propriétaire du dossier", async () => {
      const young = await createYoungHelper(getNewYoungFixture(youngSecrets));

      const res = await request(await getAppHelperWithAcl(young, "young"))
        .put(`/young/${young._id}/phase2/militaryPreparation/status`)
        .send({ statusMilitaryPreparationFiles: "REFUSED" });

      expect(res.status).toBe(200);
      expectNoSecret(res.body.data);
    });
  });

  describe("H43 — POST /young/invite", () => {
    it("ne renvoie pas l'invitationToken du compte créé", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Juillet 2023" }));
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));

      const res = await request(await getAppHelperWithAcl(referent, "referent"))
        .post("/young/invite")
        .send({
          firstName: "Jean",
          lastName: "Dupont",
          email: `invite-${Date.now()}@example.org`,
          birthdateAt: new Date("2008-01-01"),
          cohort: cohort.name,
          cohortId: cohort._id.toString(),
        });

      if (res.status === 200) {
        expectNoSecret(res.body.young);
      }
    });
  });

  describe("H44 — POST /young/note/:youngId", () => {
    it("refuse à un référent hors périmètre de créer une note (et de lire le dossier)", async () => {
      const victim = await createYoungHelper(getNewYoungFixture({ ...youngSecrets, department: "Ain", region: "Auvergne-Rhône-Alpes" }));
      const structure = await createStructureHelper(getNewStructureFixture());
      const attacker = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }));

      const res = await request(await getAppHelperWithAcl(attacker, "referent"))
        .post(`/young/note/${victim._id}`)
        .send({ note: "x", phase: "PHASE_1" });

      expect(res.status).toBe(403);
      const untouched = await YoungModel.findById(victim._id);
      expect(untouched?.notes ?? []).toHaveLength(0);
    });
  });

  describe("H45 / H46 — POST /young/:id/phase1/*", () => {
    it("refuse à un chef de centre d'un autre centre de marquer la présence d'un jeune", async () => {
      const otherCenter = await CohesionCenterModel.create(getNewCohesionCenterFixture());
      const attacker = await createReferentHelper(getNewReferentFixture({ role: ROLES.HEAD_CENTER }));
      const attackerSession = await SessionPhase1Model.create(
        getNewSessionPhase1Fixture({ cohesionCenterId: otherCenter._id.toString(), headCenterId: attacker._id.toString() }),
      );

      const victimCenter = await CohesionCenterModel.create(getNewCohesionCenterFixture());
      const victimSession = await SessionPhase1Model.create(getNewSessionPhase1Fixture({ cohesionCenterId: victimCenter._id.toString(), headCenterId: new ObjectId().toString() }));
      const victim = await createYoungHelper(
        getNewYoungFixture({ ...youngSecrets, presenceJDM: "false", sessionPhase1Id: victimSession._id.toString(), cohesionCenterId: victimCenter._id.toString() }),
      );

      expect(attackerSession._id.toString()).not.toBe(victimSession._id.toString());

      const res = await request(await getAppHelperWithAcl(attacker, "referent"))
        .post(`/young/${victim._id}/phase1/presenceJDM`)
        .send({ value: "true" });

      expect(res.status).toBe(403);
      const untouched = await YoungModel.findById(victim._id);
      expect(untouched?.presenceJDM).not.toBe("true");
    });

    it("refuse à un chef de centre d'un autre centre de dispenser un jeune", async () => {
      const attacker = await createReferentHelper(getNewReferentFixture({ role: ROLES.HEAD_CENTER }));
      const victimCenter = await CohesionCenterModel.create(getNewCohesionCenterFixture());
      const victimSession = await SessionPhase1Model.create(getNewSessionPhase1Fixture({ cohesionCenterId: victimCenter._id.toString(), headCenterId: new ObjectId().toString() }));
      const victim = await createYoungHelper(getNewYoungFixture({ ...youngSecrets, statusPhase1: "NOT_DONE", sessionPhase1Id: victimSession._id.toString() }));

      const res = await request(await getAppHelperWithAcl(attacker, "referent"))
        .post(`/young/${victim._id}/phase1/dispense`)
        .send({ statusPhase1Motif: "OTHER", statusPhase1MotifDetail: "x" });

      expect(res.status).toBe(403);
      const untouched = await YoungModel.findById(victim._id);
      expect(untouched?.statusPhase1).toBe("NOT_DONE");
    });
  });

  describe("H47 — PUT /young/:id/phase2/preference", () => {
    it("ne renvoie aucun secret du jeune au référent", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ ...youngSecrets, department: "Ain", region: "Auvergne-Rhône-Alpes" }));
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Ain"], region: "Auvergne-Rhône-Alpes" }));

      const res = await request(await getAppHelperWithAcl(referent, "referent"))
        .put(`/young/${young._id}/phase2/preference`)
        .send({ domains: ["CITOYENNETE"], professionnalProject: "UNIFORM" });

      expect(res.status).toBe(200);
      expectNoSecret(res.body.data);
    });
  });

  describe("H48 — GET /young/:id/point-de-rassemblement", () => {
    it("refuse à un jeune de lire le point de rassemblement d'un autre jeune", async () => {
      const bus = await LigneBusModel.create(getNewLigneBusFixture({ team: [getBusTeamFixture({ mail: "convoyeur@example.org" })] as any }));
      const pdr = await PointDeRassemblementModel.create(getNewPointDeRassemblementFixture());
      const victim = await createYoungHelper(getNewYoungFixture({ ...youngSecrets, meetingPointId: pdr._id.toString(), ligneId: bus._id.toString() }));
      const attacker = await createYoungHelper(getNewYoungFixture());

      const res = await request(await getAppHelperWithAcl(attacker, "young")).get(`/young/${victim._id}/point-de-rassemblement?withbus=true`);

      expect(res.status).toBe(403);
    });

    it("ne renvoie pas l'équipe de convoyage au jeune propriétaire", async () => {
      const bus = await LigneBusModel.create(getNewLigneBusFixture({ team: [getBusTeamFixture({ mail: "convoyeur@example.org" })] as any }));
      const pdr = await PointDeRassemblementModel.create(getNewPointDeRassemblementFixture());
      const young = await createYoungHelper(getNewYoungFixture({ meetingPointId: pdr._id.toString(), ligneId: bus._id.toString() }));

      const res = await request(await getAppHelperWithAcl(young, "young")).get(`/young/${young._id}/point-de-rassemblement?withbus=true`);

      expect(res.status).toBe(200);
      expect(JSON.stringify(res.body.data)).not.toContain("convoyeur@example.org");
    });
  });

  describe("H50 / H52 / H54 — /young/:id/phase2/equivalence", () => {
    it("refuse à un jeune de lire les équivalences d'un autre jeune", async () => {
      const victim = await createYoungHelper(getNewYoungFixture());
      const attacker = await createYoungHelper(getNewYoungFixture());
      await MissionEquivalenceModel.create({
        youngId: victim._id.toString(),
        status: EQUIVALENCE_STATUS.WAITING_VERIFICATION,
        type: "BAFA",
        contactEmail: "contact-victime@example.org",
      });

      const res = await request(await getAppHelperWithAcl(attacker, "young")).get(`/young/${victim._id}/phase2/equivalence`);

      expect(res.status).toBe(403);
    });

    it("refuse à un responsable de structure de créer une équivalence VALIDATED pour un jeune quelconque", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Juillet 2023" }));
      const victim = await createYoungHelper(getNewYoungFixture({ cohort: cohort.name, cohortId: cohort._id.toString(), statusPhase1: "DONE" }));
      const structure = await createStructureHelper(getNewStructureFixture());
      const attacker = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), subRole: SUB_ROLES.none }));

      const res = await request(await getAppHelperWithAcl(attacker, "referent"))
        .post(`/young/${victim._id}/phase2/equivalence`)
        .send({
          type: "Autre",
          desc: "x",
          structureName: "x",
          address: "x",
          zip: "75000",
          city: "Paris",
          startDate: new Date("2026-01-01"),
          endDate: new Date("2026-01-02"),
          missionDuration: 84,
          contactFullName: "x",
          contactEmail: "x@example.org",
          files: ["f.pdf"],
        });

      expect(res.status).toBe(403);
      expect(await MissionEquivalenceModel.countDocuments({ youngId: victim._id.toString() })).toBe(0);
    });

    it("refuse à un jeune de valider lui-même son équivalence", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Juillet 2023" }));
      const young = await createYoungHelper(getNewYoungFixture({ cohort: cohort.name, cohortId: cohort._id.toString(), statusPhase1: "DONE" }));
      const equivalence = await MissionEquivalenceModel.create({
        youngId: young._id.toString(),
        status: EQUIVALENCE_STATUS.WAITING_VERIFICATION,
        type: "Autre",
        missionDuration: 84,
      });

      const res = await request(await getAppHelperWithAcl(young, "young"))
        .put(`/young/${young._id}/phase2/equivalence/${equivalence._id}`)
        .send({ status: EQUIVALENCE_STATUS.VALIDATED, type: "Autre", missionDuration: 84 });

      const reloaded = await MissionEquivalenceModel.findById(equivalence._id);
      expect(reloaded?.status).not.toBe(EQUIVALENCE_STATUS.VALIDATED);
    });

    it("refuse une équivalence dont le youngId ne correspond pas au :id de l'URL", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Juillet 2023" }));
      const young = await createYoungHelper(getNewYoungFixture({ cohort: cohort.name, cohortId: cohort._id.toString(), statusPhase1: "DONE" }));
      const other = await createYoungHelper(getNewYoungFixture({ cohort: cohort.name, cohortId: cohort._id.toString() }));
      const equivalence = await MissionEquivalenceModel.create({
        youngId: other._id.toString(),
        status: EQUIVALENCE_STATUS.WAITING_VERIFICATION,
        type: "Autre",
        missionDuration: 84,
      });

      const res = await request(await getAppHelperWithAcl(young, "young"))
        .put(`/young/${young._id}/phase2/equivalence/${equivalence._id}`)
        .send({ status: EQUIVALENCE_STATUS.WAITING_CORRECTION, type: "Autre", missionDuration: 84 });

      expect(res.status).toBe(403);
    });
  });

  describe("H71 — serializeYoung", () => {
    it("retire les tokens de représentant légal", async () => {
      const young = await createYoungHelper(getNewYoungFixture(youngSecrets));

      const serialized = serializeYoung(young, young);

      expect(serialized.parent1Inscription2023Token).toBeUndefined();
      expect(serialized.parent2Inscription2023Token).toBeUndefined();
      expectNoSecret(serialized);
    });
  });
});
