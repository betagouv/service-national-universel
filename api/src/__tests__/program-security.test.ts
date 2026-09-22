import request from "supertest";

import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLES } from "snu-lib";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { addPermissionHelper } from "./helpers/permissions";
import { createProgramHelper, getProgramByIdHelper } from "./helpers/program";
import { createReferentHelper } from "./helpers/referent";
import getNewProgramFixture from "./fixtures/program";
import { getNewReferentFixture } from "./fixtures/referent";
import { PermissionModel } from "../models/permissions/permission";

jest.setTimeout(60_000);

const DEPARTEMENT_CIBLE = "Rhône";
const REGION_CIBLE = "Auvergne-Rhône-Alpes";
const DEPARTEMENT_ATTAQUANT = "Ain";
const REGION_ATTAQUANT = "Guyane";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await PermissionModel.deleteMany({});
  // Seed identique à la production (migration 20250624122150) : PROGRAM est accordée sans policy,
  // c'est `canCreateOrUpdateProgram` qui porte tout le cloisonnement.
  await addPermissionHelper([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION], PERMISSION_RESOURCES.PROGRAM, PERMISSION_ACTIONS.FULL);
}, 120_000);
afterAll(dbClose);
afterEach(resetAppAuth);

async function createReferent(overrides: Record<string, unknown>) {
  return createReferentHelper(getNewReferentFixture(overrides));
}

async function createProgram(overrides: Record<string, unknown> = {}) {
  return createProgramHelper({ ...getNewProgramFixture(), ...overrides });
}

describe("Sécurité des programmes", () => {
  describe("H33 — PUT /program/:id évalué sur le corps de la requête", () => {
    it("refuse à un référent départemental de réécrire le programme d'un autre département", async () => {
      const attaquant = await createReferent({ role: ROLES.REFERENT_DEPARTMENT, department: [DEPARTEMENT_ATTAQUANT], region: REGION_ATTAQUANT });
      const programme = await createProgram({ department: DEPARTEMENT_CIBLE, region: REGION_CIBLE, visibility: "DEPARTMENT" });

      const res = await request(await getAppHelperWithAcl(attaquant))
        .put(`/program/${programme._id}`)
        .send({ name: "Programme détourné", department: DEPARTEMENT_ATTAQUANT, visibility: "DEPARTMENT" });

      expect(res.statusCode).toEqual(403);
      const apres = await getProgramByIdHelper(programme._id);
      expect(apres!.name).toEqual(programme.name);
      expect(apres!.department).toEqual(DEPARTEMENT_CIBLE);
    });

    it("refuse à un référent régional de réécrire un programme national", async () => {
      const attaquant = await createReferent({ role: ROLES.REFERENT_REGION, region: REGION_ATTAQUANT });
      const programme = await createProgram({ department: "", region: "", visibility: "NATIONAL" });

      const res = await request(await getAppHelperWithAcl(attaquant))
        .put(`/program/${programme._id}`)
        .send({ name: "Programme détourné", region: REGION_ATTAQUANT, visibility: "REGION" });

      expect(res.statusCode).toEqual(403);
      const apres = await getProgramByIdHelper(programme._id);
      expect(apres!.name).toEqual(programme.name);
      expect(apres!.visibility).toEqual("NATIONAL");
    });

    it("refuse à un référent départemental de sortir son programme de son département", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_DEPARTMENT, department: [DEPARTEMENT_ATTAQUANT], region: REGION_ATTAQUANT });
      const programme = await createProgram({ department: DEPARTEMENT_ATTAQUANT, region: REGION_ATTAQUANT, visibility: "DEPARTMENT" });

      const res = await request(await getAppHelperWithAcl(referent))
        .put(`/program/${programme._id}`)
        .send({ department: DEPARTEMENT_CIBLE, visibility: "DEPARTMENT" });

      expect(res.statusCode).toEqual(403);
      const apres = await getProgramByIdHelper(programme._id);
      expect(apres!.department).toEqual(DEPARTEMENT_ATTAQUANT);
    });

    it("laisse un référent départemental modifier un programme de son département", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_DEPARTMENT, department: [DEPARTEMENT_ATTAQUANT], region: REGION_ATTAQUANT });
      const programme = await createProgram({ department: DEPARTEMENT_ATTAQUANT, region: REGION_ATTAQUANT, visibility: "DEPARTMENT" });

      const res = await request(await getAppHelperWithAcl(referent))
        .put(`/program/${programme._id}`)
        .send({ name: "Nouveau nom", department: DEPARTEMENT_ATTAQUANT, visibility: "DEPARTMENT" });

      expect(res.statusCode).toEqual(200);
      const apres = await getProgramByIdHelper(programme._id);
      expect(apres!.name).toEqual("Nouveau nom");
    });
  });

  describe("M26 — visibilité d'un programme", () => {
    it("refuse à un référent départemental de créer un programme national", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_DEPARTMENT, department: [DEPARTEMENT_ATTAQUANT], region: REGION_ATTAQUANT });

      const res = await request(await getAppHelperWithAcl(referent))
        .post("/program")
        .send({ ...getNewProgramFixture(), department: DEPARTEMENT_ATTAQUANT, region: REGION_ATTAQUANT, visibility: "NATIONAL" });

      expect(res.statusCode).toEqual(403);
    });

    it("refuse à un référent régional de créer un programme national", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_REGION, region: REGION_ATTAQUANT });

      const res = await request(await getAppHelperWithAcl(referent))
        .post("/program")
        .send({ ...getNewProgramFixture(), department: "", region: REGION_ATTAQUANT, visibility: "NATIONAL" });

      expect(res.statusCode).toEqual(403);
    });

    it("refuse à un référent départemental de créer un programme régional", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_DEPARTMENT, department: [DEPARTEMENT_ATTAQUANT], region: REGION_ATTAQUANT });

      const res = await request(await getAppHelperWithAcl(referent))
        .post("/program")
        .send({ ...getNewProgramFixture(), department: DEPARTEMENT_ATTAQUANT, region: REGION_ATTAQUANT, visibility: "REGION" });

      expect(res.statusCode).toEqual(403);
    });

    it("laisse un référent régional créer un programme régional dans sa région", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_REGION, region: REGION_ATTAQUANT });

      const res = await request(await getAppHelperWithAcl(referent))
        .post("/program")
        .send({ ...getNewProgramFixture(), department: "", region: REGION_ATTAQUANT, visibility: "REGION" });

      expect(res.statusCode).toEqual(200);
    });

    it("laisse un administrateur créer un programme national", async () => {
      const admin = await createReferent({ role: ROLES.ADMIN });

      const res = await request(await getAppHelperWithAcl(admin))
        .post("/program")
        .send({ ...getNewProgramFixture(), department: "", region: "", visibility: "NATIONAL" });

      expect(res.statusCode).toEqual(200);
    });
  });
});
