/**
 * Lot V10 : emails de validation de mission (PM22). Le nom de la mission, saisi par la structure,
 * est recopié dans les emails envoyés au tuteur depuis l'expéditeur officiel : aucun balisage ne
 * doit y figurer. Exercé par les vraies routes `POST /mission` et `PUT /mission/:id`, seul
 * `sendTemplate` étant remplacé. Chaque cas existe en valeur balisée (rouge avant le correctif) et
 * en valeur normale (non-régression).
 */
import request from "supertest";
import { MISSION_STATUS, PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLES, SENDINBLUE_TEMPLATES } from "snu-lib";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { addPermissionHelper } from "./helpers/permissions";
import { createMissionHelper } from "./helpers/mission";
import { createReferentHelper } from "./helpers/referent";
import { createStructureHelper } from "./helpers/structure";
import getNewMissionFixture from "./fixtures/mission";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewStructureFixture from "./fixtures/structure";
import { PermissionModel } from "../models/permissions/permission";
import { MissionModel, ReferentModel, StructureModel } from "../models";

jest.setTimeout(60_000);

const mockSendTemplate = jest.fn().mockResolvedValue(undefined);
jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: (...args: any[]) => mockSendTemplate(...args),
  sendEmail: () => Promise.resolve(),
}));
jest.mock("../services/gouv.fr/api-adresse", () => ({
  getNearestLocation: () => Promise.resolve({ lat: 48.85, lon: 2.35 }),
}));

const HOSTILE = '<a href="https://sosie.example">Cliquez ici</a>';
const NORMAL = "Aide aux devoirs";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await PermissionModel.deleteMany({});
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.MISSION, PERMISSION_ACTIONS.FULL);
}, 120_000);
afterAll(dbClose);
beforeEach(async () => {
  await Promise.all([MissionModel, ReferentModel, StructureModel].map((m: any) => m.deleteMany()));
  mockSendTemplate.mockClear();
});
afterEach(resetAppAuth);

function paramsOf(template: string): Record<string, any> {
  const call = mockSendTemplate.mock.calls.find(([id]) => id === template);
  expect(call).toBeDefined();
  return call![1].params;
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

  async function contexte() {
    const structure = await createStructureHelper({ ...getNewStructureFixture(), isNetwork: "false", networkId: "" });
    const tutor = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) }));
    return { structure, tutor };
  }

  it("POST /mission en attente de validation : nom de mission transmis au tuteur", async () => {
    const { structure, tutor } = await contexte();

    const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
      .post("/mission")
      .send({
        ...getNewMissionFixture(),
        name,
        startAt: new Date("2030-01-01T00:00:00Z").toISOString(),
        endAt: new Date("2030-02-01T00:00:00Z").toISOString(),
        structureId: String(structure._id),
        structureName: structure.name,
        placesTotal: 5,
        placesLeft: 5,
        status: MISSION_STATUS.WAITING_VALIDATION,
        tutorId: String(tutor._id),
        tutorName: undefined,
      });

    expect(res.status).toBe(200);
    check(paramsOf(SENDINBLUE_TEMPLATES.referent.MISSION_WAITING_VALIDATION).missionName);
  });

  it.each([
    [MISSION_STATUS.WAITING_VALIDATION, SENDINBLUE_TEMPLATES.referent.MISSION_WAITING_VALIDATION],
    [MISSION_STATUS.VALIDATED, SENDINBLUE_TEMPLATES.referent.MISSION_VALIDATED],
  ])("PUT /mission/:id vers %s : nom de mission transmis au tuteur", async (status, template) => {
    const { structure, tutor } = await contexte();
    const mission = await createMissionHelper({
      ...getNewMissionFixture(),
      structureId: String(structure._id),
      structureName: structure.name,
      status: MISSION_STATUS.DRAFT,
      placesTotal: 10,
      placesLeft: 10,
      tutorId: String(tutor._id),
    });

    const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN }))
      .put(`/mission/${mission._id}`)
      .send({ name, status, tutorId: String(tutor._id), description: mission.description, actions: mission.actions });

    expect(res.status).toBe(200);
    const params = paramsOf(template);
    check(params.missionName);
    if (status === MISSION_STATUS.VALIDATED) expect(params.cta).toMatch(/\/dashboard$/);
  });
});
