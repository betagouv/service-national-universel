/**
 * Une proposition de mission que le volontaire n'a pas acceptée n'ouvre rien à la structure : ni les pièces
 * de préparation militaire du volontaire, ni les pièces jointes de la candidature.
 *
 * Chaque cas refusé a son témoin positif (candidature du volontaire lui-même, ou proposition acceptée) : un
 * 403 ne prouve le périmètre que si la même requête réussit quand le lien est légitime.
 */
import request from "supertest";
import { Types } from "mongoose";

import { APPLICATION_STATUS, ROLES } from "snu-lib";

import { ApplicationModel } from "../models";
import { isYoungInMilitaryPreparationStructureScope } from "../young/youngScope";
import * as fileUtils from "../utils/file";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { createReferentHelper } from "./helpers/referent";
import { createStructureHelper } from "./helpers/structure";
import { createYoungHelper } from "./helpers/young";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewStructureFixture from "./fixtures/structure";
import getNewYoungFixture from "./fixtures/young";

const { ObjectId } = Types;

jest.setTimeout(120_000);

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  getFile: () => Promise.resolve({ Body: "" }),
  uploadFile: () => Promise.resolve({}),
}));
jest.mock("../cryptoUtils", () => ({
  ...jest.requireActual("../cryptoUtils"),
  decrypt: () => Buffer.from("test"),
  encrypt: () => Buffer.from("test"),
}));
const getMimeFromFileSpy = jest.spyOn(fileUtils, "getMimeFromFile");

const { WAITING_ACCEPTATION, WAITING_VALIDATION, REFUSED, CANCEL } = APPLICATION_STATUS;
const SANS_ACCEPTATION = [WAITING_ACCEPTATION, REFUSED, CANCEL];
const ROLES_STRUCTURE = [ROLES.RESPONSIBLE, ROLES.SUPERVISOR];
const FICHIER = "fichier.pdf";
const CLE_PM = "militaryPreparationFilesIdentity";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
}, 120_000);
afterAll(dbClose);
afterEach(resetAppAuth);

const uniqueEmail = () => `acteur-${new ObjectId().toString()}@example.org`;

/**
 * Une structure de préparation militaire dans le réseau d'une tête de réseau, son responsable, le
 * superviseur de la tête de réseau, et un volontaire.
 */
async function createScenario() {
  const tete = await createStructureHelper({ ...getNewStructureFixture(), name: `Réseau ${new ObjectId().toString()}`, isMilitaryPreparation: "false" });
  const structure = await createStructureHelper({
    ...getNewStructureFixture(),
    name: `Structure PM ${new ObjectId().toString()}`,
    isMilitaryPreparation: "true",
    isNetwork: "false",
    networkId: tete._id.toString(),
  });
  const responsable = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), email: uniqueEmail() }));
  const superviseur = await createReferentHelper(getNewReferentFixture({ role: ROLES.SUPERVISOR, structureId: tete._id.toString(), email: uniqueEmail() }));
  const young = await createYoungHelper(getNewYoungFixture());
  const acteurs = { [ROLES.RESPONSIBLE]: responsable, [ROLES.SUPERVISOR]: superviseur } as Record<string, any>;
  return { structure, young, acteurs };
}
type Scenario = Awaited<ReturnType<typeof createScenario>>;

/** Une candidature du volontaire à la structure, avec une pièce jointe : par défaut une proposition, amenée au statut demandé sans acceptation. */
async function createApplicationFor(s: Scenario, status: string, { proposition = true } = {}) {
  const application = await ApplicationModel.create({
    youngId: s.young._id.toString(),
    youngFirstName: s.young.firstName,
    youngLastName: s.young.lastName,
    youngEmail: s.young.email,
    missionId: new ObjectId().toString(),
    structureId: s.structure._id.toString(),
    tutorId: new ObjectId().toString(),
    missionDuration: "84",
    justificatifsFiles: [FICHIER],
    status: proposition ? WAITING_ACCEPTATION : status,
  });
  if (proposition && status !== WAITING_ACCEPTATION) {
    application.set({ status });
    await application.save({ fromUser: { firstName: "[TEST] sortie de proposition" } });
  }
  return application;
}

/** Le volontaire accepte la proposition : elle devient une candidature ordinaire. */
async function accept(application: any) {
  application.set({ status: WAITING_VALIDATION });
  await application.save({ fromUser: { firstName: "[TEST] acceptation" } });
}

describe("pièces de préparation militaire d'un volontaire (périmètre de la structure PM)", () => {
  describe.each(SANS_ACCEPTATION)("proposition au statut %s", (statut) => {
    it.each(ROLES_STRUCTURE)(
      "isYoungInMilitaryPreparationStructureScope (%s) : le volontaire est hors périmètre, puis dans le périmètre une fois la proposition acceptée",
      async (role) => {
        const s = await createScenario();
        const application = await createApplicationFor(s, statut);

        expect(await isYoungInMilitaryPreparationStructureScope(s.acteurs[role], s.young)).toBe(false);

        await accept(application);
        expect(await isYoungInMilitaryPreparationStructureScope(s.acteurs[role], s.young)).toBe(true);
      },
    );

    it.each(ROLES_STRUCTURE)("GET /referent/youngFile/:id/military-preparation/:key/:file (%s) : 403, puis 200 une fois la proposition acceptée", async (role) => {
      const s = await createScenario();
      const application = await createApplicationFor(s, statut);
      const url = `/referent/youngFile/${s.young._id}/military-preparation/${CLE_PM}/cni.pdf`;

      const refus = await request(await getAppHelperWithAcl(s.acteurs[role], "referent")).get(url);
      expect(refus.status).toBe(403);

      await accept(application);
      const accepte = await request(await getAppHelperWithAcl(s.acteurs[role], "referent")).get(url);
      expect(accepte.status).toBe(200);
    });

    it.each(ROLES_STRUCTURE)("GET /referent/youngFile/:id/:key/:file (%s) : pièce de préparation militaire refusée, puis servie une fois la proposition acceptée", async (role) => {
      const s = await createScenario();
      const application = await createApplicationFor(s, statut);
      const url = `/referent/youngFile/${s.young._id}/${CLE_PM}/piece.pdf`;

      const refus = await request(await getAppHelperWithAcl(s.acteurs[role], "referent")).get(url);
      expect(refus.status).toBe(403);

      await accept(application);
      const accepte = await request(await getAppHelperWithAcl(s.acteurs[role], "referent")).get(url);
      expect(accepte.status).toBe(200);
    });
  });

  it.each(ROLES_STRUCTURE)("une candidature du volontaire lui-même, même refusée ou annulée, garde le périmètre (%s)", async (role) => {
    const s = await createScenario();
    await createApplicationFor(s, REFUSED, { proposition: false });
    const url = `/referent/youngFile/${s.young._id}/military-preparation/${CLE_PM}/cni.pdf`;

    expect(await isYoungInMilitaryPreparationStructureScope(s.acteurs[role], s.young)).toBe(true);
    expect((await request(await getAppHelperWithAcl(s.acteurs[role], "referent")).get(url)).status).toBe(200);
  });

  it.each(ROLES_STRUCTURE)("une proposition n'ouvre rien même quand le volontaire a une candidature dans une autre structure de préparation militaire (%s)", async (role) => {
    const s = await createScenario();
    const autreStructure = await createStructureHelper({ ...getNewStructureFixture(), name: `Autre PM ${new ObjectId().toString()}`, isMilitaryPreparation: "true" });
    await createApplicationFor(s, CANCEL);
    await ApplicationModel.create({
      youngId: s.young._id.toString(),
      missionId: new ObjectId().toString(),
      structureId: autreStructure._id.toString(),
      status: WAITING_VALIDATION,
    });

    expect(await isYoungInMilitaryPreparationStructureScope(s.acteurs[role], s.young)).toBe(false);
  });
});

describe("pièces jointes d'une candidature (périmètre de la structure)", () => {
  describe.each(SANS_ACCEPTATION)("proposition au statut %s", (statut) => {
    it.each(ROLES_STRUCTURE)("GET /application/:id/file/:key/:name (%s) : 403 sur la proposition, 200 une fois acceptée", async (role) => {
      const s = await createScenario();
      const application = await createApplicationFor(s, statut);
      const url = `/application/${application._id}/file/justificatifsFiles/${FICHIER}`;

      const refus = await request(await getAppHelperWithAcl(s.acteurs[role], "referent")).get(url);
      expect(refus.status).toBe(403);

      await accept(application);
      const accepte = await request(await getAppHelperWithAcl(s.acteurs[role], "referent")).get(url);
      expect(accepte.status).toBe(200);
    });

    it.each(ROLES_STRUCTURE)("POST /application/:id/file/:key (%s) : 403 sur la proposition, 200 une fois acceptée", async (role) => {
      const s = await createScenario();
      const application = await createApplicationFor(s, statut);
      const deposer = async () =>
        request(await getAppHelperWithAcl(s.acteurs[role], "referent"))
          .post(`/application/${application._id}/file/justificatifsFiles`)
          .field("body", JSON.stringify({ names: ["justificatif.jpeg"] }))
          .attach("file", Buffer.from("contenu"), { filename: "justificatif.jpeg" });

      const refus = await deposer();
      expect(refus.status).toBe(403);
      expect((await ApplicationModel.findById(application._id))!.justificatifsFiles).toEqual([FICHIER]);

      await accept(application);
      getMimeFromFileSpy.mockResolvedValueOnce("image/jpeg");
      const accepte = await deposer();
      expect(accepte.status).toBe(200);
      expect((await ApplicationModel.findById(application._id))!.justificatifsFiles).toContain("justificatif.jpeg");
    });

    it("le volontaire garde l'accès aux pièces de sa propre proposition", async () => {
      const s = await createScenario();
      const application = await createApplicationFor(s, statut);

      const lecture = await request(await getAppHelperWithAcl(s.young, "young")).get(`/application/${application._id}/file/justificatifsFiles/${FICHIER}`);
      expect(lecture.status).toBe(200);
    });
  });

  it.each(ROLES_STRUCTURE)("la structure (%s) garde les pièces d'une candidature du volontaire lui-même, même refusée", async (role) => {
    const s = await createScenario();
    const application = await createApplicationFor(s, REFUSED, { proposition: false });

    const res = await request(await getAppHelperWithAcl(s.acteurs[role], "referent")).get(`/application/${application._id}/file/justificatifsFiles/${FICHIER}`);

    expect(res.status).toBe(200);
  });
});
