/**
 * Lot D (GOO-38) : changement de statut des candidatures par lot (L1) et notifications
 * déclenchables par le volontaire (L2).
 */
import request from "supertest";
import { Types } from "mongoose";

import { APPLICATION_STATUS, PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLE_JEUNE, ROLES, SENDINBLUE_TEMPLATES, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2 } from "snu-lib";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { createApplication } from "./helpers/application";
import { createCohortHelper } from "./helpers/cohort";
import { createMissionHelper } from "./helpers/mission";
import { createReferentHelper } from "./helpers/referent";
import { createYoungHelper, getYoungByIdHelper } from "./helpers/young";
import { addPermissionHelper } from "./helpers/permissions";
import { getNewApplicationFixture } from "./fixtures/application";
import getNewCohortFixture from "./fixtures/cohort";
import getNewMissionFixture from "./fixtures/mission";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import { PermissionModel } from "../models/permissions/permission";
import { ApplicationModel, MissionModel } from "../models";

jest.setTimeout(60_000);

const sendTemplate = jest.fn(() => Promise.resolve());
jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: (...args: unknown[]) => sendTemplate(...(args as [])),
  sendEmail: () => Promise.resolve(),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await PermissionModel.deleteMany({});
  // Même seed qu'en production (cf. application-security.test.ts).
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.APPLICATION, PERMISSION_ACTIONS.FULL);
  await addPermissionHelper([ROLES.SUPERVISOR, ROLES.RESPONSIBLE], PERMISSION_RESOURCES.APPLICATION, PERMISSION_ACTIONS.READ);
  await addPermissionHelper([ROLES.SUPERVISOR, ROLES.RESPONSIBLE], PERMISSION_RESOURCES.APPLICATION, PERMISSION_ACTIONS.WRITE);
  await addPermissionHelper([ROLE_JEUNE], PERMISSION_RESOURCES.APPLICATION, PERMISSION_ACTIONS.FULL, [
    {
      where: [
        { source: "_id", field: "youngId" },
        { source: "_id", resource: "young", field: "_id" },
      ],
      blacklist: [],
      whitelist: [],
    },
  ]);
}, 120_000);
afterAll(dbClose);
afterEach(() => {
  resetAppAuth();
  sendTemplate.mockClear();
  jest.restoreAllMocks();
});

async function createYoungWithApplication(status: string) {
  const young = await createYoungHelper(getNewYoungFixture());
  const tutor = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE }));
  const mission = await createMissionHelper({ ...getNewMissionFixture(), tutorId: tutor._id.toString() });
  const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id.toString(), missionId: mission._id.toString(), status });
  return { young, application };
}

describe("POST /application/:id/notify/:template — volontaire (L2)", () => {
  it("refuse un template hors de la liste du volontaire (400, aucun email)", async () => {
    const { young, application } = await createYoungWithApplication(APPLICATION_STATUS.VALIDATED);
    const res = await request(await getAppHelperWithAcl(young, "young"))
      .post(`/application/${application._id}/notify/${SENDINBLUE_TEMPLATES.referent.YOUNG_VALIDATED}`)
      .send({});
    expect(res.status).toBe(400);
    expect(sendTemplate).not.toHaveBeenCalled();
  });

  it("refuse un motif libre envoyé par le volontaire (400)", async () => {
    const { young, application } = await createYoungWithApplication(APPLICATION_STATUS.CANCEL);
    const res = await request(await getAppHelperWithAcl(young, "young"))
      .post(`/application/${application._id}/notify/${SENDINBLUE_TEMPLATES.young.CANCEL_APPLICATION}`)
      .send({ message: "Texte libre injecté dans un email officiel" });
    expect(res.status).toBe(400);
    expect(sendTemplate).not.toHaveBeenCalled();
  });

  it("refuse une notification que le statut de la candidature ne justifie pas (400)", async () => {
    const { young, application } = await createYoungWithApplication(APPLICATION_STATUS.IN_PROGRESS);
    const res = await request(await getAppHelperWithAcl(young, "young"))
      .post(`/application/${application._id}/notify/${SENDINBLUE_TEMPLATES.referent.ABANDON_APPLICATION}`)
      .send({});
    expect(res.status).toBe(400);
    expect(sendTemplate).not.toHaveBeenCalled();
  });

  it("accepte l'annulation d'une candidature annulée (200)", async () => {
    const { young, application } = await createYoungWithApplication(APPLICATION_STATUS.CANCEL);
    const res = await request(await getAppHelperWithAcl(young, "young"))
      .post(`/application/${application._id}/notify/${SENDINBLUE_TEMPLATES.young.CANCEL_APPLICATION}`)
      .send({});
    expect(res.status).toBe(200);
    expect(sendTemplate).toHaveBeenCalledTimes(1);
  });

  it("valide le type de pièce jointe contre une liste fermée", async () => {
    const { young, application } = await createYoungWithApplication(APPLICATION_STATUS.VALIDATED);
    const app = await getAppHelperWithAcl(young, "young");
    const url = `/application/${application._id}/notify/${SENDINBLUE_TEMPLATES.ATTACHEMENT_PHASE_2_APPLICATION}`;

    const refused = await request(app).post(url).send({ type: "<b>un faux document officiel</b>", multipleDocument: "false" });
    expect(refused.status).toBe(400);

    const accepted = await request(app).post(url).send({ type: "justificatifsFiles", multipleDocument: "false" });
    expect(accepted.status).toBe(200);
  });

  it("limite le nombre de notifications par volontaire (429 au-delà de 20 par heure)", async () => {
    const { young, application } = await createYoungWithApplication(APPLICATION_STATUS.CANCEL);
    const app = await getAppHelperWithAcl(young, "young");
    const url = `/application/${application._id}/notify/${SENDINBLUE_TEMPLATES.young.CANCEL_APPLICATION}`;
    for (let i = 0; i < 20; i++) {
      const res = await request(app).post(url).send({});
      expect(res.status).toBe(200);
    }
    const res = await request(app).post(url).send({});
    expect(res.status).toBe(429);
  });

  it("ne sert plus la route morte notify/docs-military-preparation", async () => {
    const { young } = await createYoungWithApplication(APPLICATION_STATUS.VALIDATED);
    const res = await request(await getAppHelperWithAcl(young, "young"))
      .post(`/application/notify/docs-military-preparation/${SENDINBLUE_TEMPLATES.referent.MILITARY_PREPARATION_DOCS_SUBMITTED}`)
      .send({});
    expect(res.status).toBe(404);
    expect(sendTemplate).not.toHaveBeenCalled();
  });
});

describe("POST /application/multiaction/change-status/:key (L1)", () => {
  it("applique les transitions par rôle : une structure ne passe pas WAITING_ACCEPTATION à DONE", async () => {
    // Rattaché à une structure : sans `structureId`, le contrôle de périmètre répondrait 403 avant
    // le contrôle de transition et le test serait vert par construction.
    const structureId = new Types.ObjectId().toString();
    const responsible = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId }));
    const young = await createYoungHelper(getNewYoungFixture());
    const mission = await createMissionHelper({ ...getNewMissionFixture(), structureId });
    const application = await createApplication({
      ...getNewApplicationFixture(),
      youngId: young._id.toString(),
      missionId: mission._id.toString(),
      structureId,
      status: APPLICATION_STATUS.WAITING_ACCEPTATION,
      missionDuration: "84",
    });

    const res = await request(await getAppHelperWithAcl(responsible))
      .post(`/application/multiaction/change-status/${APPLICATION_STATUS.DONE}`)
      .send({ ids: [application._id.toString()] });

    expect(res.status).toBe(403);
    const unchanged = await ApplicationModel.findById(application._id);
    expect(unchanged!.status).toBe(APPLICATION_STATUS.WAITING_ACCEPTATION);
    const unchangedYoung = await getYoungByIdHelper(young._id.toString());
    expect(unchangedYoung!.statusPhase2).not.toBe(YOUNG_STATUS_PHASE2.VALIDATED);
  });

  it("un lot de 10 candidatures du même volontaire donne des heures de phase 2 justes", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture());
    const young = await createYoungHelper({
      ...getNewYoungFixture(),
      cohort: cohort.name,
      cohortId: cohort._id,
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
      phase2NumberHoursDone: "0",
    });
    const mission = await createMissionHelper({ ...getNewMissionFixture(), placesTotal: 20, placesLeft: 10 });
    const applicationIds: string[] = [];
    for (let i = 0; i < 10; i++) {
      applicationIds.push(
        await createApplication({
          ...getNewApplicationFixture(),
          youngId: young._id.toString(),
          missionId: mission._id.toString(),
          status: APPLICATION_STATUS.VALIDATED,
          missionDuration: "5",
        }).then((application) => application._id.toString()),
      );
    }
    const admin = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));

    const res = await request(await getAppHelperWithAcl(admin))
      .post(`/application/multiaction/change-status/${APPLICATION_STATUS.DONE}`)
      .send({ ids: applicationIds });

    expect(res.status).toBe(200);
    const updatedYoung = await getYoungByIdHelper(young._id.toString());
    expect(updatedYoung!.phase2NumberHoursDone).toBe("50");
    expect(updatedYoung!.phase2NumberHoursEstimated).toBe("0");
    expect(updatedYoung!.phase2ApplicationStatus).toHaveLength(10);
    expect(updatedYoung!.phase2ApplicationStatus!.every((status) => status === APPLICATION_STATUS.DONE)).toBe(true);
    const updatedMission = await MissionModel.findById(mission._id);
    expect(updatedMission!.placesLeft).toBe(10);
  });

  it("remonte l'échec d'un recalcul au lieu de l'avaler (500)", async () => {
    const young = await createYoungHelper(getNewYoungFixture());
    const mission = await createMissionHelper({ ...getNewMissionFixture(), placesTotal: 5, placesLeft: 5 });
    const application = await createApplication({
      ...getNewApplicationFixture(),
      youngId: young._id.toString(),
      missionId: mission._id.toString(),
      status: APPLICATION_STATUS.WAITING_VALIDATION,
    });
    jest.spyOn(MissionModel.prototype, "save").mockRejectedValueOnce(new Error("VersionError"));
    const admin = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));

    const res = await request(await getAppHelperWithAcl(admin))
      .post(`/application/multiaction/change-status/${APPLICATION_STATUS.VALIDATED}`)
      .send({ ids: [application._id.toString()] });

    expect(res.status).toBe(500);
  });
});
