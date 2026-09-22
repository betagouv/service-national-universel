/**
 * Reproduction des constats de l'audit sécurité du 21/09/2026 sur le téléchargement des pièces
 * d'un volontaire depuis le contrôleur référent.
 *
 * H65 GET /referent/youngFile/:youngId/:key/:fileName
 *     Pour RESPONSIBLE / SUPERVISOR, la route appelle `canViewYoungFile(actor, young, saPropreStructure)`.
 *     Les deux seules branches atteignables comparent l'acteur à SA PROPRE structure
 *     (`actor.region === structure.region`, `actor.department === structure.department`) : le volontaire
 *     n'intervient jamais. Le vrai contrôle (candidature dans la structure) est resté en commentaire.
 *
 * H66 GET /referent/youngFile/:youngId/military-preparation/:key/:fileName
 *     Le repli sur `structure.isMilitaryPreparation === "true"` ne teste que la structure de l'acteur,
 *     sans aucun lien avec le volontaire.
 */
import request from "supertest";

import { ROLES } from "snu-lib";

import { ReferentModel, YoungModel, StructureModel, ApplicationModel } from "../models";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import getNewYoungFixture from "./fixtures/young";
import getNewStructureFixture from "./fixtures/structure";
import { getNewApplicationFixture } from "./fixtures/application";
import { createYoungHelper } from "./helpers/young";
import { createStructureHelper } from "./helpers/structure";
import { createApplication } from "./helpers/application";

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  getFile: () => Promise.resolve({ Body: "" }),
  uploadFile: (path, file) => Promise.resolve({ path, file }),
}));

jest.mock("../cryptoUtils", () => ({
  ...jest.requireActual("../cryptoUtils"),
  decrypt: () => Buffer.from("test"),
  encrypt: () => Buffer.from("test"),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
beforeEach(async () => {
  await ReferentModel.deleteMany();
  await YoungModel.deleteMany();
  await StructureModel.deleteMany();
  await ApplicationModel.deleteMany();
});
afterEach(resetAppAuth);

/** Un volontaire sans aucun lien avec la structure de l'acteur. */
async function createUnrelatedYoung() {
  return createYoungHelper(getNewYoungFixture({ region: "Bretagne", department: "Finistère" } as any));
}

describe("Sécurité — téléchargement des pièces d'un volontaire (audit 2026-09-21)", () => {
  describe("H65 — GET /referent/youngFile/:youngId/:key/:fileName", () => {
    it("refuse un responsable dont le compte porte encore la région de sa structure, sur un volontaire hors périmètre", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(),  region: "Grand Est", department: "Bas-Rhin"  });
      // Compte historique : `cleanReferentData` n'a jamais tourné dessus, `region` est toujours renseignée.
      const actor = { role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), region: "Grand Est", department: ["Bas-Rhin"] };
      const young = await createUnrelatedYoung();

      const res = await request(await getAppHelperWithAcl(actor as any))
        .get(`/referent/youngFile/${young._id}/cniFiles/cni.pdf`)
        .send();

      expect(res.statusCode).toEqual(403);
    });

    it("refuse un responsable au compte nettoyé lorsque sa structure n'a ni région ni département (undefined === undefined)", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(),  region: undefined, department: undefined  });
      // Compte récent : `cleanReferentData` a retiré `region` et `department`.
      const actor = { role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), region: undefined, department: undefined };
      const young = await createUnrelatedYoung();

      const res = await request(await getAppHelperWithAcl(actor as any))
        .get(`/referent/youngFile/${young._id}/cniFiles/cni.pdf`)
        .send();

      expect(res.statusCode).toEqual(403);
    });

    it("refuse un superviseur hors périmètre", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(),  region: "Grand Est", department: "Bas-Rhin"  });
      const actor = { role: ROLES.SUPERVISOR, structureId: structure._id.toString(), region: "Grand Est", department: ["Bas-Rhin"] };
      const young = await createUnrelatedYoung();

      const res = await request(await getAppHelperWithAcl(actor as any))
        .get(`/referent/youngFile/${young._id}/cniFiles/cni.pdf`)
        .send();

      expect(res.statusCode).toEqual(403);
    });

    it("autorise un responsable sur un volontaire ayant candidaté dans sa structure", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(),  region: "Grand Est", department: "Bas-Rhin"  });
      const actor = { role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), region: "Grand Est", department: ["Bas-Rhin"] };
      const young = await createUnrelatedYoung();
      await createApplication({ ...getNewApplicationFixture(), youngId: young._id.toString(), structureId: structure._id.toString() });

      const res = await request(await getAppHelperWithAcl(actor as any))
        .get(`/referent/youngFile/${young._id}/cniFiles/cni.pdf`)
        .send();

      expect(res.statusCode).toEqual(200);
    });

    it("autorise un superviseur sur un volontaire ayant candidaté dans une structure de son réseau", async () => {
      const head = await createStructureHelper({ ...getNewStructureFixture(),  region: "Grand Est", department: "Bas-Rhin"  });
      const child = await createStructureHelper({ ...getNewStructureFixture(),  networkId: head._id.toString(), region: "Grand Est", department: "Bas-Rhin"  });
      const actor = { role: ROLES.SUPERVISOR, structureId: head._id.toString(), region: "Grand Est", department: ["Bas-Rhin"] };
      const young = await createUnrelatedYoung();
      await createApplication({ ...getNewApplicationFixture(), youngId: young._id.toString(), structureId: child._id.toString() });

      const res = await request(await getAppHelperWithAcl(actor as any))
        .get(`/referent/youngFile/${young._id}/cniFiles/cni.pdf`)
        .send();

      expect(res.statusCode).toEqual(200);
    });
  });

  describe("H66 — GET /referent/youngFile/:youngId/military-preparation/:key/:fileName", () => {
    it("refuse un responsable de structure de préparation militaire sur un volontaire hors périmètre", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(),  isMilitaryPreparation: "true", region: "Grand Est", department: "Bas-Rhin"  });
      const actor = { role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), region: "Grand Est", department: ["Bas-Rhin"] };
      const young = await createUnrelatedYoung();

      const res = await request(await getAppHelperWithAcl(actor as any))
        .get(`/referent/youngFile/${young._id}/military-preparation/militaryPreparationFilesIdentity/cni.pdf`)
        .send();

      expect(res.statusCode).toEqual(403);
    });

    it("refuse un responsable de structure NON préparation militaire sur un volontaire hors périmètre", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(),  isMilitaryPreparation: "false", region: "Grand Est", department: "Bas-Rhin"  });
      const actor = { role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), region: "Grand Est", department: ["Bas-Rhin"] };
      const young = await createUnrelatedYoung();

      const res = await request(await getAppHelperWithAcl(actor as any))
        .get(`/referent/youngFile/${young._id}/military-preparation/militaryPreparationFilesIdentity/cni.pdf`)
        .send();

      expect(res.statusCode).toEqual(403);
    });

    it("autorise un responsable de structure de préparation militaire sur un volontaire ayant candidaté chez lui", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(),  isMilitaryPreparation: "true", region: "Grand Est", department: "Bas-Rhin"  });
      const actor = { role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), region: "Grand Est", department: ["Bas-Rhin"] };
      const young = await createUnrelatedYoung();
      await createApplication({ ...getNewApplicationFixture(), youngId: young._id.toString(), structureId: structure._id.toString() });

      const res = await request(await getAppHelperWithAcl(actor as any))
        .get(`/referent/youngFile/${young._id}/military-preparation/militaryPreparationFilesIdentity/cni.pdf`)
        .send();

      expect(res.statusCode).toEqual(200);
    });

    it("refuse un volontaire inexistant au lieu de renvoyer une pièce", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(),  isMilitaryPreparation: "true"  });
      const actor = { role: ROLES.RESPONSIBLE, structureId: structure._id.toString() };

      const res = await request(await getAppHelperWithAcl(actor as any))
        .get(`/referent/youngFile/104a49ba503040e4d2153973/military-preparation/militaryPreparationFilesIdentity/cni.pdf`)
        .send();

      expect(res.statusCode).toEqual(404);
    });
  });

  /**
   * Même racine que H65 : `canViewYoungFile` comparait `actor.department` / `actor.region` aux champs
   * du centre sans exiger de valeur. Appelée sans `targetCenter`, elle autorisait tout compte dont
   * `cleanReferentData` a retiré la géographie (responsable, superviseur, chef de centre…).
   */
  describe("canViewYoungFile — un compte sans géographie ne doit plus passer par `undefined === undefined`", () => {
    it("refuse le dépôt d'une pièce d'équivalence par un responsable sur un volontaire quelconque", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), region: "Grand Est", department: "Bas-Rhin" });
      const actor = { role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), region: undefined, department: undefined };
      const young = await createUnrelatedYoung();

      const res = await request(await getAppHelperWithAcl(actor as any))
        .post("/referent/file/equivalenceFiles")
        .send({ body: JSON.stringify({ youngId: young._id.toString(), names: ["justificatif.pdf"] }) });

      expect(res.statusCode).toEqual(403);
    });

    it("refuse la suppression d'une pièce de préparation militaire par un responsable sur un volontaire quelconque", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), region: "Grand Est", department: "Bas-Rhin" });
      const actor = { role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), region: undefined, department: undefined };
      const young = await createUnrelatedYoung();

      const res = await request(await getAppHelperWithAcl(actor as any))
        .put(`/referent/young/${young._id}/removeMilitaryFile/militaryPreparationFilesIdentity`)
        .send({ filesList: [] });

      expect(res.statusCode).toEqual(403);
    });

    it("laisse passer un référent régional sur un volontaire de sa région", async () => {
      const young = await createUnrelatedYoung();
      const actor = { role: ROLES.REFERENT_REGION, region: young.region, department: [young.department] };

      const res = await request(await getAppHelperWithAcl(actor as any))
        .put(`/referent/young/${young._id}/removeMilitaryFile/militaryPreparationFilesIdentity`)
        .send({ filesList: [] });

      expect(res.statusCode).toEqual(200);
    });
  });
});
