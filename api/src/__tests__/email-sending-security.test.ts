/**
 * Reproduction des constats M73, M74 et M67 de l'audit sécurité du 21/09/2026.
 *
 *   - M73 : `PUT /young-edition/:id/identite` écrit `email` comme n'importe quel autre champ. Le
 *     changement est immédiat, sans validation de la nouvelle adresse, sans notification de
 *     l'ancienne, et sans couper les accès en cours. Enchaîné avec « mot de passe oublié », il suffit
 *     à prendre la main sur le compte d'un volontaire — la victime n'en voit rien.
 *   - M74 : `POST /young/:id/email/:template` recopie `link`, `cta`, `message` et `object` fournis
 *     par l'appelant dans un email envoyé par l'expéditeur officiel du SNU : hameçonnage prêt à
 *     l'emploi vers un domaine arbitraire.
 *   - M67 : `POST /referent/:tutorId/email/:template` ne vérifie que le rôle de l'appelant
 *     (`canSendTutorTemplate`, packages/lib/src/roles.ts L977), jamais le lien entre lui et le
 *     tuteur visé.
 */
import request from "supertest";

import { ROLES, SENDINBLUE_TEMPLATES, YOUNG_STATUS } from "snu-lib";

import { ApplicationModel, MissionModel, ReferentModel, StructureModel, YoungModel } from "../models";
import { config } from "../config";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import getNewMissionFixture from "./fixtures/mission";
import { getNewApplicationFixture } from "./fixtures/application";
import getNewStructureFixture from "./fixtures/structure";
import { createReferentHelper } from "./helpers/referent";
import { createYoungHelper, getYoungByIdHelper } from "./helpers/young";

const mockSendTemplate = jest.fn().mockResolvedValue(undefined);
const mockSendEmail = jest.fn().mockResolvedValue(undefined);

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: (...args: any[]) => mockSendTemplate(...args),
  sendEmail: (...args: any[]) => mockSendEmail(...args),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
beforeEach(async () => {
  await ReferentModel.deleteMany();
  await YoungModel.deleteMany();
  await MissionModel.deleteMany();
  await StructureModel.deleteMany();
  await ApplicationModel.deleteMany();
  mockSendTemplate.mockClear();
  mockSendEmail.mockClear();
});
afterEach(resetAppAuth);

/** Un volontaire parisien et le référent départemental qui en a la charge. */
async function jeuneEtSonReferent(youngFields: Record<string, any> = {}) {
  const young = await createYoungHelper(getNewYoungFixture({ department: "Paris", region: "Île-de-France", status: YOUNG_STATUS.WAITING_VALIDATION, ...youngFields } as any));
  const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Paris"], region: "Île-de-France" }));
  return { young, referent };
}

/** Le dernier appel à `sendTemplate`, sous la forme `[templateId, { params, emailTo, ... }]`. */
function dernierMail() {
  return mockSendTemplate.mock.calls[mockSendTemplate.mock.calls.length - 1];
}

describe("M73 — changement d'adresse email d'un volontaire par un référent", () => {
  it("avertit l'ancienne adresse et coupe les accès en cours", async () => {
    const { young, referent } = await jeuneEtSonReferent({
      forgotPasswordResetToken: "jeton-de-reinitialisation",
      forgotPasswordResetExpires: new Date(Date.now() + 3600 * 1000),
    });
    const ancienneAdresse = young.email;

    const res = await request(await getAppHelperWithAcl(referent))
      .put(`/young-edition/${young._id}/identite`)
      .send({ email: "nouvelle-adresse@example.org" });

    expect(res.statusCode).toEqual(200);
    const apres = await getYoungByIdHelper(young._id);
    expect(apres?.email).toEqual("nouvelle-adresse@example.org");

    // L'ancienne adresse est prévenue : c'est le seul signal dont dispose la victime.
    expect(mockSendEmail).toHaveBeenCalled();
    expect(mockSendEmail.mock.calls[0][0].email).toEqual(ancienneAdresse);

    // Les accès obtenus avant le changement ne doivent pas survivre.
    expect(apres?.lastLogoutAt).toBeTruthy();
    expect(apres?.forgotPasswordResetToken).toBeFalsy();
  });

  it("n'avertit personne quand l'adresse n'est pas modifiée", async () => {
    const { young, referent } = await jeuneEtSonReferent();

    const res = await request(await getAppHelperWithAcl(referent))
      .put(`/young-edition/${young._id}/identite`)
      .send({ firstName: "Camille" });

    expect(res.statusCode).toEqual(200);
    expect(mockSendEmail).not.toHaveBeenCalled();
    expect((await getYoungByIdHelper(young._id))?.lastLogoutAt).toBeFalsy();
  });
});

describe("M74 — liens et messages libres dans les emails au volontaire", () => {
  it("refuse un lien vers un domaine tiers", async () => {
    const { young, referent } = await jeuneEtSonReferent();

    const res = await request(await getAppHelperWithAcl(referent))
      .post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.LINK}`)
      .send({ object: "Document à signer", message: "Merci de compléter ce document.", link: "https://snu-gouv.example.org/phishing" });

    expect(res.statusCode).toEqual(400);
    expect(mockSendTemplate).not.toHaveBeenCalled();
  });

  it("refuse un cta vers un domaine tiers", async () => {
    const { young, referent } = await jeuneEtSonReferent();

    const res = await request(await getAppHelperWithAcl(referent))
      .post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.LINK}`)
      .send({ object: "Document à signer", cta: "https://snu-gouv.example.org/phishing" });

    expect(res.statusCode).toEqual(400);
    expect(mockSendTemplate).not.toHaveBeenCalled();
  });

  it("accepte un lien vers un domaine du service", async () => {
    const { young, referent } = await jeuneEtSonReferent();

    const res = await request(await getAppHelperWithAcl(referent))
      .post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.LINK}`)
      .send({ object: "Document à signer", link: `${config.APP_URL}/file/fiche-sanitaire.pdf` });

    expect(res.statusCode).toEqual(200);
    expect(dernierMail()[1].params.link).toEqual(`${config.APP_URL}/file/fiche-sanitaire.pdf`);
  });

  it("neutralise le HTML du message et de l'objet", async () => {
    const { young, referent } = await jeuneEtSonReferent();

    const res = await request(await getAppHelperWithAcl(referent))
      .post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.LINK}`)
      .send({
        object: 'Urgent <img src="x" onerror="alert(1)">',
        message: 'Cliquez <a href="https://snu-gouv.example.org/phishing">ici</a> pour valider votre dossier.',
      });

    expect(res.statusCode).toEqual(200);
    const params = dernierMail()[1].params;
    expect(params.message).not.toContain("<a");
    expect(params.message).not.toContain("snu-gouv.example.org");
    expect(params.object).not.toContain("<img");
  });
});

describe("M67 — email libre à un tuteur", () => {
  async function tuteurDUneAutreStructure() {
    const structure = await StructureModel.create({ ...getNewStructureFixture(), department: "Paris", region: "Île-de-France" });
    const tuteur = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), region: null, department: [] } as any));
    return { structure, tuteur };
  }

  it("refuse un référent départemental sans lien avec le tuteur", async () => {
    const { tuteur } = await tuteurDUneAutreStructure();
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Ardennes"], region: "Grand Est" }));

    const res = await request(await getAppHelperWithAcl(referent))
      .post(`/referent/${tuteur._id}/email/${SENDINBLUE_TEMPLATES.referent.MISSION_REFUSED}`)
      .send({ message: "Bonjour", missionName: "Mission" });

    expect(res.statusCode).toEqual(403);
    expect(mockSendTemplate).not.toHaveBeenCalled();
  });

  it("autorise le référent départemental du territoire d'une mission du tuteur", async () => {
    const { structure, tuteur } = await tuteurDUneAutreStructure();
    await MissionModel.create({
      ...getNewMissionFixture(),
      structureId: structure._id.toString(),
      tutorId: tuteur._id.toString(),
      department: "Ardennes",
      region: "Grand Est",
    });
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Ardennes"], region: "Grand Est" }));

    const res = await request(await getAppHelperWithAcl(referent))
      .post(`/referent/${tuteur._id}/email/${SENDINBLUE_TEMPLATES.referent.MISSION_REFUSED}`)
      .send({ message: "Bonjour", missionName: "Mission" });

    expect(res.statusCode).toEqual(200);
    expect(mockSendTemplate).toHaveBeenCalled();
  });

  it("autorise le référent départemental d'un volontaire ayant candidaté auprès du tuteur", async () => {
    const { structure, tuteur } = await tuteurDUneAutreStructure();
    const mission = await MissionModel.create({
      ...getNewMissionFixture(),
      structureId: structure._id.toString(),
      tutorId: tuteur._id.toString(),
      department: "Paris",
      region: "Île-de-France",
    });
    const young = await createYoungHelper(getNewYoungFixture({ department: "Ardennes", region: "Grand Est" } as any));
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Ardennes"], region: "Grand Est" }));
    await ApplicationModel.create({
      ...getNewApplicationFixture(),
      youngId: young._id.toString(),
      missionId: mission._id.toString(),
      tutorId: tuteur._id.toString(),
      youngDepartment: "Ardennes",
    });

    const res = await request(await getAppHelperWithAcl(referent))
      .post(`/referent/${tuteur._id}/email/${SENDINBLUE_TEMPLATES.referent.MILITARY_PREPARATION_DOCS_VALIDATED}`)
      .send({ message: "Bonjour", missionName: "Mission" });

    expect(res.statusCode).toEqual(200);
  });

  it("autorise un administrateur", async () => {
    const { tuteur } = await tuteurDUneAutreStructure();
    const admin = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));

    const res = await request(await getAppHelperWithAcl(admin))
      .post(`/referent/${tuteur._id}/email/${SENDINBLUE_TEMPLATES.referent.MISSION_REFUSED}`)
      .send({ message: "Bonjour", missionName: "Mission" });

    expect(res.statusCode).toEqual(200);
  });

  it("neutralise le HTML du message", async () => {
    const { tuteur } = await tuteurDUneAutreStructure();
    const admin = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));

    const res = await request(await getAppHelperWithAcl(admin))
      .post(`/referent/${tuteur._id}/email/${SENDINBLUE_TEMPLATES.referent.MISSION_REFUSED}`)
      .send({ message: 'Voir <a href="https://snu-gouv.example.org/phishing">le dossier</a>', missionName: "Mission" });

    expect(res.statusCode).toEqual(200);
    const params = dernierMail()[1].params;
    expect(params.message).not.toContain("<a");
    expect(params.message).not.toContain("snu-gouv.example.org");
  });
});
