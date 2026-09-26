import request from "supertest";

import { MISSION_STATUS, PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLE_JEUNE, ROLES } from "snu-lib";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { addPermissionHelper } from "./helpers/permissions";
import { createApplication } from "./helpers/application";
import { createMissionHelper, getMissionByIdHelper } from "./helpers/mission";
import { createReferentHelper } from "./helpers/referent";
import { createStructureHelper } from "./helpers/structure";
import { getNewApplicationFixture } from "./fixtures/application";
import getNewMissionFixture from "./fixtures/mission";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewStructureFixture from "./fixtures/structure";
import { PermissionModel } from "../models/permissions/permission";

jest.setTimeout(60_000);

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: () => Promise.resolve(),
  sendEmail: () => Promise.resolve(),
}));

// Aucun test ne doit dépendre d'un appel réseau vers api-adresse : `PUT /mission/:id` géocode
// dès que le statut visé est WAITING_VALIDATION.
jest.mock("../services/gouv.fr/api-adresse", () => ({
  getNearestLocation: () => Promise.resolve({ lat: 48.85, lon: 2.35 }),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await PermissionModel.deleteMany({});
  // Seed identique à la production (migrations 20250624122150 / 20250716091433 / 20250801060707).
  await addPermissionHelper([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION], PERMISSION_RESOURCES.MISSION, PERMISSION_ACTIONS.FULL);
  // MISSION:READ est accordée au superviseur SANS policy : toute autorisation en lecture est donc
  // vraie pour n'importe quelle mission. C'est ce qui rend H31 / M20 exploitables.
  await addPermissionHelper([ROLES.SUPERVISOR, ROLE_JEUNE], PERMISSION_RESOURCES.MISSION, PERMISSION_ACTIONS.READ);
  await addPermissionHelper([ROLES.RESPONSIBLE, ROLES.SUPERVISOR], PERMISSION_RESOURCES.MISSION, PERMISSION_ACTIONS.FULL, [
    {
      where: [
        { resource: "structure", field: "_id", source: "structureId" },
        { field: "structureId", source: "structureId" },
      ],
      blacklist: [],
      whitelist: [],
    },
  ]);
  await addPermissionHelper([ROLES.SUPERVISOR], PERMISSION_RESOURCES.MISSION, PERMISSION_ACTIONS.FULL, [
    {
      where: [
        { field: "structureId", source: "structureId" },
        { resource: "structure", field: "networkId", source: "structureId" },
      ],
      blacklist: [],
      whitelist: [],
    },
  ]);
  await addPermissionHelper([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.SUPERVISOR], PERMISSION_RESOURCES.USER_HISTORY, PERMISSION_ACTIONS.READ);
  await addPermissionHelper([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION], PERMISSION_RESOURCES.PATCH, PERMISSION_ACTIONS.READ);
}, 120_000);
afterAll(dbClose);
afterEach(resetAppAuth);

/**
 * Un référent réellement en base : `isReferent` teste `user instanceof ReferentModel`, un objet nu
 * ferait sauter silencieusement les contrôles de périmètre.
 */
async function createReferent(overrides: Record<string, unknown>) {
  return createReferentHelper(getNewReferentFixture(overrides));
}

async function createStructure(overrides: Record<string, unknown> = {}) {
  return createStructureHelper({ ...getNewStructureFixture(), isNetwork: "false", networkId: "", ...overrides });
}

/** Corps de création accepté par `validateMission` (dates en chaînes, pas d'identifiant vide). */
function missionCreationPayload(structure: any, overrides: Record<string, unknown> = {}) {
  const fixture = getNewMissionFixture();
  return {
    ...fixture,
    startAt: new Date("2030-01-01T00:00:00Z").toISOString(),
    endAt: new Date("2030-02-01T00:00:00Z").toISOString(),
    structureId: String(structure._id),
    structureName: structure.name,
    placesTotal: 5,
    placesLeft: 5,
    status: MISSION_STATUS.DRAFT,
    tutorId: undefined,
    tutorName: undefined,
    ...overrides,
  };
}

async function createMission(structure: any, overrides: Record<string, unknown> = {}) {
  return createMissionHelper({
    ...getNewMissionFixture(),
    structureId: String(structure._id),
    structureName: structure.name,
    status: MISSION_STATUS.VALIDATED,
    placesTotal: 10,
    placesLeft: 10,
    tutorId: "",
    ...overrides,
  });
}

describe("Sécurité des missions", () => {
  describe("H29 — PUT /mission/:id évalué sur le corps de la requête", () => {
    it("refuse à un responsable de s'approprier la mission d'une autre structure en envoyant sa propre structureId", async () => {
      const structureAttaquant = await createStructure();
      const structureCible = await createStructure();
      const attaquant = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structureAttaquant._id) });
      const mission = await createMission(structureCible);

      const res = await request(await getAppHelperWithAcl(attaquant))
        .put(`/mission/${mission._id}`)
        .send({ name: "Mission détournée", status: MISSION_STATUS.DRAFT, structureId: String(structureAttaquant._id) });

      expect(res.statusCode).toEqual(403);
      const apres = await getMissionByIdHelper(mission._id);
      expect(String(apres!.structureId)).toEqual(String(structureCible._id));
      expect(apres!.name).toEqual(mission.name);
      expect(apres!.status).toEqual(MISSION_STATUS.VALIDATED);
    });

    it("laisse un responsable modifier une mission de sa propre structure", async () => {
      const structure = await createStructure();
      const responsable = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });
      const mission = await createMission(structure, { status: MISSION_STATUS.DRAFT });

      const res = await request(await getAppHelperWithAcl(responsable))
        .put(`/mission/${mission._id}`)
        .send({ name: "Nouveau nom", status: MISSION_STATUS.DRAFT });

      expect(res.statusCode).toEqual(200);
      const apres = await getMissionByIdHelper(mission._id);
      expect(apres!.name).toEqual("Nouveau nom");
    });

    it("refuse à un responsable de déplacer sa mission vers une autre structure", async () => {
      const structure = await createStructure();
      const autreStructure = await createStructure();
      const responsable = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });
      const mission = await createMission(structure, { status: MISSION_STATUS.DRAFT });

      const res = await request(await getAppHelperWithAcl(responsable))
        .put(`/mission/${mission._id}`)
        .send({ status: MISSION_STATUS.DRAFT, structureId: String(autreStructure._id) });

      expect(res.statusCode).toEqual(403);
      const apres = await getMissionByIdHelper(mission._id);
      expect(String(apres!.structureId)).toEqual(String(structure._id));
    });
  });

  describe("H30 — POST /mission/multiaction/change-tutor autorise le lot entier", () => {
    it("refuse le lot dès qu'une mission échappe au périmètre de l'acteur", async () => {
      const structureAttaquant = await createStructure();
      const structureCible = await createStructure();
      const attaquant = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structureAttaquant._id) });
      const nouveauTuteur = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structureAttaquant._id) });
      const missionLegitime = await createMission(structureAttaquant);
      const missionCible = await createMission(structureCible);

      const res = await request(await getAppHelperWithAcl(attaquant))
        .post("/mission/multiaction/change-tutor")
        .send({ ids: [String(missionLegitime._id), String(missionCible._id)], tutorId: String(nouveauTuteur._id), tutorName: "Tuteur injecté" });

      expect(res.statusCode).toEqual(403);
      const apres = await getMissionByIdHelper(missionCible._id);
      expect(apres!.tutorId).toBeFalsy();
      const legitime = await getMissionByIdHelper(missionLegitime._id);
      expect(legitime!.tutorId).toBeFalsy();
    });

    it("laisse changer le tuteur d'un lot entièrement dans le périmètre", async () => {
      const structure = await createStructure();
      const responsable = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });
      const nouveauTuteur = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });
      const mission = await createMission(structure);

      const res = await request(await getAppHelperWithAcl(responsable))
        .post("/mission/multiaction/change-tutor")
        .send({ ids: [String(mission._id)], tutorId: String(nouveauTuteur._id), tutorName: "Peu importe" });

      expect(res.statusCode).toEqual(200);
      const apres = await getMissionByIdHelper(mission._id);
      expect(String(apres!.tutorId)).toEqual(String(nouveauTuteur._id));
      // Le nom du tuteur est recalculé côté serveur, jamais repris du corps de la requête.
      expect(apres!.tutorName).toEqual(`${nouveauTuteur.firstName} ${nouveauTuteur.lastName}`);
    });

    it("refuse un tuteur extérieur à la structure de la mission", async () => {
      const structure = await createStructure();
      const autreStructure = await createStructure();
      const responsable = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });
      const tuteurEtranger = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(autreStructure._id) });
      const mission = await createMission(structure);

      const res = await request(await getAppHelperWithAcl(responsable))
        .post("/mission/multiaction/change-tutor")
        .send({ ids: [String(mission._id)], tutorId: String(tuteurEtranger._id), tutorName: "Tuteur étranger" });

      expect(res.statusCode).toEqual(403);
      const apres = await getMissionByIdHelper(mission._id);
      expect(apres!.tutorId).toBeFalsy();
    });
  });

  describe("H31 — GET /mission/:id/application sans rapprochement", () => {
    async function missionAvecCandidature() {
      const structure = await createStructure();
      const mission = await createMission(structure);
      await createApplication({
        ...getNewApplicationFixture(),
        missionId: String(mission._id),
        structureId: String(structure._id),
        status: "VALIDATED",
      });
      return { structure, mission };
    }

    it("refuse les candidatures d'une mission d'une autre structure à un responsable", async () => {
      const { mission } = await missionAvecCandidature();
      const attaquant = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String((await createStructure())._id) });

      const res = await request(await getAppHelperWithAcl(attaquant)).get(`/mission/${mission._id}/application`);

      expect(res.statusCode).toEqual(403);
    });

    it("refuse les candidatures d'une mission hors réseau à un superviseur", async () => {
      const { mission } = await missionAvecCandidature();
      const reseau = await createStructure({ isNetwork: "true" });
      const superviseur = await createReferent({ role: ROLES.SUPERVISOR, structureId: String(reseau._id) });

      const res = await request(await getAppHelperWithAcl(superviseur)).get(`/mission/${mission._id}/application`);

      expect(res.statusCode).toEqual(403);
    });

    it("laisse le responsable de la structure porteuse lire les candidatures", async () => {
      const { structure, mission } = await missionAvecCandidature();
      const responsable = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });

      const res = await request(await getAppHelperWithAcl(responsable)).get(`/mission/${mission._id}/application`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveLength(1);
    });

    it("laisse le superviseur du réseau lire les candidatures", async () => {
      const reseau = await createStructure({ isNetwork: "true" });
      const structure = await createStructure({ networkId: String(reseau._id) });
      const mission = await createMission(structure);
      await createApplication({ ...getNewApplicationFixture(), missionId: String(mission._id), structureId: String(structure._id), status: "VALIDATED" });
      const superviseur = await createReferent({ role: ROLES.SUPERVISOR, structureId: String(reseau._id) });

      const res = await request(await getAppHelperWithAcl(superviseur)).get(`/mission/${mission._id}/application`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe("M20 — GET /mission/:id/patches sans périmètre", () => {
    it("refuse l'historique d'une mission hors réseau à un superviseur", async () => {
      const structure = await createStructure();
      const mission = await createMission(structure);
      const reseau = await createStructure({ isNetwork: "true" });
      const superviseur = await createReferent({ role: ROLES.SUPERVISOR, structureId: String(reseau._id) });

      const res = await request(await getAppHelperWithAcl(superviseur)).get(`/mission/${mission._id}/patches`);

      expect(res.statusCode).toEqual(403);
    });

    it("laisse le superviseur du réseau lire l'historique", async () => {
      const reseau = await createStructure({ isNetwork: "true" });
      const structure = await createStructure({ networkId: String(reseau._id) });
      const mission = await createMission(structure);
      const superviseur = await createReferent({ role: ROLES.SUPERVISOR, structureId: String(reseau._id) });

      const res = await request(await getAppHelperWithAcl(superviseur)).get(`/mission/${mission._id}/patches`);

      expect(res.statusCode).toEqual(200);
    });
  });

  describe("M19 — champs libres du validateur de mission", () => {
    it("refuse à un responsable de valider lui-même sa mission", async () => {
      const structure = await createStructure();
      const responsable = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });
      const mission = await createMission(structure, { status: MISSION_STATUS.DRAFT });

      const res = await request(await getAppHelperWithAcl(responsable))
        .put(`/mission/${mission._id}`)
        .send({ status: MISSION_STATUS.VALIDATED });

      expect(res.statusCode).toEqual(403);
      const apres = await getMissionByIdHelper(mission._id);
      expect(apres!.status).toEqual(MISSION_STATUS.DRAFT);
    });

    it("laisse un responsable soumettre sa mission à validation", async () => {
      const structure = await createStructure();
      const responsable = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });
      const tuteur = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });
      const mission = await createMission(structure, { status: MISSION_STATUS.DRAFT, tutorId: String(tuteur._id) });

      const res = await request(await getAppHelperWithAcl(responsable))
        .put(`/mission/${mission._id}`)
        .send({ status: MISSION_STATUS.WAITING_VALIDATION });

      expect(res.statusCode).toEqual(200);
      const apres = await getMissionByIdHelper(mission._id);
      expect(apres!.status).toEqual(MISSION_STATUS.WAITING_VALIDATION);
    });

    it("laisse un référent départemental valider une mission", async () => {
      const structure = await createStructure();
      const referent = await createReferent({ role: ROLES.REFERENT_DEPARTMENT, department: ["Ain"] });
      const tuteur = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });
      const mission = await createMission(structure, {
        status: MISSION_STATUS.WAITING_VALIDATION,
        tutorId: String(tuteur._id),
        department: "Ain",
        region: "Auvergne-Rhône-Alpes",
      });

      const res = await request(await getAppHelperWithAcl(referent))
        .put(`/mission/${mission._id}`)
        // description et actions inchangées : sinon le contrôleur repasse la mission en attente de validation.
        .send({ status: MISSION_STATUS.VALIDATED, description: mission.description, actions: mission.actions });

      expect(res.statusCode).toEqual(200);
      const apres = await getMissionByIdHelper(mission._id);
      expect(apres!.status).toEqual(MISSION_STATUS.VALIDATED);
    });

    it("ignore le nombre de places restantes envoyé par un responsable", async () => {
      const structure = await createStructure();
      const responsable = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });
      const mission = await createMission(structure, { status: MISSION_STATUS.DRAFT, placesTotal: 10, placesLeft: 2 });

      const res = await request(await getAppHelperWithAcl(responsable))
        .put(`/mission/${mission._id}`)
        .send({ status: MISSION_STATUS.DRAFT, placesTotal: 10, placesLeft: 9999 });

      expect(res.statusCode).toEqual(200);
      const apres = await getMissionByIdHelper(mission._id);
      expect(apres!.placesLeft).toEqual(2);
    });

    it("refuse à un responsable de désigner un tuteur extérieur à sa structure", async () => {
      const structure = await createStructure();
      const autreStructure = await createStructure();
      const responsable = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });
      const tuteurEtranger = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(autreStructure._id) });
      const mission = await createMission(structure, { status: MISSION_STATUS.DRAFT });

      const res = await request(await getAppHelperWithAcl(responsable))
        .put(`/mission/${mission._id}`)
        .send({ status: MISSION_STATUS.DRAFT, tutorId: String(tuteurEtranger._id) });

      expect(res.statusCode).toEqual(403);
      const apres = await getMissionByIdHelper(mission._id);
      expect(apres!.tutorId).toBeFalsy();
    });

    it("refuse à un responsable de créer une mission déjà validée", async () => {
      const structure = await createStructure();
      const responsable = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });

      const res = await request(await getAppHelperWithAcl(responsable))
        .post("/mission")
        .send(missionCreationPayload(structure, { status: MISSION_STATUS.VALIDATED }));

      expect(res.statusCode).toEqual(403);
    });

    it("aligne les places restantes sur les places totales à la création par un responsable", async () => {
      const structure = await createStructure();
      const responsable = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });

      const res = await request(await getAppHelperWithAcl(responsable))
        .post("/mission")
        .send(missionCreationPayload(structure, { placesTotal: 5, placesLeft: 9999 }));

      expect(res.statusCode).toEqual(200);
      const creee = await getMissionByIdHelper(res.body.data._id);
      expect(creee!.placesLeft).toEqual(5);
    });
  });

  describe("GOO-45 — périmètre territorial des référents sur les missions", () => {
    const RHONE = { department: "Rhône", region: "Auvergne-Rhône-Alpes" };
    const PARIS = { department: "Paris", region: "Île-de-France" };
    const HAUTS_DE_SEINE = { department: "Hauts-de-Seine", region: "Île-de-France" };

    async function referentDepartemental92() {
      return createReferent({ role: ROLES.REFERENT_DEPARTMENT, department: ["Hauts-de-Seine"], region: "Île-de-France" });
    }

    async function missionEn(territoire: Record<string, string>, overrides: Record<string, unknown> = {}) {
      const structure = await createStructure();
      return createMission(structure, { status: MISSION_STATUS.DRAFT, ...territoire, ...overrides });
    }

    it.each([
      ["du Rhône", RHONE],
      ["de Paris (même région)", PARIS],
    ])("refuse à un référent du 92 de changer le statut d'une mission %s", async (_label, territoire) => {
      const referent = await referentDepartemental92();
      const mission = await missionEn(territoire);

      const res = await request(await getAppHelperWithAcl(referent))
        .put(`/mission/${mission._id}`)
        .send({ status: MISSION_STATUS.WAITING_VALIDATION, description: mission.description, actions: mission.actions });

      expect(res.statusCode).toEqual(403);
      expect((await getMissionByIdHelper(mission._id))!.status).toEqual(MISSION_STATUS.DRAFT);
    });

    it.each([
      ["du Rhône", RHONE],
      ["de Paris (même région)", PARIS],
    ])("refuse à un référent du 92 de supprimer une mission %s", async (_label, territoire) => {
      const referent = await referentDepartemental92();
      const mission = await missionEn(territoire);

      const res = await request(await getAppHelperWithAcl(referent)).delete(`/mission/${mission._id}`);

      expect(res.statusCode).toEqual(403);
      expect(await getMissionByIdHelper(mission._id)).not.toBeNull();
    });

    it("laisse un référent du 92 modifier et supprimer une mission du 92", async () => {
      const referent = await referentDepartemental92();
      const mission = await missionEn(HAUTS_DE_SEINE);
      const app = await getAppHelperWithAcl(referent);

      const put = await request(app).put(`/mission/${mission._id}`).send({ status: MISSION_STATUS.DRAFT, name: "Mission renommée" });
      expect(put.statusCode).toEqual(200);
      expect((await getMissionByIdHelper(mission._id))!.name).toEqual("Mission renommée");

      const del = await request(app).delete(`/mission/${mission._id}`);
      expect(del.statusCode).toEqual(200);
      expect(await getMissionByIdHelper(mission._id)).toBeNull();
    });

    it("refuse à un référent du 92 de déplacer une mission du 92 vers un autre département", async () => {
      const referent = await referentDepartemental92();
      const mission = await missionEn(HAUTS_DE_SEINE);

      const res = await request(await getAppHelperWithAcl(referent))
        .put(`/mission/${mission._id}`)
        .send({ status: MISSION_STATUS.DRAFT, ...RHONE });

      expect(res.statusCode).toEqual(403);
      expect((await getMissionByIdHelper(mission._id))!.department).toEqual("Hauts-de-Seine");
    });

    it("refuse à un référent du 92 de créer une mission dans un autre département", async () => {
      const referent = await referentDepartemental92();
      const structure = await createStructure();

      const res = await request(await getAppHelperWithAcl(referent))
        .post("/mission")
        .send(missionCreationPayload(structure, RHONE));

      expect(res.statusCode).toEqual(403);
    });

    it("refuse à un référent régional d'Île-de-France de modifier une mission du Rhône, et le laisse sur Paris", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_REGION, region: "Île-de-France", department: [] });
      const app = await getAppHelperWithAcl(referent);
      const horsRegion = await missionEn(RHONE);
      const dansRegion = await missionEn(PARIS);
      const payload = { status: MISSION_STATUS.DRAFT, name: "Mission renommée" };

      expect((await request(app).put(`/mission/${horsRegion._id}`).send(payload)).statusCode).toEqual(403);
      expect((await request(app).put(`/mission/${dansRegion._id}`).send(payload)).statusCode).toEqual(200);
    });

    it("refuse le changement de tuteur d'une mission hors territoire", async () => {
      const referent = await referentDepartemental92();
      const structure = await createStructure();
      const tuteur = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });
      const mission = await createMission(structure, RHONE);

      const res = await request(await getAppHelperWithAcl(referent))
        .post("/mission/multiaction/change-tutor")
        .send({ ids: [String(mission._id)], tutorId: String(tuteur._id), tutorName: "x" });

      expect(res.statusCode).toEqual(403);
    });

    it("refuse l'historique d'une mission hors territoire", async () => {
      const referent = await referentDepartemental92();
      const mission = await missionEn(RHONE);

      const res = await request(await getAppHelperWithAcl(referent)).get(`/mission/${mission._id}/patches`);

      expect(res.statusCode).toEqual(403);
    });

    it("ne montre, hors territoire, que les candidatures des volontaires du référent", async () => {
      const referent = await referentDepartemental92();
      const structure = await createStructure();
      const mission = await createMission(structure, RHONE);
      const candidature = (youngDepartment: string) =>
        createApplication({ ...getNewApplicationFixture(), missionId: String(mission._id), structureId: String(structure._id), status: "VALIDATED", youngDepartment });
      const sienne = await candidature("Hauts-de-Seine");
      await candidature("Rhône");

      const res = await request(await getAppHelperWithAcl(referent)).get(`/mission/${mission._id}/application`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.map((application: any) => String(application._id))).toEqual([String(sienne._id)]);
    });

    it("montre toutes les candidatures d'une mission du territoire", async () => {
      const referent = await referentDepartemental92();
      const structure = await createStructure();
      const mission = await createMission(structure, HAUTS_DE_SEINE);
      for (const youngDepartment of ["Hauts-de-Seine", "Paris"]) {
        await createApplication({ ...getNewApplicationFixture(), missionId: String(mission._id), structureId: String(structure._id), status: "VALIDATED", youngDepartment });
      }

      const res = await request(await getAppHelperWithAcl(referent)).get(`/mission/${mission._id}/application`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveLength(2);
    });

    it("laisse un référent lire la fiche d'une mission hors territoire", async () => {
      const referent = await referentDepartemental92();
      const mission = await missionEn(RHONE);

      const res = await request(await getAppHelperWithAcl(referent)).get(`/mission/${mission._id}`);

      expect(res.statusCode).toEqual(200);
    });
  });

  describe("GOO-59 — modération des missions après validation (PM13, PM22, PL1)", () => {
    const START_AT = "2030-03-01T10:00:00.000Z";
    const END_AT = "2030-04-01T10:00:00.000Z";

    async function missionValidee(structure: any, overrides: Record<string, unknown> = {}) {
      return createMission(structure, {
        startAt: new Date(START_AT),
        endAt: new Date(END_AT),
        duration: "3",
        hebergement: "false",
        isMilitaryPreparation: "false",
        department: "Ain",
        region: "Auvergne-Rhône-Alpes",
        ...overrides,
      });
    }

    /** Corps que renvoie la fiche d'édition : les champs modérés tels qu'en base. */
    function corpsInchange(mission: any) {
      return {
        name: mission.name,
        description: mission.description,
        actions: mission.actions,
        justifications: mission.justifications,
        contraintes: mission.contraintes,
        frequence: mission.frequence,
        duration: mission.duration,
        startAt: START_AT,
        endAt: END_AT,
        address: mission.address,
        zip: mission.zip,
        city: mission.city,
        department: mission.department,
        region: mission.region,
        isMilitaryPreparation: mission.isMilitaryPreparation,
        hebergement: mission.hebergement,
        placesTotal: mission.placesTotal,
      };
    }

    it.each([
      ["name", "Mission renommée"],
      ["justifications", "Nouvelle justification"],
      ["contraintes", "Nouvelles contraintes"],
      ["frequence", "Tous les jours"],
      ["duration", "40"],
      ["startAt", "2030-03-05T10:00:00.000Z"],
      ["endAt", "2030-05-01T10:00:00.000Z"],
      ["address", "1 rue ailleurs"],
      ["zip", "01000"],
      ["city", "Bourg-en-Bresse"],
      ["department", "Rhône"],
      ["isMilitaryPreparation", "true"],
      ["hebergement", "true"],
    ])("repasse en modération une mission validée dont le responsable change « %s »", async (field, value) => {
      const structure = await createStructure();
      const responsable = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });
      const mission = await missionValidee(structure);

      const res = await request(await getAppHelperWithAcl(responsable))
        .put(`/mission/${mission._id}`)
        .send({ ...corpsInchange(mission), [field]: value });

      expect(res.statusCode).toEqual(200);
      const apres = await getMissionByIdHelper(mission._id);
      expect(apres!.status).toEqual(MISSION_STATUS.WAITING_VALIDATION);
    });

    it("repasse en modération la mission validée d'un superviseur qui change son adresse", async () => {
      const structure = await createStructure();
      const superviseur = await createReferent({ role: ROLES.SUPERVISOR, structureId: String(structure._id) });
      const mission = await missionValidee(structure);

      const res = await request(await getAppHelperWithAcl(superviseur))
        .put(`/mission/${mission._id}`)
        .send({ ...corpsInchange(mission), address: "2 rue ailleurs" });

      expect(res.statusCode).toEqual(200);
      const apres = await getMissionByIdHelper(mission._id);
      expect(apres!.status).toEqual(MISSION_STATUS.WAITING_VALIDATION);
    });

    it("laisse validée une mission dont seuls les champs non modérés changent (places, visibilité)", async () => {
      const structure = await createStructure();
      const responsable = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });
      const mission = await missionValidee(structure);

      const res = await request(await getAppHelperWithAcl(responsable))
        .put(`/mission/${mission._id}`)
        .send({ ...corpsInchange(mission), placesTotal: mission.placesTotal! + 2, visibility: "HIDDEN" });

      expect(res.statusCode).toEqual(200);
      const apres = await getMissionByIdHelper(mission._id);
      expect(apres!.status).toEqual(MISSION_STATUS.VALIDATED);
      expect(apres!.placesTotal).toEqual(mission.placesTotal! + 2);
    });

    it("laisse validée une mission dont le drapeau préparation militaire, absent en base, est renvoyé à « false »", async () => {
      const structure = await createStructure();
      const responsable = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });
      const mission = await missionValidee(structure, { isMilitaryPreparation: undefined, hebergement: undefined });

      const res = await request(await getAppHelperWithAcl(responsable))
        .put(`/mission/${mission._id}`)
        .send({ ...corpsInchange(mission), isMilitaryPreparation: "false", hebergement: "" });

      expect(res.statusCode).toEqual(200);
      const apres = await getMissionByIdHelper(mission._id);
      expect(apres!.status).toEqual(MISSION_STATUS.VALIDATED);
    });

    it("n'impose pas de nouvelle modération au référent qui modère la mission", async () => {
      const structure = await createStructure();
      const referent = await createReferent({ role: ROLES.REFERENT_DEPARTMENT, department: ["Ain"] });
      const mission = await missionValidee(structure);

      const res = await request(await getAppHelperWithAcl(referent))
        .put(`/mission/${mission._id}`)
        .send({ ...corpsInchange(mission), name: "Nom corrigé par le référent", duration: "12" });

      expect(res.statusCode).toEqual(200);
      const apres = await getMissionByIdHelper(mission._id);
      expect(apres!.status).toEqual(MISSION_STATUS.VALIDATED);
      expect(apres!.name).toEqual("Nom corrigé par le référent");
    });

    it("relit le nom de la structure depuis la structure porteuse au lieu du corps", async () => {
      const structure = await createStructure({ name: "Structure réelle" });
      const responsable = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });
      const mission = await missionValidee(structure);

      const res = await request(await getAppHelperWithAcl(responsable))
        .put(`/mission/${mission._id}`)
        .send({ ...corpsInchange(mission), structureName: "Gagnez un iPhone sur exemple.com" });

      expect(res.statusCode).toEqual(200);
      const apres = await getMissionByIdHelper(mission._id);
      expect(apres!.structureName).toEqual("Structure réelle");
      expect(apres!.status).toEqual(MISSION_STATUS.VALIDATED);
    });

    it("à la création, relit aussi le nom de la structure depuis la structure porteuse", async () => {
      const structure = await createStructure({ name: "Structure réelle" });
      const responsable = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });

      const res = await request(await getAppHelperWithAcl(responsable))
        .post("/mission")
        .send(missionCreationPayload(structure, { structureName: "Gagnez un iPhone sur exemple.com" }));

      expect(res.statusCode).toEqual(200);
      const apres = await getMissionByIdHelper(res.body.data._id);
      expect(apres!.structureName).toEqual("Structure réelle");
    });

    it("ne renvoie pas le dump JeVeuxAider dans la réponse de PUT /mission/:id (PL1)", async () => {
      const structure = await createStructure();
      const responsable = await createReferent({ role: ROLES.RESPONSIBLE, structureId: String(structure._id) });
      const mission = await missionValidee(structure, { jvaRawData: { contact: { email: "contact-interne@jva.example" } } });

      const res = await request(await getAppHelperWithAcl(responsable))
        .put(`/mission/${mission._id}`)
        .send({ ...corpsInchange(mission), placesTotal: mission.placesTotal! + 1 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data._id).toEqual(String(mission._id));
      expect(res.body.data).not.toHaveProperty("jvaRawData");
    });
  });
});
