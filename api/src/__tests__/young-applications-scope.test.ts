/**
 * GOO-41 — candidatures jointes au dossier d'un volontaire (constat de recette superviseur, 24/09).
 *
 * GET /referent/young/:id    : toutes les candidatures du volontaire renvoyées sans filtre de périmètre,
 *                              chacune avec la structure complète, `structureManager` compris
 * GET /young/:id/application : `CANDIDATURE_READ` sans policy, aucun contrôle de périmètre sur le
 *                              volontaire, candidatures renvoyées sans filtre
 */
import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;

import { ROLES, PERMISSION_RESOURCES, PERMISSION_ACTIONS } from "snu-lib";

import { ApplicationModel, ReferentModel, StructureModel, YoungModel } from "../models";
import { PermissionModel } from "../models/permissions/permission";
import { RoleModel } from "../models/permissions/role";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { addPermissionHelper } from "./helpers/permissions";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import getNewStructureFixture from "./fixtures/structure";
import { createReferentHelper } from "./helpers/referent";
import { createYoungHelper } from "./helpers/young";
import { createStructureHelper } from "./helpers/structure";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sync: jest.fn().mockResolvedValue(true),
  unsync: jest.fn().mockResolvedValue(true),
  syncContact: jest.fn().mockResolvedValue(true),
  sendTemplate: jest.fn().mockResolvedValue(true),
  sendEmail: jest.fn().mockResolvedValue(true),
  sendSMS: jest.fn().mockResolvedValue(true),
}));

const TERRITOIRE = { department: "Ain", region: "Auvergne-Rhône-Alpes" };
const structureManager = { firstName: "Rita", lastName: "Représentante", email: "rita@example.org", mobile: "0600000000", role: "Présidente" };

async function seedPermissions() {
  await PermissionModel.deleteMany();
  await RoleModel.deleteMany();
  // Même seed qu'en production (migration 20250716091433) : CANDIDATURE_READ sans policy.
  await addPermissionHelper(
    [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.RESPONSIBLE, ROLES.SUPERVISOR] as any,
    PERMISSION_RESOURCES.APPLICATION,
    PERMISSION_ACTIONS.READ,
  );
}

/**
 * Réseau (tête + antenne), structure isolée hors réseau, et un volontaire qui a candidaté dans les trois.
 */
async function createScenario() {
  const tete = await createStructureHelper({ ...getNewStructureFixture(), structureManager });
  const antenne = await createStructureHelper({ ...getNewStructureFixture(), isNetwork: "false", networkId: tete._id.toString(), structureManager });
  const horsReseau = await createStructureHelper({ ...getNewStructureFixture(), isNetwork: "false", networkId: "", structureManager });
  const young = await createYoungHelper(getNewYoungFixture({ ...TERRITOIRE } as any));
  const candidater = (structureId: string) =>
    ApplicationModel.create({ youngId: young._id.toString(), structureId, missionId: new ObjectId().toString(), missionName: structureId });
  const [chezTete, chezAntenne, chezHorsReseau] = [await candidater(tete._id.toString()), await candidater(antenne._id.toString()), await candidater(horsReseau._id.toString())];
  return { tete, antenne, horsReseau, young, chezTete, chezAntenne, chezHorsReseau };
}

const ids = (applications: any[]) => applications.map((application) => String(application._id)).sort();

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await seedPermissions();
});
afterAll(dbClose);
beforeEach(async () => {
  await Promise.all([ReferentModel.deleteMany(), YoungModel.deleteMany(), StructureModel.deleteMany(), ApplicationModel.deleteMany()]);
  jest.clearAllMocks();
});
afterEach(resetAppAuth);

describe("GOO-41 — candidatures hors périmètre dans le dossier volontaire", () => {
  describe("GET /referent/young/:id", () => {
    it("ne renvoie à un superviseur que les candidatures de son réseau, sans structureManager", async () => {
      const { tete, young, chezTete, chezAntenne } = await createScenario();
      const superviseur = await createReferentHelper(getNewReferentFixture({ role: ROLES.SUPERVISOR, structureId: tete._id.toString() }));

      const res = await request(await getAppHelperWithAcl(superviseur, "referent")).get(`/referent/young/${young._id}`);

      expect(res.status).toBe(200);
      expect(ids(res.body.data.applications)).toEqual(ids([chezTete, chezAntenne]));
      for (const application of res.body.data.applications) {
        expect(application.structure).toBeTruthy();
        expect(application.structure.structureManager).toBeUndefined();
      }
    }, 30000);

    it("ne renvoie à un responsable que les candidatures de sa structure", async () => {
      const { antenne, young, chezAntenne } = await createScenario();
      const responsable = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: antenne._id.toString() }));

      const res = await request(await getAppHelperWithAcl(responsable, "referent")).get(`/referent/young/${young._id}`);

      expect(res.status).toBe(200);
      expect(ids(res.body.data.applications)).toEqual(ids([chezAntenne]));
    }, 30000);

    it("renvoie toutes les candidatures à un référent départemental du territoire (non-régression), sans structureManager", async () => {
      const { young, chezTete, chezAntenne, chezHorsReseau } = await createScenario();
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: [TERRITOIRE.department], region: TERRITOIRE.region }));

      const res = await request(await getAppHelperWithAcl(referent, "referent")).get(`/referent/young/${young._id}`);

      expect(res.status).toBe(200);
      expect(ids(res.body.data.applications)).toEqual(ids([chezTete, chezAntenne, chezHorsReseau]));
      for (const application of res.body.data.applications) expect(application.structure.structureManager).toBeUndefined();
    }, 30000);
  });

  describe("GET /young/:id/application", () => {
    it("refuse à un responsable la liste des candidatures d'un volontaire qui n'a jamais candidaté chez lui", async () => {
      const { young } = await createScenario();
      const autreStructure = await createStructureHelper(getNewStructureFixture());
      const responsable = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: autreStructure._id.toString() }));

      const res = await request(await getAppHelperWithAcl(responsable, "referent")).get(`/young/${young._id}/application`);

      expect(res.status).toBe(403);
    }, 30000);

    it("ne renvoie à un superviseur que les candidatures de son réseau", async () => {
      const { tete, young, chezTete, chezAntenne } = await createScenario();
      const superviseur = await createReferentHelper(getNewReferentFixture({ role: ROLES.SUPERVISOR, structureId: tete._id.toString() }));

      const res = await request(await getAppHelperWithAcl(superviseur, "referent")).get(`/young/${young._id}/application`);

      expect(res.status).toBe(200);
      expect(ids(res.body.data)).toEqual(ids([chezTete, chezAntenne]));
    }, 30000);

    it("ne renvoie à un responsable que les candidatures de sa structure", async () => {
      const { horsReseau, young, chezHorsReseau } = await createScenario();
      const responsable = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: horsReseau._id.toString() }));

      const res = await request(await getAppHelperWithAcl(responsable, "referent")).get(`/young/${young._id}/application`);

      expect(res.status).toBe(200);
      expect(ids(res.body.data)).toEqual(ids([chezHorsReseau]));
    }, 30000);

    it("refuse à un référent départemental un volontaire hors de son territoire", async () => {
      const { young } = await createScenario();
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Doubs"], region: "Bourgogne-Franche-Comté" }));

      const res = await request(await getAppHelperWithAcl(referent, "referent")).get(`/young/${young._id}/application`);

      expect(res.status).toBe(403);
    }, 30000);

    it("renvoie toutes les candidatures à un référent départemental du territoire (non-régression)", async () => {
      const { young, chezTete, chezAntenne, chezHorsReseau } = await createScenario();
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: [TERRITOIRE.department], region: TERRITOIRE.region }));

      const res = await request(await getAppHelperWithAcl(referent, "referent")).get(`/young/${young._id}/application`);

      expect(res.status).toBe(200);
      expect(ids(res.body.data)).toEqual(ids([chezTete, chezAntenne, chezHorsReseau]));
    }, 30000);
  });
});
