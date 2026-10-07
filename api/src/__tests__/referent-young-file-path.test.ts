/**
 * Invariant : la clé et le nom de fichier d'une pièce de volontaire désignent chacun UN niveau de
 * l'arborescence, et la clé appartient à la liste des pièces connues. Le chemin d'objet lu ou écrit
 * est construit à partir de ces seuls segments ; Express décode `%2F` en `/` dans `req.params`, la
 * validation porte donc sur la valeur décodée.
 *
 * - GET  /referent/youngFile/:youngId/:key/:fileName
 * - GET  /referent/youngFile/:youngId/military-preparation/:key/:fileName
 * - POST /referent/file/:key
 *
 * Le contrôle de périmètre est évalué APRÈS la validation : un refus de validation n'appelle jamais
 * le stockage, quel que soit l'acteur.
 *
 * Même invariant pour les noms de pièces STOCKÉS sur le dossier du volontaire : un nom relu en base
 * n'est passé à la suppression que s'il désigne un seul niveau de l'arborescence.
 *
 * - POST /referent/young/:id/refuse-military-preparation-files
 */
import request from "supertest";

import { FILE_KEYS, MILITARY_FILE_KEYS, ROLES } from "snu-lib";

import { logger } from "../logger";
import { ApplicationModel, ReferentModel, StructureModel, YoungModel } from "../models";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import getNewYoungFixture from "./fixtures/young";
import getNewStructureFixture from "./fixtures/structure";
import getNewReferentFixture from "./fixtures/referent";
import { getNewApplicationFixture } from "./fixtures/application";
import { createYoungHelper } from "./helpers/young";
import { createStructureHelper } from "./helpers/structure";
import { createReferentHelper } from "./helpers/referent";
import { createApplication } from "./helpers/application";

const mockGetFile = jest.fn();
const mockUploadFile = jest.fn();
const mockDeleteFile = jest.fn();

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  getFile: (...args: unknown[]) => mockGetFile(...args),
  uploadFile: (...args: unknown[]) => mockUploadFile(...args),
  deleteFile: (...args: unknown[]) => mockDeleteFile(...args),
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
  mockGetFile.mockReset();
  mockGetFile.mockResolvedValue({ Body: "" });
  mockUploadFile.mockReset();
  mockUploadFile.mockResolvedValue({});
  mockDeleteFile.mockReset();
  mockDeleteFile.mockResolvedValue({});
});
afterEach(() => {
  resetAppAuth();
  jest.restoreAllMocks();
});

const YOUNG_FILE_KEYS: string[] = [...FILE_KEYS, ...MILITARY_FILE_KEYS];
/** Pièces qu'un responsable de structure en périmètre n'obtient jamais (identité, santé, préparation militaire hors structure PM). */
const KEYS_FORBIDDEN_TO_STRUCTURE: string[] = ["cniFiles", "autoTestPCRFiles", ...MILITARY_FILE_KEYS];
const KEYS_OPEN_TO_STRUCTURE: string[] = FILE_KEYS.filter((key: string) => !KEYS_FORBIDDEN_TO_STRUCTURE.includes(key));

// Valeurs telles qu'elles voyagent dans l'URL : Express les décode avant de les remettre à la route.
const BAD_KEYS = [
  ["un sous-arbre des pièces de préparation militaire", "military-preparation%2FmilitaryPreparationFilesIdentity"],
  ["un sous-chemin quelconque", "cniFiles%2Fsous-dossier"],
  ["une remontée d'arborescence", "..%2FcniFiles"],
  ["une clé connue suivie d'une remontée", "cniFiles%2F..%2FmilitaryPreparationFilesIdentity"],
  ["un antislash", "cniFiles%5C..%5C"],
  ["un octet nul", "cniFiles%00"],
  ["un caractère de contrôle", "cniFiles%0A"],
  ["une clé inconnue", "key"],
  ["un nom de champ du dossier qui n'est pas une pièce", "status"],
  ["une clé « application », qui désigne une pièce de candidature, non une pièce de volontaire", "application"],
];

const BAD_FILE_NAMES = [
  ["une remontée d'arborescence", "..%2F..%2F2%2FcniFiles%2Fid"],
  ["un sous-chemin", "sous-dossier%2Ffichier.pdf"],
  ["un antislash", "dossier%5Cfichier.pdf"],
  ["un octet nul", "fichier%00.pdf"],
  ["un retour à la ligne", "fichier%0A.pdf"],
  ["un caractère de contrôle", "fichier%1F.pdf"],
];

async function createResponsibleInScope(options: { isMilitaryPreparation?: boolean } = {}) {
  const structure = await createStructureHelper({
    ...getNewStructureFixture(),
    region: "Grand Est",
    department: "Bas-Rhin",
    isMilitaryPreparation: options.isMilitaryPreparation ? "true" : "false",
  });
  const actor = await createReferentHelper(
    getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString(), region: "Grand Est", department: ["Bas-Rhin"] }),
  );
  const young = await createYoungHelper(getNewYoungFixture({ region: "Bretagne", department: "Finistère" } as any));
  await createApplication({ ...getNewApplicationFixture(), youngId: young._id.toString(), structureId: structure._id.toString() });
  return { actor, young, structure };
}

describe("GET /referent/youngFile/:youngId/:key/:fileName", () => {
  describe("clé bornée (PH20)", () => {
    it.each(BAD_KEYS)("refuse (400) pour un responsable en périmètre une clé contenant %s, sans toucher au stockage", async (_label, key) => {
      const { actor, young } = await createResponsibleInScope();

      const res = await request(await getAppHelperWithAcl(actor))
        .get(`/referent/youngFile/${young._id}/${key}/piece.pdf`)
        .send();

      expect(res.statusCode).toEqual(400);
      expect(mockGetFile).not.toHaveBeenCalled();
    });

    it.each(BAD_KEYS)("refuse (400) pour un administrateur une clé contenant %s, sans toucher au stockage", async (_label, key) => {
      const young = await createYoungHelper(getNewYoungFixture());

      const res = await request(await getAppHelperWithAcl())
        .get(`/referent/youngFile/${young._id}/${key}/piece.pdf`)
        .send();

      expect(res.statusCode).toEqual(400);
      expect(mockGetFile).not.toHaveBeenCalled();
    });

    it("refuse (400) une clé désignant le sous-arbre des pièces de préparation militaire pour un responsable hors structure de préparation militaire", async () => {
      const { actor, young } = await createResponsibleInScope({ isMilitaryPreparation: false });

      const res = await request(await getAppHelperWithAcl(actor))
        .get(`/referent/youngFile/${young._id}/military-preparation%2FmilitaryPreparationFilesIdentity/abc`)
        .send();

      expect(res.statusCode).toEqual(400);
      expect(mockGetFile).not.toHaveBeenCalled();
    });

    it("refuse (400) une clé « application » visant une pièce de candidature d'une autre structure, sans toucher au stockage (H5)", async () => {
      const { actor, young } = await createResponsibleInScope();
      const otherStructure = await createStructureHelper({ ...getNewStructureFixture(), region: "Île-de-France", department: "Paris" });
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id.toString(), structureId: otherStructure._id.toString() });

      const res = await request(await getAppHelperWithAcl(actor))
        .get(`/referent/youngFile/${young._id}/application/${application._id}%2FcontractAvenantFiles%2Fpiece.pdf`)
        .send();

      expect(res.statusCode).toEqual(400);
      expect(mockGetFile).not.toHaveBeenCalled();
    });
  });

  describe("nom de fichier borné", () => {
    it.each(BAD_FILE_NAMES)("refuse (400) pour un responsable en périmètre un nom contenant %s, sans toucher au stockage", async (_label, fileName) => {
      const { actor, young } = await createResponsibleInScope();

      const res = await request(await getAppHelperWithAcl(actor))
        .get(`/referent/youngFile/${young._id}/imageRightFiles/${fileName}`)
        .send();

      expect(res.statusCode).toEqual(400);
      expect(mockGetFile).not.toHaveBeenCalled();
    });

    it.each(BAD_FILE_NAMES)("refuse (400) pour un administrateur un nom contenant %s, sans toucher au stockage", async (_label, fileName) => {
      const young = await createYoungHelper(getNewYoungFixture());

      const res = await request(await getAppHelperWithAcl())
        .get(`/referent/youngFile/${young._id}/equivalenceFiles/${fileName}`)
        .send();

      expect(res.statusCode).toEqual(400);
      expect(mockGetFile).not.toHaveBeenCalled();
    });

    it.each([
      ["des espaces et des accents", "Pièce d'identité (1).pdf"],
      ["des points successifs au milieu", "a..b.pdf"],
      ["des points en tête", "..cache.pdf"],
      ["un nom produit par l'interface", "justificatif-0.pdf"],
    ])("laisse passer un nom légitime avec %s", async (_label, fileName) => {
      const young = await createYoungHelper(getNewYoungFixture());

      const res = await request(await getAppHelperWithAcl())
        .get(`/referent/youngFile/${young._id}/equivalenceFiles/${encodeURIComponent(fileName)}`)
        .send();

      expect(res.statusCode).toEqual(200);
      expect(res.body.fileName).toEqual(fileName);
      expect(mockGetFile).toHaveBeenCalledWith(`app/young/${young._id}/equivalenceFiles/${fileName}`);
    });
  });

  describe("ordre : la validation précède la recherche du volontaire et le contrôle de périmètre", () => {
    it("répond 400, et non 404, pour une clé invalide sur un volontaire inexistant", async () => {
      const res = await request(await getAppHelperWithAcl())
        .get(`/referent/youngFile/104a49ba503040e4d2153973/military-preparation%2FmilitaryPreparationFilesIdentity/abc`)
        .send();

      expect(res.statusCode).toEqual(400);
      expect(mockGetFile).not.toHaveBeenCalled();
    });

    it("répond 400, et non 403, pour une clé invalide demandée par un acteur hors périmètre", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), region: "Grand Est", department: "Bas-Rhin" });
      const actor = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }));
      const young = await createYoungHelper(getNewYoungFixture());

      const res = await request(await getAppHelperWithAcl(actor))
        .get(`/referent/youngFile/${young._id}/..%2FcniFiles/piece.pdf`)
        .send();

      expect(res.statusCode).toEqual(400);
      expect(mockGetFile).not.toHaveBeenCalled();
    });

    it("n'appelle pas le stockage lorsque le périmètre refuse une clé pourtant valide", async () => {
      const structure = await createStructureHelper({ ...getNewStructureFixture(), region: "Grand Est", department: "Bas-Rhin" });
      const actor = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }));
      const young = await createYoungHelper(getNewYoungFixture());

      const res = await request(await getAppHelperWithAcl(actor))
        .get(`/referent/youngFile/${young._id}/imageRightFiles/piece.pdf`)
        .send();

      expect(res.statusCode).toEqual(403);
      expect(mockGetFile).not.toHaveBeenCalled();
    });
  });

  describe("téléchargements légitimes inchangés, par rôle et par clé", () => {
    it.each(YOUNG_FILE_KEYS)("administrateur : %s", async (key) => {
      const young = await createYoungHelper(getNewYoungFixture());

      const res = await request(await getAppHelperWithAcl())
        .get(`/referent/youngFile/${young._id}/${key}/piece.pdf`)
        .send();

      expect(res.statusCode).toEqual(200);
      expect(res.body.fileName).toEqual("piece.pdf");
      expect(mockGetFile).toHaveBeenCalledTimes(1);
      expect(mockGetFile).toHaveBeenCalledWith(`app/young/${young._id}/${key}/piece.pdf`);
    });

    it.each(YOUNG_FILE_KEYS)("référent départemental du territoire du volontaire : %s", async (key) => {
      const young = await createYoungHelper(getNewYoungFixture({ region: "Bretagne", department: "Finistère" } as any));
      const actor = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, region: "Bretagne", department: ["Finistère"] }));

      const res = await request(await getAppHelperWithAcl(actor))
        .get(`/referent/youngFile/${young._id}/${key}/piece.pdf`)
        .send();

      expect(res.statusCode).toEqual(200);
      expect(mockGetFile).toHaveBeenCalledWith(`app/young/${young._id}/${key}/piece.pdf`);
    });

    it.each(YOUNG_FILE_KEYS)("référent régional de la région du volontaire : %s", async (key) => {
      const young = await createYoungHelper(getNewYoungFixture({ region: "Bretagne", department: "Finistère" } as any));
      const actor = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_REGION, region: "Bretagne", department: [] }));

      const res = await request(await getAppHelperWithAcl(actor))
        .get(`/referent/youngFile/${young._id}/${key}/piece.pdf`)
        .send();

      expect(res.statusCode).toEqual(200);
      expect(mockGetFile).toHaveBeenCalledWith(`app/young/${young._id}/${key}/piece.pdf`);
    });

    it.each(KEYS_OPEN_TO_STRUCTURE)("responsable de structure en périmètre : %s", async (key) => {
      const { actor, young } = await createResponsibleInScope();

      const res = await request(await getAppHelperWithAcl(actor))
        .get(`/referent/youngFile/${young._id}/${key}/piece.pdf`)
        .send();

      expect(res.statusCode).toEqual(200);
      expect(mockGetFile).toHaveBeenCalledWith(`app/young/${young._id}/${key}/piece.pdf`);
    });

    it.each(KEYS_FORBIDDEN_TO_STRUCTURE)("responsable de structure en périmètre : %s reste refusé (403)", async (key) => {
      const { actor, young } = await createResponsibleInScope();

      const res = await request(await getAppHelperWithAcl(actor))
        .get(`/referent/youngFile/${young._id}/${key}/piece.pdf`)
        .send();

      expect(res.statusCode).toEqual(403);
      expect(mockGetFile).not.toHaveBeenCalled();
    });

    it.each(MILITARY_FILE_KEYS)("responsable d'une structure de préparation militaire en périmètre : %s", async (key) => {
      const { actor, young } = await createResponsibleInScope({ isMilitaryPreparation: true });

      const res = await request(await getAppHelperWithAcl(actor))
        .get(`/referent/youngFile/${young._id}/${key}/piece.pdf`)
        .send();

      expect(res.statusCode).toEqual(200);
      expect(mockGetFile).toHaveBeenCalledWith(`app/young/${young._id}/${key}/piece.pdf`);
    });
  });
});

describe("GET /referent/youngFile/:youngId/military-preparation/:key/:fileName", () => {
  it.each([
    ["une pièce hors préparation militaire", "cniFiles"],
    ["une clé inconnue", "key"],
    ["une remontée vers une autre pièce", "..%2FcniFiles"],
    ["un sous-chemin", "militaryPreparationFilesIdentity%2F..%2F..%2FcniFiles"],
    ["un octet nul", "militaryPreparationFilesIdentity%00"],
  ])("refuse (400) une clé désignant %s, sans toucher au stockage", async (_label, key) => {
    const young = await createYoungHelper(getNewYoungFixture());

    const res = await request(await getAppHelperWithAcl())
      .get(`/referent/youngFile/${young._id}/military-preparation/${key}/piece.pdf`)
      .send();

    expect(res.statusCode).toEqual(400);
    expect(mockGetFile).not.toHaveBeenCalled();
  });

  it.each(BAD_FILE_NAMES)("refuse (400) un nom contenant %s, sans toucher au stockage", async (_label, fileName) => {
    const { actor, young } = await createResponsibleInScope({ isMilitaryPreparation: true });

    const res = await request(await getAppHelperWithAcl(actor))
      .get(`/referent/youngFile/${young._id}/military-preparation/militaryPreparationFilesIdentity/${fileName}`)
      .send();

    expect(res.statusCode).toEqual(400);
    expect(mockGetFile).not.toHaveBeenCalled();
  });

  it("répond 400, et non 403, à une clé invalide demandée par un acteur hors périmètre", async () => {
    const structure = await createStructureHelper({ ...getNewStructureFixture(), isMilitaryPreparation: "true" });
    const actor = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }));
    const young = await createYoungHelper(getNewYoungFixture());

    const res = await request(await getAppHelperWithAcl(actor))
      .get(`/referent/youngFile/${young._id}/military-preparation/..%2FcniFiles/piece.pdf`)
      .send();

    expect(res.statusCode).toEqual(400);
    expect(mockGetFile).not.toHaveBeenCalled();
  });

  it.each(MILITARY_FILE_KEYS)("administrateur : %s", async (key) => {
    const young = await createYoungHelper(getNewYoungFixture());

    const res = await request(await getAppHelperWithAcl())
      .get(`/referent/youngFile/${young._id}/military-preparation/${key}/piece.pdf`)
      .send();

    expect(res.statusCode).toEqual(200);
    expect(mockGetFile).toHaveBeenCalledWith(`app/young/${young._id}/military-preparation/${key}/piece.pdf`);
  });

  it.each(MILITARY_FILE_KEYS)("responsable d'une structure de préparation militaire en périmètre : %s", async (key) => {
    const { actor, young } = await createResponsibleInScope({ isMilitaryPreparation: true });

    const res = await request(await getAppHelperWithAcl(actor))
      .get(`/referent/youngFile/${young._id}/military-preparation/${key}/piece.pdf`)
      .send();

    expect(res.statusCode).toEqual(200);
    expect(mockGetFile).toHaveBeenCalledWith(`app/young/${young._id}/military-preparation/${key}/piece.pdf`);
  });

  it("refuse (403) un responsable d'une structure hors préparation militaire, sans toucher au stockage", async () => {
    const { actor, young } = await createResponsibleInScope({ isMilitaryPreparation: false });

    const res = await request(await getAppHelperWithAcl(actor))
      .get(`/referent/youngFile/${young._id}/military-preparation/militaryPreparationFilesIdentity/piece.pdf`)
      .send();

    expect(res.statusCode).toEqual(403);
    expect(mockGetFile).not.toHaveBeenCalled();
  });
});

describe("POST /referent/file/:key", () => {
  const body = (youngId: string) => JSON.stringify({ youngId, names: ["justificatif-0.pdf"] });

  it.each([
    ["un sous-chemin", "..%2F..%2Fautre"],
    ["un octet nul", "equivalenceFiles%00"],
    ["un nom de champ du dossier qui n'est pas une pièce", "status"],
    ["une clé inconnue", "unknownField"],
  ])("refuse (400) une clé désignant %s, sans écrire ni modifier le volontaire", async (_label, key) => {
    const young = await createYoungHelper(getNewYoungFixture({ status: "VALIDATED" } as any));

    const res = await request(await getAppHelperWithAcl())
      .post(`/referent/file/${key}`)
      .send({ body: body(young._id.toString()) });

    expect(res.statusCode).toEqual(400);
    expect(mockUploadFile).not.toHaveBeenCalled();
    expect((await YoungModel.findById(young._id))?.status).toEqual("VALIDATED");
  });

  it("répond 400, et non 404, à une clé invalide sur un volontaire inexistant", async () => {
    const res = await request(await getAppHelperWithAcl())
      .post(`/referent/file/..%2Fautre`)
      .send({ body: body("104a49ba503040e4d2153973") });

    expect(res.statusCode).toEqual(400);
  });

  it.each(YOUNG_FILE_KEYS)("administrateur : la clé %s reste acceptée", async (key) => {
    const young = await createYoungHelper(getNewYoungFixture());

    const res = await request(await getAppHelperWithAcl())
      .post(`/referent/file/${key}`)
      .send({ body: body(young._id.toString()) });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toEqual(["justificatif-0.pdf"]);
  });

  it("référent départemental du territoire du volontaire : equivalenceFiles reste accepté", async () => {
    const young = await createYoungHelper(getNewYoungFixture({ region: "Bretagne", department: "Finistère" } as any));
    const actor = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, region: "Bretagne", department: ["Finistère"] }));

    const res = await request(await getAppHelperWithAcl(actor))
      .post(`/referent/file/equivalenceFiles`)
      .send({ body: body(young._id.toString()) });

    expect(res.statusCode).toEqual(200);
  });
});

describe("POST /referent/young/:id/refuse-military-preparation-files : noms stockés", () => {
  const militaryPath = (youngId: unknown, key: string, name: string) => `app/young/${youngId}/military-preparation/${key}/${name}`;

  /** Le même jeu de noms est stocké sous chacune des quatre listes de pièces de préparation militaire. */
  const storedUnderEveryKey = (names: string[]) => Object.fromEntries(MILITARY_FILE_KEYS.map((key: string) => [key, names]));

  const createYoungWithStoredNames = (names: string[]) =>
    createYoungHelper(getNewYoungFixture({ statusMilitaryPreparationFiles: "WAITING_VERIFICATION", ...storedUnderEveryKey(names) } as any));

  it.each([
    ["une remontée d'arborescence", "../../2/cniFiles/id"],
    ["un sous-chemin", "sous-dossier/fichier.pdf"],
    ["un antislash", "dossier\\fichier.pdf"],
    ["un octet nul", "fichier\u0000.pdf"],
    ["un retour à la ligne", "fichier\n.pdf"],
    ["le segment « .. » seul", ".."],
    ["le segment « . » seul", "."],
    ["une chaîne vide", ""],
  ])("ne supprime jamais un nom stocké contenant %s, mais supprime les noms légitimes voisins", async (_label, storedName) => {
    const young = await createYoungWithStoredNames(["piece.pdf", storedName]);

    const res = await request(await getAppHelperWithAcl()).post(`/referent/young/${young._id}/refuse-military-preparation-files`);

    expect(res.statusCode).toEqual(200);
    const deleted = mockDeleteFile.mock.calls.map(([path]) => path as string).sort();
    expect(deleted).toEqual(MILITARY_FILE_KEYS.map((key: string) => militaryPath(young._id, key, "piece.pdf")).sort());
    expect((await YoungModel.findById(young._id))?.statusMilitaryPreparationFiles).toEqual("REFUSED");
  });

  it("ne supprime rien lorsque tous les noms stockés sont non sûrs, et refuse tout de même le dossier", async () => {
    const young = await createYoungWithStoredNames(["../../2/cniFiles/id", "a/b.pdf"]);

    const res = await request(await getAppHelperWithAcl()).post(`/referent/young/${young._id}/refuse-military-preparation-files`);

    expect(res.statusCode).toEqual(200);
    expect(mockDeleteFile).not.toHaveBeenCalled();
    expect((await YoungModel.findById(young._id))?.statusMilitaryPreparationFiles).toEqual("REFUSED");
  });

  it("journalise l'abandon d'un nom non sûr sans en reproduire le contenu", async () => {
    const warn = jest.spyOn(logger, "warn").mockImplementation(() => logger);
    const young = await createYoungWithStoredNames(["piece.pdf", "../../2/cniFiles/MARQUEUR-DE-FUITE"]);

    const res = await request(await getAppHelperWithAcl()).post(`/referent/young/${young._id}/refuse-military-preparation-files`);

    expect(res.statusCode).toEqual(200);
    expect(warn).toHaveBeenCalled();
    expect(JSON.stringify(warn.mock.calls)).not.toContain("MARQUEUR-DE-FUITE");
  });

  it.each([
    ["des espaces et des accents", "Pièce d'identité (1).pdf"],
    ["des points successifs au milieu", "a..b.pdf"],
    ["des points en tête", "..cache.pdf"],
    ["un nom produit par l'interface", "justificatif-0.pdf"],
  ])("supprime comme avant un nom stocké légitime avec %s, sans rien journaliser", async (_label, storedName) => {
    const warn = jest.spyOn(logger, "warn").mockImplementation(() => logger);
    const young = await createYoungWithStoredNames([storedName]);

    const res = await request(await getAppHelperWithAcl()).post(`/referent/young/${young._id}/refuse-military-preparation-files`);

    expect(res.statusCode).toEqual(200);
    const deleted = mockDeleteFile.mock.calls.map(([path]) => path as string).sort();
    expect(deleted).toEqual(MILITARY_FILE_KEYS.map((key: string) => militaryPath(young._id, key, storedName)).sort());
    expect(warn).not.toHaveBeenCalled();
  });
});
