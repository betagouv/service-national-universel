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
 *
 * Et des constats PM2, PM4, PM15, PM24 et PM37 de l'audit de production du 25/09/2026 : textes
 * libres recopiés sans assainissement hors des deux routes ci-dessus (refus de candidature, mission
 * annulée, équivalence, question au support), et gabarits parents ou buckets Cellar tiers encore
 * accessibles au volontaire.
 */
import request from "supertest";

import { APPLICATION_STATUS, MISSION_STATUS, PERMISSION_ACTIONS, PERMISSION_RESOURCES, ReferentStatus, ROLES, SENDINBLUE_TEMPLATES, YOUNG_STATUS } from "snu-lib";

import { ApplicationModel, MissionModel, ReferentModel, StructureModel, YoungModel } from "../models";
import { config } from "../config";

import getAppHelper, { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import getNewMissionFixture from "./fixtures/mission";
import { getNewApplicationFixture } from "./fixtures/application";
import getNewStructureFixture from "./fixtures/structure";
import { createReferentHelper } from "./helpers/referent";
import { addPermissionHelper } from "./helpers/permissions";
import { createYoungHelper, getYoungByIdHelper } from "./helpers/young";
import { updateApplicationStatus } from "../application/applicationService";
import { notifyReferentNewApplication, notifyYoungChangementStatutEquivalence } from "../application/applicationNotificationService";

const mockSendTemplate = jest.fn().mockResolvedValue(undefined);
const mockSendEmail = jest.fn().mockResolvedValue(undefined);

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: (...args: any[]) => mockSendTemplate(...args),
  sendEmail: (...args: any[]) => mockSendEmail(...args),
}));

const mockSnupportApi = jest.fn();
jest.mock("../SNUpport", () => ({
  api: (...args: any[]) => mockSnupportApi(...args),
  getCustomerIdByEmail: jest.fn(),
}));
jest.mock("../services/support", () => ({
  getUserAttributes: jest.fn().mockResolvedValue([]),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.APPLICATION, PERMISSION_ACTIONS.FULL);
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
  mockSnupportApi.mockReset();
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

/** Un lien d'hameçonnage balisé, tel qu'un compte faible le glisserait dans un texte libre. */
const TEXTE_PIEGE = 'Reconnectez-vous <a href="https://snu-gouv.example.org/phishing">ici</a> <img src="https://snu-gouv.example.org/x.png">';

function expectSansBalisage(value: string | undefined) {
  expect(value).toBeDefined();
  expect(value).not.toContain("<a");
  expect(value).not.toContain("<img");
  expect(value).not.toContain("snu-gouv.example.org");
}

describe("PM2/PM4 — textes libres des structures et des référents dans les emails au volontaire", () => {
  async function candidatureSurMission(missionFields: Record<string, any> = {}) {
    const { young } = await jeuneEtSonReferent();
    const structure = await StructureModel.create({ ...getNewStructureFixture(), department: "Paris", region: "Île-de-France" });
    const tuteur = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() } as any));
    const mission = await MissionModel.create({
      ...getNewMissionFixture(),
      structureId: structure._id.toString(),
      tutorId: tuteur._id.toString(),
      department: "Paris",
      region: "Île-de-France",
      ...missionFields,
    });
    const application = await ApplicationModel.create({
      ...getNewApplicationFixture(),
      youngId: young._id.toString(),
      youngEmail: young.email,
      missionId: mission._id.toString(),
      structureId: structure._id.toString(),
      status: APPLICATION_STATUS.WAITING_VALIDATION,
    });
    return { young, mission, application };
  }

  it("neutralise le motif de refus d'une candidature (REFUSE_APPLICATION)", async () => {
    const { application } = await candidatureSurMission({ name: "Mission <b>solidaire</b>" });

    const res = await request(await getAppHelperWithAcl())
      .post(`/application/${application._id}/notify/${SENDINBLUE_TEMPLATES.young.REFUSE_APPLICATION}`)
      .send({ message: TEXTE_PIEGE });

    expect(res.statusCode).toEqual(200);
    const params = dernierMail()[1].params;
    expectSansBalisage(params.message);
    expect(params.message).toContain("Reconnectez-vous");
  });

  it("laisse passer inchangé un motif de refus sans balisage", async () => {
    const { application } = await candidatureSurMission();

    await request(await getAppHelperWithAcl())
      .post(`/application/${application._id}/notify/${SENDINBLUE_TEMPLATES.young.REFUSE_APPLICATION}`)
      .send({ message: "La mission est complète, merci pour votre candidature." });

    expect(dernierMail()[1].params.message).toEqual("La mission est complète, merci pour votre candidature.");
  });

  it("neutralise le nom et le commentaire d'une mission annulée par son responsable (MISSION_CANCEL)", async () => {
    const { mission } = await candidatureSurMission({ name: `Mission ${TEXTE_PIEGE}`, statusComment: TEXTE_PIEGE, status: MISSION_STATUS.CANCEL });

    await updateApplicationStatus(mission, { firstName: "Responsable" });

    const [template, { params }] = dernierMail();
    expect(template).toEqual(SENDINBLUE_TEMPLATES.young.MISSION_CANCEL);
    expectSansBalisage(params.message);
    expectSansBalisage(params.missionName);
  });

  it("neutralise le message d'équivalence d'un référent", async () => {
    const { young } = await jeuneEtSonReferent();

    await notifyYoungChangementStatutEquivalence(young, "REFUSED", TEXTE_PIEGE);

    const [template, { params }] = dernierMail();
    expect(template).toEqual(SENDINBLUE_TEMPLATES.young.EQUIVALENCE_REFUSED);
    expectSansBalisage(params.message);
  });

  it("neutralise le nom de mission notifié au tuteur", async () => {
    const { young } = await jeuneEtSonReferent();
    const tuteur = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, status: ReferentStatus.ACTIVE } as any));

    await notifyReferentNewApplication({ ...getNewApplicationFixture(), youngId: young._id.toString(), tutorId: tuteur._id.toString(), missionName: TEXTE_PIEGE } as any, young);

    expectSansBalisage(dernierMail()[1].params.missionName);
  });
});

describe("PM15 — question d'un volontaire relayée aux référents de son département", () => {
  const supportWriteAcl = [{ resource: PERMISSION_RESOURCES.SUPPORT, action: PERMISSION_ACTIONS.WRITE, policy: [] }];

  async function poserUneQuestion(message: string) {
    const { young } = await jeuneEtSonReferent();
    await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Paris"], region: "Île-de-France", status: ReferentStatus.ACTIVE } as any));
    mockSnupportApi.mockResolvedValue({ ok: true, data: { ticket: { contactEmail: young.email } } });
    (young as any).acl = supportWriteAcl;
    const res = await request(getAppHelper(young)).post("/SNUpport/ticket").send({ subject: "J'ai une question", message });
    return { res, young };
  }

  it("retire le balisage du message avant de l'envoyer aux référents", async () => {
    const { res } = await poserUneQuestion(TEXTE_PIEGE);

    expect(res.statusCode).toEqual(200);
    const [template, { params }] = dernierMail();
    expect(template).toEqual(SENDINBLUE_TEMPLATES.referent.MESSAGE_NOTIFICATION);
    expectSansBalisage(params.message);
  });

  it("laisse passer inchangée une question sans balisage", async () => {
    await poserUneQuestion("Quand aura lieu mon séjour ?");

    expect(dernierMail()[1].params.message).toEqual("Quand aura lieu mon séjour ?");
  });

  it("plafonne le nombre de questions d'un même volontaire", async () => {
    const { young } = await poserUneQuestion("Question 1");
    const app = getAppHelper(young);
    const statuts: number[] = [];
    for (let i = 2; i <= 11; i++) {
      statuts.push(
        (
          await request(app)
            .post("/SNUpport/ticket")
            .send({ subject: "J'ai une question", message: `Question ${i}` })
        ).statusCode,
      );
    }

    expect(statuts.slice(0, 9).every((statut) => statut === 200)).toBe(true);
    expect(statuts[9]).toEqual(429);
  });
});

describe("PM24/PM37 — gabarits parents et liens Cellar depuis un compte volontaire", () => {
  it("refuse au volontaire les gabarits parents (consentement parental décommissionné)", async () => {
    const { young } = await jeuneEtSonReferent();

    const res = await request(await getAppHelperWithAcl(young))
      .post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.parent.PARENT1_CONSENT}`)
      .send({ cta: "https://cellar-c2.services.clever-cloud.com/cni-bucket-prod/file/consentement.pdf" });

    expect(res.statusCode).toEqual(403);
    expect(mockSendTemplate).not.toHaveBeenCalled();
  });

  it("refuse un volontaire avant même la vérification du lien (GOO-198 : plus d'exception young.LINK)", async () => {
    const { young } = await jeuneEtSonReferent();

    const res = await request(await getAppHelperWithAcl(young))
      .post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.LINK}`)
      .send({ object: "Fiche sanitaire", link: "https://cellar-c2.services.clever-cloud.com/bucket-pirate/consentement.html" });

    expect(res.statusCode).toEqual(403);
    expect(mockSendTemplate).not.toHaveBeenCalled();
  });

  it("n'applique pas ce quota aux référents", async () => {
    const { young, referent } = await jeuneEtSonReferent();
    const app = await getAppHelperWithAcl(referent);

    const statuts: number[] = [];
    for (let i = 0; i < 11; i++) statuts.push((await request(app).post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.LINK}`).send({ object: "Document" })).statusCode);

    expect(statuts.every((statut) => statut === 200)).toBe(true);
  });
});

describe("GOO-198 — un volontaire ne peut plus déclencher aucun gabarit d'email officiel", () => {
  it("refuse un gabarit young quelconque, pas seulement LINK ou les gabarits parents", async () => {
    const { young } = await jeuneEtSonReferent();

    const res = await request(await getAppHelperWithAcl(young))
      .post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.MISSION_PROPOSITION}`)
      .send({});

    expect(res.statusCode).toEqual(403);
    expect(mockSendTemplate).not.toHaveBeenCalled();
  });

  it("le référent garde son accès actuel sur young.LINK", async () => {
    const { young, referent } = await jeuneEtSonReferent();

    const res = await request(await getAppHelperWithAcl(referent))
      .post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.LINK}`)
      .send({ object: "Document" });

    expect(res.statusCode).toEqual(200);
    expect(mockSendTemplate).toHaveBeenCalled();
  });

  it("le refus du volontaire compte quand même dans la limite horaire (défense en profondeur inchangée)", async () => {
    const { young } = await jeuneEtSonReferent();
    const app = await getAppHelperWithAcl(young);
    const envoyer = () => request(app).post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.LINK}`).send({ object: "Fiche sanitaire" });

    const statuts: number[] = [];
    for (let i = 0; i < 11; i++) statuts.push((await envoyer()).statusCode);

    expect(statuts.slice(0, 10).every((statut) => statut === 403)).toBe(true);
    expect(statuts[10]).toEqual(429);
    expect(mockSendTemplate).not.toHaveBeenCalled();
  });
});
