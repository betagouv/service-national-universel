import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;
import { ROLES, PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "snu-lib";
import { dbConnect, dbClose } from "../helpers/db";
import { mockEsClient } from "../helpers/es";
import { getAppHelperWithAcl, resetAppAuth } from "../helpers/app";

// classe
import { createClasse } from "../helpers/classe";
import { createFixtureClasse } from "../fixtures/classe";

// etablissement
import { ClasseModel, EtablissementModel, ReferentModel } from "../../models";

import { PermissionModel } from "../../models/permissions/permission";
import { addPermissionHelper } from "../helpers/permissions";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await PermissionModel.deleteMany({ roles: { $in: [ROLES.ADMIN] } });
  await addPermissionHelper([ROLES.ADMIN, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE], PERMISSION_RESOURCES.PATCH, PERMISSION_ACTIONS.READ);
});
afterAll(dbClose);
beforeEach(async () => {
  await ClasseModel.deleteMany({});
  await EtablissementModel.deleteMany({});
  await ReferentModel.deleteMany({});
});
afterEach(resetAppAuth);

mockEsClient({
  classe: [{ _id: "classeId", etablissementIds: ["etabId"], referentClasseIds: ["referentId"] }],
  etablissement: [{ _id: "etabId" }],
  referent: [{ _id: "referentId" }],
});

jest.mock("../../emails", () => ({
  emit: jest.fn(),
}));

describe("GET /cle/classe/:id", () => {
  afterEach(resetAppAuth);
  it("should return 400 when id is invalid", async () => {
    const res = await request(await getAppHelperWithAcl()).get("/cle/classe/invalidId");
    expect(res.status).toBe(400);
  });

  it("should return 403 when user cannot update classes", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;

    const withDetails = true;
    const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE })).get(`/cle/classe/${validId}?withDetails=${withDetails}`);
    expect(res.status).toBe(403);
  });

  it("should return 400 when query params are invalid", async () => {
    const classeId = new ObjectId();
    const res = await request(await getAppHelperWithAcl()).get(`/cle/classe/${classeId}?withDetails=invalid`);
    expect(res.status).toBe(400);
  });

  it("should return 404 when class is not found", async () => {
    const nonExistingId = "104a49ba503555e4d8853003";
    const res = await request(await getAppHelperWithAcl())
      .delete(`/cle/classe/${nonExistingId}`)
      .query({ type: "delete" })
      .send();
    expect(res.status).toBe(404);
  });

  it("should return 200 and class data without details when withDetails is false", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    const withDetails = false;
    const res = await request(await getAppHelperWithAcl()).get(`/cle/classe/${validId}?withDetails=${withDetails}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("_id", validId.toString());
    expect(res.body.data).not.toHaveProperty("etablissement");
    expect(res.body.data).not.toHaveProperty("cohortDetails");
  });

  it("should return 200 and class data with details when withDetails is true", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    const withDetails = true;
    const res = await request(await getAppHelperWithAcl()).get(`/cle/classe/${validId}?withDetails=${withDetails}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("_id", validId.toString());
    expect(res.body.data).toHaveProperty("etablissement");
    expect(res.body.data).toHaveProperty("referents");
    expect(res.body.data).toHaveProperty("cohortDetails");
  });
});

describe("GET /cle/classe/public/:id", () => {
  afterEach(resetAppAuth);
  it("should return 400 when id is invalid", async () => {
    const res = await request(await getAppHelperWithAcl()).get("/cle/classe/public/invalidId");
    expect(res.status).toBe(400);
  });

  it("should return 400 when query params are invalid", async () => {
    const classeId = new ObjectId();
    const res = await request(await getAppHelperWithAcl()).get(`/cle/classe/public/${classeId}?withDetails=invalid`);
    expect(res.status).toBe(400);
  });

  it("should return 404 when class is not found", async () => {
    const nonExistingId = "104a49ba503555e4d8853003";
    const res = await request(await getAppHelperWithAcl())
      .delete(`/cle/classe/public/${nonExistingId}`)
      .query({ type: "delete" })
      .send();
    expect(res.status).toBe(404);
  });

  it("should return 200 and class data without details when withDetails is false", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    const withDetails = false;
    const res = await request(await getAppHelperWithAcl()).get(`/cle/classe/public/${validId}?withDetails=${withDetails}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("_id", validId.toString());
    expect(res.body.data).not.toHaveProperty("etablissement");
    expect(res.body.data).not.toHaveProperty("cohortDetails");
  });

  it("should return 200 and class data with details when withDetails is true", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    const withDetails = true;
    const res = await request(await getAppHelperWithAcl()).get(`/cle/classe/public/${validId}?withDetails=${withDetails}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("_id", validId.toString());
    expect(res.body.data).toHaveProperty("etablissement");
    expect(res.body.data).toHaveProperty("referents");
    expect(res.body.data).toHaveProperty("cohortDetails");
  });
});

describe("POST /elasticsearch/cle/classe/export", () => {
  it("should return 403 when user is not admin", async () => {
    const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE }))
      .post("/elasticsearch/cle/classe/export")
      .send();
    expect(res.status).toBe(403);
  });
  it("should return 200 when export is successful", async () => {
    const res = await request(await getAppHelperWithAcl())
      .post("/elasticsearch/cle/classe/export")
      .send({ filters: {}, exportFields: ["name", "uniqueKeyAndId"] });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe("POST /elasticsearch/cle/etablissement/export", () => {
  it("should return 403 when user is not admin", async () => {
    const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE }))
      .post("/elasticsearch/cle/etablissement/export")
      .send();
    expect(res.status).toBe(403);
  });
  it("should return 200 when export is successful", async () => {
    const res = await request(await getAppHelperWithAcl())
      .post("/elasticsearch/cle/etablissement/export")
      .send({ filters: {}, exportFields: ["name", "uai"] });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe("GET /cle/classe/:id/patches", () => {
  it("should return 404 if classe not found", async () => {
    const classeId = new ObjectId();
    const res = await request(await getAppHelperWithAcl())
      .get(`/cle/classe/${classeId}/patches`)
      .send();
    expect(res.statusCode).toEqual(404);
  });
  it("should return 403 if not admin", async () => {
    const classe = await createClasse(createFixtureClasse());
    classe.name = "MY NEW NAME";
    await classe.save();

    const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE }))
      .get(`/cle/classe/${classe._id}/patches`)
      .send();
    expect(res.status).toBe(403);
  });
  it("should return 200 if classe found with patches", async () => {
    const classe = await createClasse(createFixtureClasse());
    classe.name = "MY NEW NAME";
    await classe.save();
    const res = await request(await getAppHelperWithAcl())
      .get(`/cle/classe/${classe._id}/patches`)
      .send();
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ops: expect.arrayContaining([expect.objectContaining({ op: "replace", path: "/name", value: "MY NEW NAME" })]),
        }),
      ]),
    );
  });
  it("should be only accessible by referents", async () => {
    const passport = require("passport");
    const classeId = new ObjectId();
    await request(await getAppHelperWithAcl())
      .get(`/cle/classe/${classeId}/patches`)
      .send();
    expect(passport.lastTypeCalledOnAuthenticate).toEqual("referent");
  });
});
