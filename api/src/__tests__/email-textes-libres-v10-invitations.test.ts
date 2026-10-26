/**
 * Lot V10 : emails d'invitation des référents (PM22). Le nom de la structure, celui du centre et le
 * nom du destinataire sont saisis par des tiers et recopiés dans l'email envoyé depuis l'expéditeur
 * officiel : aucun balisage ne doit y figurer. Les trois chemins d'envoi sont exercés par leur vraie
 * route (invitation initiale, renvoi anonyme, renouvellement par un administrateur) ; seul
 * `sendTemplate` est remplacé. Chaque cas existe en valeur balisée (rouge avant le correctif) et en
 * valeur normale (non-régression : le texte légitime est transmis tel quel).
 */
import request from "supertest";
import crypto from "crypto";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLES, SENDINBLUE_TEMPLATES } from "snu-lib";

import { ReferentModel, StructureModel } from "../models";
import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import getAppHelper from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { addPermissionHelper } from "./helpers/permissions";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewStructureFixture from "./fixtures/structure";
import { createReferentHelper } from "./helpers/referent";

const mockSendTemplate = jest.fn().mockResolvedValue(undefined);
jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
  sendTemplate: (...args: any[]) => mockSendTemplate(...args),
}));

const HOSTILE = '<a href="https://sosie.example">Cliquez ici</a>';
const NORMAL = "Aide aux devoirs";
const TEMPLATE = SENDINBLUE_TEMPLATES.invitationReferent[ROLES.RESPONSIBLE];

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.REFERENT, PERMISSION_ACTIONS.FULL);
});
afterAll(dbClose);
beforeEach(async () => {
  await ReferentModel.deleteMany();
  await StructureModel.deleteMany();
  mockSendTemplate.mockClear();
});
afterEach(resetAppAuth);

/** L'envoi du renvoi d'invitation n'est pas attendu par la route (PM5) : on attend l'appel. */
async function dernierEnvoi() {
  for (let i = 0; i < 100 && mockSendTemplate.mock.calls.length === 0; i++) await new Promise((resolve) => setTimeout(resolve, 50));
  expect(mockSendTemplate).toHaveBeenCalled();
  return mockSendTemplate.mock.calls[mockSendTemplate.mock.calls.length - 1];
}

describe.each([
  ["valeur balisée", HOSTILE, true],
  ["valeur normale", NORMAL, false],
])("%s", (_label, name, hostile) => {
  const check = (value: unknown) => {
    if (hostile) {
      expect(String(value)).not.toMatch(/[<>]/);
      expect(String(value)).toContain("Cliquez ici");
    } else {
      expect(value).toEqual(NORMAL);
    }
  };

  it("POST /referent/signup_invite/:template : nom de structure et de centre transmis à l'invité", async () => {
    const structure = await StructureModel.create({ ...getNewStructureFixture(), name } as any);

    const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
      .post(`/referent/signup_invite/${TEMPLATE}`)
      .send({ email: "invite@example.org", firstName: "Ada", lastName: "Lovelace", role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), cohesionCenterName: name });

    expect(res.status).toBe(200);
    const [templateId, { params, emailTo }] = await dernierEnvoi();
    expect(templateId).toBe(TEMPLATE);
    expect(emailTo[0].email).toBe("invite@example.org");
    check(params.structureName);
    check(params.cohesionCenterName);
    expect(params.cta).toMatch(/\/auth\/signup\/invite\?token=[0-9a-f]{40}$/);
  });

  it("POST /referent/signup_retry : nom de structure, de centre et du destinataire transmis", async () => {
    const structure = await StructureModel.create({ ...getNewStructureFixture(), name } as any);
    const referent = await ReferentModel.create(
      getNewReferentFixture({
        role: ROLES.RESPONSIBLE,
        firstName: name,
        lastName: name,
        structureId: structure._id.toString(),
        cohesionCenterName: name,
        invitationToken: crypto.randomBytes(20).toString("hex"),
        invitationExpires: new Date(Date.now() + 2 * 24 * 3600 * 1000),
      } as any),
    );

    const res = await request(getAppHelper()).post("/referent/signup_retry").send({ email: referent.email });

    expect(res.status).toBe(200);
    const [templateId, { params }] = await dernierEnvoi();
    expect(templateId).toBe(SENDINBLUE_TEMPLATES.invitationReferent[ROLES.RESPONSIBLE]);
    check(params.structureName);
    check(params.cohesionCenterName);
    if (hostile) {
      expect(params.toName).not.toMatch(/[<>]/);
    } else {
      expect(params.toName).toEqual(`${NORMAL} ${NORMAL}`);
    }
    expect(params.fromName).toEqual("L'équipe SNU");
    expect(params.cta).toMatch(/\/auth\/signup\/invite\?token=[0-9a-f]{40}$/);
  });

  it("POST /referent/:id/renew-invitation : nom de structure, de centre et du destinataire transmis", async () => {
    const structure = await StructureModel.create({ ...getNewStructureFixture(), name } as any);
    const referent = await createReferentHelper(
      getNewReferentFixture({
        role: ROLES.RESPONSIBLE,
        firstName: name,
        lastName: name,
        structureId: structure._id.toString(),
        cohesionCenterName: name,
        registredAt: undefined,
        invitationToken: crypto.randomBytes(20).toString("hex"),
        invitationExpires: new Date(Date.now() - 24 * 3600 * 1000),
      } as any),
    );

    const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN })).post(`/referent/${referent._id}/renew-invitation`);

    expect(res.status).toBe(200);
    const [, { params }] = await dernierEnvoi();
    check(params.structureName);
    check(params.cohesionCenterName);
    if (hostile) {
      expect(params.toName).not.toMatch(/[<>]/);
    } else {
      expect(params.toName).toEqual(`${NORMAL} ${NORMAL}`);
    }
    expect(params.cta).toMatch(/\/auth\/signup\/invite\?token=[0-9a-f]{40}$/);
  });
});
