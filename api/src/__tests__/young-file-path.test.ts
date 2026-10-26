/**
 * Même invariant que pour les routes référent (voir referent-young-file-path.test.ts) : les segments
 * d'un chemin d'objet construit à partir de l'URL désignent chacun UN niveau de l'arborescence, et la
 * clé d'une pièce appartient à la liste des pièces connues.
 *
 * - GET /young/file/:youngId/:key/:fileName
 * - GET /young/:id/phase2/equivalence/file/:name
 */
import request from "supertest";

import { FILE_KEYS, MILITARY_FILE_KEYS } from "snu-lib";

import { YoungModel } from "../models";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper } from "./helpers/young";

const mockGetFile = jest.fn();

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  getFile: (...args: unknown[]) => mockGetFile(...args),
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
  await YoungModel.deleteMany();
  mockGetFile.mockReset();
  mockGetFile.mockResolvedValue({ Body: "" });
});
afterEach(resetAppAuth);

const YOUNG_FILE_KEYS: string[] = [...FILE_KEYS, ...MILITARY_FILE_KEYS];

const BAD_KEYS = [
  ["un sous-arbre des pièces de préparation militaire", "military-preparation%2FmilitaryPreparationFilesIdentity"],
  ["une remontée d'arborescence", "..%2FcniFiles"],
  ["un antislash", "cniFiles%5C..%5C"],
  ["un octet nul", "cniFiles%00"],
  ["une clé inconnue", "key"],
  ["un nom de champ du dossier qui n'est pas une pièce", "status"],
];

const BAD_NAMES = [
  ["une remontée d'arborescence", "..%2F..%2F2%2FcniFiles%2Fid"],
  ["un sous-chemin", "sous-dossier%2Ffichier.pdf"],
  ["un antislash", "dossier%5Cfichier.pdf"],
  ["un octet nul", "fichier%00.pdf"],
  ["un retour à la ligne", "fichier%0A.pdf"],
];

const LEGIT_NAMES = [
  ["des espaces et des accents", "Pièce d'identité (1).pdf"],
  ["des points successifs au milieu", "a..b.pdf"],
  ["un nom produit par l'interface", "justificatif-0.pdf"],
];

describe("GET /young/file/:youngId/:key/:fileName", () => {
  it.each(BAD_KEYS)("refuse (400) pour le volontaire concerné une clé contenant %s, sans toucher au stockage", async (_label, key) => {
    const young = await createYoungHelper(getNewYoungFixture());

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .get(`/young/file/${young._id}/${key}/piece.pdf`)
      .send();

    expect(res.statusCode).toEqual(400);
    expect(mockGetFile).not.toHaveBeenCalled();
  });

  it.each(BAD_NAMES)("refuse (400) pour le volontaire concerné un nom contenant %s, sans toucher au stockage", async (_label, fileName) => {
    const young = await createYoungHelper(getNewYoungFixture());

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .get(`/young/file/${young._id}/equivalenceFiles/${fileName}`)
      .send();

    expect(res.statusCode).toEqual(400);
    expect(mockGetFile).not.toHaveBeenCalled();
  });

  it("répond 400, et non 403, pour une clé invalide sur le dossier d'un autre volontaire", async () => {
    const young = await createYoungHelper(getNewYoungFixture());
    const other = await createYoungHelper(getNewYoungFixture());

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .get(`/young/file/${other._id}/..%2FcniFiles/piece.pdf`)
      .send();

    expect(res.statusCode).toEqual(400);
    expect(mockGetFile).not.toHaveBeenCalled();
  });

  it("refuse (403) le dossier d'un autre volontaire pour une clé valide, sans toucher au stockage", async () => {
    const young = await createYoungHelper(getNewYoungFixture());
    const other = await createYoungHelper(getNewYoungFixture());

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .get(`/young/file/${other._id}/cniFiles/piece.pdf`)
      .send();

    expect(res.statusCode).toEqual(403);
    expect(mockGetFile).not.toHaveBeenCalled();
  });

  it.each(YOUNG_FILE_KEYS)("le volontaire télécharge toujours sa pièce : %s", async (key) => {
    const young = await createYoungHelper(getNewYoungFixture());

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .get(`/young/file/${young._id}/${key}/piece.pdf`)
      .send();

    expect(res.statusCode).toEqual(200);
    expect(res.body.fileName).toEqual("piece.pdf");
    expect(mockGetFile).toHaveBeenCalledWith(`app/young/${young._id}/${key}/piece.pdf`);
  });

  it.each(LEGIT_NAMES)("laisse passer un nom légitime avec %s", async (_label, fileName) => {
    const young = await createYoungHelper(getNewYoungFixture());

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .get(`/young/file/${young._id}/equivalenceFiles/${encodeURIComponent(fileName)}`)
      .send();

    expect(res.statusCode).toEqual(200);
    expect(mockGetFile).toHaveBeenCalledWith(`app/young/${young._id}/equivalenceFiles/${fileName}`);
  });
});

describe("GET /young/:id/phase2/equivalence/file/:name", () => {
  it.each(BAD_NAMES)("refuse (400) pour le volontaire un nom contenant %s, sans toucher au stockage", async (_label, name) => {
    const young = await createYoungHelper(getNewYoungFixture());

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .get(`/young/${young._id}/phase2/equivalence/file/${name}`)
      .send();

    expect(res.statusCode).toEqual(400);
    expect(mockGetFile).not.toHaveBeenCalled();
  });

  it.each(BAD_NAMES)("refuse (400) pour un administrateur un nom contenant %s, sans toucher au stockage", async (_label, name) => {
    const young = await createYoungHelper(getNewYoungFixture());

    const res = await request(await getAppHelperWithAcl())
      .get(`/young/${young._id}/phase2/equivalence/file/${name}`)
      .send();

    expect(res.statusCode).toEqual(400);
    expect(mockGetFile).not.toHaveBeenCalled();
  });

  it.each(LEGIT_NAMES)("le volontaire télécharge toujours un justificatif avec %s", async (_label, name) => {
    const young = await createYoungHelper(getNewYoungFixture());

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .get(`/young/${young._id}/phase2/equivalence/file/${encodeURIComponent(name)}`)
      .send();

    expect(res.statusCode).toEqual(200);
    expect(res.body.fileName).toEqual(name);
    expect(mockGetFile).toHaveBeenCalledWith(`app/young/${young._id}/equivalenceFiles/${name}`);
  });

  it("un administrateur télécharge toujours un justificatif", async () => {
    const young = await createYoungHelper(getNewYoungFixture());

    const res = await request(await getAppHelperWithAcl())
      .get(`/young/${young._id}/phase2/equivalence/file/justificatif-0.pdf`)
      .send();

    expect(res.statusCode).toEqual(200);
    expect(mockGetFile).toHaveBeenCalledTimes(1);
    expect(mockGetFile.mock.calls[0][0]).toMatch(/\/equivalenceFiles\/justificatif-0\.pdf$/);
  });
});
