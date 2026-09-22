import request from "supertest";
import { Types } from "mongoose";

import { APPLICATION_STATUS, PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLE_JEUNE, ROLES, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2 } from "snu-lib";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { createApplication } from "./helpers/application";
import { createCohortHelper } from "./helpers/cohort";
import { createMissionHelper } from "./helpers/mission";
import { createReferentHelper } from "./helpers/referent";
import { createStructureHelper } from "./helpers/structure";
import { createYoungHelper } from "./helpers/young";
import { addPermissionHelper } from "./helpers/permissions";
import { getNewApplicationFixture } from "./fixtures/application";
import getNewCohortFixture from "./fixtures/cohort";
import getNewMissionFixture from "./fixtures/mission";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import { PermissionModel } from "../models/permissions/permission";

const { ObjectId } = Types;

jest.setTimeout(60_000);

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: () => Promise.resolve(),
  sendEmail: () => Promise.resolve(),
}));

const DEP_CIBLE = "Yvelines";
const REGION_CIBLE = "Île-de-France";
const DEP_ATTAQUANT = "Guyane";
const REGION_ATTAQUANT = "Guyane";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await PermissionModel.deleteMany({});
  // Même seed qu'en production (migration 20250716091433) : CANDIDATURE_READ / _WRITE / _CREATE
  // sont accordées SANS policy, donc `isReadAuthorized` & co répondent vrai pour n'importe
  // quelle candidature. C'est le périmètre explicite du contrôleur qui doit cloisonner.
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.APPLICATION, PERMISSION_ACTIONS.FULL);
  await addPermissionHelper(
    [ROLES.SUPERVISOR, ROLES.RESPONSIBLE, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.HEAD_CENTER],
    PERMISSION_RESOURCES.APPLICATION,
    PERMISSION_ACTIONS.READ,
  );
  await addPermissionHelper([ROLES.SUPERVISOR, ROLES.RESPONSIBLE, ROLES.HEAD_CENTER], PERMISSION_RESOURCES.APPLICATION, PERMISSION_ACTIONS.WRITE);
  await addPermissionHelper([ROLES.SUPERVISOR, ROLES.RESPONSIBLE, ROLES.HEAD_CENTER], PERMISSION_RESOURCES.APPLICATION, PERMISSION_ACTIONS.CREATE);
  for (const action of [PERMISSION_ACTIONS.READ, PERMISSION_ACTIONS.WRITE, PERMISSION_ACTIONS.CREATE]) {
    await addPermissionHelper([ROLES.REFERENT_DEPARTMENT], PERMISSION_RESOURCES.APPLICATION, action, [
      { where: [{ resource: "young", field: "department", source: "department" }], blacklist: [], whitelist: [] },
    ]);
    await addPermissionHelper([ROLES.REFERENT_REGION], PERMISSION_RESOURCES.APPLICATION, action, [
      { where: [{ resource: "young", field: "region", source: "region" }], blacklist: [], whitelist: [] },
    ]);
  }
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
afterEach(resetAppAuth);

/**
 * Un référent en base : `isReferent` teste `user instanceof ReferentModel`, un objet nu
 * ferait silencieusement sauter les contrôles de structure de `POST /application`.
 */
async function createReferent(overrides: Record<string, unknown>) {
  return createReferentHelper(getNewReferentFixture(overrides));
}

/**
 * Un volontaire réellement candidatable : le contrôleur exige une cohorte existante, et
 * `canCreateApplications` une phase 1 validée avec une phase 2 non validée. Sans ça,
 * `POST /application` renvoie 403 AVANT d'atteindre le contrôle de structure — et un test
 * de cloisonnement serait vert pour la mauvaise raison.
 */
async function createYoungWithCohort(overrides = {}) {
  const cohort = await createCohortHelper(getNewCohortFixture({ name: `Test-${new ObjectId().toString()}` }));
  return createYoungHelper(
    getNewYoungFixture({
      cohort: cohort.name,
      cohortId: cohort._id.toString(),
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
      ...overrides,
    }),
  );
}

async function createScopedApplication({ structureId }: { structureId: string }) {
  const young = await createYoungHelper({ ...getNewYoungFixture(), department: DEP_CIBLE, region: REGION_CIBLE });
  const mission = await createMissionHelper({ ...getNewMissionFixture(), structureId });
  const application = await createApplication({
    ...getNewApplicationFixture(),
    youngId: young._id.toString(),
    youngDepartment: DEP_CIBLE,
    missionId: mission._id.toString(),
    structureId,
  });
  return { young, mission, application };
}

describe("H1 - POST /application : la structure vient de la mission, pas du body", () => {
  it("devrait refuser à un responsable une candidature sur la mission d'une autre structure", async () => {
    const maStructure = await createStructureHelper({ name: "Ma structure" });
    const autreStructure = await createStructureHelper({ name: "Autre structure" });
    const young = await createYoungWithCohort({ department: DEP_CIBLE, region: REGION_CIBLE });
    const mission = await createMissionHelper({ ...getNewMissionFixture(), structureId: autreStructure._id.toString() });

    const responsable = await createReferent({ role: ROLES.RESPONSIBLE, structureId: maStructure._id.toString() });

    const res = await request(await getAppHelperWithAcl(responsable))
      .post("/application")
      // le body prétend que la candidature relève de la structure de l'appelant
      .send({ ...getNewApplicationFixture(), youngId: young._id.toString(), missionId: mission._id.toString(), structureId: maStructure._id.toString() });

    expect(res.status).toBe(403);
  });

  it("devrait refuser à un superviseur une candidature sur une mission hors de son réseau", async () => {
    const teteDeReseau = await createStructureHelper({ name: "Tête de réseau" });
    const horsReseau = await createStructureHelper({ name: "Hors réseau" });
    const young = await createYoungWithCohort({ department: DEP_CIBLE, region: REGION_CIBLE });
    const mission = await createMissionHelper({ ...getNewMissionFixture(), structureId: horsReseau._id.toString() });

    const superviseur = await createReferent({ role: ROLES.SUPERVISOR, structureId: teteDeReseau._id.toString() });

    const res = await request(await getAppHelperWithAcl(superviseur))
      .post("/application")
      .send({ ...getNewApplicationFixture(), youngId: young._id.toString(), missionId: mission._id.toString(), structureId: teteDeReseau._id.toString() });

    expect(res.status).toBe(403);
  });

  it("devrait accepter le responsable de la structure de la mission et ignorer le structureId du body", async () => {
    const maStructure = await createStructureHelper({ name: "Ma structure" });
    const young = await createYoungWithCohort({ department: DEP_CIBLE, region: REGION_CIBLE });
    const mission = await createMissionHelper({ ...getNewMissionFixture(), structureId: maStructure._id.toString() });

    const responsable = await createReferent({ role: ROLES.RESPONSIBLE, structureId: maStructure._id.toString() });

    const res = await request(await getAppHelperWithAcl(responsable))
      .post("/application")
      .send({
        ...getNewApplicationFixture(),
        youngId: young._id.toString(),
        missionId: mission._id.toString(),
        structureId: new ObjectId().toString(),
      });

    expect(res.status).toBe(200);
    expect(res.body.data.structureId).toBe(maStructure._id.toString());
  });
});

describe("H3 - GET /application/:id est cloisonné", () => {
  it("devrait refuser un responsable d'une autre structure", async () => {
    const structure = await createStructureHelper({ name: "Structure de la mission" });
    const { application } = await createScopedApplication({ structureId: structure._id.toString() });

    const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: new ObjectId().toString() })).get(`/application/${application._id}`);
    expect(res.status).toBe(403);
  });

  it("devrait refuser un référent départemental hors du département du jeune", async () => {
    const structure = await createStructureHelper({ name: "Structure de la mission" });
    const { application } = await createScopedApplication({ structureId: structure._id.toString() });

    const res = await request(
      await getAppHelperWithAcl({ role: ROLES.REFERENT_DEPARTMENT, department: [DEP_ATTAQUANT], region: REGION_ATTAQUANT }),
    ).get(`/application/${application._id}`);
    expect(res.status).toBe(403);
  });

  it("devrait accepter le responsable de la structure de la candidature", async () => {
    const structure = await createStructureHelper({ name: "Structure de la mission" });
    const { application } = await createScopedApplication({ structureId: structure._id.toString() });

    const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() })).get(`/application/${application._id}`);
    expect(res.status).toBe(200);
  });

  it("devrait accepter le référent départemental du jeune", async () => {
    const structure = await createStructureHelper({ name: "Structure de la mission" });
    const { application } = await createScopedApplication({ structureId: structure._id.toString() });

    const res = await request(await getAppHelperWithAcl({ role: ROLES.REFERENT_DEPARTMENT, department: [DEP_CIBLE], region: REGION_CIBLE })).get(
      `/application/${application._id}`,
    );
    expect(res.status).toBe(200);
  });
});

describe("H4 - POST /application/:id/file/:key est cloisonné", () => {
  it("devrait refuser un volontaire sur la candidature d'un autre", async () => {
    const structure = await createStructureHelper({ name: "Structure de la mission" });
    const { application } = await createScopedApplication({ structureId: structure._id.toString() });
    const attaquant = await createYoungHelper(getNewYoungFixture());

    const res = await request(await getAppHelperWithAcl(attaquant, "young"))
      .post(`/application/${application._id}/file/justificatifsFiles`)
      .send({ body: JSON.stringify({ names: ["fichier.pdf"] }) });
    expect(res.status).toBe(403);
  });

  it("devrait refuser un référent hors périmètre", async () => {
    const structure = await createStructureHelper({ name: "Structure de la mission" });
    const { application } = await createScopedApplication({ structureId: structure._id.toString() });

    const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: new ObjectId().toString() }))
      .post(`/application/${application._id}/file/justificatifsFiles`)
      .send({ body: JSON.stringify({ names: ["fichier.pdf"] }) });
    expect(res.status).toBe(403);
  });

  it("devrait refuser un rôle sans périmètre sur les candidatures (visiteur)", async () => {
    const structure = await createStructureHelper({ name: "Structure de la mission" });
    const { application } = await createScopedApplication({ structureId: structure._id.toString() });

    const res = await request(await getAppHelperWithAcl({ role: ROLES.VISITOR, department: [DEP_CIBLE], region: REGION_CIBLE }))
      .post(`/application/${application._id}/file/justificatifsFiles`)
      .send({ body: JSON.stringify({ names: ["fichier.pdf"] }) });
    expect(res.status).toBe(403);
  });
});

describe("H5 - GET /application/:id/file/:key/:name est cloisonné", () => {
  it("devrait refuser un référent hors périmètre", async () => {
    const structure = await createStructureHelper({ name: "Structure de la mission" });
    const { application } = await createScopedApplication({ structureId: structure._id.toString() });

    const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: new ObjectId().toString() })).get(
      `/application/${application._id}/file/justificatifsFiles/fichier.pdf`,
    );
    expect(res.status).toBe(403);
  });

  it("devrait refuser un visiteur", async () => {
    const structure = await createStructureHelper({ name: "Structure de la mission" });
    const { application } = await createScopedApplication({ structureId: structure._id.toString() });

    const res = await request(await getAppHelperWithAcl({ role: ROLES.VISITOR, department: [DEP_CIBLE], region: REGION_CIBLE })).get(
      `/application/${application._id}/file/justificatifsFiles/fichier.pdf`,
    );
    expect(res.status).toBe(403);
  });

  it("devrait refuser un volontaire sur la candidature d'un autre", async () => {
    const structure = await createStructureHelper({ name: "Structure de la mission" });
    const { application } = await createScopedApplication({ structureId: structure._id.toString() });
    const attaquant = await createYoungHelper(getNewYoungFixture());

    const res = await request(await getAppHelperWithAcl(attaquant, "young")).get(`/application/${application._id}/file/justificatifsFiles/fichier.pdf`);
    expect(res.status).toBe(403);
  });
});

describe("M1 - PUT /application/:id/visibilite", () => {
  it("devrait laisser un volontaire masquer SA candidature", async () => {
    const young = await createYoungHelper(getNewYoungFixture());
    const mission = await createMissionHelper(getNewMissionFixture());
    const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id.toString(), missionId: mission._id.toString() });

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .put(`/application/${application._id}/visibilite`)
      .send({ hidden: "true" });
    expect(res.status).toBe(200);
    expect(res.body.data.hidden).toBe("true");
  });

  it("devrait refuser à un volontaire de masquer la candidature d'un autre", async () => {
    const cible = await createYoungHelper(getNewYoungFixture());
    const attaquant = await createYoungHelper(getNewYoungFixture());
    const mission = await createMissionHelper(getNewMissionFixture());
    const application = await createApplication({ ...getNewApplicationFixture(), youngId: cible._id.toString(), missionId: mission._id.toString() });

    const res = await request(await getAppHelperWithAcl(attaquant, "young"))
      .put(`/application/${application._id}/visibilite`)
      .send({ hidden: "true" });
    expect(res.status).toBe(403);
  });
});

describe("H2 - POST /application : un volontaire ne peut pas se créditer des heures", () => {
  it("devrait refuser un statut DONE à la création", async () => {
    const structure = await createStructureHelper({ name: "Structure de la mission" });
    const young = await createYoungWithCohort();
    const mission = await createMissionHelper({ ...getNewMissionFixture(), structureId: structure._id.toString(), duration: "1" });

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .post("/application")
      .send({
        ...getNewApplicationFixture(),
        youngId: young._id.toString(),
        missionId: mission._id.toString(),
        status: APPLICATION_STATUS.DONE,
        missionDuration: "1000",
      });
    expect(res.status).toBe(400);
  });
});
