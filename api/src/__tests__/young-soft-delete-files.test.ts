/**
 * Reproduction du constat M48 de l'audit sécurité du 21/09/2026 (lot T3) :
 * `PUT /young/:id/soft-delete` bouclait sur les caractères du nom de chaque clé de `young.files`,
 * supprimait `app/young/<id>/<clé>/undefined`, puis vidait le document. Aucun binaire n'était
 * supprimé, et plus rien en base ne permettait de les retrouver.
 */
import request from "supertest";
import { Types } from "mongoose";
import { YOUNG_STATUS } from "snu-lib";

import { YoungModel } from "../models";
import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper } from "./helpers/young";

const mockListFiles = jest.fn();
const mockDeleteFilesByList = jest.fn();
const mockDeleteFile = jest.fn();
jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  listFiles: (...args) => mockListFiles(...args),
  deleteFilesByList: (...args) => mockDeleteFilesByList(...args),
  deleteFile: (...args) => mockDeleteFile(...args),
}));

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
  sendTemplate: () => Promise.resolve(),
  unsync: () => Promise.resolve(),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
beforeEach(() => {
  mockListFiles.mockReset();
  mockDeleteFilesByList.mockReset();
  mockDeleteFile.mockReset();
  mockDeleteFilesByList.mockResolvedValue({});
});
afterEach(resetAppAuth);

const FILE_A = new Types.ObjectId().toString();
const FILE_B = new Types.ObjectId().toString();
const cniFile = (id: string) => ({ _id: id, name: `${id}.pdf`, uploadedAt: new Date(), size: 1024, mimetype: "application/pdf" });

/** Simule le bucket : le préfixe contient `keys` jusqu'à leur suppression. */
function mockBucket(keys: string[]) {
  let remaining = [...keys];
  mockListFiles.mockImplementation((prefix: string) => Promise.resolve(remaining.filter((key) => key.startsWith(prefix)).map((Key) => ({ Key }))));
  mockDeleteFilesByList.mockImplementation((objects: Array<{ Key: string }>) => {
    const deleted = objects.map((o) => o.Key);
    remaining = remaining.filter((key) => !deleted.includes(key));
    return Promise.resolve({ Deleted: objects });
  });
  return () => remaining;
}

describe("PUT /young/:id/soft-delete — purge S3 (M48)", () => {
  it("supprime les deux fichiers réels du volontaire, sous leurs vraies clés", async () => {
    const young = await createYoungHelper(getNewYoungFixture({ files: { cniFiles: [cniFile(FILE_A), cniFile(FILE_B)] } } as any));
    const keys = [`app/young/${young._id}/cniFiles/${FILE_A}`, `app/young/${young._id}/cniFiles/${FILE_B}`];
    const remaining = mockBucket([...keys, "app/young/un-autre-volontaire/cniFiles/cccc3333"]);

    const res = await request(await getAppHelperWithAcl()).put(`/young/${young._id}/soft-delete`);

    expect(res.statusCode).toEqual(200);
    expect(mockListFiles).toHaveBeenCalledWith(`app/young/${young._id}/`);
    expect(mockDeleteFilesByList).toHaveBeenCalledTimes(1);
    expect(mockDeleteFilesByList).toHaveBeenCalledWith(keys.map((Key) => ({ Key })));
    // L'ancienne boucle visait `app/young/<id>/<clé>/undefined`.
    expect(mockDeleteFile).not.toHaveBeenCalled();
    expect(remaining()).toEqual(["app/young/un-autre-volontaire/cniFiles/cccc3333"]);
    expect((await YoungModel.findById(young._id))!.status).toEqual(YOUNG_STATUS.DELETED);
  });

  it("purge aussi les fichiers hors de `young.files` (candidatures, préparation militaire)", async () => {
    const young = await createYoungHelper(getNewYoungFixture());
    const keys = [`app/young/${young._id}/application/contractAvenantFiles/f1`, `app/young/${young._id}/military-preparation/militaryPreparationFilesIdentity/f2`];
    const remaining = mockBucket(keys);

    const res = await request(await getAppHelperWithAcl()).put(`/young/${young._id}/soft-delete`);

    expect(res.statusCode).toEqual(200);
    expect(remaining()).toEqual([]);
  });

  it("n'efface rien en base si le stockage échoue : la suppression reste rejouable", async () => {
    const young = await createYoungHelper(getNewYoungFixture({ files: { cniFiles: [cniFile(FILE_A)] } } as any));
    mockListFiles.mockRejectedValue(new Error("S3 indisponible"));

    const res = await request(await getAppHelperWithAcl()).put(`/young/${young._id}/soft-delete`);

    expect(res.statusCode).toEqual(500);
    const after = (await YoungModel.findById(young._id))!;
    expect(after.status).not.toEqual(YOUNG_STATUS.DELETED);
    expect(after.email).toEqual(young.email);
    expect(after.files?.cniFiles).toHaveLength(1);
  });
});
