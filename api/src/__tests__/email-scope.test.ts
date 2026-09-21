/**
 * Périmètre de lecture des notifications mail — audit API 2026-09-21 (C12 / M18 / M15).
 *
 * Avant correctif, la permission UserNotificationsRead étant seedée SANS policy,
 * `hasUnrestrictedPermission` autorisait l'appel quel que soit le destinataire visé :
 * un référent de classe listait les mails d'un ADMIN puis en lisait le contenu,
 * lien de réinitialisation compris.
 */
import request from "supertest";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLES, SENDINBLUE_TEMPLATES } from "snu-lib";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { addPermissionHelper } from "./helpers/permissions";
import { PermissionModel } from "../models/permissions/permission";
import { EmailModel, ReferentModel, YoungModel } from "../models";
import getNewReferentFixture from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import { REDACTED } from "../email/emailContent";

const RESET_TOKEN = "TOKEN-DE-REINITIALISATION-DE-L-ADMIN";
const CONSENTEMENT_TOKEN = "TOKEN-REPRESENTANT-LEGAL";

const brevoBodies: Record<string, string> = {
  "uuid-reset": `<html><body><a href="https://admin.snu.gouv.fr/auth/reset?token=${RESET_TOKEN}">Choisir un nouveau mot de passe</a></body></html>`,
  "uuid-consentement": `<html><body><a href="https://moncompte.snu.gouv.fr/representants-legaux/presentation?token=${CONSENTEMENT_TOKEN}&parent=1">Donner mon consentement</a></body></html>`,
};
let currentUuid = "uuid-reset";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  getEmailsList: jest.fn(async () => ({ count: 1, transactionalEmails: [{ uuid: currentUuid }] })),
  getEmailContent: jest.fn(async (uuid: string) => ({
    subject: "Sujet du mail",
    date: "2026-09-21T10:00:00.000Z",
    events: [{ name: "delivered", time: "2026-09-21T10:00:00.000Z" }],
    body: brevoBodies[uuid],
  })),
}));

jest.mock("../es", () => ({
  msearch: jest.fn(async () => ({ body: { responses: [] } })),
}));

const DEPARTEMENT = "Morbihan";
const REGION = "Bretagne";

const referentClasse = { role: ROLES.REFERENT_CLASSE, region: REGION, department: [DEPARTEMENT] };
const referentDepartement = { role: ROLES.REFERENT_DEPARTMENT, region: REGION, department: [DEPARTEMENT] };

let victimeAdmin;
let referentDuDepartement;
let jeuneDuDepartement;
let mailResetAdmin;
let mailResetJeune;
let mailConsentementJeune;

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await PermissionModel.deleteMany({});
  await EmailModel.deleteMany({});
  await ReferentModel.deleteMany({});
  await YoungModel.deleteMany({});

  // Seed identique à la prod (migrations 20250624122150 + 20250801060707) : aucune policy.
  await addPermissionHelper(
    [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE, ROLES.SUPERVISOR],
    PERMISSION_RESOURCES.USER_NOTIFICATIONS,
    PERMISSION_ACTIONS.READ,
  );

  victimeAdmin = await ReferentModel.create(getNewReferentFixture({ role: ROLES.ADMIN, email: "admin-cible@snu.gouv.fr" }));
  referentDuDepartement = await ReferentModel.create(
    getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, email: "ref-dep-morbihan@snu.gouv.fr", region: REGION, department: [DEPARTEMENT] }),
  );
  jeuneDuDepartement = await YoungModel.create(getNewYoungFixture({ email: "jeune-morbihan@example.org", department: DEPARTEMENT, region: REGION }));

  mailResetAdmin = await EmailModel.create({
    email: victimeAdmin.email,
    event: "delivered",
    subject: "Réinitialisation de votre mot de passe",
    templateId: SENDINBLUE_TEMPLATES.FORGOT_PASSWORD,
    messageId: "<202609211000.4242424242@smtp-relay.mailin.fr>",
    date: new Date("2026-09-21T10:00:00.000Z"),
  });
  mailResetJeune = await EmailModel.create({
    email: jeuneDuDepartement.email,
    event: "delivered",
    subject: "Réinitialisation de votre mot de passe",
    templateId: SENDINBLUE_TEMPLATES.FORGOT_PASSWORD,
    messageId: "<202609211000.5353535353@smtp-relay.mailin.fr>",
    date: new Date("2026-09-21T10:00:00.000Z"),
  });
  await EmailModel.create({
    email: referentDuDepartement.email,
    event: "delivered",
    subject: "Bienvenue",
    templateId: "2220",
    messageId: "<202609211000.7575757575@smtp-relay.mailin.fr>",
    date: new Date("2026-09-21T10:00:00.000Z"),
  });
  mailConsentementJeune = await EmailModel.create({
    email: jeuneDuDepartement.email,
    event: "delivered",
    subject: "Consentement du représentant légal",
    templateId: "605",
    messageId: "<202609211000.6464646464@smtp-relay.mailin.fr>",
    date: new Date("2026-09-21T10:00:00.000Z"),
  });
});

afterAll(async () => {
  await dbClose();
});
afterEach(resetAppAuth);

describe("Notifications mail — périmètre", () => {
  it("M18 — un référent de classe ne liste pas l'historique d'un ADMIN", async () => {
    const res = await request(await getAppHelperWithAcl(referentClasse as any)).get(`/email?email=${victimeAdmin.email}`);
    expect(res.status).toBe(403);
  });

  it("C12 — un référent de classe ne lit pas le contenu du mail de réinitialisation d'un ADMIN", async () => {
    const res = await request(await getAppHelperWithAcl(referentClasse as any)).get(`/email/${mailResetAdmin._id}`);
    expect(res.status).toBe(403);
  });

  it("M15 — un référent de classe n'interroge pas l'index ES sur l'adresse d'un ADMIN", async () => {
    const res = await request(await getAppHelperWithAcl(referentClasse as any))
      .post(`/elasticsearch/email/${victimeAdmin.email}/search`)
      .send({});
    expect(res.status).toBe(403);
  });

  it("une adresse inconnue est refusée (pas d'oracle d'existence de compte)", async () => {
    const res = await request(await getAppHelperWithAcl(referentDepartement as any)).get("/email?email=inconnu@example.org");
    expect(res.status).toBe(403);
  });

  it("un référent départemental accède aux notifications d'un jeune de son département", async () => {
    const res = await request(await getAppHelperWithAcl(referentDepartement as any)).get(`/email?email=${jeuneDuDepartement.email}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it("un référent départemental d'un autre département n'y accède pas", async () => {
    const horsPerimetre = { role: ROLES.REFERENT_DEPARTMENT, region: "Normandie", department: ["Calvados"] };
    const res = await request(await getAppHelperWithAcl(horsPerimetre as any)).get(`/email?email=${jeuneDuDepartement.email}`);
    expect(res.status).toBe(403);
  });

  it("un référent régional accède aux notifications d'un référent départemental de sa région", async () => {
    const referentRegion = { role: ROLES.REFERENT_REGION, region: REGION, department: [DEPARTEMENT] };
    const res = await request(await getAppHelperWithAcl(referentRegion as any)).get(`/email?email=${referentDuDepartement.email}`);
    expect(res.status).toBe(200);
  });

  it("un référent régional d'une autre région n'accède pas à ce référent départemental", async () => {
    const autreRegion = { role: ROLES.REFERENT_REGION, region: "Normandie", department: ["Calvados"] };
    const res = await request(await getAppHelperWithAcl(autreRegion as any)).get(`/email?email=${referentDuDepartement.email}`);
    expect(res.status).toBe(403);
  });

  it("un ADMIN conserve l'accès transverse", async () => {
    const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN } as any)).get(`/email?email=${victimeAdmin.email}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe("Notifications mail — contenu restitué", () => {
  it("le corps d'un mail d'authentification n'est jamais restitué, même à un ADMIN", async () => {
    currentUuid = "uuid-reset";
    const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN } as any)).get(`/email/${mailResetJeune._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.contentRedacted).toBe(true);
    expect(res.body.data.body).toBeNull();
    expect(JSON.stringify(res.body)).not.toContain(RESET_TOKEN);
  });

  it("les tokens présents dans les liens des autres mails sont masqués", async () => {
    currentUuid = "uuid-consentement";
    const res = await request(await getAppHelperWithAcl(referentDepartement as any)).get(`/email/${mailConsentementJeune._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.contentRedacted).toBe(false);
    expect(res.body.data.body).toContain(`token=${REDACTED}`);
    expect(JSON.stringify(res.body)).not.toContain(CONSENTEMENT_TOKEN);
  });
});
