/**
 * GOO-11 — audit des fronts du 23/09/2026, FH6 / FH10.
 *
 * Le dossier jeune complet (notes internes, santé, pièces d'identité) était renvoyé aux
 * structures d'accueil, et les notes internes au volontaire lui-même ; seule l'interface
 * masquait ces champs. Les sérialiseurs Mongo et Elasticsearch les retirent désormais
 * selon le rôle de l'appelant.
 */
import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;

import { ROLES } from "snu-lib";

import { ApplicationModel, ReferentModel, StructureModel, YoungModel } from "../models";
import { serializeYoung } from "../utils/serializer";
import { serializeYoungs } from "../utils/es-serializer";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
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

/** Dossier portant chaque catégorie de donnée restreinte, pour rendre une fuite visible. */
const restrictedData = {
  notes: [{ phase: "PHASE_2", note: "note interne", referent: { firstName: "Réf", role: ROLES.REFERENT_DEPARTMENT } }],
  handicap: "true",
  allergies: "true",
  ppsBeneficiary: "true",
  paiBeneficiary: "true",
  medicosocialStructure: "true",
  medicosocialStructureName: "CMP",
  specificAmenagment: "true",
  specificAmenagmentType: "fauteuil",
  reducedMobilityAccess: "true",
  latestCNIFileExpirationDate: new Date("2030-01-01"),
  latestCNIFileCategory: "cniNew",
  files: { cniFiles: [{ name: "cni.pdf", category: "cniNew" }], imageRightFiles: [{ name: "droit-image.pdf" }] },
};

const HEALTH_SAMPLE = ["handicap", "allergies", "ppsBeneficiary", "paiBeneficiary", "medicosocialStructure", "medicosocialStructureName", "specificAmenagmentType"];

function expectNoHealth(payload: any) {
  expect(HEALTH_SAMPLE.filter((field) => payload?.[field] !== undefined)).toEqual([]);
}

function expectNoIdentityFiles(payload: any) {
  expect(payload?.files?.cniFiles).toBeUndefined();
  expect(payload?.latestCNIFileExpirationDate).toBeUndefined();
  expect(payload?.latestCNIFileCategory).toBeUndefined();
}

describe("GOO-11 — champs du dossier jeune selon le rôle", () => {
  describe("serializeYoung", () => {
    const young = new YoungModel({ ...getNewYoungFixture(), ...restrictedData });

    it.each([ROLES.RESPONSIBLE, ROLES.SUPERVISOR])("retire notes, santé et pièces d'identité pour %s", (role) => {
      const data = serializeYoung(young, { role });
      expect(data.notes).toBeUndefined();
      expectNoHealth(data);
      expectNoIdentityFiles(data);
      // Le reste du dossier et des pièces reste lisible.
      expect(data.firstName).toBe(young.firstName);
      expect(data.files.imageRightFiles).toHaveLength(1);
    });

    it("retire les notes internes au visiteur, sans toucher au reste", () => {
      const data = serializeYoung(young, { role: ROLES.VISITOR });
      expect(data.notes).toBeUndefined();
      expect(data.handicap).toBe("true");
      expect(data.files.cniFiles).toHaveLength(1);
    });

    it("retire les notes internes au volontaire, qui garde sa santé et ses pièces", () => {
      const data = serializeYoung(young, young);
      expect(data.notes).toBeUndefined();
      expect(data.handicap).toBe("true");
      expect(data.files.cniFiles).toHaveLength(1);
    });

    it.each([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE])("renvoie tout le dossier à %s", (role) => {
      const data = serializeYoung(young, { role });
      expect(data.notes).toHaveLength(1);
      expect(data.handicap).toBe("true");
      expect(data.files.cniFiles).toHaveLength(1);
    });

    it("masque tout sans utilisateur connu", () => {
      const data = serializeYoung(young);
      expect(data.notes).toBeUndefined();
      expectNoHealth(data);
      expectNoIdentityFiles(data);
    });
  });

  describe("serializeYoungs (Elasticsearch)", () => {
    const source = { _id: "y1", firstName: "Jeanne", password: "hash", ...restrictedData };
    const body = { hits: { hits: [{ _id: "y1", _source: source }] }, aggregations: { top: { hits: { hits: [{ _source: source }] } } } };

    it.each([ROLES.RESPONSIBLE, ROLES.SUPERVISOR])("retire notes, santé et pièces d'identité des résultats et des agrégations pour %s", (role) => {
      const out = serializeYoungs(body, { role });
      for (const doc of [out.hits.hits[0]._source, out.aggregations.top.hits.hits[0]._source]) {
        expect(doc.password).toBeUndefined();
        expect(doc.notes).toBeUndefined();
        expectNoHealth(doc);
        expectNoIdentityFiles(doc);
        expect(doc.files.imageRightFiles).toHaveLength(1);
      }
      // Le document d'origine n'est pas muté.
      expect(source.files.cniFiles).toHaveLength(1);
    });

    it("retire les notes internes d'un export aplati (allRecords) pour un visiteur", () => {
      const [doc] = serializeYoungs([source], { role: ROLES.VISITOR });
      expect(doc.notes).toBeUndefined();
      expect(doc.handicap).toBe("true");
    });

    it("garde les notes pour un référent départemental", () => {
      const [doc] = serializeYoungs([source], { role: ROLES.REFERENT_DEPARTMENT });
      expect(doc.notes).toHaveLength(1);
      expect(doc.files.cniFiles).toHaveLength(1);
    });
  });

  describe("GET /referent/young/:id", () => {
    beforeAll(async () => {
      await dbConnect(__filename.slice(__dirname.length + 1, -3));
    });
    afterAll(dbClose);
    beforeEach(async () => {
      await Promise.all([ReferentModel.deleteMany(), YoungModel.deleteMany(), StructureModel.deleteMany(), ApplicationModel.deleteMany()]);
    });
    afterEach(resetAppAuth);

    it("ne renvoie ni notes, ni santé, ni pièces d'identité au responsable de la structure", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ ...TERRITOIRE, ...restrictedData } as any));
      const structure = await createStructureHelper(getNewStructureFixture());
      const responsable = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }));
      await ApplicationModel.create({ youngId: young._id.toString(), structureId: structure._id.toString(), missionId: new ObjectId().toString() });

      const res = await request(await getAppHelperWithAcl(responsable, "referent")).get(`/referent/young/${young._id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.firstName).toBe(young.firstName);
      expect(res.body.data.notes).toBeUndefined();
      expectNoHealth(res.body.data);
      expectNoIdentityFiles(res.body.data);
    }, 30000);

    it("renvoie le dossier complet au référent départemental du territoire", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ ...TERRITOIRE, ...restrictedData } as any));
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: [TERRITOIRE.department], region: TERRITOIRE.region }));

      const res = await request(await getAppHelperWithAcl(referent, "referent")).get(`/referent/young/${young._id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes).toHaveLength(1);
      expect(res.body.data.handicap).toBe("true");
      expect(res.body.data.files.cniFiles).toHaveLength(1);
    }, 30000);
  });
});
