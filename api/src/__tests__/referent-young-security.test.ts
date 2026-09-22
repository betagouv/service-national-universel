/**
 * Reproduction des constats de l'audit sécurité du 21/09/2026 — lot A1
 * « Dossier volontaire côté référent ».
 *
 * H63 PUT /referent/youngs                                     : validation/refus en masse sans contrôle de classe
 * H64 POST /referent/young/:id/refuse-military-preparation-files : tout RESPONSIBLE et tout REFERENT_REGION,
 *     sans lien avec le volontaire, peuvent refuser (et supprimer) ses pièces de préparation militaire
 * L23 PUT /young/update_phase3/:young                          : `canEditYoung` seul, sans rattachement réel
 */
import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;

import { ROLES, YOUNG_SOURCE, YOUNG_STATUS } from "snu-lib";

import { ApplicationModel, ClasseModel, EtablissementModel, ReferentModel, StructureModel, YoungModel } from "../models";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import getNewStructureFixture from "./fixtures/structure";
import { createFixtureClasse } from "./fixtures/classe";
import { createFixtureEtablissement } from "./fixtures/etablissement";
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
const AUTRE_TERRITOIRE = { department: "Doubs", region: "Bourgogne-Franche-Comté" };

/** Volontaire CLE rattaché à une classe dont `referentClasseIds` est fourni. */
async function createYoungInClasse(referentClasseIds: string[], fields: Record<string, any> = {}) {
  const etablissement = await EtablissementModel.create(createFixtureEtablissement());
  const classe = await ClasseModel.create(createFixtureClasse({ etablissementId: etablissement._id.toString(), referentClasseIds }));
  const young = await createYoungHelper(
    getNewYoungFixture({
      ...TERRITOIRE,
      source: YOUNG_SOURCE.CLE,
      classeId: classe._id.toString(),
      etablissementId: etablissement._id.toString(),
      status: YOUNG_STATUS.WAITING_VALIDATION,
      ...fields,
    } as any),
  );
  return { young, classe, etablissement };
}

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
beforeEach(async () => {
  await Promise.all([
    ReferentModel.deleteMany(),
    YoungModel.deleteMany(),
    StructureModel.deleteMany(),
    ApplicationModel.deleteMany(),
    ClasseModel.deleteMany(),
    EtablissementModel.deleteMany(),
  ]);
  jest.clearAllMocks();
});
afterEach(resetAppAuth);

describe("Sécurité dossier volontaire côté référent — audit 2026-09-21 (lot A1)", () => {
  describe("H64 — POST /referent/young/:id/refuse-military-preparation-files", () => {
    it("refuse à un responsable de structure le rejet des pièces de préparation militaire", async () => {
      const victime = await createYoungHelper(getNewYoungFixture({ ...TERRITOIRE, statusMilitaryPreparationFiles: "WAITING_VERIFICATION" } as any));
      const structure = await createStructureHelper(getNewStructureFixture());
      const attaquant = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }));

      const res = await request(await getAppHelperWithAcl(attaquant, "referent")).post(`/referent/young/${victime._id}/refuse-military-preparation-files`);

      expect(res.status).toBe(403);
      expect((await YoungModel.findById(victime._id))?.statusMilitaryPreparationFiles).toBe("WAITING_VERIFICATION");
    }, 30000);

    it("refuse à un référent régional d'une autre région le rejet des pièces", async () => {
      const victime = await createYoungHelper(getNewYoungFixture({ ...TERRITOIRE, statusMilitaryPreparationFiles: "WAITING_VERIFICATION" } as any));
      const attaquant = await createReferentHelper(
        getNewReferentFixture({ role: ROLES.REFERENT_REGION, region: AUTRE_TERRITOIRE.region, department: [AUTRE_TERRITOIRE.department] }),
      );

      const res = await request(await getAppHelperWithAcl(attaquant, "referent")).post(`/referent/young/${victime._id}/refuse-military-preparation-files`);

      expect(res.status).toBe(403);
      expect((await YoungModel.findById(victime._id))?.statusMilitaryPreparationFiles).toBe("WAITING_VERIFICATION");
    }, 30000);

    it("autorise le référent régional de la région du volontaire", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ ...TERRITOIRE, statusMilitaryPreparationFiles: "WAITING_VERIFICATION" } as any));
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_REGION, region: TERRITOIRE.region, department: [TERRITOIRE.department] }));

      const res = await request(await getAppHelperWithAcl(referent, "referent")).post(`/referent/young/${young._id}/refuse-military-preparation-files`);

      expect(res.status).toBe(200);
      expect((await YoungModel.findById(young._id))?.statusMilitaryPreparationFiles).toBe("REFUSED");
    }, 30000);
  });

  describe("H63 — PUT /referent/youngs", () => {
    it("refuse à un référent de classe le refus en masse de volontaires d'une autre classe", async () => {
      const { young: victime } = await createYoungInClasse([new ObjectId().toString()]);
      const attaquant = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE }));

      const res = await request(await getAppHelperWithAcl(attaquant, "referent"))
        .put("/referent/youngs")
        .send({ youngIds: [victime._id.toString()], status: YOUNG_STATUS.REFUSED });

      expect(res.status).toBe(403);
      expect((await YoungModel.findById(victime._id))?.status).toBe(YOUNG_STATUS.WAITING_VALIDATION);
    }, 30000);

    it("autorise le référent de la classe du volontaire", async () => {
      const attaquant = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE }));
      const { young } = await createYoungInClasse([attaquant._id.toString()]);

      const res = await request(await getAppHelperWithAcl(attaquant, "referent"))
        .put("/referent/youngs")
        .send({ youngIds: [young._id.toString()], status: YOUNG_STATUS.REFUSED });

      expect(res.status).toBe(200);
      expect((await YoungModel.findById(young._id))?.status).toBe(YOUNG_STATUS.REFUSED);
    }, 30000);
  });

  describe("L23 — PUT /young/update_phase3/:young", () => {
    const payload = {
      phase3StructureName: "Structure",
      phase3MissionDescription: "Mission",
      phase3TutorFirstName: "Jean",
      phase3TutorLastName: "Valjean",
      phase3TutorEmail: "tuteur@example.org",
      phase3TutorPhone: "0102030405",
    };

    it("refuse à un référent de classe la mise à jour de la phase 3 d'un volontaire d'une autre classe", async () => {
      const { young: victime } = await createYoungInClasse([new ObjectId().toString()]);
      const attaquant = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE }));

      const res = await request(await getAppHelperWithAcl(attaquant, "referent"))
        .put(`/young/update_phase3/${victime._id}`)
        .send(payload);

      expect(res.status).toBe(403);
      expect((await YoungModel.findById(victime._id))?.phase3TutorEmail).not.toBe(payload.phase3TutorEmail);
    }, 30000);

    it("autorise le référent de la classe du volontaire", async () => {
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE }));
      const { young } = await createYoungInClasse([referent._id.toString()]);

      const res = await request(await getAppHelperWithAcl(referent, "referent"))
        .put(`/young/update_phase3/${young._id}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect((await YoungModel.findById(young._id))?.phase3TutorEmail).toBe(payload.phase3TutorEmail);
    }, 30000);
  });
});
