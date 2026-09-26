/**
 * Lot P02 (GOO-57) — candidatures créées ou réécrites hors du flux, propositions visibles des structures.
 *
 * PH1  : POST /application — un responsable / superviseur fixait librement statut et durée
 * PH19 : PUT / POST /application — les champs dénormalisés (contrat, tuteur, mission, identité) étaient
 *        écrits par le client, puis GET /young/:id/application joignait contrat et tuteur sans contrôle
 * PH11 : GET /mission/:id/application et périmètre dossier — une simple proposition (WAITING_ACCEPTATION)
 *        ouvrait à la structure l'identité, le dossier et les pièces du volontaire
 * PM3  : GET / POST /application/:id/file — clé et nom libres, espace de stockage partagé entre candidatures
 */
import request from "supertest";
import { Types } from "mongoose";

import { APPLICATION_STATUS, PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLE_JEUNE, ROLES, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2 } from "snu-lib";

import { ApplicationModel, ContractModel } from "../models";
import { PermissionModel } from "../models/permissions/permission";
import { getFile, uploadFile } from "../utils";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { createCohortHelper } from "./helpers/cohort";
import { createMissionHelper } from "./helpers/mission";
import { createReferentHelper } from "./helpers/referent";
import { createStructureHelper } from "./helpers/structure";
import { createYoungHelper, getYoungByIdHelper } from "./helpers/young";
import { addPermissionHelper } from "./helpers/permissions";
import getNewCohortFixture from "./fixtures/cohort";
import getNewMissionFixture from "./fixtures/mission";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";

const { ObjectId } = Types;

jest.setTimeout(120_000);

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: () => Promise.resolve(),
  sendEmail: () => Promise.resolve(),
  sync: () => Promise.resolve(),
  unsync: () => Promise.resolve(),
}));
// Pas de clé de chiffrement des fichiers en test : le contenu transite en clair.
jest.mock("../cryptoUtils", () => ({ ...jest.requireActual("../cryptoUtils"), encrypt: (buffer) => buffer, decrypt: (buffer) => buffer }));
jest.mock("../utils/virusScanner", () => ({ scanFile: jest.fn().mockResolvedValue({ infected: false }) }));
jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  uploadFile: jest.fn().mockResolvedValue({}),
  getFile: jest.fn(),
}));

const PNG_1x1 = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
const TERRITOIRE = { department: "Ain", region: "Auvergne-Rhône-Alpes" };

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await PermissionModel.deleteMany({});
  // Même seed qu'en production (migration 20250716091433) : CANDIDATURE_* sans policy pour les rôles de structure.
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.APPLICATION, PERMISSION_ACTIONS.FULL);
  for (const action of [PERMISSION_ACTIONS.READ, PERMISSION_ACTIONS.WRITE, PERMISSION_ACTIONS.CREATE]) {
    await addPermissionHelper([ROLES.SUPERVISOR, ROLES.RESPONSIBLE], PERMISSION_RESOURCES.APPLICATION, action);
  }
  await addPermissionHelper([ROLES.SUPERVISOR, ROLES.RESPONSIBLE], PERMISSION_RESOURCES.MISSION, PERMISSION_ACTIONS.READ);
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
beforeEach(() => jest.clearAllMocks());
afterEach(resetAppAuth);

async function createYoungWithCohort(overrides = {}) {
  const cohort = await createCohortHelper(getNewCohortFixture({ name: `Test-${new ObjectId().toString()}` }));
  return createYoungHelper(
    getNewYoungFixture({
      cohort: cohort.name,
      cohortId: cohort._id.toString(),
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
      ...TERRITOIRE,
      ...overrides,
    } as any),
  );
}

/** Structure, tuteur de la structure, mission publiée portée par la structure, responsable de la structure. */
async function createStructureScenario({ duration = "12" } = {}) {
  const structure = await createStructureHelper({ name: `Structure ${new ObjectId().toString()}` });
  const tuteur = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }));
  const mission = await createMissionHelper({
    ...getNewMissionFixture(),
    status: "VALIDATED",
    visibility: "VISIBLE",
    placesTotal: 10,
    placesLeft: 10,
    structureId: structure._id.toString(),
    tutorId: tuteur._id.toString(),
    tutorName: `${tuteur.firstName} ${tuteur.lastName}`,
    duration,
  } as any);
  const responsable = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }));
  return { structure, tuteur, mission, responsable };
}

/** Champs qu'un client malveillant tenterait d'imposer à la candidature. */
function forgedFields() {
  return {
    contractId: new ObjectId().toString(),
    tutorId: new ObjectId().toString(),
    tutorName: "Tuteur forgé",
    structureId: new ObjectId().toString(),
    missionName: "Mission forgée",
    missionDepartment: "Guyane",
    missionRegion: "Guyane",
    youngEmail: "victime@example.org",
    youngFirstName: "Forgé",
    youngLastName: "Forgé",
    youngDepartment: "Guyane",
    youngCohort: "forgée",
  };
}

describe("PH1 — POST /application : une structure ne crée qu'une proposition", () => {
  it.each([ROLES.RESPONSIBLE, ROLES.SUPERVISOR])("impose WAITING_ACCEPTATION et la durée de la mission au rôle %s", async (role) => {
    const { structure, mission } = await createStructureScenario({ duration: "12" });
    const young = await createYoungWithCohort();
    const acteur = await createReferentHelper(getNewReferentFixture({ role, structureId: structure._id.toString() }));

    const res = await request(await getAppHelperWithAcl(acteur))
      .post("/application")
      .send({ youngId: young._id.toString(), missionId: mission._id.toString(), status: APPLICATION_STATUS.DONE, missionDuration: "84" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(APPLICATION_STATUS.WAITING_ACCEPTATION);
    expect(res.body.data.missionDuration).toBe("12");
    const updatedYoung = await getYoungByIdHelper(young._id);
    expect(updatedYoung!.statusPhase2).not.toBe(YOUNG_STATUS_PHASE2.VALIDATED);
  });

  it("dérive du volontaire et de la mission les champs dénormalisés, jamais du body", async () => {
    const { mission, tuteur } = await createStructureScenario();
    const young = await createYoungWithCohort();

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .post("/application")
      .send({ youngId: young._id.toString(), missionId: mission._id.toString(), ...forgedFields() });

    expect(res.status).toBe(200);
    const created = await ApplicationModel.findById(res.body.data._id);
    expect(created!.contractId).toBeFalsy();
    expect(created!.tutorId).toBe(tuteur._id.toString());
    expect(created!.tutorName).toBe(mission.tutorName);
    expect(created!.structureId).toBe(mission.structureId);
    expect(created!.missionName).toBe(mission.name);
    expect(created!.missionDepartment).toBe(mission.department);
    expect(created!.missionRegion).toBe(mission.region);
    expect(created!.youngEmail).toBe(young.email);
    expect(created!.youngFirstName).toBe(young.firstName);
    expect(created!.youngLastName).toBe(young.lastName);
    expect(created!.youngDepartment).toBe(young.department);
    expect(created!.youngCohort).toBe(young.cohort);
  });
});

describe("PH19 / PH1 — PUT /application : seuls statut, durée, masquage et rang sont modifiables", () => {
  it("ignore contrat, tuteur, mission, structure et identité envoyés par le volontaire", async () => {
    const { mission, structure, tuteur } = await createStructureScenario();
    const young = await createYoungWithCohort();
    const application = await ApplicationModel.create({
      youngId: young._id.toString(),
      youngEmail: young.email,
      missionId: mission._id.toString(),
      missionName: mission.name,
      structureId: structure._id.toString(),
      tutorId: tuteur._id.toString(),
      status: APPLICATION_STATUS.WAITING_ACCEPTATION,
    });
    const autreMission = await createMissionHelper({ ...getNewMissionFixture(), structureId: new ObjectId().toString() });

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .put("/application")
      .send({ _id: application._id.toString(), status: APPLICATION_STATUS.WAITING_VALIDATION, missionId: autreMission._id.toString(), ...forgedFields() });

    expect(res.status).toBe(200);
    const updated = await ApplicationModel.findById(application._id);
    expect(updated!.status).toBe(APPLICATION_STATUS.WAITING_VALIDATION);
    expect(updated!.contractId).toBeFalsy();
    expect(updated!.tutorId).toBe(tuteur._id.toString());
    expect(updated!.missionId).toBe(mission._id.toString());
    expect(updated!.structureId).toBe(structure._id.toString());
    expect(updated!.youngEmail).toBe(young.email);
    expect(updated!.missionName).toBe(mission.name);
  });

  it("refuse à un responsable de réaffecter une candidature à un autre volontaire", async () => {
    const { mission, structure, responsable } = await createStructureScenario();
    const young = await createYoungWithCohort();
    const autreVolontaire = await createYoungWithCohort();
    const application = await ApplicationModel.create({
      youngId: young._id.toString(),
      missionId: mission._id.toString(),
      structureId: structure._id.toString(),
      status: APPLICATION_STATUS.WAITING_VALIDATION,
    });

    const res = await request(await getAppHelperWithAcl(responsable))
      .put("/application")
      .send({ _id: application._id.toString(), youngId: autreVolontaire._id.toString() });

    expect(res.status).toBe(400);
    const updated = await ApplicationModel.findById(application._id);
    expect(updated!.youngId).toBe(young._id.toString());
  });

  it("ignore contrat, tuteur, mission et structure envoyés par un responsable", async () => {
    const { mission, structure, tuteur, responsable } = await createStructureScenario();
    const young = await createYoungWithCohort();
    const application = await ApplicationModel.create({
      youngId: young._id.toString(),
      missionId: mission._id.toString(),
      structureId: structure._id.toString(),
      tutorId: tuteur._id.toString(),
      status: APPLICATION_STATUS.WAITING_VALIDATION,
    });

    const res = await request(await getAppHelperWithAcl(responsable))
      .put("/application")
      .send({ _id: application._id.toString(), missionId: new ObjectId().toString(), ...forgedFields() });

    expect(res.status).toBe(200);
    const updated = await ApplicationModel.findById(application._id);
    expect(updated!.missionId).toBe(mission._id.toString());
    expect(updated!.structureId).toBe(structure._id.toString());
    expect(updated!.tutorId).toBe(tuteur._id.toString());
    expect(updated!.contractId).toBeFalsy();
  });
});

describe("PH19 — GET /young/:id/application ne joint que le contrat du volontaire et un tuteur réduit", () => {
  it("ne renvoie pas le contrat d'un autre volontaire pointé par la candidature", async () => {
    const { mission, structure, tuteur } = await createStructureScenario();
    const young = await createYoungWithCohort();
    const victime = await createYoungWithCohort();
    const contratVictime = await ContractModel.create({ youngId: victime._id.toString(), youngFirstName: "Victime", youngEmail: "victime@example.org" });
    // Pointeur déjà corrompu en base (écrit avant ce correctif).
    await ApplicationModel.create({
      youngId: young._id.toString(),
      missionId: mission._id.toString(),
      structureId: structure._id.toString(),
      tutorId: tuteur._id.toString(),
      contractId: contratVictime._id.toString(),
      status: APPLICATION_STATUS.VALIDATED,
    });

    const res = await request(await getAppHelperWithAcl(young, "young")).get(`/young/${young._id}/application`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].contract).toBeFalsy();
  });

  it("renvoie le contrat du volontaire lui-même (non-régression)", async () => {
    const { mission, structure, tuteur } = await createStructureScenario();
    const young = await createYoungWithCohort();
    const application = await ApplicationModel.create({
      youngId: young._id.toString(),
      missionId: mission._id.toString(),
      structureId: structure._id.toString(),
      tutorId: tuteur._id.toString(),
      status: APPLICATION_STATUS.VALIDATED,
    });
    const contrat = await ContractModel.create({ youngId: young._id.toString(), applicationId: application._id.toString() });
    application.set({ contractId: contrat._id.toString() });
    await application.save();

    const res = await request(await getAppHelperWithAcl(young, "young")).get(`/young/${young._id}/application`);

    expect(res.status).toBe(200);
    expect(res.body.data[0].contract._id).toBe(contrat._id.toString());
  });

  it("ne renvoie pas un référent étranger à la structure pointé comme tuteur", async () => {
    const { mission, structure } = await createStructureScenario();
    const young = await createYoungWithCohort();
    const referentCible = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Doubs"] }));
    await ApplicationModel.create({
      youngId: young._id.toString(),
      missionId: mission._id.toString(),
      structureId: structure._id.toString(),
      tutorId: referentCible._id.toString(),
      status: APPLICATION_STATUS.VALIDATED,
    });

    const res = await request(await getAppHelperWithAcl(young, "young")).get(`/young/${young._id}/application`);

    expect(res.status).toBe(200);
    expect(res.body.data[0].tutor).toBeFalsy();
  });

  it("réduit le tuteur de la structure à son identité et ses coordonnées", async () => {
    const { mission, structure, tuteur } = await createStructureScenario();
    const young = await createYoungWithCohort();
    await ApplicationModel.create({
      youngId: young._id.toString(),
      missionId: mission._id.toString(),
      structureId: structure._id.toString(),
      tutorId: tuteur._id.toString(),
      status: APPLICATION_STATUS.VALIDATED,
    });

    const res = await request(await getAppHelperWithAcl(young, "young")).get(`/young/${young._id}/application`);

    expect(res.status).toBe(200);
    const { tutor } = res.body.data[0];
    expect(tutor).toMatchObject({ _id: tuteur._id.toString(), firstName: tuteur.firstName, lastName: tuteur.lastName, email: tuteur.email });
    expect(Object.keys(tutor).sort()).toEqual(["_id", "email", "firstName", "lastName", "mobile", "phone"].sort());
  });
});

describe("PH11 — une proposition n'ouvre rien à la structure", () => {
  async function createProposalScenario() {
    const { mission, structure, responsable } = await createStructureScenario();
    const young = await createYoungWithCohort();
    const proposition = await ApplicationModel.create({
      youngId: young._id.toString(),
      youngFirstName: young.firstName,
      youngEmail: young.email,
      missionId: mission._id.toString(),
      structureId: structure._id.toString(),
      status: APPLICATION_STATUS.WAITING_ACCEPTATION,
    });
    return { mission, structure, responsable, young, proposition };
  }

  it("GET /mission/:id/application ne renvoie pas les propositions au responsable", async () => {
    const { mission, structure, responsable } = await createProposalScenario();
    const candidat = await createYoungWithCohort();
    const candidature = await ApplicationModel.create({
      youngId: candidat._id.toString(),
      missionId: mission._id.toString(),
      structureId: structure._id.toString(),
      status: APPLICATION_STATUS.WAITING_VALIDATION,
    });

    const res = await request(await getAppHelperWithAcl(responsable)).get(`/mission/${mission._id}/application`);

    expect(res.status).toBe(200);
    expect(res.body.data.map((application) => application._id)).toEqual([candidature._id.toString()]);
  });

  it("GET /referent/young/:id refuse le dossier d'un volontaire seulement destinataire d'une proposition", async () => {
    const { responsable, young } = await createProposalScenario();

    const res = await request(await getAppHelperWithAcl(responsable)).get(`/referent/young/${young._id}`);

    expect(res.status).toBe(403);
  });

  it("GET /young/:id/application refuse les candidatures d'un volontaire seulement destinataire d'une proposition", async () => {
    const { responsable, young } = await createProposalScenario();

    const res = await request(await getAppHelperWithAcl(responsable)).get(`/young/${young._id}/application`);

    expect(res.status).toBe(403);
  });

  it("GET /young/:id/application n'inclut pas les propositions d'un volontaire qui a aussi candidaté", async () => {
    const { mission, structure, responsable, young } = await createProposalScenario();
    const autreMission = await createMissionHelper({ ...getNewMissionFixture(), structureId: structure._id.toString(), tutorId: mission.tutorId } as any);
    const candidature = await ApplicationModel.create({
      youngId: young._id.toString(),
      missionId: autreMission._id.toString(),
      structureId: structure._id.toString(),
      status: APPLICATION_STATUS.WAITING_VALIDATION,
    });

    const res = await request(await getAppHelperWithAcl(responsable)).get(`/young/${young._id}/application`);

    expect(res.status).toBe(200);
    expect(res.body.data.map((application) => application._id)).toEqual([candidature._id.toString()]);
  });
});

describe("PM3 — pièces de candidature rangées par candidature", () => {
  async function createApplicationWithFiles() {
    const { mission, structure, responsable } = await createStructureScenario();
    const young = await createYoungWithCohort();
    const application = await ApplicationModel.create({
      youngId: young._id.toString(),
      missionId: mission._id.toString(),
      structureId: structure._id.toString(),
      status: APPLICATION_STATUS.VALIDATED,
      justificatifsFiles: ["cv.pdf"],
    });
    return { young, application, responsable };
  }

  it("refuse une clé hors des quatre listes de pièces", async () => {
    const { application, responsable } = await createApplicationWithFiles();

    const res = await request(await getAppHelperWithAcl(responsable)).get(`/application/${application._id}/file/cniFiles/cv.pdf`);

    expect(res.status).toBe(400);
    expect(getFile).not.toHaveBeenCalled();
  });

  it("refuse un nom absent de la liste de la candidature", async () => {
    const { application, responsable } = await createApplicationWithFiles();

    const res = await request(await getAppHelperWithAcl(responsable)).get(`/application/${application._id}/file/justificatifsFiles/autre-candidature.pdf`);

    expect(res.status).toBe(403);
    expect(getFile).not.toHaveBeenCalled();
  });

  it("lit d'abord le rangement par candidature, puis l'ancien rangement par volontaire", async () => {
    const { young, application, responsable } = await createApplicationWithFiles();
    (getFile as jest.Mock).mockRejectedValueOnce(Object.assign(new Error("NoSuchKey"), { code: "NoSuchKey" })).mockResolvedValueOnce({ Body: PNG_1x1 });

    const res = await request(await getAppHelperWithAcl(responsable)).get(`/application/${application._id}/file/justificatifsFiles/cv.pdf`);

    expect(res.status).toBe(200);
    expect((getFile as jest.Mock).mock.calls.map(([path]) => path)).toEqual([
      `app/young/${young._id}/application/${application._id}/justificatifsFiles/cv.pdf`,
      `app/young/${young._id}/application/justificatifsFiles/cv.pdf`,
    ]);
  });

  it("dépose sous la candidature et ne retient que les noms existants ou déposés", async () => {
    const { young, application } = await createApplicationWithFiles();

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .post(`/application/${application._id}/file/justificatifsFiles`)
      .field("body", JSON.stringify({ names: ["cv.pdf", "piece.png", "piece-d-une-autre-candidature.pdf"] }))
      .attach("piece.png", PNG_1x1, { filename: "piece.png", contentType: "image/png" });

    expect(res.status).toBe(200);
    expect(uploadFile).toHaveBeenCalledTimes(1);
    expect((uploadFile as jest.Mock).mock.calls[0][0]).toBe(`app/young/${young._id}/application/${application._id}/justificatifsFiles/piece.png`);
    const updated = await ApplicationModel.findById(application._id);
    expect([...updated!.justificatifsFiles]).toEqual(["cv.pdf", "piece.png"]);
  });
});
