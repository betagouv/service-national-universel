/**
 * Lot V10 : emails de contrat, de changement de statut de candidature, de clôture de candidature
 * (phase 2 validée) et de validation de mission de phase 3. Les noms de mission, de structure et de
 * personnes sont saisis par des tiers et recopiés dans des emails envoyés depuis l'expéditeur
 * officiel : aucun balisage ne doit y figurer. Exercé par les vraies routes (ou, pour la clôture de
 * candidature, la vraie fonction) ; seul `sendTemplate` est remplacé. Chaque cas existe en valeur
 * balisée (rouge avant le correctif) et en valeur normale (non-régression).
 */
import request from "supertest";
import { Types } from "mongoose";
import { APPLICATION_STATUS, PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLE_JEUNE, ROLES, SENDINBLUE_TEMPLATES } from "snu-lib";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { addPermissionHelper } from "./helpers/permissions";
import { createApplication } from "./helpers/application";
import { createContractHelper } from "./helpers/contract";
import { createMissionHelper } from "./helpers/mission";
import { createReferentHelper } from "./helpers/referent";
import { createStructureHelper } from "./helpers/structure";
import { createYoungHelper } from "./helpers/young";
import getNewContractFixture from "./fixtures/contract";
import { getNewApplicationFixture } from "./fixtures/application";
import getNewMissionFixture from "./fixtures/mission";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewStructureFixture from "./fixtures/structure";
import getNewYoungFixture from "./fixtures/young";
import { PermissionModel } from "../models/permissions/permission";
import { ApplicationModel, ContractModel, MissionModel, ReferentModel, StructureModel, YoungModel } from "../models";
import { sendNotificationApplicationClosedBecausePhase2Validated } from "../utils";

jest.setTimeout(60_000);

const mockSendTemplate = jest.fn().mockResolvedValue(undefined);
jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: (...args: any[]) => mockSendTemplate(...args),
  sendEmail: () => Promise.resolve(),
}));

const HOSTILE = '<a href="https://sosie.example">Cliquez ici</a>';
const NORMAL = "Aide aux devoirs";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await PermissionModel.deleteMany({});
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.APPLICATION, PERMISSION_ACTIONS.FULL);
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.CONTRACT, PERMISSION_ACTIONS.FULL);
}, 120_000);
afterAll(dbClose);
beforeEach(async () => {
  await Promise.all([ApplicationModel, ContractModel, MissionModel, ReferentModel, StructureModel, YoungModel].map((m: any) => m.deleteMany()));
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
  const checkName = (value: unknown) => {
    if (hostile) {
      expect(String(value)).not.toMatch(/[<>]/);
      expect(String(value)).toContain("Cliquez ici");
    } else {
      expect(value).toEqual(`${NORMAL} Dupont`);
    }
  };

  it("POST /contract/:id/send-email/parent1 : nom de mission, du jeune et du destinataire", async () => {
    const structure = await createStructureHelper(getNewStructureFixture());
    const young = await createYoungHelper({ ...getNewYoungFixture(), parent1Email: `parent1-${new Types.ObjectId()}@dossier.fr` });
    const application = await createApplication({ ...getNewApplicationFixture(), status: "VALIDATED", youngId: young._id, structureId: structure._id });
    const contract = await createContractHelper({
      ...getNewContractFixture(),
      youngId: young._id,
      applicationId: application._id,
      structureId: structure._id,
      missionName: name,
      youngFirstName: name,
      youngLastName: "Dupont",
      parent1FirstName: name,
      parent1LastName: "Dupont",
      parent1Token: "tok-parent1",
    });

    const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN })).post(`/contract/${contract._id}/send-email/parent1`).send();

    expect(res.status).toBe(200);
    const call = mockSendTemplate.mock.calls.find(([id]) => id === SENDINBLUE_TEMPLATES.VALIDATE_CONTRACT);
    expect(call).toBeDefined();
    const params = call![1].params;
    check(params.missionName);
    checkName(params.youngName);
    checkName(params.toName);
    expect(params.cta).toContain("/validate-contract?token=tok-parent1");
  });

  it("POST /contract/token/:token : nom de mission du contrat signé", async () => {
    const young = await createYoungHelper(getNewYoungFixture());
    const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id });
    await createContractHelper({
      ...getNewContractFixture(),
      youngId: young._id,
      applicationId: application._id,
      missionName: name,
      isYoungAdult: "true",
      invitationSent: "true",
      projectManagerToken: "tok-pm",
      projectManagerStatus: "VALIDATED",
      structureManagerToken: "tok-sm",
      structureManagerStatus: "VALIDATED",
      youngContractToken: "tok-young",
    });

    const res = await request(await getAppHelperWithAcl()).post("/contract/token/tok-young").send();

    expect(res.status).toBe(200);
    const params = paramsOf(SENDINBLUE_TEMPLATES.young.CONTRACT_VALIDATED);
    check(params.missionName);
    expect(params.cta).toContain("/candidature");
  });

  it.each([
    [APPLICATION_STATUS.VALIDATED, SENDINBLUE_TEMPLATES.young.VALIDATE_APPLICATION],
    [APPLICATION_STATUS.REFUSED, SENDINBLUE_TEMPLATES.young.REFUSE_APPLICATION],
  ])("POST /application/multiaction/change-status/%s : nom de mission", async (status, template) => {
    const young = await createYoungHelper(getNewYoungFixture());
    const tutor = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE }));
    const mission = await createMissionHelper({ ...getNewMissionFixture(), name, tutorId: tutor._id.toString(), placesTotal: 5, placesLeft: 5 });
    const application = await createApplication({
      ...getNewApplicationFixture(),
      youngId: young._id.toString(),
      missionId: mission._id.toString(),
      status: APPLICATION_STATUS.WAITING_VALIDATION,
    });
    const admin = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));

    const res = await request(await getAppHelperWithAcl(admin))
      .post(`/application/multiaction/change-status/${status}`)
      .send({ ids: [application._id.toString()] });

    expect(res.status).toBe(200);
    check(paramsOf(template).missionName);
  });

  it("clôture de candidature (phase 2 validée) : nom de mission et du jeune transmis au tuteur", async () => {
    const tutor = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE }));

    await sendNotificationApplicationClosedBecausePhase2Validated({
      tutorId: tutor._id.toString(),
      missionName: name,
      youngFirstName: name,
      youngLastName: "Dupont",
    });

    const params = paramsOf(SENDINBLUE_TEMPLATES.referent.CANCEL_APPLICATION_PHASE_2_VALIDATED);
    check(params.missionName);
    check(params.youngFirstName);
    expect(params.youngLastName).toEqual("Dupont");
  });

  it("PUT /young/:id/validate-mission-phase3 : noms transmis au tuteur", async () => {
    const young = await createYoungHelper(getNewYoungFixture({ statusPhase3: "WAITING_REALISATION", firstName: name, lastName: "Dupont" }));

    const res = await request(await getAppHelperWithAcl(young))
      .put(`/young/${young._id}/validate-mission-phase3`)
      .send({
        phase3StructureName: name,
        phase3TutorFirstName: name,
        phase3TutorLastName: "Dupont",
        phase3TutorEmail: "tuteur.phase3@exemple.fr",
      });

    expect(res.status).toBe(200);
    const params = paramsOf(SENDINBLUE_TEMPLATES.referent.VALIDATE_MISSION_PHASE3);
    check(params.structureName);
    checkName(params.toName);
    checkName(params.youngName);
    expect(params.cta).toContain("/validate?token=");
  });
});
