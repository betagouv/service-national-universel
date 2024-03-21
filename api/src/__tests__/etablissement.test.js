require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
const { createEtablissementHelper, deleteEtablissementByIdHelper } = require("./helpers/etablissement");
const getNewEtablissementFixture = require("./fixtures/etablissement");
// referent
const { createReferentHelper, deleteReferentByIdHelper } = require("./helpers/referent");
const getNewReferentFixture = require("./fixtures/referent");

beforeAll(dbConnect);
afterAll(dbClose);

describe("GET /cle/etablissement/:id", () => {
  let etablissement, referent, coordinateur;
  const passport = require("passport");

  beforeAll(async () => {
    coordinateur = await createReferentHelper(getNewReferentFixture({ role: "coordinateur" }));
    etablissement = await createEtablissementHelper({ ...getNewEtablissementFixture(), coordinateurIds: coordinateur._id });
    referent = await createReferentHelper({
      ...getNewReferentFixture(),
      role: "referent_classe",
    });
    passport.user = referent;
  });

  afterAll(async () => {
    passport.user = null;
  });

  it("should return 200 and etablissement data for authorized user", async () => {
    const res = await request(getAppHelper()).get(`/cle/etablissement/${etablissement._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data._id.toString()).toEqual(etablissement._id.toString());
  });

  it("should return 400 for invalid etablissement id", async () => {
    const res = await request(getAppHelper()).get("/cle/etablissement/invalid-id");
    expect(res.statusCode).toEqual(400);
  });

  it("should return 404 if etablissement not found", async () => {
    const notExistingEtablissementId = "60d49e8fd7984c3f12345678";
    const res = await request(getAppHelper()).get(`/cle/etablissement/${notExistingEtablissementId}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 403 when user is not authorized to view etablissement", async () => {
    const unauthorizedReferent = await { ...getNewReferentFixture(), role: "supervisor" };
    passport.user = unauthorizedReferent;
    const res = await request(getAppHelper()).get(`/cle/etablissement/${etablissement._id}`);
    expect(res.statusCode).toEqual(403);
  });

  describe("PUT /cle/etablissement/:id", () => {
    let etablissement, referent, updatedEtablissementData;

    beforeAll(async () => {
      referent = await createReferentHelper(getNewReferentFixture({ role: "referent_etablissement" }));
      etablissement = await createEtablissementHelper(getNewEtablissementFixture({ referentEtablissementIds: [referent._id] }));
      passport.user = referent;

      updatedEtablissementData = {
        name: "Lycée modifié",
        zip: "91000",
        city: "Evry",
        department: "ESSONNES",
        region: "Ile-de-France",
      };
    });

    afterAll(async () => {
      passport.user = null;
    });

    it("should update etablissement successfully for authorized user", async () => {
      const res = await request(getAppHelper()).put(`/cle/etablissement/${etablissement._id}`).send(updatedEtablissementData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.ok).toEqual(true);

      expect(res.body.data.name).toEqual(updatedEtablissementData.name);
      expect(res.body.data.zip).toEqual(updatedEtablissementData.zip);
      expect(res.body.data.city).toEqual(updatedEtablissementData.city);
      expect(res.body.data.department).toEqual(updatedEtablissementData.department);
      expect(res.body.data.region).toEqual(updatedEtablissementData.region);
    });

    it("should return 400 for invalid input", async () => {
      const res = await request(getAppHelper()).put(`/cle/etablissement/${etablissement._id}`).send({ department: 77000 });
      expect(res.statusCode).toEqual(400);
    });

    it("should return 403 when user is not authorized to update etablissement", async () => {
      const unauthorizedReferent = await createReferentHelper(getNewReferentFixture({ role: "autre_role" }));
      passport.user = unauthorizedReferent;
      const res = await request(getAppHelper()).put(`/cle/etablissement/${etablissement._id}`).send(updatedEtablissementData);
      expect(res.statusCode).toEqual(403);
      await deleteReferentByIdHelper(unauthorizedReferent._id);
    });

    it("should return 404 if etablissement not found", async () => {
      const notExistingEtablissementId = "60d49e8fd7984c3f12345678";
      const res = await request(getAppHelper()).put(`/cle/etablissement/${notExistingEtablissementId}`).send(updatedEtablissementData);
      expect(res.statusCode).toEqual(404);
    });
  });
});
