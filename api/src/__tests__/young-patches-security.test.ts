import request from "supertest";
import mongoose from "mongoose";

import { ROLES, YOUNG_SOURCE, PERMISSION_RESOURCES, PERMISSION_ACTIONS } from "snu-lib";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { createYoungHelper } from "./helpers/young";
import getNewYoungFixture from "./fixtures/young";
import { createReferentHelper } from "./helpers/referent";
import { getNewReferentFixture } from "./fixtures/referent";
import { createClasse } from "./helpers/classe";
import { createFixtureClasse } from "./fixtures/classe";
import { createFixtureEtablissement } from "./fixtures/etablissement";
import { addPermissionHelper } from "./helpers/permissions";
import { EtablissementModel } from "../models";
import { PermissionModel } from "../models/permissions/permission";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: () => Promise.resolve(),
  sendEmail: () => Promise.resolve(),
  sync: () => Promise.resolve(),
  unsync: () => Promise.resolve(),
}));

const DEP_CIBLE = "Yvelines";
const REGION_CIBLE = "Île-de-France";
const DEP_ATTAQUANT = "Guyane";
const REGION_ATTAQUANT = "Guyane";

const TOKEN_PARENT1 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1";
const TOKEN_PARENT1_BIS = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa2";
const TOKEN_PARENT2 = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb1";
const TOKEN_EMAIL = "ccccccccccccccccccccccccccccccccccccccc1";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await PermissionModel.deleteMany({});
  // Même seed qu'en production (migration 20250624122150) : USER_HISTORY:READ sans policy.
  await addPermissionHelper(
    [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.TRANSPORTER, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE],
    PERMISSION_RESOURCES.USER_HISTORY,
    PERMISSION_ACTIONS.READ,
  );
  await addPermissionHelper([ROLES.ADMIN, ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE], PERMISSION_RESOURCES.PATCH, PERMISSION_ACTIONS.READ);
});
afterAll(dbClose);
afterEach(resetAppAuth);

/** Jeune du périmètre ciblé, dont l'historique porte les jetons parents et de validation d'email. */
async function createYoungWithTokens(overrides: Record<string, any> = {}) {
  const young = await createYoungHelper(
    getNewYoungFixture({
      department: DEP_CIBLE,
      region: REGION_CIBLE,
      parent1Inscription2023Token: TOKEN_PARENT1,
      tokenEmailValidation: TOKEN_EMAIL,
      ...overrides,
    } as any),
  );
  // Renouvellement des jetons : l'ancienne comme la nouvelle valeur finissent dans l'historique.
  young.set({ parent1Inscription2023Token: TOKEN_PARENT1_BIS, parent2Inscription2023Token: TOKEN_PARENT2, firstName: "NOUVEAU PRENOM" });
  await young.save();
  return young;
}

function tokensDansLaReponse(body: any): string[] {
  const dump = JSON.stringify(body);
  return [TOKEN_PARENT1, TOKEN_PARENT1_BIS, TOKEN_PARENT2, TOKEN_EMAIL].filter((token) => dump.includes(token));
}

describe("H56 — historique d'un jeune : jetons et périmètre", () => {
  describe("Les jetons ne doivent pas être enregistrés dans l'historique", () => {
    it("young_patches ne contient aucune opération sur un champ jeton", async () => {
      const young = await createYoungWithTokens();

      const patches = await mongoose.connection.db.collection("young_patches").find({ ref: young._id }).toArray();
      const opsJetons = patches.flatMap((patch: any) => patch.ops).filter((op: any) => /token/i.test(op.path));

      expect(opsJetons).toEqual([]);
    });
  });

  describe("Les jetons ne doivent pas être renvoyés par l'API", () => {
    it("GET /young/:id/patches ne renvoie aucun jeton (admin)", async () => {
      const young = await createYoungWithTokens();

      const res = await request(await getAppHelperWithAcl())
        .get(`/young/${young._id}/patches`)
        .send();

      expect(res.statusCode).toEqual(200);
      expect(tokensDansLaReponse(res.body)).toEqual([]);
      // l'historique métier reste lisible
      expect(JSON.stringify(res.body)).toContain("NOUVEAU PRENOM");
    });

    it("GET /young/:id/patches ne renvoie pas les jetons déjà stockés avant le correctif", async () => {
      const young = await createYoungWithTokens();
      await mongoose.connection.db.collection("young_patches").insertOne({
        ops: [
          { op: "add", path: "/parent1Inscription2023Token", value: TOKEN_PARENT1 },
          { op: "replace", path: "/tokenEmailValidation", value: TOKEN_EMAIL, originalValue: TOKEN_EMAIL },
          { op: "replace", path: "/firstName", value: "ANCIEN PRENOM" },
        ],
        ref: young._id,
        modelName: "young",
        date: new Date(),
        __v: 0,
      } as any);

      const res = await request(await getAppHelperWithAcl())
        .get(`/young/${young._id}/patches`)
        .send();

      expect(res.statusCode).toEqual(200);
      expect(tokensDansLaReponse(res.body)).toEqual([]);
      expect(JSON.stringify(res.body)).toContain("ANCIEN PRENOM");
    });

    it("GET /cle/young/by-classe-historic/:idClasse/patches/old-student ne renvoie aucun jeton", async () => {
      const etablissement = await EtablissementModel.create(createFixtureEtablissement());
      const classeQuittee = await createClasse(createFixtureClasse({ etablissementId: etablissement._id.toString(), referentClasseIds: [] }));
      const nouvelleClasse = await createClasse(createFixtureClasse({ etablissementId: etablissement._id.toString(), referentClasseIds: [] }));
      const young = await createYoungWithTokens({ source: YOUNG_SOURCE.CLE, classeId: classeQuittee._id.toString(), etablissementId: etablissement._id.toString() });
      young.set({ classeId: nouvelleClasse._id.toString() });
      await young.save();

      const res = await request(await getAppHelperWithAcl())
        .get(`/cle/young/by-classe-historic/${classeQuittee._id}/patches/old-student`)
        .send();

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(tokensDansLaReponse(res.body)).toEqual([]);
    });

    it("GET /cle/young/by-classe-historic/:idClasse/patches ne renvoie aucun jeton", async () => {
      const etablissement = await EtablissementModel.create(createFixtureEtablissement());
      const referentClasse = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE }));
      const classe = await createClasse(createFixtureClasse({ etablissementId: etablissement._id.toString(), referentClasseIds: [referentClasse._id.toString()] }));
      await createYoungWithTokens({ source: YOUNG_SOURCE.CLE, classeId: classe._id.toString(), etablissementId: etablissement._id.toString() });

      const res = await request(await getAppHelperWithAcl(referentClasse))
        .get(`/cle/young/by-classe-historic/${classe._id}/patches`)
        .send();

      expect(res.statusCode).toEqual(200);
      expect(tokensDansLaReponse(res.body)).toEqual([]);
    });
  });

  describe("Purge des jetons déjà enregistrés (migration H56)", () => {
    it("retire les opérations sur un jeton et conserve le reste de l'historique", async () => {
      const young = await createYoungWithTokens();
      const collection = mongoose.connection.db.collection("young_patches");
      await collection.insertMany([
        // patch qui ne porte qu'un jeton : il n'a plus rien à afficher après purge
        { ops: [{ op: "add", path: "/parent1Inscription2023Token", value: TOKEN_PARENT1 }], ref: young._id, modelName: "young", date: new Date(), __v: 0 },
        // patch mixte : seule l'opération sur le jeton disparaît
        {
          ops: [
            { op: "replace", path: "/tokenEmailValidation", value: TOKEN_EMAIL, originalValue: TOKEN_EMAIL },
            { op: "replace", path: "/firstName", value: "ANCIEN PRENOM" },
          ],
          ref: young._id,
          modelName: "young",
          date: new Date(),
          __v: 0,
        },
      ] as any);

      const migration = require("../../migrations/20260922103000-h56-purge-jetons-historique.js");
      await migration.up();

      const restants = await collection.find({ ref: young._id }).toArray();
      const ops = restants.flatMap((patch: any) => patch.ops);
      expect(ops.filter((op: any) => /token/i.test(op.path))).toEqual([]);
      expect(JSON.stringify(restants)).not.toContain(TOKEN_PARENT1);
      expect(JSON.stringify(restants)).not.toContain(TOKEN_EMAIL);
      expect(ops).toEqual(expect.arrayContaining([expect.objectContaining({ path: "/firstName", value: "ANCIEN PRENOM" })]));
      expect(restants.every((patch: any) => patch.ops.length > 0)).toBe(true);
    });
  });

  describe("L'historique d'un jeune doit rester dans le périmètre de l'appelant", () => {
    it("refuse un référent départemental hors du département du jeune", async () => {
      const young = await createYoungWithTokens();
      const attaquant = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: [DEP_ATTAQUANT], region: REGION_ATTAQUANT }));

      const res = await request(await getAppHelperWithAcl(attaquant))
        .get(`/young/${young._id}/patches`)
        .send();

      expect(res.statusCode).toEqual(403);
    });

    it("autorise un référent départemental du département du jeune", async () => {
      const young = await createYoungWithTokens();
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: [DEP_CIBLE], region: REGION_CIBLE }));

      const res = await request(await getAppHelperWithAcl(referent))
        .get(`/young/${young._id}/patches`)
        .send();

      expect(res.statusCode).toEqual(200);
    });

    it("refuse un référent de classe d'un autre établissement", async () => {
      const etablissement = await EtablissementModel.create(createFixtureEtablissement());
      const classe = await createClasse(createFixtureClasse({ etablissementId: etablissement._id.toString(), referentClasseIds: [] }));
      const young = await createYoungWithTokens({ source: YOUNG_SOURCE.CLE, classeId: classe._id.toString(), etablissementId: etablissement._id.toString() });
      const attaquant = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE }));

      const res = await request(await getAppHelperWithAcl(attaquant))
        .get(`/young/${young._id}/patches`)
        .send();

      expect(res.statusCode).toEqual(403);
    });

    it("autorise un référent de sa propre classe", async () => {
      const etablissement = await EtablissementModel.create(createFixtureEtablissement());
      const referentClasse = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE }));
      const classe = await createClasse(createFixtureClasse({ etablissementId: etablissement._id.toString(), referentClasseIds: [referentClasse._id.toString()] }));
      const young = await createYoungWithTokens({ source: YOUNG_SOURCE.CLE, classeId: classe._id.toString(), etablissementId: etablissement._id.toString() });

      const res = await request(await getAppHelperWithAcl(referentClasse))
        .get(`/young/${young._id}/patches`)
        .send();

      expect(res.statusCode).toEqual(200);
    });

    it("autorise un administrateur national", async () => {
      const young = await createYoungWithTokens();

      const res = await request(await getAppHelperWithAcl())
        .get(`/young/${young._id}/patches`)
        .send();

      expect(res.statusCode).toEqual(200);
    });
  });
});
