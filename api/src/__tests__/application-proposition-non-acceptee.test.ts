/**
 * Une proposition de mission que le volontaire n'a pas acceptée n'ouvre rien à la structure.
 *
 * I1 : aucune suite d'appels ouverte à un responsable / superviseur ne mène une telle candidature à
 *      VALIDATED, IN_PROGRESS ou DONE (et donc ne valide la phase 2 du volontaire) ;
 * I2 : un volontaire dont le seul lien avec la structure est une proposition non acceptée, quel que
 *      soit son statut courant (REFUSED et CANCEL compris), est hors de son périmètre ;
 * I3 : un responsable / superviseur ne crée pas de candidature (donc ne rattache pas un volontaire
 *      arbitraire) ;
 * I4 : les parcours légitimes sont inchangés.
 */
import request from "supertest";
import { Types } from "mongoose";

import { APPLICATION_STATUS, PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLE_JEUNE, ROLES, SENDINBLUE_TEMPLATES, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2 } from "snu-lib";

import { ApplicationModel } from "../models";
import { PermissionModel } from "../models/permissions/permission";
import { buildYoungContext } from "../controllers/elasticsearch/young";
import { buildApplicationContext } from "../controllers/elasticsearch/utils";
import { isEmailInUserScope } from "../email/emailNotificationScope";

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
import getNewStructureFixture from "./fixtures/structure";
import getNewYoungFixture from "./fixtures/young";
import { insertLegacyApplication } from "./helpers/legacyApplication";

// Rattrapage du marqueur sur les candidatures antérieures (module CommonJS { up, down }).
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rattrapage = require("../../migrations/20261005120000-rattrapage-propositions-non-acceptees");

const { ObjectId } = Types;

jest.setTimeout(120_000);

const sendTemplate = jest.fn(() => Promise.resolve());
jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: (...args: unknown[]) => sendTemplate(...(args as [])),
  sendEmail: () => Promise.resolve(),
  sync: () => Promise.resolve(),
  unsync: () => Promise.resolve(),
}));

const TERRITOIRE = { department: "Ain", region: "Auvergne-Rhône-Alpes" };
const structureManager = { firstName: "Rita", lastName: "Représentante", email: "rita@example.org", mobile: "0600000000", role: "Présidente" };
const ROLES_STRUCTURE = [ROLES.RESPONSIBLE, ROLES.SUPERVISOR];
const STATUTS: string[] = Object.values(APPLICATION_STATUS);
const SANS_ACCEPTATION = [APPLICATION_STATUS.WAITING_ACCEPTATION, APPLICATION_STATUS.REFUSED, APPLICATION_STATUS.CANCEL];

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await PermissionModel.deleteMany({});
  // Même seed qu'en production (migration 20250716091433) : CANDIDATURE_* sans policy pour les rôles de structure.
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.APPLICATION, PERMISSION_ACTIONS.FULL);
  for (const action of [PERMISSION_ACTIONS.READ, PERMISSION_ACTIONS.WRITE, PERMISSION_ACTIONS.CREATE]) {
    await addPermissionHelper([ROLES.SUPERVISOR, ROLES.RESPONSIBLE], PERMISSION_RESOURCES.APPLICATION, action);
    await addPermissionHelper([ROLES.REFERENT_DEPARTMENT], PERMISSION_RESOURCES.APPLICATION, action, [
      { where: [{ resource: "young", field: "department", source: "department" }], blacklist: [], whitelist: [] },
    ]);
  }
  await addPermissionHelper([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.SUPERVISOR, ROLES.RESPONSIBLE], PERMISSION_RESOURCES.MISSION, PERMISSION_ACTIONS.READ);
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

/** Les référents ont un index unique sur l'email : les adresses tirées au hasard peuvent se recouper d'un scénario à l'autre. */
const uniqueEmail = () => `acteur-${new ObjectId().toString()}@example.org`;

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

/**
 * Tête de réseau (superviseur), structure du réseau (responsable), tuteur, mission publiée de la
 * structure, administrateur et référent départemental du territoire du volontaire.
 */
async function createScenario({ duration = "12" } = {}) {
  const tete = await createStructureHelper({ ...getNewStructureFixture(), name: `Réseau ${new ObjectId().toString()}`, structureManager });
  const structure = await createStructureHelper({
    ...getNewStructureFixture(),
    name: `Structure ${new ObjectId().toString()}`,
    isNetwork: "false",
    networkId: tete._id.toString(),
    structureManager,
  });
  const tuteur = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), email: uniqueEmail() }));
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
  const responsable = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), email: uniqueEmail() }));
  const superviseur = await createReferentHelper(getNewReferentFixture({ role: ROLES.SUPERVISOR, structureId: tete._id.toString(), email: uniqueEmail() }));
  const admin = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN, email: uniqueEmail() }));
  const referentDepartemental = await createReferentHelper(
    getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: [TERRITOIRE.department], region: TERRITOIRE.region, email: uniqueEmail() }),
  );
  const acteurs = { [ROLES.RESPONSIBLE]: responsable, [ROLES.SUPERVISOR]: superviseur } as Record<string, any>;
  return { tete, structure, tuteur, mission, responsable, superviseur, admin, referentDepartemental, acteurs };
}
type Scenario = Awaited<ReturnType<typeof createScenario>>;

/** Une proposition à `young`, portée par la mission du scénario, amenée au statut demandé sans passer par l'acceptation. */
async function createProposal(s: Scenario, young: any, status: string = APPLICATION_STATUS.WAITING_ACCEPTATION) {
  const application = await ApplicationModel.create({
    youngId: young._id.toString(),
    youngFirstName: young.firstName,
    youngLastName: young.lastName,
    youngEmail: young.email,
    youngDepartment: young.department,
    missionId: s.mission._id.toString(),
    structureId: s.structure._id.toString(),
    tutorId: s.tuteur._id.toString(),
    missionDuration: "84",
    status: APPLICATION_STATUS.WAITING_ACCEPTATION,
  });
  if (status !== APPLICATION_STATUS.WAITING_ACCEPTATION) {
    application.set({ status });
    await application.save({ fromUser: { firstName: "[TEST] sortie de proposition" } });
  }
  return application;
}

/** Une candidature du volontaire lui-même (statut d'origine WAITING_VALIDATION). */
async function createCandidature(s: Scenario, young: any, status: string = APPLICATION_STATUS.WAITING_VALIDATION, missionId = s.mission._id.toString()) {
  return ApplicationModel.create({
    youngId: young._id.toString(),
    youngFirstName: young.firstName,
    youngLastName: young.lastName,
    youngEmail: young.email,
    youngDepartment: young.department,
    missionId,
    structureId: s.structure._id.toString(),
    tutorId: s.tuteur._id.toString(),
    missionDuration: "84",
    status,
  });
}

const reload = (application: any) => ApplicationModel.findById(application._id);

describe("marqueur de proposition non acceptée", () => {
  it("est posé à la création d'une proposition", async () => {
    const s = await createScenario();
    const young = await createYoungWithCohort();

    const application = await createProposal(s, young);

    expect((await reload(application))!.proposalNotAccepted).toBe(true);
  });

  it.each([APPLICATION_STATUS.REFUSED, APPLICATION_STATUS.CANCEL])("reste posé quand la proposition sort en %s", async (status) => {
    const s = await createScenario();
    const young = await createYoungWithCohort();

    const application = await createProposal(s, young, status);

    expect((await reload(application))!.proposalNotAccepted).toBe(true);
  });

  it("est posé aussi quand une proposition antérieure au marqueur est annulée (candidature sans marqueur en base)", async () => {
    const s = await createScenario();
    const young = await createYoungWithCohort();
    const { insertedId } = await ApplicationModel.collection.insertOne({
      youngId: young._id.toString(),
      missionId: s.mission._id.toString(),
      structureId: s.structure._id.toString(),
      status: APPLICATION_STATUS.WAITING_ACCEPTATION,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const ancienne = await ApplicationModel.findById(insertedId);
    expect(ancienne!.proposalNotAccepted).toBeUndefined();
    ancienne!.set({ status: APPLICATION_STATUS.CANCEL });
    await ancienne!.save({ fromUser: { firstName: "[CRON] annulation" } });

    expect((await reload(ancienne))!.proposalNotAccepted).toBe(true);
  });

  it("n'est pas posé sur une candidature du volontaire, même refusée ou annulée", async () => {
    const s = await createScenario();
    const young = await createYoungWithCohort();

    const candidature = await createCandidature(s, young);
    for (const status of [APPLICATION_STATUS.REFUSED, APPLICATION_STATUS.CANCEL]) {
      candidature.set({ status });
      await candidature.save({ fromUser: { firstName: "[TEST]" } });
      expect(!!(await reload(candidature))!.proposalNotAccepted).toBe(false);
    }
  });

  it("est levé quand le volontaire accepte la proposition", async () => {
    const s = await createScenario();
    const young = await createYoungWithCohort();
    const application = await createProposal(s, young);

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .put("/application")
      .send({ _id: application._id.toString(), status: APPLICATION_STATUS.WAITING_VALIDATION });

    expect(res.status).toBe(200);
    const accepted = await reload(application);
    expect(accepted!.status).toBe(APPLICATION_STATUS.WAITING_VALIDATION);
    expect(accepted!.proposalNotAccepted).toBe(false);
  });

  it("est levé quand un administrateur engage la candidature (statut VALIDATED, IN_PROGRESS ou DONE)", async () => {
    const s = await createScenario();
    const young = await createYoungWithCohort();
    const application = await createProposal(s, young, APPLICATION_STATUS.REFUSED);

    application.set({ status: APPLICATION_STATUS.VALIDATED });
    await application.save({ fromUser: { firstName: "[TEST] admin" } });

    expect((await reload(application))!.proposalNotAccepted).toBe(false);
  });
});

describe("I1 — une proposition non acceptée ne mène jamais à VALIDATED, IN_PROGRESS ou DONE", () => {
  it.each(ROLES_STRUCTURE)("PUT /application (%s) : aucun changement de statut depuis une proposition, quel que soit son statut courant", async (role) => {
    const s = await createScenario();
    const young = await createYoungWithCohort();
    const acteur = s.acteurs[role];

    for (const depart of SANS_ACCEPTATION) {
      const application = await createProposal(s, young, depart);
      // Une même candidature ne se répète pas pour un volontaire et une mission : une mission par départ.
      for (const cible of STATUTS.filter((statut) => statut !== depart)) {
        const res = await request(await getAppHelperWithAcl(acteur, "referent"))
          .put("/application")
          .send({ _id: application._id.toString(), status: cible, missionDuration: "84" });

        expect([depart, cible, res.status]).toEqual([depart, cible, 403]);
        expect((await reload(application))!.status).toBe(depart);
      }
      await application.deleteOne();
    }
    const updatedYoung = await getYoungByIdHelper(young._id.toString());
    expect(updatedYoung!.statusPhase2).not.toBe(YOUNG_STATUS_PHASE2.VALIDATED);
    expect(updatedYoung!.phase2NumberHoursDone).not.toBe("84");
  });

  it.each(ROLES_STRUCTURE)("PUT /application (%s) : la suite REFUSED, VALIDATED, IN_PROGRESS, DONE (84 h) laisse la proposition et la phase 2 intactes", async (role) => {
    const s = await createScenario({ duration: "84" });
    const young = await createYoungWithCohort();
    const application = await createProposal(s, young);
    const app = await getAppHelperWithAcl(s.acteurs[role], "referent");

    for (const statut of [APPLICATION_STATUS.REFUSED, APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.IN_PROGRESS, APPLICATION_STATUS.DONE]) {
      await request(app).put("/application").send({ _id: application._id.toString(), status: statut, missionDuration: "84" });
    }

    expect((await reload(application))!.status).toBe(APPLICATION_STATUS.WAITING_ACCEPTATION);
    const updatedYoung = await getYoungByIdHelper(young._id.toString());
    expect(updatedYoung!.statusPhase2).toBe(YOUNG_STATUS_PHASE2.IN_PROGRESS);
    expect(updatedYoung!.phase2NumberHoursDone).not.toBe("84");
  });

  it.each(ROLES_STRUCTURE)("PUT /application (%s) : ni durée, ni commentaire, ni rang modifiables sur une proposition", async (role) => {
    const s = await createScenario();
    const young = await createYoungWithCohort();
    const application = await createProposal(s, young, APPLICATION_STATUS.REFUSED);

    const res = await request(await getAppHelperWithAcl(s.acteurs[role], "referent"))
      .put("/application")
      .send({ _id: application._id.toString(), missionDuration: "1", statusComment: "x" });

    expect(res.status).toBe(403);
    expect((await reload(application))!.missionDuration).toBe("84");
  });

  it.each(ROLES_STRUCTURE)("POST /application/multiaction/change-status (%s) : même refus, pour chaque statut visé", async (role) => {
    const s = await createScenario();
    const young = await createYoungWithCohort();

    for (const depart of SANS_ACCEPTATION) {
      const application = await createProposal(s, young, depart);
      for (const cible of STATUTS.filter((statut) => statut !== depart)) {
        const res = await request(await getAppHelperWithAcl(s.acteurs[role], "referent"))
          .post(`/application/multiaction/change-status/${cible}`)
          .send({ ids: [application._id.toString()] });

        expect([depart, cible, res.status]).toEqual([depart, cible, 403]);
        expect((await reload(application))!.status).toBe(depart);
      }
      await application.deleteOne();
    }
    const updatedYoung = await getYoungByIdHelper(young._id.toString());
    expect(updatedYoung!.statusPhase2).not.toBe(YOUNG_STATUS_PHASE2.VALIDATED);
  });

  it("un lot mêlant une candidature légitime et une proposition est refusé en entier", async () => {
    const s = await createScenario();
    const young = await createYoungWithCohort();
    const autreMission = await createMissionHelper({
      ...getNewMissionFixture(),
      status: "VALIDATED",
      visibility: "VISIBLE",
      placesTotal: 10,
      placesLeft: 10,
      structureId: s.structure._id.toString(),
      tutorId: s.tuteur._id.toString(),
    } as any);
    const candidature = await createCandidature(s, young, APPLICATION_STATUS.WAITING_VALIDATION, autreMission._id.toString());
    const proposition = await createProposal(s, young, APPLICATION_STATUS.REFUSED);

    const res = await request(await getAppHelperWithAcl(s.responsable, "referent"))
      .post(`/application/multiaction/change-status/${APPLICATION_STATUS.VALIDATED}`)
      .send({ ids: [candidature._id.toString(), proposition._id.toString()] });

    expect(res.status).toBe(403);
    expect((await reload(candidature))!.status).toBe(APPLICATION_STATUS.WAITING_VALIDATION);
    expect((await reload(proposition))!.status).toBe(APPLICATION_STATUS.REFUSED);
  });

  it("une proposition acceptée par le volontaire redevient une candidature ordinaire", async () => {
    const s = await createScenario();
    const young = await createYoungWithCohort();
    const application = await createProposal(s, young);
    await request(await getAppHelperWithAcl(young, "young"))
      .put("/application")
      .send({ _id: application._id.toString(), status: APPLICATION_STATUS.WAITING_VALIDATION });

    const res = await request(await getAppHelperWithAcl(s.responsable, "referent"))
      .put("/application")
      .send({ _id: application._id.toString(), status: APPLICATION_STATUS.VALIDATED });

    expect(res.status).toBe(200);
    expect((await reload(application))!.status).toBe(APPLICATION_STATUS.VALIDATED);
  });
});

describe("I2 — un volontaire seulement destinataire d'une proposition est hors du périmètre de la structure", () => {
  describe.each(SANS_ACCEPTATION)("proposition au statut %s", (statut) => {
    it.each(ROLES_STRUCTURE)("GET /referent/young/:id (%s) refuse le dossier", async (role) => {
      const s = await createScenario();
      const young = await createYoungWithCohort();
      await createProposal(s, young, statut);

      const res = await request(await getAppHelperWithAcl(s.acteurs[role], "referent")).get(`/referent/young/${young._id}`);

      expect(res.status).toBe(403);
    });

    it.each(ROLES_STRUCTURE)("GET /young/:id/application (%s) refuse les candidatures du volontaire", async (role) => {
      const s = await createScenario();
      const young = await createYoungWithCohort();
      await createProposal(s, young, statut);

      const res = await request(await getAppHelperWithAcl(s.acteurs[role], "referent")).get(`/young/${young._id}/application`);

      expect(res.status).toBe(403);
    });

    it.each(ROLES_STRUCTURE)("GET /mission/:id/application (%s) ne renvoie pas la proposition", async (role) => {
      const s = await createScenario();
      const young = await createYoungWithCohort();
      const autreVolontaire = await createYoungWithCohort();
      await createProposal(s, young, statut);
      const candidature = await createCandidature(s, autreVolontaire);

      const res = await request(await getAppHelperWithAcl(s.acteurs[role], "referent")).get(`/mission/${s.mission._id}/application`);

      expect(res.status).toBe(200);
      expect(res.body.data.map((application) => application._id)).toEqual([candidature._id.toString()]);
    });

    it.each(ROLES_STRUCTURE)("l'index ES des volontaires (%s) n'inclut pas le volontaire", async (role) => {
      const s = await createScenario();
      const young = await createYoungWithCohort();
      const autreVolontaire = await createYoungWithCohort();
      await createProposal(s, young, statut);
      await createCandidature(s, autreVolontaire);

      const { youngContextFilters } = await buildYoungContext(s.acteurs[role]);

      const filtreIds = youngContextFilters.find((filtre) => filtre.terms?._id);
      expect(filtreIds.terms._id).toEqual([autreVolontaire._id.toString()]);
    });

    it.each(ROLES_STRUCTURE)("l'index ES des candidatures (%s) écarte les propositions non acceptées", async (role) => {
      const s = await createScenario();

      const { applicationContextFilters } = await buildApplicationContext(s.acteurs[role]);

      expect(applicationContextFilters).toContainEqual({ bool: { must_not: [{ term: { proposalNotAccepted: true } }] } });
    });

    it.each(ROLES_STRUCTURE)("le périmètre des notifications mail (%s) n'inclut pas l'adresse du volontaire", async (role) => {
      const s = await createScenario();
      const young = await createYoungWithCohort();
      await createProposal(s, young, statut);

      expect(await isEmailInUserScope(s.acteurs[role], young.email)).toBe(false);
    });

    it.each(ROLES_STRUCTURE)("GET /application/:id (%s) refuse la candidature", async (role) => {
      const s = await createScenario();
      const young = await createYoungWithCohort();
      const application = await createProposal(s, young, statut);

      const res = await request(await getAppHelperWithAcl(s.acteurs[role], "referent")).get(`/application/${application._id}`);

      expect(res.status).toBe(403);
    });

    it.each(ROLES_STRUCTURE)("POST /application/:id/notify/:template (%s) n'envoie aucun email", async (role) => {
      const s = await createScenario();
      const young = await createYoungWithCohort();
      const application = await createProposal(s, young, statut);

      const res = await request(await getAppHelperWithAcl(s.acteurs[role], "referent"))
        .post(`/application/${application._id}/notify/${SENDINBLUE_TEMPLATES.young.REFUSE_APPLICATION}`)
        .send({ message: "Motif" });

      expect(res.status).toBe(403);
      expect(sendTemplate).not.toHaveBeenCalled();
    });
  });

  it.each(ROLES_STRUCTURE)("un volontaire qui a aussi candidaté reste dans le périmètre, sans sa proposition (%s)", async (role) => {
    const s = await createScenario();
    const young = await createYoungWithCohort();
    const autreMission = await createMissionHelper({
      ...getNewMissionFixture(),
      status: "VALIDATED",
      visibility: "VISIBLE",
      placesTotal: 10,
      placesLeft: 10,
      structureId: s.structure._id.toString(),
      tutorId: s.tuteur._id.toString(),
    } as any);
    await createProposal(s, young, APPLICATION_STATUS.CANCEL);
    const candidature = await createCandidature(s, young, APPLICATION_STATUS.WAITING_VALIDATION, autreMission._id.toString());
    const app = await getAppHelperWithAcl(s.acteurs[role], "referent");

    const dossier = await request(app).get(`/referent/young/${young._id}`);
    const candidatures = await request(app).get(`/young/${young._id}/application`);

    expect(dossier.status).toBe(200);
    expect(candidatures.status).toBe(200);
    expect(candidatures.body.data.map((application) => application._id)).toEqual([candidature._id.toString()]);
    expect(await isEmailInUserScope(s.acteurs[role], young.email)).toBe(true);
    const { youngContextFilters } = await buildYoungContext(s.acteurs[role]);
    expect(youngContextFilters.find((filtre) => filtre.terms?._id).terms._id).toEqual([young._id.toString()]);
  });

  it.each(ROLES_STRUCTURE)("une candidature refusée ou annulée du volontaire lui-même reste dans le périmètre (%s)", async (role) => {
    const s = await createScenario();
    const young = await createYoungWithCohort();
    const candidature = await createCandidature(s, young, APPLICATION_STATUS.REFUSED);
    const app = await getAppHelperWithAcl(s.acteurs[role], "referent");

    expect((await request(app).get(`/referent/young/${young._id}`)).status).toBe(200);
    expect((await request(app).get(`/application/${candidature._id}`)).status).toBe(200);
    expect(await isEmailInUserScope(s.acteurs[role], young.email)).toBe(true);
    const { youngContextFilters } = await buildYoungContext(s.acteurs[role]);
    expect(youngContextFilters.find((filtre) => filtre.terms?._id).terms._id).toEqual([young._id.toString()]);
  });

  it("l'administrateur et le référent départemental voient toujours les propositions", async () => {
    const s = await createScenario();
    const young = await createYoungWithCohort();
    const proposition = await createProposal(s, young);

    for (const acteur of [s.admin, s.referentDepartemental]) {
      const app = await getAppHelperWithAcl(acteur, "referent");
      expect((await request(app).get(`/referent/young/${young._id}`)).status).toBe(200);
      expect((await request(app).get(`/application/${proposition._id}`)).status).toBe(200);
      const liste = await request(app).get(`/mission/${s.mission._id}/application`);
      expect(liste.body.data.map((application) => application._id)).toEqual([proposition._id.toString()]);
    }
  });
});

describe("I3 — une structure ne rattache pas un volontaire par POST /application", () => {
  it.each(ROLES_STRUCTURE)("%s : refus, aucune candidature créée, phase 2 inchangée", async (role) => {
    const s = await createScenario({ duration: "84" });
    const young = await createYoungWithCohort();

    const res = await request(await getAppHelperWithAcl(s.acteurs[role], "referent"))
      .post("/application")
      .send({ youngId: young._id.toString(), missionId: s.mission._id.toString(), status: APPLICATION_STATUS.DONE, missionDuration: "84" });

    expect(res.status).toBe(403);
    expect(await ApplicationModel.countDocuments({ youngId: young._id.toString() })).toBe(0);
    const updatedYoung = await getYoungByIdHelper(young._id.toString());
    expect(updatedYoung!.statusPhase2).toBe(YOUNG_STATUS_PHASE2.IN_PROGRESS);
  });
});

describe("I4 — parcours légitimes inchangés", () => {
  it.each(ROLES_STRUCTURE)("le volontaire candidate, la structure (%s) valide, la mission passe IN_PROGRESS puis DONE avec saisie des heures", async (role) => {
    const s = await createScenario({ duration: "12" });
    const young = await createYoungWithCohort();

    const candidature = await request(await getAppHelperWithAcl(young, "young"))
      .post("/application")
      .send({ youngId: young._id.toString(), missionId: s.mission._id.toString() });
    expect(candidature.status).toBe(200);
    expect(candidature.body.data.status).toBe(APPLICATION_STATUS.WAITING_VALIDATION);
    const id = candidature.body.data._id;
    const app = await getAppHelperWithAcl(s.acteurs[role], "referent");

    // Le volontaire figure dans le périmètre de la structure.
    expect((await request(app).get(`/referent/young/${young._id}`)).status).toBe(200);
    expect((await request(app).get(`/mission/${s.mission._id}/application`)).body.data.map((a) => a._id)).toEqual([id]);

    expect((await request(app).put("/application").send({ _id: id, status: APPLICATION_STATUS.VALIDATED })).status).toBe(200);
    expect((await request(app).put("/application").send({ _id: id, status: APPLICATION_STATUS.IN_PROGRESS })).status).toBe(200);
    const done = await request(app).put("/application").send({ _id: id, status: APPLICATION_STATUS.DONE, missionDuration: "84" });

    expect(done.status).toBe(200);
    expect(done.body.data.status).toBe(APPLICATION_STATUS.DONE);
    expect(done.body.data.missionDuration).toBe("84");
    const updatedYoung = await getYoungByIdHelper(young._id.toString());
    expect(updatedYoung!.phase2NumberHoursDone).toBe("84");
    expect(updatedYoung!.statusPhase2).toBe(YOUNG_STATUS_PHASE2.VALIDATED);
  });

  it.each(ROLES_STRUCTURE)("la structure (%s) refuse la candidature d'un volontaire puis la revalide, par PUT et par lot", async (role) => {
    const s = await createScenario();
    const young = await createYoungWithCohort();
    const candidature = await createCandidature(s, young);
    const app = await getAppHelperWithAcl(s.acteurs[role], "referent");

    expect((await request(app).put("/application").send({ _id: candidature._id.toString(), status: APPLICATION_STATUS.REFUSED })).status).toBe(200);
    expect((await reload(candidature))!.status).toBe(APPLICATION_STATUS.REFUSED);
    expect((await request(app).put("/application").send({ _id: candidature._id.toString(), status: APPLICATION_STATUS.VALIDATED })).status).toBe(200);
    expect(
      (
        await request(app)
          .post(`/application/multiaction/change-status/${APPLICATION_STATUS.REFUSED}`)
          .send({ ids: [candidature._id.toString()] })
      ).status,
    ).toBe(200);
    expect(
      (
        await request(app)
          .post(`/application/multiaction/change-status/${APPLICATION_STATUS.VALIDATED}`)
          .send({ ids: [candidature._id.toString()] })
      ).status,
    ).toBe(200);
    expect((await reload(candidature))!.status).toBe(APPLICATION_STATUS.VALIDATED);
    expect(!!(await reload(candidature))!.proposalNotAccepted).toBe(false);
  });

  it.each(ROLES_STRUCTURE)("la structure (%s) notifie le volontaire et consulte la candidature qu'il a faite", async (role) => {
    const s = await createScenario();
    const young = await createYoungWithCohort();
    const candidature = await createCandidature(s, young, APPLICATION_STATUS.REFUSED);
    const app = await getAppHelperWithAcl(s.acteurs[role], "referent");

    expect((await request(app).get(`/application/${candidature._id}`)).status).toBe(200);
    const res = await request(app).post(`/application/${candidature._id}/notify/${SENDINBLUE_TEMPLATES.young.REFUSE_APPLICATION}`).send({ message: "Motif" });

    expect(res.status).toBe(200);
    expect(sendTemplate).toHaveBeenCalledTimes(1);
  });

  it("un volontaire qui accepte une proposition entre dans le périmètre de la structure, qui peut alors la valider", async () => {
    const s = await createScenario();
    const young = await createYoungWithCohort();
    const proposition = await createProposal(s, young);
    const structureApp = async () => getAppHelperWithAcl(s.responsable, "referent");
    expect((await request(await structureApp()).get(`/referent/young/${young._id}`)).status).toBe(403);

    const acceptation = await request(await getAppHelperWithAcl(young, "young"))
      .put("/application")
      .send({ _id: proposition._id.toString(), status: APPLICATION_STATUS.WAITING_VALIDATION });
    expect(acceptation.status).toBe(200);

    expect((await request(await structureApp()).get(`/referent/young/${young._id}`)).status).toBe(200);
    const liste = await request(await structureApp()).get(`/mission/${s.mission._id}/application`);
    expect(liste.body.data.map((application) => application._id)).toEqual([proposition._id.toString()]);
    expect(
      (
        await request(await structureApp())
          .put("/application")
          .send({ _id: proposition._id.toString(), status: APPLICATION_STATUS.VALIDATED })
      ).status,
    ).toBe(200);
  });

  it("l'administrateur propose une mission, la fait réaliser (mission personnalisée DONE) et déplace les propositions", async () => {
    const s = await createScenario({ duration: "84" });
    const young = await createYoungWithCohort();
    const autreMission = await createMissionHelper({
      ...getNewMissionFixture(),
      status: "VALIDATED",
      visibility: "VISIBLE",
      placesTotal: 10,
      placesLeft: 10,
      structureId: s.structure._id.toString(),
      tutorId: s.tuteur._id.toString(),
      duration: "84",
    } as any);
    const app = await getAppHelperWithAcl(s.admin, "referent");

    const proposition = await request(app)
      .post("/application")
      .send({ youngId: young._id.toString(), missionId: s.mission._id.toString(), status: APPLICATION_STATUS.WAITING_ACCEPTATION });
    expect(proposition.status).toBe(200);
    expect(proposition.body.data.status).toBe(APPLICATION_STATUS.WAITING_ACCEPTATION);
    expect((await ApplicationModel.findById(proposition.body.data._id))!.proposalNotAccepted).toBe(true);

    const personnalisee = await request(app)
      .post("/application")
      .send({ youngId: young._id.toString(), missionId: autreMission._id.toString(), status: APPLICATION_STATUS.DONE, missionDuration: "84" });
    expect(personnalisee.status).toBe(200);
    expect(personnalisee.body.data.status).toBe(APPLICATION_STATUS.DONE);
    expect(!!(await ApplicationModel.findById(personnalisee.body.data._id))!.proposalNotAccepted).toBe(false);
    expect((await getYoungByIdHelper(young._id.toString()))!.statusPhase2).toBe(YOUNG_STATUS_PHASE2.VALIDATED);

    for (const statut of [APPLICATION_STATUS.REFUSED, APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.CANCEL]) {
      const res = await request(app).put("/application").send({ _id: proposition.body.data._id, status: statut });
      expect([statut, res.status]).toEqual([statut, 200]);
    }
  });

  it("le référent départemental du volontaire propose une mission et déplace la proposition", async () => {
    const s = await createScenario();
    const young = await createYoungWithCohort();
    const app = await getAppHelperWithAcl(s.referentDepartemental, "referent");

    const proposition = await request(app)
      .post("/application")
      .send({ youngId: young._id.toString(), missionId: s.mission._id.toString(), status: APPLICATION_STATUS.WAITING_ACCEPTATION });
    expect(proposition.status).toBe(200);
    expect(proposition.body.data.status).toBe(APPLICATION_STATUS.WAITING_ACCEPTATION);
    expect((await ApplicationModel.findById(proposition.body.data._id))!.proposalNotAccepted).toBe(true);

    const res = await request(app).put("/application").send({ _id: proposition.body.data._id, status: APPLICATION_STATUS.REFUSED });
    expect(res.status).toBe(200);
    const res2 = await request(app).put("/application").send({ _id: proposition.body.data._id, status: APPLICATION_STATUS.VALIDATED });
    expect(res2.status).toBe(200);
  });
});

describe("candidatures antérieures au marqueur, après le rattrapage", () => {
  /** Une proposition née avant le marqueur : insérée sans hook, avec son historique de statuts, déjà sortie de WAITING_ACCEPTATION. */
  async function createLegacyProposal(s: Scenario, young: any, status: string, history: string[] = [APPLICATION_STATUS.WAITING_ACCEPTATION, status]) {
    const { _id } = await insertLegacyApplication(
      {
        youngId: young._id.toString(),
        youngFirstName: young.firstName,
        youngLastName: young.lastName,
        youngEmail: young.email,
        youngDepartment: young.department,
        missionId: s.mission._id.toString(),
        structureId: s.structure._id.toString(),
        tutorId: s.tuteur._id.toString(),
        missionDuration: "84",
      },
      history,
    );
    return (await ApplicationModel.findById(_id))!;
  }
  const SORTIES = [APPLICATION_STATUS.REFUSED, APPLICATION_STATUS.CANCEL];

  describe.each(SORTIES)("proposition sortie en %s avant le marqueur", (depart) => {
    it.each(ROLES_STRUCTURE)("I1 : PUT /application et lot (%s) refusent tout changement de statut, la phase 2 reste intacte", async (role) => {
      const s = await createScenario();
      const young = await createYoungWithCohort();
      const application = await createLegacyProposal(s, young, depart);
      await rattrapage.up();

      for (const cible of STATUTS.filter((statut) => statut !== depart)) {
        const put = await request(await getAppHelperWithAcl(s.acteurs[role], "referent"))
          .put("/application")
          .send({ _id: application._id.toString(), status: cible, missionDuration: "84" });
        const lot = await request(await getAppHelperWithAcl(s.acteurs[role], "referent"))
          .post(`/application/multiaction/change-status/${cible}`)
          .send({ ids: [application._id.toString()] });

        expect([depart, cible, put.status, lot.status]).toEqual([depart, cible, 403, 403]);
      }
      expect((await reload(application))!.status).toBe(depart);
      const updatedYoung = await getYoungByIdHelper(young._id.toString());
      expect(updatedYoung!.statusPhase2).not.toBe(YOUNG_STATUS_PHASE2.VALIDATED);
      expect(updatedYoung!.phase2NumberHoursDone).not.toBe("84");
    });

    it.each(ROLES_STRUCTURE)("I1 : la suite VALIDATED, IN_PROGRESS, DONE (84 h) n'aboutit pas (%s)", async (role) => {
      const s = await createScenario({ duration: "84" });
      const young = await createYoungWithCohort();
      const application = await createLegacyProposal(s, young, depart);
      await rattrapage.up();
      const app = await getAppHelperWithAcl(s.acteurs[role], "referent");

      for (const statut of [APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.IN_PROGRESS, APPLICATION_STATUS.DONE]) {
        await request(app).put("/application").send({ _id: application._id.toString(), status: statut, missionDuration: "84" });
      }

      expect((await reload(application))!.status).toBe(depart);
      const updatedYoung = await getYoungByIdHelper(young._id.toString());
      expect(updatedYoung!.statusPhase2).toBe(YOUNG_STATUS_PHASE2.IN_PROGRESS);
      expect(updatedYoung!.phase2NumberHoursDone).not.toBe("84");
    });

    it.each(ROLES_STRUCTURE)("I2 : le volontaire est hors du périmètre de la structure (%s)", async (role) => {
      const s = await createScenario();
      const young = await createYoungWithCohort();
      const autreVolontaire = await createYoungWithCohort();
      const application = await createLegacyProposal(s, young, depart);
      const candidature = await createCandidature(s, autreVolontaire);
      await rattrapage.up();
      const app = await getAppHelperWithAcl(s.acteurs[role], "referent");

      expect((await request(app).get(`/referent/young/${young._id}`)).status).toBe(403);
      expect((await request(app).get(`/young/${young._id}/application`)).status).toBe(403);
      expect((await request(app).get(`/application/${application._id}`)).status).toBe(403);
      const liste = await request(app).get(`/mission/${s.mission._id}/application`);
      expect(liste.body.data.map((a) => a._id)).toEqual([candidature._id.toString()]);
      expect(await isEmailInUserScope(s.acteurs[role], young.email)).toBe(false);
      const { youngContextFilters } = await buildYoungContext(s.acteurs[role]);
      expect(youngContextFilters.find((filtre) => filtre.terms?._id).terms._id).toEqual([autreVolontaire._id.toString()]);
    });
  });

  it.each(ROLES_STRUCTURE)("I4 : la candidature refusée du volontaire lui-même reste dans le périmètre et se revalide (%s)", async (role) => {
    const s = await createScenario();
    const young = await createYoungWithCohort();
    const candidature = await createLegacyProposal(s, young, APPLICATION_STATUS.REFUSED, [APPLICATION_STATUS.WAITING_VALIDATION, APPLICATION_STATUS.REFUSED]);
    await rattrapage.up();
    const app = await getAppHelperWithAcl(s.acteurs[role], "referent");

    expect((await request(app).get(`/referent/young/${young._id}`)).status).toBe(200);
    expect((await request(app).get(`/application/${candidature._id}`)).status).toBe(200);
    expect(await isEmailInUserScope(s.acteurs[role], young.email)).toBe(true);
    expect((await request(app).put("/application").send({ _id: candidature._id.toString(), status: APPLICATION_STATUS.VALIDATED })).status).toBe(200);
    expect((await reload(candidature))!.status).toBe(APPLICATION_STATUS.VALIDATED);
  });

  it.each(ROLES_STRUCTURE)("I4 : la proposition que le volontaire avait acceptée avant son refus reste une candidature ordinaire (%s)", async (role) => {
    const s = await createScenario();
    const young = await createYoungWithCohort();
    const candidature = await createLegacyProposal(s, young, APPLICATION_STATUS.REFUSED, [
      APPLICATION_STATUS.WAITING_ACCEPTATION,
      APPLICATION_STATUS.WAITING_VALIDATION,
      APPLICATION_STATUS.REFUSED,
    ]);
    await rattrapage.up();
    const app = await getAppHelperWithAcl(s.acteurs[role], "referent");

    expect((await request(app).get(`/referent/young/${young._id}`)).status).toBe(200);
    expect((await request(app).put("/application").send({ _id: candidature._id.toString(), status: APPLICATION_STATUS.VALIDATED })).status).toBe(200);
  });

  it("l'administrateur et le référent départemental gardent la main sur une proposition refusée antérieure au marqueur", async () => {
    const s = await createScenario();
    const young = await createYoungWithCohort();
    const proposition = await createLegacyProposal(s, young, APPLICATION_STATUS.REFUSED);
    await rattrapage.up();

    for (const acteur of [s.admin, s.referentDepartemental]) {
      const app = await getAppHelperWithAcl(acteur, "referent");
      expect((await request(app).get(`/application/${proposition._id}`)).status).toBe(200);
      expect((await request(app).put("/application").send({ _id: proposition._id.toString(), status: APPLICATION_STATUS.VALIDATED })).status).toBe(200);
      expect((await request(app).put("/application").send({ _id: proposition._id.toString(), status: APPLICATION_STATUS.REFUSED })).status).toBe(200);
    }
  });
});
