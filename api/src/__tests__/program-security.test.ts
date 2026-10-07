import request from "supertest";

import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLE_JEUNE, ROLES } from "snu-lib";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { addPermissionHelper } from "./helpers/permissions";
import { createProgramHelper, getProgramByIdHelper } from "./helpers/program";
import { createReferentHelper } from "./helpers/referent";
import { createYoungHelper } from "./helpers/young";
import getNewProgramFixture from "./fixtures/program";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import { PermissionModel } from "../models/permissions/permission";

jest.setTimeout(60_000);

const DEPARTEMENT_CIBLE = "Rhône";
const REGION_CIBLE = "Auvergne-Rhône-Alpes";
// Paire département/région réellement cohérente (contrairement à "Ain"/"Guyane" utilisé avant
// GOO-159 M26) : le fix de cloisonnement croisé évalue aussi le programme stocké, où un couple
// incohérent ferait échouer ces tests dès le premier contrôle.
const DEPARTEMENT_ATTAQUANT = "Guyane";
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

  describe("M26 — cloisonnement croisé département/région", () => {
    it("refuse à un référent départemental de poser une région étrangère à la création", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_DEPARTMENT, department: [DEPARTEMENT_ATTAQUANT], region: REGION_ATTAQUANT });

      const res = await request(await getAppHelperWithAcl(referent))
        .post("/program")
        .send({ ...getNewProgramFixture(), department: DEPARTEMENT_ATTAQUANT, region: REGION_CIBLE, visibility: "DEPARTMENT" });

      expect(res.statusCode).toEqual(403);
    });

    it("refuse à un référent départemental de faire glisser son programme vers une région étrangère", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_DEPARTMENT, department: [DEPARTEMENT_ATTAQUANT], region: REGION_ATTAQUANT });
      const programme = await createProgram({ department: DEPARTEMENT_ATTAQUANT, region: REGION_ATTAQUANT, visibility: "DEPARTMENT" });

      const res = await request(await getAppHelperWithAcl(referent))
        .put(`/program/${programme._id}`)
        .send({ region: REGION_CIBLE, visibility: "DEPARTMENT" });

      expect(res.statusCode).toEqual(403);
      const apres = await getProgramByIdHelper(programme._id);
      expect(apres!.region).toEqual(REGION_ATTAQUANT);
    });

    it("refuse à un référent régional de poser un département hors de sa région à la création", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_REGION, region: REGION_ATTAQUANT });

      const res = await request(await getAppHelperWithAcl(referent))
        .post("/program")
        .send({ ...getNewProgramFixture(), department: DEPARTEMENT_CIBLE, region: REGION_ATTAQUANT, visibility: "DEPARTMENT" });

      expect(res.statusCode).toEqual(403);
    });

    it("refuse à un référent régional de faire glisser son programme vers un département hors de sa région", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_REGION, region: REGION_ATTAQUANT });
      const programme = await createProgram({ department: "", region: REGION_ATTAQUANT, visibility: "REGION" });

      const res = await request(await getAppHelperWithAcl(referent))
        .put(`/program/${programme._id}`)
        .send({ department: DEPARTEMENT_CIBLE, visibility: "DEPARTMENT" });

      expect(res.statusCode).toEqual(403);
      const apres = await getProgramByIdHelper(programme._id);
      expect(apres!.department).toEqual("");
    });

    it("laisse un référent régional poser un département vide sur un programme de sa région", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_REGION, region: REGION_ATTAQUANT });
      const programme = await createProgram({ department: "", region: REGION_ATTAQUANT, visibility: "REGION" });

      const res = await request(await getAppHelperWithAcl(referent))
        .put(`/program/${programme._id}`)
        .send({ name: "Nouveau nom", department: "", visibility: "REGION" });

      expect(res.statusCode).toEqual(200);
    });

    it("laisse un référent départemental poser la région exacte de son département", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_DEPARTMENT, department: [DEPARTEMENT_ATTAQUANT], region: REGION_ATTAQUANT });

      const res = await request(await getAppHelperWithAcl(referent))
        .post("/program")
        .send({ ...getNewProgramFixture(), department: DEPARTEMENT_ATTAQUANT, region: REGION_ATTAQUANT, visibility: "DEPARTMENT" });

      expect(res.statusCode).toEqual(200);
    });

    it("laisse un référent régional poser un département réel de sa région à la création", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_REGION, region: REGION_CIBLE });

      const res = await request(await getAppHelperWithAcl(referent))
        .post("/program")
        .send({ ...getNewProgramFixture(), department: DEPARTEMENT_CIBLE, region: REGION_CIBLE, visibility: "DEPARTMENT" });

      expect(res.statusCode).toEqual(200);
    });

    it("laisse un référent régional faire glisser son programme vers un département réel de sa région", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_REGION, region: REGION_CIBLE });
      const programme = await createProgram({ department: "", region: REGION_CIBLE, visibility: "REGION" });

      const res = await request(await getAppHelperWithAcl(referent))
        .put(`/program/${programme._id}`)
        .send({ department: DEPARTEMENT_CIBLE, visibility: "DEPARTMENT" });

      expect(res.statusCode).toEqual(200);
      const apres = await getProgramByIdHelper(programme._id);
      expect(apres!.department).toEqual(DEPARTEMENT_CIBLE);
    });

    it("laisse un référent départemental supprimer un programme de son département", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_DEPARTMENT, department: [DEPARTEMENT_ATTAQUANT], region: REGION_ATTAQUANT });
      const programme = await createProgram({ department: DEPARTEMENT_ATTAQUANT, region: REGION_ATTAQUANT, visibility: "DEPARTMENT" });

      const res = await request(await getAppHelperWithAcl(referent)).delete(`/program/${programme._id}`);

      expect(res.statusCode).toEqual(200);
      expect(await getProgramByIdHelper(programme._id)).toBeNull();
    });

    it("laisse un référent régional supprimer un programme de sa région", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_REGION, region: REGION_ATTAQUANT });
      const programme = await createProgram({ department: "", region: REGION_ATTAQUANT, visibility: "REGION" });

      const res = await request(await getAppHelperWithAcl(referent)).delete(`/program/${programme._id}`);

      expect(res.statusCode).toEqual(200);
      expect(await getProgramByIdHelper(programme._id)).toBeNull();
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

  describe("GOO-188 — visibilité de GET /program/:id (même filtre que GET /program)", () => {
    beforeAll(async () => {
      // La route est montée avec ignorePolicy:true (cf. api/src/controllers/program.ts) : seule la
      // présence d'une permission READ sur PROGRAM pour le rôle est vérifiée par le middleware, le
      // cloisonnement géographique relève uniquement du contrôle ajouté dans le contrôleur.
      await addPermissionHelper([ROLES.HEAD_CENTER], PERMISSION_RESOURCES.PROGRAM, PERMISSION_ACTIONS.READ);
      await addPermissionHelper([ROLE_JEUNE], PERMISSION_RESOURCES.PROGRAM, PERMISSION_ACTIONS.READ);
    });

    it("refuse (404) à un référent départemental de lire par id un programme d'un autre département", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_DEPARTMENT, department: [DEPARTEMENT_ATTAQUANT], region: REGION_ATTAQUANT });
      const programme = await createProgram({ department: DEPARTEMENT_CIBLE, region: REGION_CIBLE, visibility: "DEPARTMENT" });

      const res = await request(await getAppHelperWithAcl(referent)).get(`/program/${programme._id}`);

      expect(res.statusCode).toEqual(404);
    });

    it("laisse un référent départemental lire par id un programme de son département", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_DEPARTMENT, department: [DEPARTEMENT_ATTAQUANT], region: REGION_ATTAQUANT });
      const programme = await createProgram({ department: DEPARTEMENT_ATTAQUANT, region: REGION_ATTAQUANT, visibility: "DEPARTMENT" });

      const res = await request(await getAppHelperWithAcl(referent)).get(`/program/${programme._id}`);

      expect(res.statusCode).toEqual(200);
    });

    it("refuse (404) à un référent régional de lire par id un programme d'une autre région", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_REGION, region: REGION_ATTAQUANT });
      const programme = await createProgram({ department: "", region: REGION_CIBLE, visibility: "REGION" });

      const res = await request(await getAppHelperWithAcl(referent)).get(`/program/${programme._id}`);

      expect(res.statusCode).toEqual(404);
    });

    it("laisse un référent régional lire par id un programme de sa région", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_REGION, region: REGION_ATTAQUANT });
      const programme = await createProgram({ department: "", region: REGION_ATTAQUANT, visibility: "REGION" });

      const res = await request(await getAppHelperWithAcl(referent)).get(`/program/${programme._id}`);

      expect(res.statusCode).toEqual(200);
    });

    it("laisse n'importe quel référent lire par id un programme national, hors de son département/région", async () => {
      const referent = await createReferent({ role: ROLES.REFERENT_DEPARTMENT, department: [DEPARTEMENT_ATTAQUANT], region: REGION_ATTAQUANT });
      const programme = await createProgram({ department: "", region: "", visibility: "NATIONAL" });

      const res = await request(await getAppHelperWithAcl(referent)).get(`/program/${programme._id}`);

      expect(res.statusCode).toEqual(200);
    });

    it("refuse (404) à un chef de centre de lire par id un programme de visibilité DEPARTMENT", async () => {
      const chefDeCentre = await createReferent({ role: ROLES.HEAD_CENTER });
      const programme = await createProgram({ department: DEPARTEMENT_CIBLE, region: REGION_CIBLE, visibility: "DEPARTMENT" });

      const res = await request(await getAppHelperWithAcl(chefDeCentre)).get(`/program/${programme._id}`);

      expect(res.statusCode).toEqual(404);
    });

    it("laisse un chef de centre lire par id un programme de visibilité HEAD_CENTER", async () => {
      const chefDeCentre = await createReferent({ role: ROLES.HEAD_CENTER });
      const programme = await createProgram({ department: DEPARTEMENT_CIBLE, region: REGION_CIBLE, visibility: "HEAD_CENTER" });

      const res = await request(await getAppHelperWithAcl(chefDeCentre)).get(`/program/${programme._id}`);

      expect(res.statusCode).toEqual(200);
    });

    it("refuse (404) à un volontaire de lire par id un programme d'un autre département/région", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ department: DEPARTEMENT_ATTAQUANT, region: REGION_ATTAQUANT }));
      const programme = await createProgram({ department: DEPARTEMENT_CIBLE, region: REGION_CIBLE, visibility: "DEPARTMENT" });

      const res = await request(await getAppHelperWithAcl(young, "young")).get(`/program/${programme._id}`);

      expect(res.statusCode).toEqual(404);
    });

    it("laisse un volontaire lire par id un programme de son département", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ department: DEPARTEMENT_ATTAQUANT, region: REGION_ATTAQUANT }));
      const programme = await createProgram({ department: DEPARTEMENT_ATTAQUANT, region: REGION_ATTAQUANT, visibility: "DEPARTMENT" });

      const res = await request(await getAppHelperWithAcl(young, "young")).get(`/program/${programme._id}`);

      expect(res.statusCode).toEqual(200);
    });

    it("refuse (404) à un référent départemental sans région renseignée de lire par id un programme à région elle aussi vide (relecture A)", async () => {
      // `GET /program` (liste) rejette ce profil en 400 : `validateString("")` échoue (Joi.string()
      // sans `.allow("")`), donc `errorRegion` est vrai. `isProgramVisibleToUser` doit refuser de la
      // même façon, pas comparer silencieusement "" === "" et laisser passer un programme HEAD_CENTER.
      const referent = await createReferent({ role: ROLES.REFERENT_DEPARTMENT, department: [DEPARTEMENT_ATTAQUANT], region: "" });
      const programme = await createProgram({ department: "", region: "", visibility: "HEAD_CENTER" });

      const res = await request(await getAppHelperWithAcl(referent)).get(`/program/${programme._id}`);

      expect(res.statusCode).toEqual(404);
    });
  });
});
